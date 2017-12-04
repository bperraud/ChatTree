const express = require('express');
const router  = express.Router();
const SQL     = require('sql-template-strings');
const db      = require('../../server/db');

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const User         = require('../models/schemas/user');
const Conversation = require('../models/schemas/conversation');
const Thread       = require('../models/schemas/thread');
const Message      = require('../models/message');

const auth = require('../middleware/auth');

const convSocket = require('../websocket/conversation.io');

// Get a conversation (with its threads)
router.get('/get-conv/:id', auth.verifyToken, (req, res) => {
  let user   = new User(req.session.user);
  let convId = +req.params.id;

  if (user.conversations.indexOf(convId) === -1) {
    console.log(req.session);
    console.log(user);
    console.log(user.conversations);
    return res.status(401).json(new Message(
      {},
      false,
      'Erreur d\'accès'
    ));
  }

  (async(function () {
    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    const client = await(db.pool.connect());

    try {
      await(client.query('BEGIN'));
      let dbres;

      // Retrieve the conversation
      dbres = await(client.query(
        SQL`
        SELECT
        t_conversation.id c_id,
        t_conversation.title c_title,
        t_conversation.picture c_picture,
        t_conversation.fk_root_thread c_fk_root_thread,
        t_user.id u_id,
        t_user.login u_login,
        t_user.email u_email,
        t_user.firstname u_firstname,
        t_user.lastname u_lastname,
        t_user.profile_picture u_pp
        FROM t_conversation
        INNER JOIN t_conversation_user ON t_conversation.id = t_conversation_user.fk_conversation
        INNER JOIN t_user ON t_user.id = t_conversation_user.fk_member
        WHERE t_conversation.id = ${convId}
        `
      ));

      let conversation = new Conversation(dbres.rows[0]),
          member;
      dbres.rows.forEach(row => {
        // Conversation member found
        member = new User(row);
        conversation.members.push(member);
      });

      // Retrieve the threads of the conversation
      dbres = await(client.query(
        SQL`
        SELECT
        t_thread.id,
        t_thread.creation_date date,
        t_thread.title,
        t_thread.fk_author author,
        t_thread.fk_thread_parent thread_parent,
        t_thread.fk_message_parent message_parent,
        t_thread.fk_conversation conversation,
        t_tag_thread.name
        FROM t_thread
        LEFT OUTER JOIN t_tag_thread ON t_thread.id = t_tag_thread.fk_thread
        WHERE t_thread.fk_conversation = ${convId}
        `
      ));

      await(client.query('COMMIT'));

      let lastThreadId = null;
      let thread, tag;

      dbres.rows.forEach(row => {
        // New thread found
        if (row.id !== lastThreadId) {
          thread = new Thread(row);
          if (row.name !== null)
            tag = row.name;
          thread.tags.push(tag);
          lastThreadId = row.id;
          conversation.threads.push(thread);
        }
        // Tag found
        else {
          tag = row.name;
          thread.tags.push(tag);
        }
      });

      // Create the socket nsp for that conversation IF NEEDED
      if (!Object.keys(convSocket.getIoServer().nsps)
          .find(nspName => nspName === `/conv-${convId}`)) {
        convSocket.createConvNsp(convId);
      }

      return res.json(new Message(
        {conversation},
        true,
        'Conversation récupérée avec succès'
      ));

    } catch (e) {
      await(client.query('ROLLBACK'));
      throw e;
    } finally {
      client.release();
    }
  }))().catch(e => console.error(e.stack));
});

module.exports = router;
