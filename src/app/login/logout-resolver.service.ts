import { Injectable } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { WebSocketService } from '../home/_services/web-socket.service';
import { Resolve } from '@angular/router';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class LogoutResolver implements Resolve<boolean> {

  constructor(private auth: AuthService,
              private ws: WebSocketService) {
  }

  // TODO: handle failure
  resolve(): Promise<boolean> {
    // Disconnect the ws
    this.ws.close();

    return this.auth.logout().toPromise().then((res: Response) => {

      let body: any = res.json();
      return body.success;
    });
  }

}
