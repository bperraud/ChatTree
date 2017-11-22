const config  = require('../config/token');
const jwt     = require('jsonwebtoken');
const Message = require('../models/message');
const db      = require('../../server/db');
const SQL     = require('sql-template-strings');
const User    = require('../models/schemas/user');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

module.exports = {

  verifyToken: ((req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {

      jwt.verify(token, config.secret, (err, decoded) => {

        if (err) {
          return res.json(new Message(
            {},
            false,
            'Failed to authenticate token'
          ));
        } else {
            // all good, continue
            req.decoded = decoded;
            (async(function () {
              // note: we don't try/catch this because if connecting throws an exception
              // we don't need to dispose of the client (it will be undefined)
            if(req.session.user == null) {
              //rebuild req.session.user

              const client = await(db.pool.connect());
              let userEmail = decoded;
              let dbres = await(client.query(SQL`SELECT * FROM t_user WHERE email = ${userEmail}`));
              if (dbres.rowCount === 0) {
                return res.json(new Message(
                  {type: 'email'},
                  false,
                  'Aucun compte trouvé'
                ));
              }
              let user = new User(dbres.rows[0]);
              dbres = await(client.query(SQL`SELECT fk_conversation FROM t_conversation_user WHERE fk_member = ${user.id}`));
              dbres.rows.forEach(row => user.conversations.push(+row.fk_conversation));

              req.session.user = user;
              console.log("Auth user : " + req.session.user);

            }

            next();
          }))().catch(e => console.error(e.stack));

        }
      });

    } else {

      return res.json(new Message(
        {},
        false,
        'No token exists'
      ));

    }
  })

};
