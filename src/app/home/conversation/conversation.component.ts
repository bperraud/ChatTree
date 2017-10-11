import { AfterViewInit, Component, OnInit } from '@angular/core';
import { WebSocketService } from '../_services/web-socket.service';
import { AuthService } from '../../_services/auth.service';
import { Http } from '@angular/http';
import { Conversation } from '../_models/conversation';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ConversationService } from '../_services/conversation.service';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.less']
})
export class ConversationComponent implements OnInit {

  conversation: Conversation;
  conversationSubscription: Subscription;

  constructor(
    private http: Http,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private ws: WebSocketService,
    private convService: ConversationService
  ) {
    this.ws.thread$.subscribe(
      thread => {
        convService.addThreadToConversation(thread);
      });
  }

  ngOnInit() {
    console.log("ConversationComponent INIT");

    this.route.paramMap
      .switchMap((params: ParamMap) =>
        this.convService.getConversation(+params.get('id')))
      .subscribe((conv: Conversation) => {
      console.info("Active conversation:");
      console.info(conv);
      this.conversation = conv;
      this.ws.connectToConvNsp(conv.id);
      // Auto-redirect to the root thread // TODO: see if we keep this behaviour
      if (this.conversation.threads.length === 1) {
        this.router.navigate(['./thread', this.conversation.threads[0].id], { relativeTo: this.route });
      }
      else {
        this.router.navigate(['./overview'], { relativeTo: this.route });
      }
    });
  }

/*
  var onGetConv = function (data) {
    if (parseInt(data.code) !== 200) {
      console.log("onGetConv KO");
      return LogoutService.errorToLogout(WS);
    }

    console.log("onGetConv OK");

    $scope.conversation = data.content.conversation;
    $rootScope.conversationsDetails[$scope.conversation._id] = $scope.conversation;


    var contacts = $rootScope.conversations[$rootScope.activeConvId].members;
    $rootScope.activeConv = {};
    $rootScope.activeConv.members = [];

    var me = this.auth.getUser();
    var res;
    if (me.surname !== undefined && me.name !== undefined)
      res = me.surname + ' ' + me.name;
    else if (me.name !== undefined)
      res = me.name;
    else if (me.surname !== undefined)
      res = me.surname;
    else
      res = null;
    me.label = res;
    AuthService.setUser(me);
    $rootScope.activeConv.members.push(me);
    $.each(contacts, function (i, contact) {
      if (contact.surname !== undefined && contact.name !== undefined)
        res = contact.surname + ' ' + contact.name;
      else if (contact.name !== undefined)
        res = contact.name;
      else if (contact.surname !== undefined)
        res = contact.surname;
      else
        res = null;
      contact.label = res;
      $rootScope.activeConv.members.push(contact);
    });

    // Auto redirect to the detail of the root thread if no other thread
    var threads_o = $scope.conversation.threads;
    console.log("THE CONV :");
    console.log($scope.conversation);

    if ($location.search().nore === undefined) {
      if (Object.keys(threads_o).length === 1) {
        console.log("Redirect to root thread needed");
        $location.path('/thread/' + Object.keys(threads_o)[0]).replace();
        $rootScope.safeApply();
        return;
      }
    }

    // Auto-set the title of the root thread if not set
    var rootTitle = threads_o[Object.keys(threads_o)[0]].title;
    if (rootTitle === "")
      threads_o[Object.keys(threads_o)[0]].title = "Fil principal";

    if ($scope.conversation.title !== '')
      $scope.headerTitle = $scope.conversation.title;
    else {
      res = 'Conversation avec ';
      var members = angular.copy($rootScope.activeConv.members);
      members.splice(0, 1);
      res += members.map(function (member) {
        return member.label;
      }).join(', ');
      $scope.headerTitle = res;
    }

    $scope.conversation.threadsArray = [];
    $.each($scope.conversation.threads, function (key, val) {
      $scope.conversation.threadsArray.push(val);
    });

    if ($rootScope.treeViewReady) {
      buildTreeConfig();
      $rootScope.treeViewReady = false;
    } else {
      $scope.$on('treeViewReady', function (event, args) {
        buildTreeConfig();
        $rootScope.treeViewReady = false;
      });
    }
  };
*/

/*
  $scope.initConv = function () {

    console.log("The conv tree to display :");
    console.log($scope.conversation);

    var msg = {
      action: "get-conv",
      content: {
        "_id": $scope.convId
      },
      performative: "query-ref"
    };
    WS.sendRequest(msg, onGetConv);
  };
*/

  //$scope.initConv();

}
