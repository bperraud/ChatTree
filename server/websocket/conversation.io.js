const SQL = require('sql-template-strings');
const db  = require('../../server/db');

const config        = require('../config/token');
const jwt           = require('jsonwebtoken');
const sharedSession = require('express-socket.io-session');

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const Thread   = require('../models/schemas/thread');
const TMessage = require('../models/schemas/message');

/** @type {SocketIO.Server} */
let io;
let session;

/**
 *
 * @param newThread {Thread}
 * @param nsp {SocketIO.Namespace}
 */
function createThread(newThread, nsp) {
  console.log("createThread");
  console.log(newThread);

  (async(function () {
    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    const client = await(db.pool.connect());

    try {
      await(client.query('BEGIN'));
      let res;

      // Insert the new thread
      res = await(client.query(
        SQL`
            INSERT INTO t_thread(fk_thread_parent, fk_conversation, fk_author)
            VALUES (${newThread.thread_parent}, ${newThread.conversation}, ${newThread.author})
            RETURNING id, creation_date
            `
      ));

      console.log("New thread id: ", res.rows[0].id);
      newThread.id   = res.rows[0].id;
      newThread.date = res.rows[0].creation_date;
      newThread.messages = [];

      // If not supplied, find the last message of the parent thread
      // noinspection JSValidateTypes
      if (newThread.message_parent === null) {

        res = await(client.query(
          SQL`
              SELECT id
              FROM t_message
              WHERE fk_thread_parent = ${newThread.thread_parent}
              ORDER BY id DESC
              LIMIT 1
              `
        ));

        if (res.rows.length !== 0) {
          newThread.message_parent = res.rows[0].id;
        }
      }

      // If it exists (not root thread), update the message parent for the new thread
      // noinspection JSValidateTypes
      if (newThread.message_parent !== null) {
        await(client.query(
          SQL`
              UPDATE t_thread
              SET fk_message_parent = ${newThread.message_parent}
              WHERE id = ${newThread.id}
              `
        ));
      }

      await(client.query('COMMIT'));

      // Broadcast to all members of the conversation
      nsp.emit('create-thread', {thread: newThread});

    } catch (e) {
      await(client.query('ROLLBACK'));
      throw e;
    } finally {
      client.release();
    }
  }))().catch(e => console.error(e.stack));

}

/**
 *
 * @param newMsg {Message}
 * @param nsp {SocketIO.Namespace}
 * @param room {String}
 */
function createMessage(newMsg, nsp, room) {
  console.log("createMessage");
  console.log(newMsg);

  // Insert the new message
  db.query(
    SQL`
      INSERT INTO t_message(fk_author, content, fk_thread_parent)
      VALUES (${newMsg.author}, ${newMsg.content}, ${newMsg.thread})
      RETURNING id, creation_date
      `, (err, dbres) => {
      if (err) throw err;

      console.log("New message id: ", dbres.rows[0].id);
      newMsg.id   = dbres.rows[0].id;
      newMsg.date = dbres.rows[0].creation_date;

      // Broadcast to all members in the room
      nsp.to(room).emit('create-message', {message: newMsg});
    });

}

module.exports = {

  /**
   *
   * @returns {SocketIO.Server}
   */
  getIoServer: function () {
    return io;
  },

  setIoServer: function (server) {
    io = server;
  },

  setSession: function (sess) {
    session = sess;
  },

  /**
   *
   * @param convId {Number}
   */
  createConvNsp: function (convId) {
    console.log("createConvNsp");

    let nsp = io.of(`conv-${convId}`).use(sharedSession(session, {
      autoSave: true
    }));

    console.log(`WS nsp created/retrieved for conv#${convId}`);

    nsp.use((socket, next) => {
      let token = socket.handshake.query.token;
      jwt.verify(token, config.secret, (err) => {
        if (err) {
          return next(new Error('WS auth error'));
        }
      });
      return next();
    });

    nsp.on('connection', (socket) => {
      console.log(`user ${socket.id} connected to conv#${convId}`);
      nsp.clients(function (error, clients) {
        console.log(clients);
      });

      socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected from conv#${convId}`);
      });

      socket.on('join-thread-room', (threadId) => {
        socket.join(threadId);
        socket.handshake.session.user.activeThread = threadId;
        console.log(`user ${socket.id} joined room for thread#${threadId}`);
      });

      socket.on('create-message', (data) => {
        console.log('create-message ws');
        console.log(data.message);

        let user   = socket.handshake.session.user,
            newMsg = new TMessage({
              author: user.id,
              content: data.message.content,
              thread: user.activeThread
            });

        createMessage(newMsg, nsp, user.activeThread);
      });

      socket.on('create-thread', (data) => {
        console.log('create-thread ws');
        console.log(data.thread);

        let user      = socket.handshake.session.user,
            newThread = new Thread({
              author: user.id,
              message_parent: data.thread.message_parent,
              thread_parent: data.thread.thread_parent,
              conversation: convId
            });

        createThread(newThread, nsp);
      });
    });

    return nsp;
  }


};
