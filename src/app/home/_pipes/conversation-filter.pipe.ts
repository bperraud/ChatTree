import { Pipe, PipeTransform } from '@angular/core';
import { Conversation } from '../_models/conversation';
import { UserNamePipe } from './user-name.pipe';

@Pipe({
  name: 'conversationFilter'
})
export class ConversationFilterPipe implements PipeTransform {

  constructor(private userNamePipe: UserNamePipe) {
  }

  transform(conversations: Conversation[], search: String): Conversation[] {
    if (search === "") return conversations;
    const regex = new RegExp(`.*${search.toLowerCase()}.*`);
    return conversations.filter(c =>
      (c.title !== null && c.title.toLowerCase().match(regex)) ||
      (
        c.members.map(m => this.userNamePipe.transform(m).toLowerCase().match(regex))
          .filter(matchesArray => matchesArray !== null)
          .length > 0
      )
    );
  }

}
