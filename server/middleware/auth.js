const config  = require('../config/token');
const jwt     = require('jsonwebtoken');
const Message = require('../models/message');

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
          next();
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
