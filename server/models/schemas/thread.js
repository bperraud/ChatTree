const atts     = ['id', 'creation_date', 'fk_message_parent', 'fk_thread_parent', 'fk_conversation', 'title'];
const aug_atts = ['tags'];
const alt_atts = ['date', 'message_parent', 'thread_parent', 'conversation'];
const prefix   = 't_';

class Thread {

  constructor(obj) {
    // Atts
    this.id                = null;
    this.creation_date     = null;
    this.fk_message_parent = null;
    this.fk_thread_parent  = null;
    this.fk_conversation   = null;
    this.title             = null;

    // Augmented atts
    this.tags = [];

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

module.exports = Thread;
