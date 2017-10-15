import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../_models/user';
import { AuthService } from '../../_services/auth.service';

@Pipe({
  name: 'excludeSelfUser'
})
export class ExcludeSelfUserPipe implements PipeTransform {

  constructor(private auth: AuthService) {}

  transform(users: User[]): User[] {
    return users.filter(user => user.id !== this.auth.getUser().id);
  }

}
