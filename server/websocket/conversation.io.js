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
 * @param nsp {Namespace}
 * @param room {String}
 */
function createMessage(newMsg, nsp, room) {
  console.log("createMessage");

  // Insert the new message
  db.query(
    SQL`
      INSERT INTO t_message(fk_author, content, fk_thread_parent)
      VALUES (${newMsg.author}, ${newMsg.content}, ${newMsg.thread})
      RETURNING id, creation_date
      `, (err, dbres) => {
      if (err) throw err;

      newMsg.id = dbres.rows[0].id;
      newMsg.date = dbres.rows[0].creation_date;

      console.log(room);
      // Broadcast to all members in the room
      nsp.to(room).emit('create-message', {message: newMsg});

/*      socket.emit('create-message-done', {message: newMsg});


      // Broadcast to all members in the room
      socket.to(room).emit('create-message', {message: newMsg});*/
    });

}

module.exports = {

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

    const nsp = io.of(`conv-${convId}`).use(sharedSession(session, {
      autoSave: true
    }));

    console.log(`WS nsp created for conv#${convId}`);

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
      console.log(`user connected to conv#${convId}`);

      socket.on('disconnect', () => {
        console.log(`user disconnected from conv#${convId}`);
      });

      socket.on('join-thread-room', (threadId) => {
        socket.join(threadId);
        socket.handshake.session.user.activeThread = threadId;
        console.log(`user joined room for thread#${threadId}`);
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

  }


};
