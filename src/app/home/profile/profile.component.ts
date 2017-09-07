import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../_services/logout.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.less']
})
export class ProfileComponent implements OnInit {

  showUserInformation = false;
  showMembersList = false;

  constructor(private logoutService: LogoutService) {}

  ngOnInit() {}

  logout() {
    this.logoutService.logout();
  }

}
