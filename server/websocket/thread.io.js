const config   = require('../config/token');
const jwt      = require('jsonwebtoken');

/** @type {SocketIO.Server} */
let io;

module.exports = {

  setIoServer: function (server) {
    io = server;
  },

  /**
   *
   * @param threadId {Number}
   */
  createThreadNsp: function (threadId) {

    const nsp = io.of(`conv-${threadId}`);

    console.log(`WS nsp created for thread#${threadId}`);

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
      console.log(`user connected to thread#${threadId}`);

      socket.on('disconnect', () => {
        console.log(`user disconnected from thread#${threadId}`);
      });
    });



  }


};
