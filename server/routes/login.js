const express = require('express');
const router  = express.Router();
const SQL     = require('sql-template-strings');
const jwt     = require('jsonwebtoken');
const config  = require('../config/token');
const auth    = require('../middleware/auth');
const User    = require('../models/schemas/user');
const Message = require('../models/message');
const db      = require('../../server/db');

const async = require('asyncawait/async');
const await = require('asyncawait/await');

router.get('/check-state', auth.verifyToken, (req, res) => {
  return res.json(new Message(
    {},
    true,
    'Successfully logged in'
  ));
});

// TODO: Check length password > 4 (bypass...)
router.post('/signup', (req, res) => {

  let reqUser = req.body;

  process.nextTick(() => {
    if (reqUser.password && reqUser.confirmPassword !== reqUser.password) {
      return res.json(new Message(
        {type: 'passwordConfirm'},
        false,
        'Le mot de passe et sa confirmation doivent être identiques'
      ));
    }

    db.query(SQL`SELECT * FROM t_user WHERE email = ${reqUser.email}`, (err, dbres) => {
      if (err) throw err;

      if (dbres.rowCount > 0) {
        return res.json(new Message(
          {type: 'email'},
          false,
          'Email déjà utilisé'
        ));
      }

      let user      = new User();
      user.email    = reqUser.email;
      user.password = User.generateHash(reqUser.password);
      user.conversations = [];

      db.query(SQL`INSERT INTO t_user(email, password) VALUES(${user.email}, ${user.password})`, (err) => {
        if (err) throw err;

        let token = jwt.sign(user, config.secret, {
          expiresIn: 60 * 60 * 24
        });

        req.session.user = user;

        return res.json(new Message(
          {user, token},
          true,
          'Compte créé'
        ));
      });
    });
  });
});

router.post('/login', (req, res) => {

  let identifiant = req.body.email;

  db.query(SQL`SELECT * FROM t_user WHERE email = ${identifiant} OR login = ${identifiant}`, (err, dbres) => {
    if (err) throw err;

    if (dbres.rowCount === 0) {
      return res.json(new Message(
        {type: 'email'},
        false,
        'Aucun compte trouvé'
      ));
    }

    let user = new User(dbres.rows[0]);

    if (!user.validPassword(req.body.password)) {
      return res.json(new Message(
        {type: 'password'},
        false,
        'Mot de passe incorrect'
      ));
    }

    db.query(SQL`SELECT fk_conversation FROM t_conversation_user WHERE fk_member = ${user.id}`, (err, dbres) => {
      if (err) throw err;

      dbres.rows.forEach(row => user.conversations.push(+row.fk_conversation));

      let token = jwt.sign(user, config.secret, {
        expiresIn: 60 * 60 * 24
      });

      (async(function () {
        try {
          await(req.session.user = user);
        } catch (e) {
          throw e;
        }
      }))().catch(e => console.error(e.stack));

      return res.json(new Message(
        {user, token},
        true,
        'Connexion réussie'
      ));
    });
  });
});

router.delete('/logout', (req, res) => {
  req.session.destroy();

  return res.json(new Message(
    {},
    true,
    'Déconnexion réussie'
  ));
});

module.exports = router;
