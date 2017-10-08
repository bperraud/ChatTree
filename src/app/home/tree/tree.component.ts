import {
  NgModule, Component, Compiler, ElementRef,
  ViewChild, ViewContainerRef, ViewEncapsulation, OnInit, Renderer2, AfterViewChecked
} from '@angular/core';

import { AuthService } from '../../_services/auth.service';
import { Conversation } from '../_models/conversation';
import { ConversationService } from '../_services/conversation.service';

import * as $ from 'jquery';
import { Treant } from 'treant-js';
import * as moment from 'moment';

import { Thread } from '../_models/thread';
import { ActivatedRoute, Router } from '@angular/router';
import { ITreeOptions, TREE_ACTIONS } from 'angular-tree-component';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less']
})
export class TreeComponent implements OnInit {
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  @ViewChild('treeContainer') treeContainer: ElementRef;
  @ViewChild(TreeComponent)
  private tree: TreeComponent;


  conversation: Conversation;
  nodes: Array<Object>;
  nodesMap: Object;
  onTitleEdition: Object;
  titles: Object;

  options: ITreeOptions = {
    allowDrag: false,
    allowDrop: false,
    animateExpand: true,
    animateSpeed: 30,
    animateAcceleration: 1.2,
  };

  constructor(private auth: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private convService: ConversationService,
              private compiler: Compiler
  ) {
    this.nodesMap = {};
    this.onTitleEdition = {};
    this.titles = {};
  }

  ngOnInit() {
    console.log("TreeComponent INIT");
    this.conversation = this.convService.activeConversation;
    this.buildConversationTree();
  }

  /*  $scope.searchByTag = function (tag) {
      $scope.blockRedirectionToMessagesView = true;
      $location.url('tag/' + tag);
    };*/

  /*  $scope.loadMessagesView = function (threadId) {
      if (!$scope.edit[threadId]) {
        $location.url('thread/' + threadId);
      }
    };*/

  /*  $scope.edit = {};
           $scope.titles = {};*/

  /*  $scope.deleteThread = function (id) {
      if (id !== $scope.conversation.root) {
        var threads = $scope.conversation.threadsArray;
        var indexToDelete = -1;
        for (var i = 0; i < threads.length; i++) {
          if (threads[i]._id === id) {
            indexToDelete = i;
          }
        }
        if (indexToDelete !== -1) {
          $scope.conversation.threadsArray.splice(indexToDelete, 1);
          buildTreeConfig();
        } else {
          console.log('the element you are trying to delete is not a thread');
        }
      } else {
        console.log('you can\'t delete the root node !');
      }
    };*/

  buildData(threads) {
    let data = {};
    for (let i = 0; i < threads.length; i++) {
      data[threads[i].id] = {
        id: threads[i].id,
        fav: threads[i].fav,
        mute: threads[i].mute,
        newMessage: true,
        title: threads[i].title
      };
    }
    return data;
  }

