import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { Resolve } from '@angular/router';

@Injectable()
export class LogoutResolver implements Resolve<boolean> {

  constructor(private auth: AuthService) {}

  // TODO: handle failure
  resolve(): Promise<boolean> {
    return this.auth.logout().toPromise().then((res: Response) => {
      let body: any = res.json();
      return body.success;
    });
  }

}
