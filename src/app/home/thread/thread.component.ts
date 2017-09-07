import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ThreadService } from '../_services/thread.service';
import { Thread } from '../_models/thread';
import { ConversationService } from '../_services/conversation.service';
import { Message } from '../_models/message';
import { Observable } from 'rxjs/Observable';
import { fadeInOutAnimation } from '../../_animations/fade-in-out.animation';
import { User } from '../_models/user';
import { AuthService } from '../../_services/auth.service';


import { WebSocketService } from '../_services/web-socket.service';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/observable/forkJoin';

@Component({
  selector   : 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls  : ['./thread.component.less'],
  animations : [fadeInOutAnimation]
})
export class ThreadComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') private scrollContainer: ElementRef;

  user: User;
  thread: Observable<Thread>;
  activeThread: Thread;
  messagesSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private convService: ConversationService,
    private threadService: ThreadService,
    private ws: WebSocketService
  ) {
    this.user = this.auth.getUser();
    this.messagesSubscription = this.ws.message$.subscribe(
      msg => {
        if (msg.thread === this.activeThread.id)
          this.threadService.addMessagesToActiveThread(msg);
      });
  }

  ngOnInit() {
    console.log("ThreadComponent INIT");
    this.threadService.scrollContainer = this.scrollContainer;

    this.route.paramMap.subscribe((params: ParamMap) => {
        this.threadService.activeThread = this.convService.activeConversation.threads.find(
          thread => thread.id === +params.get('id')
        );

      let thread: Thread = this.threadService.activeThread;

      this.threadService.getThreadMessages(thread.id, thread.conversation)
        .subscribe((messages: Array<Message>) => {
          let thread: Thread = this.threadService.activeThread;
          this.threadService.addMessagesToActiveThread(messages);
          this.thread       = Observable.of(thread);
          this.activeThread = thread;

          // Join the thread room
          this.ws.joinThreadRoom(thread.id);
        });
      });
  }

  ngOnDestroy() {
    this.messagesSubscription.unsubscribe();
  }

  showUserModal() {
    // TODO: implement this by a service + profile component (?)
  }

  getAuthorMember(id: number) {
    if (this.user.id === id)
      return this.user;

    return this.convService.activeConversation.members.find(m => m.id === id);
  }

  /*$scope.templateUrl = function () {
    return "/views/partials/thread.html";
  };

  $scope.showUserModal = function () {
    $rootScope.showUserModal();
  };

  console.log("Moved to => ThreadController | threadId : " + $routeParams.threadId);
  $scope.threadId = $routeParams.threadId;
         $rootScope.activeThreadId = $routeParams.threadId;

  $scope.goToTreeView = function () {
    if ($rootScope.activeConvId !== undefined) {
      $location.url('/conversation/' + $rootScope.activeConvId + '?nore=true');
    }
  };

  $scope.formatUserName = function (memberId) {
    var member;
    if (memberId === this.auth.getUser()._id) {
      member = this.auth.getUser();
    } else {
      member = $rootScope.conversations[$rootScope.activeConvId].members[memberId];
    }
    var res;
    if (member.surname !== undefined && member.name !== undefined)
      res = member.surname + ' ' + member.name;
    else if (member.name !== undefined)
      res = member.name;
    else if (member.surname !== undefined)
      res = member.surname;
    else
      res = member.email;
    res += "\u00A0\u2014\u00A0";
    return res;
  };

  $scope.getTemplateMessage = function (author) {
    switch (author) {
      case this.auth.getUser()._id:
        return "/views/partials/message-me.html";
      default:
        return "/views/partials/message-other.html";
    }
  };

  $scope.initThread = function () {
    console.log("initThread start");
    $scope.conversation = $rootScope.conversationsDetails[$rootScope.activeConvId];
    var convParent = $scope.conversation;
    $scope.thread = convParent.threads[$scope.threadId];
    var thread = $scope.thread;

    if (thread.fatherThread === null)
      $scope.headerTitle = "Fil principal";
    else {
      $scope.headerTitle = thread.title === "" ? "Fil #" + $scope.threadId : thread.title;
    }

    $rootScope.threadsMessages[$scope.threadId] = thread.messages;
  };

  $scope.initThread();

  // -------------------------------------------------------------------------
  //  NEW MESSAGE
  // -------------------------------------------------------------------------

  $scope.message = {
    content: ""
  };

  $scope.handleSubmit = function ($event) {
    $event.preventDefault();
    if ($event.keyCode === 13) {
      // NewLine
      if (!$event.shiftKey) {
        $scope.createMessage();
      }
    }
  };

  var onNewMessage = function (data) {
    if (parseInt(data.code) !== 200) {
      console.log("onNewMessage KO");
      return LogoutService.errorToLogout(WS);
    }

    console.log("onNewMessage OK");
    var newMsg = data.content;
    console.log(newMsg);

    $rootScope.threadsMessages[$scope.threadId].push({
      author: newMsg.author,
      content: newMsg.content,
      date: newMsg.date,
      father: newMsg.father
    });
    $rootScope.safeApply();
  };

  $scope.createMessage = function () {

    if ($scope.message.content === "")
      return;

    var msg = {
      action: "new-message",
      content: {
        convId: $rootScope.activeConvId,
        father: $rootScope.activeThreadId,
        content: $scope.message.content
      },
      performative: "request"
    };
    WS.sendRequest(msg, onNewMessage);

    $scope.message.content = "";
  };*/

}
