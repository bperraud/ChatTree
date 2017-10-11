const socketIo = require('socket.io');
const config = require('../config/token');
const jwt = require('jsonwebtoken');

const SQL = require('sql-template-strings');
const db = require('../../server/db');

const sharedSession = require('express-socket.io-session');

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const Conversation = require('../models/schemas/conversation');
const User = require('../models/schemas/user');

/** @type SocketIO.Server */
let io;
let session;

/**
 ---------------- DOCS ----------------
 // sending to sender-client only
 socket.emit('message', "this is a test");

 // sending to all clients, include sender
 io.emit('message', "this is a test");

 // sending to all clients except sender
 socket.broadcast.emit('message', "this is a test");

 // sending to all clients in 'game' room(channel) except sender
 socket.broadcast.to('game').emit('message', 'nice game');

 // sending to all clients in 'game' room(channel), include sender
 io.in('game').emit('message', 'cool game');

 // sending to sender client, only if they are in 'game' room(channel)
 socket.to('game').emit('message', 'enjoy the game');

 // sending to all clients in namespace 'myNamespace', include sender
 io.of('myNamespace').emit('message', 'gg');

 // sending to individual socketid
 socket.broadcast.to(socketid).emit('message', 'for your eyes only');
 */

/**
 *
 * @param newConv {Conversation}
 * @param user
 * @param user {SocketIO.Socket}
 */
function createConversation(newConv, user, socket) {
  console.log("createConversation");
  console.log(newConv);

  let title = newConv.title === '' ? null : newConv.title;

  (async(function () {
    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    const client = await(db.pool.connect());

    try {
      await(client.query('BEGIN'));
      let res;

      // Insert the new conversation
      res = await(client.query(
        SQL`
            INSERT INTO t_conversation(title)
            VALUES (${title})
            RETURNING id
            `
      ));

      let convId = res.rows[0].id;

      // Insert new (root) thread for the conversation
      res = await(client.query(
        SQL`INSERT INTO t_thread(fk_conversation) VALUES (${convId}) RETURNING id`
      ));

      let rootId = res.rows[0].id;

      // Update the root thread ref for the conversation
      await(client.query(
        SQL`UPDATE t_conversation SET fk_root_thread = ${rootId} WHERE id = ${convId}`
      ));

      // Insert the new conversation for users
      for (let id of newConv.members) {
        await(client.query(
          SQL`
            INSERT INTO t_conversation_user(fk_conversation, fk_member)
            VALUES (${convId}, ${id})
            `
        ));
      }

      // Retrieve the list of members of the new conversation
      res = await(client.query(
        SQL`
          SELECT id u_id, login u_login, email u_email, firstname u_firstname, lastname u_lastname, profile_picture u_pp
          FROM  t_user
          WHERE id = ANY (${newConv.members.filter(id => id !== user.id)})
          `
      ));

      let members = [], member;
      res.rows.forEach(row => {
        member = new User(row);
        members.push(member);
      });

      await(client.query('COMMIT'));

      newConv.root = rootId;
      newConv.id = convId;
      newConv.members = members;

      // Broadcast to all members of the conversation
      Object.keys(io.sockets.sockets)
        .map(id => { return io.sockets.sockets[id]; }) // Get the socket itself
        .map(socket => {
          return {
            user: socket.handshake.session.user,
            socketId: socket.id,
            session: socket.handshake.session
          };
        }) // Get the user
        .filter(data => newConv.members.map(m => m.id).indexOf(data.user.id) !== -1) // Member of the conv
        .forEach(data => {
          socket.broadcast.to(data.socketId).emit('new-conversation', {conversation: newConv});
        });

      // Send to the client itself
      socket.emit('create-conversation', {conversation: newConv});

    } catch (e) {
      await(client.query('ROLLBACK'));
      throw e;
    } finally {
      client.release();
    }
  }))().catch(e => console.error(e.stack));

}

module.exports = {

  setSession: function(sess) {
    session = sess;
  },

  /**
   *
   * @param server
   * @returns {SocketIO.Server}
   */
  startServer: function (server) {

    io = socketIo.listen(server, {
      origins: 'http://localhost:4200'
    });

    require('./conversation.io').setIoServer(io);
    //require('./thread.io').setIoServer(io);

    io.use((socket, next) => {
      let token = socket.handshake.query.token;
      jwt.verify(token, config.secret, (err) => {
        if (err) {
          return next(new Error('WS auth error'));
        }
      });
      return next();
    });

    io.use(sharedSession(session, {
      autoSave: true
    }));

    io.on('connection', (socket) => {
      console.log(`user ${socket.id} connected to global ws`);

      socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected from global ws`);
      });

      socket.on('create-conversation', (data) => {
        console.log('create-conversation ws');
        console.log(data);

        let user = socket.handshake.session.user,
          newConv = new Conversation({
            members: data.conv.members.map(m => m.id),
            title: data.conv.title
          });

        createConversation(newConv, user, socket);
      });
    });

    return io;
  }
};
