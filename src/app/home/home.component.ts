import { Component, OnInit, OnDestroy, ViewContainerRef, HostBinding } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';
import { User } from './_models/user';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { WebSocketService } from './_services/web-socket.service';
import { ToastsManager } from 'ng2-toastr';
import { fadeInRouteAnimation } from '../_animations/fade-in-out.animation';
import { ToastService } from './_services/toast.service';

import io from 'socket.io-client';

@Component({
  selector   : 'app-home',
  templateUrl: './home.component.html',
  styleUrls  : ['./home.component.less'],
  animations : [fadeInRouteAnimation]
})
export class HomeComponent implements OnInit, OnDestroy {
  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('style.display') display          = 'block';
  @HostBinding('style.position') position        = 'absolute';

  user: User;
  userSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ws: WebSocketService,
    public toastr: ToastsManager,
    vcr: ViewContainerRef,
    private toastService: ToastService,
  ) {
    this.toastr.setRootViewContainerRef(vcr);
    // TODO: remove this subscription if useless
    this.userSubscription = auth.user$.subscribe(user => this.user = user);
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.auth.verify().subscribe(res => {
      if (!res['success'] === true) {
        this.logout();
        this.router.navigate(['/login']);
        return false;
      }

      if (!localStorage.getItem('isLoggedIn')) {
        // TODO: see if we need to keep this, since we are not supposed to reload the home component except on logout/login
        this.showWelcomeHome();
        localStorage.setItem('isLoggedIn', 'true');
      }

      console.info("Current user:");
      console.info(this.user);

      const socket = io('http://localhost:3000');
      //socket.
      //const socket2 = io('http://localhost:3000/my-namespace');
      //this.socket.on('news', data => {
      //  console.log("zezzzz");
      //  console.log(data);
      //  this.socket.emit('my other event', { my: 'data' });
      //});
    });
  }

  ngOnDestroy() {
    // Prevent memory leak when component destroyed
    // TODO: remove this unsubscription if useless
    this.userSubscription.unsubscribe();
  }

  // TODO: push this into a service or the profile component
  logout() {
    this.ws.close(); // Will automatically start the logout process
    this.user = null;
  }

  private showWelcomeHome() {
    let label: string;
    if (this.user.firstname !== null)
      label = this.user.firstname;
    else if (this.user.login !== null)
      label = this.user.login;
    else label = this.user.email;
    this.toastService.showCustom(`Bienvenue ${label} sur votre espace ChatTree ! :)`);
  }
}
