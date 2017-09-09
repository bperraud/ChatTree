const bcrypt = require('bcrypt-nodejs');

const atts     = ['id', 'login', 'password', 'email', 'firstname', 'lastname', 'profile_picture'];
const aug_atts = ['conversations'];
const prefix   = 'u_';

class User { // TODO: extends from a model super class which factorizes hydratation of atts
  constructor(obj) {
    // Atts
    this.id              = null;
    this.login           = null;
    this.password        = null;
    this.email           = null;
    this.firstname       = null;
    this.lastname        = null;
    this.profile_picture = null;

    // Augmented atts
    this.conversations = [];

    for (let field in obj) {
      if (obj.hasOwnProperty(field)) {
        if (atts.indexOf(field) > -1 || aug_atts.indexOf(field) > -1)
          this[field] = obj[field];
        else if (atts.map(att => `${prefix}${att}`).indexOf(field) > -1 ||
          aug_atts.map(att => `${prefix}${att}`).indexOf(field) > -1)
          this[field.substr(2)] = obj[field];
      }
    }
  }

  static generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  }

  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

module.exports = User;
