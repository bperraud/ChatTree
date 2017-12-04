import { Injectable } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { AuthService } from '../../_services/auth.service';
import { ToastService } from './toast.service';
import { Subject } from 'rxjs/Subject';
import { Message } from '../_models/message';
import { Conversation } from '../_models/conversation';

import io from 'socket.io-client';
import { Thread } from '../_models/thread';

@Injectable()
export class WebSocketService {

  // TODO: externalize the observables to the thread and conversation services instead

  // Observable sources
  private messageSource        = new Subject<Message>();
  private threadSource         = new Subject<Thread>();
  private threadUpdatedSource  = new Subject<Thread>();
  private conversationSource   = new Subject<Conversation>();
  private conversationOKSource = new Subject<Conversation>();

  // Observable streams
  message$        = this.messageSource.asObservable();
  thread$         = this.threadSource.asObservable();
  threadUpdated$  = this.threadUpdatedSource.asObservable();
  conversation$   = this.conversationSource.asObservable();
  conversationOK$ = this.conversationOKSource.asObservable();

  constructor(
    private auth: AuthService,
    private toastService: ToastService
  ) {}

  private socket_url = 'http://localhost:3000';
  // private socket_url = 'https://07f4db71.ngrok.io';
  private mainSocket: any;
  private activeConvSocket: any;



  //-------------------------
  // WS NOTIFICATION HANDLERS
  //-------------------------

  /**
   * For both messages of others and mine
   *
   * @param {Message} msg
   */
  onNewMessage(msg: Message) {
    this.messageSource.next(msg);
  }

  /**
   * For both threads of others and mine
   *
   * @param {Thread} thread
   */
  onNewThread(thread: Thread) {
    this.threadSource.next(thread);
  }

  onNewConversation(conv: Conversation) {
    this.conversationSource.next(conv);
  }

  onCreateConversationOK(conv: Conversation) {
    this.conversationOKSource.next(conv);
  }

  onEditThread(thread: Thread) {
    this.threadUpdatedSource.next(thread);
  }

  private static generateUuid() {
    return UUID.UUID();
  }

  connect(): Observable<boolean> {
    const auth    = this.auth;
    let onLoggout = false;
    const $this = this;

    return Observable.fromPromise(new Promise((resolve, reject) => {

        // Instantiation of the connection
        this.mainSocket = io(`${this.socket_url}?token=${this.auth.getToken()}`);

        let onConnection = function () {
          console.log("Websocket connected");
          resolve(true);
        };

        let onConnectError = function (error) {
          console.error("Error at connection");
          console.error(error);
          resolve(false);
        };

        let onError = function (error) {
          console.error("WebSocket error:");
          console.error(error);
          if (onLoggout) return;

          this.toastService.showError('Oups, erreur serveur<br/>Vous allez être déconnecté... :/');
          onLoggout = true;

          setTimeout(() => {
            onLoggout = false; //TODO: improve this code... (the onLoggout var)
            reject(error);
            auth.logout().subscribe();
          }, 3000);
        };

      let onCreateConversation = function (data) {
        console.log("onCreateConversation");
        $this.onCreateConversationOK(data.conversation);
      };

      let onNewConversation = function (data) {
        console.log("onNewConversation");
        $this.onNewConversation(data.conversation);
      };

        // Event bindings
        this.mainSocket.on('connect', onConnection);
        this.mainSocket.on('connect_error', onConnectError);
        this.mainSocket.on('error', onError);
        this.mainSocket.on('create-conversation', onCreateConversation);
        this.mainSocket.on('new-conversation', onNewConversation);
      })
    );
  }

  connectToConvNsp(convId: Number) {
    const $this = this;

    // Instantiation of the connection
    this.activeConvSocket = io(`${this.socket_url}/conv-${convId}?token=${this.auth.getToken()}`);

    let onConnection = function () {
      console.log(`Websocket conv#${convId} connected`);

    };

    let onDisconnection = function () {
      console.log(`Websocket conv#${convId} disconnected`);
    };

    let onConnectError = function (error) {
      console.error(`Error at connection (conv#${convId})`);
      console.error(error);
    };

    let onError = function (error) {
      console.error(`WebSocket error (conv#${convId}):`);
      console.error(error);
    };

    let onCreateMessage = function (data) {
      console.log("onCreateMessage");
      $this.onNewMessage(data.message);
    };

    let onCreateThread = function (data) {
      console.log("onCreateThread");
      $this.onNewThread(data.thread);
    };

    let onEditThread = function (data) {
      console.log("onEditThread");
      $this.onEditThread(data.thread);
    };

    // Event bindings
    this.activeConvSocket.on('connect', onConnection);
    this.activeConvSocket.on('disconnect', onDisconnection);
    this.activeConvSocket.on('connect_error', onConnectError);
    this.activeConvSocket.on('error', onError);
    this.activeConvSocket.on('create-message', onCreateMessage);
    this.activeConvSocket.on('create-thread', onCreateThread);
    this.activeConvSocket.on('edit-thread', onEditThread);
  }

  joinThreadRoom(threadId: Number) {
    this.activeConvSocket.emit('join-thread-room', threadId);
  }

  createMessage(message: Message) {
    let id = WebSocketService.generateUuid();
    this.activeConvSocket.emit('create-message', { message, id });
  }

  createThread(thread: Thread) {
    let id = WebSocketService.generateUuid();
    this.activeConvSocket.emit('create-thread', { thread, id });
  }

  /**
   * Only for title
   *
   * @param {Thread} thread
   */
  editThread(thread: Thread) {
    let id = WebSocketService.generateUuid();
    this.activeConvSocket.emit('edit-thread', { thread, id });
  }

  createConversation(conv: Conversation) {
    let id = WebSocketService.generateUuid();
    this.mainSocket.emit('create-conversation', { conv, id });
  }

  close() {
    if (this.mainSocket) {
      this.mainSocket.close();
      this.mainSocket = null;
    }
    if (this.activeConvSocket) {
      this.activeConvSocket.close();
      this.activeConvSocket = null;
    }
  }

}
