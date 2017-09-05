import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Message } from '../../_models/message';

import * as $ from 'jquery';
import { WebSocketService } from '../../_services/web-socket.service';
import { WsMessage } from '../../_models/ws-message';
import { AuthService } from '../../../_services/auth.service';
import { Thread } from '../../_models/thread';
import { ThreadService } from '../../_services/thread.service';

@Component({
  selector   : 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls  : ['./new-message.component.less']
})
export class NewMessageComponent implements OnInit {
  @ViewChild('messageContentContainer') private scrollContainer: ElementRef;

  @Input() thread: Thread;
           message: Message = new Message();

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private threadService: ThreadService,
    private ws: WebSocketService
  ) {
    this.ws.message$.subscribe(
      msg => {
        console.log("lol");
        console.log(msg);
      });
  }

  ngOnInit() {}

  goToTreeView() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

  handleSubmit($event) {
    if ($event.keyCode !== 13) return;

    // On 'enter' key press only
    $event.preventDefault();

    // Send the message
    if (!$event.shiftKey) {
      this.sendMessage();
      return;
    }

    // Or add a new line
    this.message.content += '\r\n';
    // Scroll to the bottom of the textarea
    $(this.scrollContainer.nativeElement)
      .animate({
          scrollTop: $(this.scrollContainer.nativeElement).prop("scrollHeight")
        },
        100
      );

  };

  sendMessage() {
    this.message.thread = this.thread.id;
    console.log('message to send :');
    console.log(this.message);
    //this.ws.sendRequest(new WsMessage(
    //  "create-message", {
    //    message: this.message,
    //    convId : this.thread.conversation
    //  }
    //), this.onNewMessage, this);
    this.ws.createMessage(this.message);
  }

  //noinspection JSMethodCanBeStatic
  private onNewMessage(data, $this) {
    let newMsg = new Message(
      data.msgId,
      data.date,
      $this.message.content,
      $this.auth.getUser().id,
      $this.message.thread
    );

    $this.threadService.addMessagesToActiveThread(newMsg);

    // Reset the new message object
    $this.message = new Message();
  }

}
