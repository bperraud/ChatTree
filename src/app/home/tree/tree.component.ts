import {
  Component, ElementRef,
  ViewChild, ViewContainerRef, ViewEncapsulation, OnInit, OnDestroy
} from '@angular/core';

import { Conversation } from '../_models/conversation';
import { ConversationService } from '../_services/conversation.service';

import * as $ from 'jquery';

import { Thread } from '../_models/thread';
import { ActivatedRoute, Router } from '@angular/router';
import { ITreeOptions } from 'angular-tree-component';
import { TreeComponent as AngularTreeComponent } from 'angular-tree-component';
import { WebSocketService } from '../_services/web-socket.service';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../_services/auth.service';
import { ToastService } from '../_services/toast.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less']
})
export class TreeComponent implements OnInit, OnDestroy {
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  @ViewChild('treeContainer') treeContainer: ElementRef;
  @ViewChild('tree') tree: AngularTreeComponent;


  conversation: Conversation;
  nodes: Array<Object>;
  nodesMap: Object;
  onTitleEdition: Object;
  titles: Object;

  options: ITreeOptions = {
    allowDrag: false,
    allowDrop: false,
    animateExpand: false,
    animateSpeed: 30,
    animateAcceleration: 1.2,
  };

  newThreadSubscription: Subscription;

  constructor(private auth: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private convService: ConversationService,
              private ws: WebSocketService,
              private toastService: ToastService
  ) {
    this.nodesMap              = {};
    this.onTitleEdition        = {};
    this.titles                = {};
    this.newThreadSubscription = this.convService.newThread$.subscribe(
      thread => {
        this.addThreadNode(thread);
      });
  }

  ngOnInit() {
    console.log("TreeComponent INIT");
    this.conversation = this.convService.activeConversation;
    this.buildConversationTree();
  }

  ngOnDestroy() {
    // Prevent memory leak when component destroyed
    this.newThreadSubscription.unsubscribe();
  }

  buildNodes(parent: Thread) {
    this.nodesMap[parent.id] = {
      id: parent.id,
      title: parent.title,
      isRoot: parent.thread_parent === null,
      isExpanded: true,
      children: []
    };

    console.log(this.conversation.threads);
    this.conversation.threads.sort((a, b) => {
      return a.id < b.id ? -1 : 1;
    }).filter(
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
        this.titles[thread.id]         = thread.title;
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

    let newThread            = new Thread();
    newThread.title          = null;
    newThread.messages       = [];
    newThread.message_parent = null; // It shall be deduced server-side
    newThread.thread_parent  = threadId;
    newThread.conversation   = this.conversation.id;

    console.log(`thread to be created from #${threadId} in conv #${newThread.conversation}`);

    this.ws.createThread(newThread);
  }

  addThreadNode(thread: Thread) {
    this.nodesMap[thread.thread_parent].children.push({
      id: thread.id,
      title: thread.title,
      isRoot: false,
      isExpanded: false,
      children: []
    });
    this.tree.treeModel.update();

    if (thread.author === this.auth.getUser().id) {
      this.onTitleEdition[thread.id] = true;
      // setTimeout because we need to wait for the ngIf to render the input elem
      setTimeout(() => {
        $(`#thread-${thread.id}`).find("input").focus();
      });
      this.toastService.showSuccess('Fil créé ;-)');
    } else {
      this.toastService.showCustom('Un fil vient d\'être créé !');
      // TODO: add info of WHO created the thread
      // using probably a service with a formatting method (with mail/pseudo, etc.)
    }
  }
}
