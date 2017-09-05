import { Message } from './message';

export class Thread {
  id: number;
  date: Date;
  message_parent: number;
  thread_parent: number;
  conversation: number;
  title: string;
  tags: Array<string>;
  messages: Array<Message>;

  constructor() {
    this.tags  = [];
    this.messages = [];
    this.title = "";
  }
}
