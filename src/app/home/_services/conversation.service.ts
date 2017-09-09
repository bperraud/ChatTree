import { ElementRef, Injectable } from '@angular/core';
import { Conversation } from '../_models/conversation';
import { Subject } from 'rxjs/Subject';
import { defaultPP } from '../_models/conversation';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../_services/auth.service';
import { Http, RequestOptions, Response, Headers } from '@angular/http';

import 'rxjs/add/observable/throw';
import "rxjs/add/operator/catch";

@Injectable()
export class ConversationService {

  private base_url     = 'http://localhost:3000';
  private get_conv_url = 'api/get-conv';

  private conversations: Array<Conversation> = [];
          activeConversation: Conversation;

  scrollContainer: ElementRef;

  // Observable sources
  private conversationsSource      = new Subject<Array<Conversation>>();
  private newConversationSource    = new Subject<boolean>();
  private activeConversationSource = new Subject<Conversation>();

  // Observable streams
  conversations$      = this.conversationsSource.asObservable();
  newConversation$    = this.newConversationSource.asObservable();
  activeConversation$ = this.activeConversationSource.asObservable();

  private setHttpOptions(headers?: Headers) {
    if (!headers) headers = new Headers({
      'content-type'  : 'application/json',
      'x-access-token': this.auth.getToken()
    });
    return new RequestOptions({ headers: headers, withCredentials: true });
  }

  constructor(
    private http: Http,
    private auth: AuthService
  ) {}

  getConversations(): Observable<Array<Conversation>> {
    return this.http.get(`${this.base_url}/api/get-conversations`, this.setHttpOptions())
      .map(ConversationService.extractData)
      .map(res => res.conversations)
      .catch(ConversationService.handleError);
  }

  // Service message commands
  setConversations(convs: Array<Conversation>) {
    convs = convs.map(conv => {
      if (conv.picture === null)
        conv.picture = defaultPP;
      return conv;
    });

    this.conversations = convs;
    this.conversationsSource.next(convs);
  }

  /**
   * Emit a boolean (true) observable to trigger the new conversation modal opening
   */
  triggerNewConversationModal() {
    this.newConversationSource.next(true);
  }

  addConversation(conv: Conversation, animate: boolean = false) {
    this.conversations.push(conv);

    if (animate) {
      setTimeout(() => {
        console.log('AAA');
        $(this.scrollContainer.nativeElement).animate({
            scrollTop: $(this.scrollContainer.nativeElement).prop("scrollHeight")
          },
          300
        );
      }, 500);
    }
  }

  getConversation(id: number): Observable<Conversation> {
    return this.http.get(`${this.base_url}/${this.get_conv_url}/${id}`, this.setHttpOptions())
      .map(ConversationService.extractData)
      .map(res => {
        let conv = res.conversation;
        console.log("in getConversation");
        console.log(conv);
        this.activeConversationSource.next(conv); // TODO: remove if useless
        this.activeConversation = conv;
        this.activeConversation.threads.forEach(thread => thread.messages = []);
        return conv;
      })
      .catch(ConversationService.handleError);
  }

  /*  private getConvLocal(id: number): Conversation {
      console.log("here");
      console.log(this.conversations);
      return this.conversations.find(conv => conv.id === id);
    }*/

  private static extractData(res: Response) {
    let body: any = res.json();
    return body.data || {};
  }

  private static handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body: any = error.json() || '';
      const err       = body.error || JSON.stringify(body);
      errMsg          = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
