import { Component, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInOutAnimation } from '../../_animations/fade-in-out.animation';
import { ConversationService } from '../_services/conversation.service';

@Component({
  selector   : 'app-home-empty',
  templateUrl: './home-empty.component.html',
  styleUrls  : ['./home-empty.component.less'],
  animations : [fadeInOutAnimation]
})
export class HomeEmptyComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private convService: ConversationService
  ) {}

  ngOnInit() {
    // Check if the user has some conversations
    let user: User = JSON.parse(localStorage.getItem('currentUser'));

    let defaultConvId = user.conversations[0];
    if (defaultConvId) {
      this.router.navigate(['./conversation', defaultConvId], { relativeTo: this.route });
      return;
    }
  }

  createNewConversation() {
    this.convService.triggerNewConversationModal();
  };

}
