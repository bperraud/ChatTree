import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { WebSocketService } from '../_services/web-socket.service';
import { WsMessage } from '../_models/ws-message';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { AuthService } from '../../_services/auth.service';
import { defaultPP, User } from '../_models/user';
import { defaultPP as defaultConvPic, Conversation } from '../_models/conversation';
import { ConversationService } from '../_services/conversation.service';
import { Subscription } from 'rxjs/Subscription';
import { UserSearchService } from '../_services/user-search.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs/Observable';
import { TypeaheadMatch } from 'ngx-bootstrap';
import { fadeInOutAnimation } from '../../_animations/fade-in-out.animation';
import { Router } from '@angular/router';
import { ToastService } from '../_services/toast.service';

@Component({
  selector   : 'app-conversations-panel',
  templateUrl: './conversations-panel.component.html',
  providers  : [UserSearchService],
  styleUrls  : ['./conversations-panel.component.less'],
  animations : [fadeInOutAnimation]
})
export class ConversationsPanelComponent implements OnInit, AfterViewInit {

  @ViewChild('modalTemplate') private newConvModal: TemplateRef<any>;

  private base_url = 'http://localhost:3000';
          conversations: Array<Conversation>;
          conversationsSubscription: Subscription;
          user: User;

  //noinspection JSUnusedLocalSymbols
  constructor(
    private router: Router,
    private http: Http,
    private auth: AuthService,
    private ws: WebSocketService,
    private convService: ConversationService,
    private searchService: UserSearchService,
    private modalService: BsModalService,
    private toastService: ToastService
  ) {
    this.conversationsSubscription = convService.conversations$.subscribe(
      convs => this.conversations = convs
    );
  }

  private setHttpOptions(headers?: Headers) {
    if (!headers) headers = new Headers({
      'content-type': 'application/json',
      'x-access-token': this.auth.getToken()
    });
    return new RequestOptions({ headers: headers, withCredentials: true });
  }

  ngOnInit() {
    console.log("ConversationsComponent INIT");
    this.user = JSON.parse(localStorage.getItem('currentUser'));

    this.convService.getConversations().subscribe((convs: Array<Conversation>) => {
      this.convService.setConversations(convs);
    });
  }

  ngAfterViewInit() {
    this.convService.newConversation$.subscribe(
      () => this.openNewConversationModal(this.newConvModal)
    );
  }

  static parseRes(res) {
    return JSON.parse(res['_body']);
  }

  /* ---------------------------------------------------------------------------- */
  /* -------------------------- NEW CONVERSATION MODAL -------------------------- */
  /* ---------------------------------------------------------------------------- */

  // TODO: add global modals service which force them to close on logout

  public modalRef: BsModalRef;

  public asyncSelected: string;
  public typeaheadLoading: boolean;
  public typeaheadNoResults: boolean;
  public dataSource: Observable<any>;
  public newConversation: Conversation = new Conversation();

  openNewConversationModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      'class': 'custom-modal new-conv-modal'
    });

    // Configure users search
    this.dataSource = Observable
      .create((observer: any) => {
        // Runs on every search
        observer.next(this.asyncSelected);
      })
      .mergeMap((token: string) => this.getUsersAsObservable(token));
  }

  public getUsersAsObservable(token: string): Observable<any> {
    return this.searchService.search(token, this.newConversation.members.map(user => user.id))
      .map((res: Response) => {
        let data: any          = ConversationsPanelComponent.parseRes(res)['data'],
            users: Array<User> = data.users;

        users
          .map(user => {
            user.label = user.login === null ? user.email : `${user.login} (${user.email})`;
            if (user.profile_picture === null)
              user.profile_picture = defaultPP;
          });
        return users;
      });
  }

  public changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  public changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

  public typeaheadOnSelect(e: TypeaheadMatch): void {
    let selectedUser: User = e.item;
    this.addMemberToConversation(selectedUser);
    this.asyncSelected = ''; // Clear the input
  }

  addMemberToConversation(user: User) {
    this.newConversation.members.push(user);
  }

  removeMemberFromConversation(user: User) {
    this.newConversation.members.splice(
      this.newConversation.members.indexOf(user), 1
    );
  }

  createNewConv(e: any) {
    console.log("HERE createNewConv !");

    // Prevent accidentally validating the modal
    if (e.explicitOriginalTarget.id === 'input-members')
      return;

    // If no members are added exit
    if (this.newConversation.members.length === 0)
      return;

    this.ws.sendRequest(new WsMessage(
      "create-conversation", {
        title  : this.newConversation.title,
        members: this.newConversation.members
          .concat(this.user)    // Add the current user
          .map(user => user.id) // Only keep userIds
      }
    ), this.onNewConversation, this);
  }

  //noinspection JSMethodCanBeStatic
  private onNewConversation(data, $this) {
    let newConv = new Conversation();
    newConv.id = data.convId;
    newConv.title = $this.newConversation.title;
    newConv.root = data.rootId;
    newConv.members = data.members;
    newConv.picture = defaultConvPic;

    $this.convService.addConversation(newConv);

    $this.user.conversations.push(newConv.id);
    $this.auth.setUser($this.user);

    // Update the remote user info (server session)
    $this.http.put(`${$this.base_url}/api/set-user`, { user: $this.auth.getUser() }, $this.setHttpOptions())
      .subscribe(res => {
        let parsedRes = ConversationsPanelComponent.parseRes(res);
        let success = parsedRes.success;
        if (!success) // TODO: directly use Node/Express errors encapsulation (status, statusText)
          console.error(parsedRes.message); // TODO: add a error service which logs errors & logout

        // Reset the modal's new conversation object
        $this.newConversation = new Conversation();

        $this.modalRef.hide(); // Close the modal

        $this.router.navigate(['/conversation', data.convId]);
        $this.toastService.showSuccess('Conversation créée !');
      });
  }

}
