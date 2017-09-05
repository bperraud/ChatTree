class Message {
  constructor(data, success, message) {
    this.data    = data ? data : {};
    this.success = success !== null ? success : true;
    this.message = message ? message : "";
  }
}

module.exports = Message;
