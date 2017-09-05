const socketIo = require('socket.io');
const config   = require('../config/token');
const jwt      = require('jsonwebtoken');

const Message = require('../models/ws-message');

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

module.exports = function (server) {

  const io = socketIo.listen(server, {
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

  io.on('connection', (socket) => {
    console.log('someone connected to global ws');

    socket.on('disconnect', () => {
      console.log('user disconnected from global ws');
    });
  });

  return io;
};
