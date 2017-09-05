import { Injectable } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { AuthService } from '../../_services/auth.service';
import { WsMessage } from '../_models/ws-message';
import { ToastService } from './toast.service';
import { Subject } from 'rxjs/Subject';
import { Message } from '../_models/message';

import io from 'socket.io-client';

@Injectable()
export class WebSocketService {

  private ws_uri                      = 'ws://localhost:3000';
  private ws: WebSocket               = null;
  private pendingRequests: object     = {};
  private pendingRequestsThis: object = {};

  // Observable sources
  private messageSource = new Subject<Message>();

  // Observable streams
  message$      = this.messageSource.asObservable();

  constructor(
    private auth: AuthService,
    private toastService: ToastService
  ) {}

  private socket_url = 'http://localhost:3000';
  private mainSocket: any;
  private activeConvSocket: any;



  //-------------------------
  // WS NOTIFICATION HANDLERS
  //-------------------------

  //onNewConversation(data) {
  //  var newConv = data.content.conversation;
  //  delete newConv.members[AuthService.getUser()._id];
  //
  //  $rootScope.conversations[newConv._id] = newConv;
  //  $rootScope.conversationsArray.push(newConv);
  //  localStorage.setItem('conversations', angular.toJson($rootScope.conversations));
  //  localStorage.setItem('conversationsArray', angular.toJson($rootScope.conversationsArray));
  //  $rootScope.$apply();
  //  $rootScope.$emit('showToast', {
  //    message: "Une nouvelle conversation vient d'être créée !"
  //  });
  //}

  //onNewThread(data) {
  //  console.log("onNewThread (other)");
  //  var newThread = data.content;
  //  console.log(newThread);
  //
  //  $rootScope.$broadcast('newThread', {
  //    thread: {
  //      _id            : newThread._id,
  //      title          : newThread.title,
  //      fav            : false,
  //      mute           : false,
  //      tags           : newThread.tags,
  //      fatherThread   : newThread.fatherThread,
  //      lastMessageTime: newThread.creationDate
  //    },
  //    convId: newThread.convId
  //  });
  //}

  onNewMessage(msg: Message) {
    this.messageSource.next(msg);
  }

  //onUpdateThread(data) {
  //  console.log("onUpdateThread (other)");
  //  var updatedThread = data.content;
  //  console.log(updatedThread);
  //
  //  $rootScope.$broadcast('updateThread', {
  //    thread: {
  //      _id  : updatedThread._id,
  //      title: updatedThread.title,
  //      tags : updatedThread.tags
  //    },
  //    convId: updatedThread.convId
  //  });
  //}

  private static generateUuid() {
    return UUID.UUID();
  }

  private destroy() {
    this.ws              = null;
    this.pendingRequests = {};
  }

  connect2(): Observable<boolean> {
    const $this   = this;
    const auth    = this.auth;
    let onLoggout = false;

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
            auth.logout().subscribe($this.destroy);
          }, 3000);
        };

        // Event bindings
        this.mainSocket.on('connect', onConnection);
        this.mainSocket.on('connect_error', onConnectError);
        this.mainSocket.on('error', onError);
      })
    );
  }

  connect(): Observable<boolean> {
    const $this   = this;
    const auth    = this.auth;
    let onLoggout = false;
    return Observable.fromPromise(
      new Promise((resolve, reject) => {

        let onOpen = function (evt) {
          console.log("Websocket connected:");
          console.log(evt);
          resolve(true);
        };

        let onMessage = function (evt) {
          console.log("Websocket message received:");
          console.log(evt.data);
          let wsMsg             = JSON.parse(evt.data),
              data              = wsMsg.data,
              id                = wsMsg.id,
              action            = wsMsg.action,
              handler: Function = $this.pendingRequests[id],
              $$this            = $this.pendingRequestsThis[id];

          // Answer from self action
          if (id && handler !== undefined) {
            handler(data, $$this);
            delete $this.pendingRequests[id];
            return;
          }

          // We received a message without being the sender
          if (handler === undefined && action) {
            switch (action) {
              //case "new-conversation":
              //  console.log("NEW CONV");
              //  onNewConversation(data);
              //  break;
              case "new-message":
                console.log("ws new-message");
                $this.onNewMessage(data.message);
                break;
              //case "new-thread":
              //  console.log("NEW THREAD");
              //  onNewThread(data);
              //  break;
              //case "update-thread":
              //  console.log("UPDATE THREAD");
              //  onUpdateThread(data);
              //  break;
              default:
                console.warn("Unkwown action from ws message");
            }
            return;
          }
        };

        let onError = function (error) {
          console.log("WebSocket error:");
          console.log(error);
          if (onLoggout) return;

          this.toastService.showError('Oups, erreur serveur<br/>Vous allez être déconnecté... :/');
          onLoggout = true;

          setTimeout(() => {
            onLoggout = false; //TODO: improve this code... (the onLoggout var)
            reject(error);
            auth.logout().subscribe($this.destroy);
          }, 3000);
        };

        let onClose = function (evt) {
          console.log("Websocket socket closed:");
          console.log(evt);
          if (evt.code === 1006) {
            onError(evt);
            return;
          }

          auth.logout().subscribe(this.destroy);
        };

        this.ws           = new WebSocket(this.ws_uri);
        this.ws.onopen    = onOpen;
        this.ws.onmessage = onMessage;
        this.ws.onerror   = onError;
        this.ws.onclose   = onClose;
      })
    );
  }

  connectToConvNsp(convId: Number): Observable<boolean> {
    const $this   = this;

    return Observable.fromPromise(new Promise((resolve, reject) => {

        // Instantiation of the connection
        this.activeConvSocket = io(`${this.socket_url}/conv-${convId}?token=${this.auth.getToken()}`);

        let onConnection = function () {
          console.log(`Websocket conv#${convId} connected`);
          resolve(true);
        };

        let onConnectError = function (error) {
          console.error(`Error at connection (conv#${convId})`);
          console.error(error);
          resolve(false);
        };

        let onError = function (error) {
          console.error(`WebSocket error (conv#${convId}):`);
          console.error(error);
        };

        let onCreateMessageOK = function (data) {
          console.log("onCreateMessageOK");
          console.log(data);
          console.log(typeof data);
          $this.onNewMessage(data);
        };

        // Event bindings
        this.activeConvSocket.on('connect', onConnection);
        this.activeConvSocket.on('connect_error', onConnectError);
        this.activeConvSocket.on('error', onError);
        this.activeConvSocket.on('create-message', onCreateMessageOK);
      })
    );
  }

  joinThreadRoom(threadId: Number) {
    this.activeConvSocket.emit('join-thread-room', threadId);
  }

  sendRequest(msg: WsMessage, callback?: Function, $this?) {
    msg.id    = WebSocketService.generateUuid();
    msg.token = this.auth.getToken();

    if (callback !== null) {
      this.pendingRequests[msg.id] = callback;
      if ($this !== null)
        this.pendingRequestsThis[msg.id] = $this;
    }
    this.ws.send(JSON.stringify(msg));
  }

  createMessage(message: Message) {
    let id = WebSocketService.generateUuid();
    this.activeConvSocket.emit('create-message', { message, id });
  }

  close() {
    this.mainSocket.close();
    if (this.activeConvSocket)
      this.activeConvSocket.close();
    //this.ws.close();
  }

}
