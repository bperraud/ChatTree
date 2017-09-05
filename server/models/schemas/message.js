const atts     = ['id', 'fk_author', 'creation_date', 'content', 'fk_thread_parent'];
const aug_atts = [];
const alt_atts = ['author', 'date', 'thread'];
const prefix   = 'm_';

class Message {

  constructor(obj) {
    // Atts
    this.id               = null;
    this.fk_author        = null;
    this.creation_date    = null;
    this.content          = null;
    this.fk_thread_parent = null;

    // Augmented atts
    //this.xxx = [];

    for (let field in obj) {
      if (obj.hasOwnProperty(field)) {
        if (
          atts.indexOf(field) > -1 ||
          aug_atts.indexOf(field) > -1 ||
          alt_atts.indexOf(field) > -1
        )
          this[field] = obj[field];
        else if (
          atts.map(att => `${prefix}${att}`).indexOf(field) > -1 ||
          aug_atts.map(att => `${prefix}${att}`).indexOf(field) > -1 ||
          alt_atts.map(att => `${prefix}${att}`).indexOf(field) > -1
        )
          this[field.substr(2)] = obj[field];
      }
    }
  }
}

module.exports = Message;
