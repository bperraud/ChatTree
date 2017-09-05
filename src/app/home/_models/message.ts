export class Message {
  id: number;
  date: Date;
  content: string;
  author: number;
  thread: number;

  constructor(id?: number, date?: Date, content?: string, author?: number, thread?: number) {
    this.id      = id ? id : null;
    this.date    = date ? date : null;
    this.content = content ? content : "";
    this.author  = author ? author : null;
    this.thread  = thread ? thread : null;
  }
}
