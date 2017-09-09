import { Component, OnInit } from '@angular/core';
import { User, defaultPP } from '../_models/user';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.less']
})
export class ProfileComponent implements OnInit {

  showUserInformation = false;
  showMembersList = false;
  user: User;
  defaultPP = defaultPP;

  constructor(private auth: AuthService) {}

  // TODO: subscribe to conversation and thread observers to update the headerTitle
  // TODO: subscribe to the active conversation observer to update the conv members

  ngOnInit() {
    console.log("ProfileComponent INIT");

    this.user = this.auth.getUser();
  }
}
