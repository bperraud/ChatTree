export class WsMessage {
  id: string;
  token: string;
  action: string;
  content: object;

  constructor(action: string, content?: object) {
    this.action  = action;
    this.content = content ? content : {};
  }
}
