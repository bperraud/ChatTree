const SQL = require('sql-template-strings');
const db  = require('../../server/db');

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const User     = require('../models/schemas/user');
const Thread   = require('../models/schemas/thread');
const TMessage = require('../models/schemas/message');
const Message  = require('../models/ws-message');

const WebSocket = require('ws');

module.exports = {

  createMessage(user, data, msgId, wss, ws) {
    console.log("createMessage");

    let content  = data.message.content,
        threadId = data.message.thread,
        convId   = data.convId;

    // Insert the new message
    db.query(
      SQL`
      INSERT INTO t_message(fk_author, content, fk_thread_parent)
      VALUES (${user.id}, ${content}, ${threadId})
      RETURNING id, creation_date
      `, (err, dbres) => {
        if (err) throw err;

        ws.sendJson(new Message(msgId, {
          msgId: dbres.rows[0].id,
          date:  dbres.rows[0].creation_date
        }, true, 'Message créé avec succès'));

        // Broadcast to all conversation members
        wss.broadcast(new Message(msgId, 'new-message', {
            message: new TMessage({
              id:     dbres.rows[0].id,
              author: user.id,
              date:   dbres.rows[0].creation_date,
              content,
              thread: threadId
            })
          },
          true,
          `Nouveau message par ${user.login ? user.login : user.email} (thread #${threadId})`
        ), user.id, convId);

      });

  }


};
