const express = require('express');
const router  = express.Router();
const SQL     = require('sql-template-strings');
const db      = require('../../server/db');

const User         = require('../models/schemas/user');
const Conversation = require('../models/schemas/conversation');
const Message      = require('../models/message');

const auth = require('../middleware/auth');

// Get our API routes
const conversation = require('./conversation');
const thread       = require('./thread');

// TODO: factorize verifyToken into a global middleware for all API routes
router.put('/set-user', auth.verifyToken, (req, res) => {

  req.session.user = req.body.user;

  return res.json(new Message(
    null,
    true,
    'Profil mis à jour avec succès'
  ));
});

// Get a user conversations list
router.get('/get-conversations', auth.verifyToken, (req, res) => {
  console.log("User : " + req.session.user);
  let user = new User(req.session.user);

  if (user.conversations.length === 0)
    return res.json(new Message(
      {conversations: []},
      true,
      'Aucune conversation existante'
    ));

  let convIds = user.conversations;

  db.query(
    SQL`
    SELECT
    t_conversation.id c_id,
    t_conversation.title c_title,
    t_conversation.picture c_picture,
    t_user.id u_id,
    t_user.login u_login,
    t_user.email u_email,
    t_user.firstname u_firstname,
    t_user.lastname u_lastname,
    t_user.profile_picture u_pp
    FROM t_conversation
    INNER JOIN t_conversation_user ON t_conversation.id = t_conversation_user.fk_conversation
    INNER JOIN t_user ON t_user.id = t_conversation_user.fk_member
    WHERE t_conversation.id = ANY (${convIds})
    `, (err, dbres) => {
      if (err) throw err;

      let lastConvId    = null;
      let conversations = [],
          conversation,
          member;

      dbres.rows.forEach(row => {
        // New conversation found
        if (row.c_id !== lastConvId) {
          conversation = new Conversation(row);
          member       = new User(row);
          conversation.members.push(member);
          lastConvId = row.c_id;
          conversations.push(conversation);
        }
        // Conversation member found
        else {
          member = new User(row);
          conversation.members.push(member);
        }
      });

      return res.json(new Message(
        {conversations},
        true,
        'Conversations récupérées avec succès'
      ));
    });
});

// Get a list of users by search
router.get('/search-users', auth.verifyToken, (req, res) => {

  let searchTerm = `.*${req.query.q}.*`,
      parsedIds  = [req.session.user.id].concat(JSON.parse(req.query.ids));
  db.query(
    SQL`
    SELECT
    id, login, email, profile_picture
    FROM t_user
    WHERE (
      login ~* ${searchTerm} OR
      email ~* ${searchTerm}
    ) AND NOT
    (id = ANY (${parsedIds}))
    `, (err, dbres) => {
      if (err) throw err;

      dbres.rows.forEach(function (row) {
          if (row['profile_picture'] !== null)
            row['profile_picture'] = Buffer.from(row['profile_picture']).toString('base64');
        }
      );

      return res.json(new Message(
        {users: dbres.rows},
        true,
        'Recherche effectuée'
      ));
    });
});

// Conversation routes
router.use('/', conversation);
router.use('/', thread);

module.exports = router;
