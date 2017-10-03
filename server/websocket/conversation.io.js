const SQL = require('sql-template-strings');
const db  = require('../../server/db');

const config        = require('../config/token');
const jwt           = require('jsonwebtoken');
const sharedSession = require('express-socket.io-session');

const TMessage = require('../models/schemas/message');

/** @type {SocketIO.Server} */
let io;
let session;

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
      newMsg.id = dbres.rows[0].id;
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
  getIoServer: function() {
    return io;
  },

  setIoServer: function (server) {
    io = server;
  },

  setSession: function(sess) {
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
      nsp.clients(function(error, clients) {
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
              author:  user.id,
              content: data.message.content,
              thread:  user.activeThread
            });

        createMessage(newMsg, nsp, user.activeThread);
      });
    });

    return nsp;
  }


};
