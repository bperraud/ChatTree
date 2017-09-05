import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { User } from '../_models/user';
import { User as ConnectedUser } from '../home/_models/user';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {

  private base_url   = 'http://localhost:3000';
  private token: string;
  private userSource = new Subject<ConnectedUser>();
          user$      = this.userSource.asObservable();

  constructor(
    private http: Http,
    private router: Router
  ) {
  }

  private static setHttpOptions(headers?: Headers) {
    if (!headers) headers = new Headers({ 'Content-Type': 'application/json' });
    return new RequestOptions({ headers: headers, withCredentials: true });
  }

  setUser(user: ConnectedUser) {
    localStorage.setItem(
      'currentUser',
      JSON.stringify(Object.assign(user, { token: this.token }))
    );
    this.userSource.next(user);
  }

  getUser(): ConnectedUser {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  signupUser(user: User): Observable<Object> {
    let body = JSON.stringify(user);
    return this.http.post(`${this.base_url}/signup`, body, AuthService.setHttpOptions()).map(res => this.setToken(res));
  }

  loginUser(user): Observable<Object> {
    let body = JSON.stringify(user);
    return this.http.post(`${this.base_url}/login`, body, AuthService.setHttpOptions()).map(res => this.setToken(res));
  }

  logout(): Observable<Object> {
    return this.http.delete(`${this.base_url}/logout`, AuthService.setHttpOptions()).do(() => {
      this.token = null;
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      this.router.navigate(['/login']);
    });
  }

  verify(): Observable<Object> {
    let currUser = JSON.parse(localStorage.getItem('currentUser'));
    let token    = ( currUser && 'token' in currUser) ? currUser.token : this.token;
    let headers  = new Headers({ 'x-access-token': token });
    return this.http.get(`${this.base_url}/check-state`, AuthService.setHttpOptions(headers))
      .map(res => AuthService.parseRes(res));
  }

  setToken(res) {
    let body = JSON.parse(res['_body']);
    if (body['success'] === true) {
      this.token = body.data['token'];
      delete body.data.user.password;
      localStorage.setItem(
        'currentUser',
        JSON.stringify(Object.assign(body.data.user, { token: this.token }))
      );
    }
    return body;
  }

  getToken() {
    return this.token ? this.token : JSON.parse(localStorage.getItem('currentUser'))['token'];
  }

  static parseRes(res) {
    return JSON.parse(res['_body']);
  }

}
