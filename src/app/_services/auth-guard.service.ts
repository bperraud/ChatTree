import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, CanActivateChild,
  NavigationExtras, CanLoad, Route
} from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // If the user is not logged in we'll send them back to the login page
    return this.auth.verify().map(res => {
      if (res['success'] === true) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    });
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate();
  }

  canLoad(route: Route): Observable<boolean> {
    return this.canActivate();
  }

  //checkLogin(url: string): boolean {
  //  if (this.auth.isLoggedIn) {
  //    return true;
  //  }
  //
  //  // Store the attempted URL for redirecting
  //  this.auth.redirectUrl = url;
  //
  //  // Create a dummy session id
  //  let sessionId = 123456789;
  //
  //  // Set our navigation extras object
  //  // that contains our global query params and fragment
  //  let navigationExtras: NavigationExtras = {
  //    queryParams: { 'session_id': sessionId },
  //    fragment   : 'anchor'
  //  };
  //
  //  // Navigate to the login page with extras
  //  this.router.navigate(['/login'], navigationExtras);
  //  return false;
  //}

}
