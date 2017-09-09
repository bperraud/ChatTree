const atts     = ['id', 'fk_root_thread', 'title', 'picture'];
const aug_atts = ['members', 'root', 'threads'];
const prefix   = 'c_';

class Conversation {

  constructor(obj) {
    // Atts
    this.id             = null;
    this.fk_root_thread = null;
    this.title          = null;
    this.picture        = null;

    // Augmented atts
    this.members = [];
    this.threads = [];

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
}

module.exports = Conversation;