  //generate HTML of a node from its data
  nodeHTML(data) {
    console.log("nodeHTML");
    console.log(data);
    let id         = `treeData[${data.id}]`;
    let newMessage = this.auth.getUser().lastConnectionTime < data.lastMessageTime;
    moment.locale('fr');
    // let date = moment(data.lastMessageTime).format('DD/MM/YYYY hh:mm');
    let date = moment(data.lastMessageTime).fromNow();

    return `
    <div id="thread-${data.id}" class="thread-node-wrapper">
      <span class="close" (click)="deleteThread(${data.id})"><i class="fa fa-times"></i></span>
      <span class="fav tool">
        <i class="fa fa-star-o"></i>
      </span>
      <span class="mute tool">
        <i class="fa fa-bell-slash-o is-mute"></i>
      </span>
      <span class="edit tool" (mousedown)="updateTitleWithPenTool(${data.id}, $event)">
        <i class="fa fa-pencil"></i>
      </span>
      <span class="new"></span>
      
      <a class="main-link" (click)="goToThread(${data.id})">
        <div class="content-container">
          <span [hidden]="onTitleEdition[${data.id}]" class="title ${newMessage ? 'new-message' : ''} ${!data.title ? 'no-title' : ''}"
                (click)="toggleEdition(${data.id}, true)"
          >{{titles[${data.id}] ? titles[${data.id}] : '&lt; Sans titre &gt;'}}</span>
          <input  type="text" class="edit-title"
                  [hidden]="!onTitleEdition[${data.id}]"
                  placeholder="Nom du thread"
                  (blur)="updateTitle(${data.id}, $event)"
                  (keyup)="updateTitle(${data.id}, $event)"
          />
          
          <p class="tags">
            <span class="tag" (click)="searchByTag('a tag')">
            TAG
            </span>
          </p>
        </div>
        
        <span class="time">${date}</span>
      </a>
    </div>
      
    <div class="thread-more" (click)="newThread(${data.id})">
      <i class="fa fa-plus"></i>
    </div>
`;


    /*//CONTAINER
    result += '<div id="thread' + data.id + '" class="thread-node-wrapper">';
    //CLOSE
    result += '<span class="close" ng-click="deleteThread(\'' + data.id + '\')"><i class="fa fa-times"></i></span>';
    //FAV
    result += '<span class="fav tool">' +
      '<span class="fa fa-star" ng-if="' + id + '.fav" ng-click="' + id + '.fav = !' + id + '.fav"></span>' +
      '<span class="fa fa-star-o " ng-if="!' + id + '.fav" ng-click="' + id + '.fav = !' + id + '.fav"></span>' +
      '</span>';
    //MUTE
    result += '<span class="mute tool" >' +
      '<i class="fa fa-bell" ng-show="!' + id + '.mute" ng-click="' + id + '.mute = !' + id + '.mute"></i>' +
      '<i class="fa fa-bell-slash-o is-mute" ng-show="' + id + '.mute" ng-click="' + id + '.mute = !' + id + '.mute"></i>' +
      '</span>';
    //EDIT
    result += '<span class="edit tool" ng-click="editThread(\'' + data.id + '\', $event)">' +
      '<i class="fa fa-pencil"></i>' +
      '</span>';
    //NEW MESSAGE
    if (newMessage) {
      result += '<span class="new"></span>';
    }
    //MAIN LINK TO CONVERSATION DETAILS
    result += '<a class="main-link" ng-href="/thread/' + data.id + '" ng-click="$event.preventDefault(); loadMessagesView(\'' + data.id + '\')">';
    result += '<div class="content-container">';
    //TITLE
    result += '<span ng-show="!edit[\'' + data.id + '\']" class="title';
    if (newMessage) {
      result += ' new-message';
    }
    result += '" ng-if="' + id + '.title">' + data.title + '</span>';
    result += '<span ng-show="!edit[\'' + data.id + '\']" class="title" ng-if="!' + id + '.title"><span class="no-title">&lt; Sans titre &gt;</span></span>';
    result += '<input type="text" class="edit-title" id="thread' + data.id + '" focus-on="edit[\'' + data.id + '\']" ng-show="edit[\'' + data.id + '\']" placeholder="Nom du thread" ng-model="titles[\'' + data.id + '\']"/>';
    //TAGS
    if (data.tags.length > 0) {
      result += '<p class="tags">';
      for (let i = 0; i < data.tags.length; i++) {
        result += ('<span class="tag" ng-click="searchByTag(\'' + data.tags[i] + '\')">' + data.tags[i] + '</span>');
      }
      result += '</p>';
    }
    result += '</div>';
    result += '</div>'; //close container with id
    //LAST MESSAGE TIME
    moment.locale('fr');
    // let date = moment(data.lastMessageTime).format('DD/MM/YYYY hh:mm');

    result += '<span class="time">' + date + '</span>';
    //CLOSE LINK
    result += '</a>';
    //option of a node
    result += '<div class="thread-more" ng-click="newThread(\'' + data.id + '\')"><i class="fa fa-plus"></i></diV>';
    // console.log(result);
    return result;*/
  }

  buildNodes(parent: Thread) {
    this.nodesMap[parent.id] = {
      id: parent.id,
      title: parent.title,
      isRoot: parent.thread_parent === null,
      isExpanded: true,
      children: []
    };

    this.conversation.threads.filter(
      thread => thread.thread_parent === parent.id
    ).forEach(thread => {
      this.nodesMap[parent.id].children.push(this.buildNodes(thread));
    });

    return this.nodesMap[parent.id];
  }

  buildConversationTree() {
    console.log("buildConversationTree");

    this.conversation.threads.forEach(
      thread => {
        this.onTitleEdition[thread.id] = false;
        this.titles[thread.id] = thread.title;
      }
    );

    this.nodes = [];
    // Find root thread
    const rootThread = this.conversation.threads.find(t => t.thread_parent === null);
    this.nodes.push(this.buildNodes(rootThread));
  }

  toggleEdition(threadId, enable = true) {
    console.log("toggleEdition");

    this.onTitleEdition[threadId] = enable;

    console.log(this.conversation);
    console.log(threadId);

    // Enable title edition
    if (this.onTitleEdition[threadId]) {

      // setTimeout because we need to wait for the ngIf to render the input elem
      setTimeout(() => {
        $(`#thread-${threadId}`).find("input").focus();
      });

    }
    // Validate changes
    else if (
      this.titles[threadId] !== this.conversation.threads.find(
        t => t.id === threadId
      ).title) {
      console.log("TODO: server call");
      //TODO: server call
    }
  }

  goToThread(threadId) {
    console.log("goToThread");

    // Don't redirect if the title is being modified, instead place focus on input
    if (this.onTitleEdition[threadId]) {
      $(`#thread-${threadId}`).find("input").focus();
      return;
    }

    this.router.navigate(['../thread/', threadId], {relativeTo: this.route});
  }

  updateTitle(threadId, $event) {
    console.log("updateTitle");
    console.log(this.titles[threadId]);

    this.toggleEdition(threadId, false);
  }

  newThread(threadId) {
    console.log("newThread");

    // TODO: server call
  }
}
