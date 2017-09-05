class Message {
  constructor(id, action, data, success, message) {
    this.id      = id ? id : null;
    this.action  = action ? action : null;
    this.data    = data ? data : {};
    this.success = success !== null ? success : true;
    this.message = message ? message : "";
  }
}

module.exports = Message;
