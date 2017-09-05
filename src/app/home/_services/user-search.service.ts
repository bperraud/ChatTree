import { Injectable } from '@angular/core';
import { RequestOptions, Headers, Response, Http } from '@angular/http';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../_services/auth.service';

@Injectable()
export class UserSearchService {

  constructor(private auth: AuthService, private http: Http) {}

  search(term: string, exceptIds: Array<number>): Observable<Response> {
    if (term === '')
      return of.call([]);

    let url     = 'http://localhost:3000/api/search-users',
        token   = this.auth.getToken(),
        headers = new Headers({ 'x-access-token': token });

    let options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });
    return this.http.get(`${url}?q=${term}&ids=${JSON.stringify(exceptIds)}`, options);
  }
}
