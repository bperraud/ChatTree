import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { AuthService } from '../../_services/auth.service';

@Injectable()
export class LogoutService {

  constructor(
    private auth: AuthService,
    private ws: WebSocketService
  ) { }

  logout() {
    this.ws.close();
    this.auth.logout().subscribe();
  }

}
