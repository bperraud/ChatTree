import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../_models/user';

@Pipe({
  name: 'userName'
})
export class UserNamePipe implements PipeTransform {

  transform(user: User): string {
    let res;
    if (user.firstname !== null && user.lastname !== null)
      res = `${user.firstname} ${user.lastname}`;
    else if (user.firstname !== null)
      res = user.firstname;
    else if (user.lastname !== null)
      res = user.lastname;
    else
      res = user.email;
    return res;
  }

}
