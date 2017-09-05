const express = require('express');
const router  = express.Router();
const SQL     = require('sql-template-strings');
const db      = require('../../server/db');

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const User     = require('../models/schemas/user');
const Thread   = require('../models/schemas/thread');
const TMessage = require('../models/schemas/message');
const Message  = require('../models/message');

const auth = require('../middleware/auth');

// Get a thread (with its messages)
router.get('/get-thread/:convId/:id', auth.verifyToken, (req, res) => {
  let user     = new User(req.session.user);
  let convId   = +req.params.convId;
  let threadId = +req.params.id;

  if (user.conversations.indexOf(convId) === -1) {
    return res.json(new Message(
      {},
      false,
      'Erreur d\'accès'
    ));
  }

  db.query(
    SQL`
    SELECT id, fk_author author, creation_date date, content, fk_thread_parent thread
    FROM t_message WHERE fk_thread_parent = ${threadId}
    `, (err, dbres) => {
    if (err) throw err;

    let messages = [], message;

    dbres.rows.forEach(row => {
      message = new TMessage(row);
      messages.push(message);
    });

    return res.json(new Message(
      {messages},
      true,
      'Thread récupéré avec succès'
    ));
  });
});

module.exports = router;
