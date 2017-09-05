const WebSocket = require('ws');
const config    = require('../config/token');
const jwt       = require('jsonwebtoken');

const convWs   = require('./conversation.ws');
const threadWs = require('./thread.ws');

const Message = require('../models/ws-message');

module.exports = function (server) {

  const wss = new WebSocket.Server({server});

  function heartbeat() {
    this.isAlive = true;
  }

  // Broadcast to all members of a conversation
  wss.broadcast = function broadcast(msg, userId, convId) {
    Array.from(wss.clients)
      .filter(client => client.readyState === WebSocket.OPEN) // Open connections
      .filter(client => client.user.conversations.indexOf(convId) !== -1) // Conversation members
      .filter(client => client.user.id !== userId) // Except the author
      .forEach(function each(client) {
        client.send(JSON.stringify(msg));
      });
  };

  wss.on('connection', function connection(ws, req) {

    console.log("ON CONNECTION (WS)");
    ws.isAlive      = true;
    ws.isAuthorized = false;
    ws.on('pong', heartbeat);

    setInterval(function ping() {
      wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
          console.log("Dead connection");
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping('', false, true);
      });
    }, 60000);

    setTimeout(function dieIfUnauthorized() {
      if (!ws.isAuthorized)
        return ws.terminate();
    }, 1000);

    ws.sendJson = function sendJson(data) {
      ws.send(JSON.stringify(data));
    };

    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
      message   = JSON.parse(message);
      let token = message.token;

      if (token) {
        jwt.verify(token, config.secret, (err) => {
          if (err) {
            ws.sendJson(new Message(message.id, null, null, false, 'Fatal Error: invalid token'));
            ws.terminate();
          } else { // all good, continue
            switch (message.action) {
              case "init" :
                ws.isAuthorized = true;
                ws.user         = message.content.user;
                ws.sendJson(new Message(message.id, null, null, true, 'Init successful'));
                break;
              case "create-conversation":
                convWs.createConversation(ws.user, message.content, message.id, wss, ws);
                break;
              case "create-message":
                threadWs.createMessage(ws.user, message.content, message.id, wss, ws);
                break;
              default:
                ws.sendJson(new Message(message.id, null, null, false, 'Error: unknown action'));
            }
          }
        });
      } else {
        ws.sendJson(new Message(message.id, null, false, 'Fatal Error: No token exists'));
        ws.terminate();
      }

    });

    ws.on('close', function close() {
      console.log('Ws disconnected!');
    });

    ws.sendJson(new Message(null, null, null, true, 'Connection established'));
  });

  return wss;
};
