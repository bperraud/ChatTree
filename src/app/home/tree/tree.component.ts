import { NgModule, Component, Compiler, ElementRef,
  ViewChild, ViewContainerRef, ViewEncapsulation, OnInit
} from '@angular/core';

import { AuthService } from '../../_services/auth.service';
import { Conversation } from '../_models/conversation';
import { ConversationService } from '../_services/conversation.service';

import * as $ from 'jquery';
import { Treant } from 'treant-js';
import * as moment from 'moment';

import { Thread } from '../_models/thread';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less']
})
export class TreeComponent implements OnInit {
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  @ViewChild('treeContainer') treeContainer: ElementRef;

  conversation: Conversation;

  constructor(private auth: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private convService: ConversationService,
              private compiler: Compiler) {
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

  /**
   * Find the root thread of a conversation
   * @param conversation
   * @returns {int} The root thread index
   */
  private static getRootIndex(conversation) {
    for (let i = 0; i < conversation.threads.length; i++) {
      if (conversation.root === conversation.threads[i].id) {
        return i;
      }
    }

    throw Error('Root thread id not found for the conversation');
  }

  buildNodes(threads) {
    let nodes = [];
    // Generate HTML
    for (let i = 0; i < threads.length; i++) {
      let thread = threads[i];
      nodes.push({
        id: thread.id,
        innerHTML: this.nodeHTML(thread),
        children: [],
        thread_parent: thread.thread_parent
      });
    }

    // Find root
    let tree   = [];
    let rootId = TreeComponent.getRootIndex(this.conversation);

    tree.push(nodes[rootId]);
    nodes.splice(rootId, 1);

    // Build tree top->bottom by copying father in every child
    for (let i = 0; i < nodes.length; i++) {
      let parentIndexInTree = TreeComponent.getFatherIndexInTree(nodes[i], tree);
      if (parentIndexInTree !== -1) {
        nodes[i].parent = tree[parentIndexInTree];
        tree.push(nodes[i]);
      }
    }

    // Clean useless fields
    for (let i = 0; i < tree.length; i++) {
      delete tree[i].children;
      delete tree[i].thread_parent;
    }

    return tree;
  }

  static getFatherIndexInTree(node, tree) {
    let fatherId = node.thread_parent;
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === fatherId) {
        return i;
      }
    }
    return -1;
  }

    onTreeLoaded() {
      console.log("onTreeLoaded");
    }

    buildConversationTree() {
    console.log("buildConversationTree");

    const config = {
      container: '#tree',
      connectors: {
        type: 'step'
      },
      node: {
        HTMLclass: 'thread-node',
        collapsable: true
      },
      levelSeparation: 45
    };

    let treeConfig = this.buildNodes(this.conversation.threads);
    treeConfig.unshift(config);
    const tree = new Treant(treeConfig, this.onTreeLoaded, $);

    this.addComponent(
      this.treeContainer.nativeElement.outerHTML,
      {},
      this.conversation.threads,
      this.route,
      this.router
    );

    $(this.treeContainer.nativeElement).remove();
  }

  private addComponent(template: string, properties: any = {}, threads: Thread[], route: ActivatedRoute, router: Router) {

    @Component({template})
    class TemplateComponent implements OnInit {
      titles: Object             = {};
      onTitleEdition: Object     = {}; // booleans, true if thread title is being modified

      ngOnInit(): void {
        // Add all needed model bindings
        threads.forEach(thread => {
          this.onTitleEdition[thread.id] = false;
          this.titles[thread.id] = thread.title;
        });
      }

      updateTitleWithPenTool(threadId, $event) {
        console.log("updateTitleWithPenTool");
        if ($event.button !== 0) return; // Track only left click
        this.updateTitle(threadId, $event);
      }

      toggleEdition(threadId, enable) {
        console.log("toggleEdition");

        this.onTitleEdition[threadId] = enable;

        // Enable title edition
        if (this.onTitleEdition[threadId]) {
          setTimeout(() => {
            $(`#thread-${threadId}`).find("input").focus();
          });
        }
        // Validate changes
        else {
          //TODO: server call
        }
      }

      updateTitle(threadId, $event) {
        console.log("updateTitle");

        // Timeout to prevent event handlers collisions
        setTimeout(() => {
          // From the pen tool
          if ($event.type === "mousedown") {
            this.toggleEdition(threadId, !this.onTitleEdition[threadId]);
            return;
          }

          let $input = $(`#thread-${threadId}`).find("input");

          if ($event.type === "blur" || ($event.type === "keyup" && $event.keyCode === 13)) {
            this.titles[threadId] = $input.val();
            this.toggleEdition(threadId, false);
          }
          else if ($event.type === "keyup" && $event.keyCode === 27) {
            $input.val(this.titles[threadId]);
            this.toggleEdition(threadId, false);
          }
        });
      }

      newThread(threadId) {
        console.log("newThread");

        // TODO: server call
      }

      goToThread(threadId) {
        console.log("goToThread");

        // Don't redirect if the title is being modified, instead place focus on input
        if (this.onTitleEdition[threadId]) {
          $(`#thread-${threadId}`).find("input").focus();
          return;
        }

        router.navigate(['../thread/', threadId], { relativeTo: route });
      }
    }

    @NgModule({declarations: [TemplateComponent]})
    class TemplateModule {}

    const module    = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory   = module.componentFactories.find(componentFactory =>
      componentFactory.componentType === TemplateComponent
    );
    const component = this.container.createComponent(factory);
    Object.assign(component.instance, properties);
    // If properties are changed at a later stage, the change detection
    // may need to be triggered manually:
    // component.changeDetectorRef.detectChanges();
  }

}
