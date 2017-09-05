import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';

@Injectable()
export class LogoutService {

  constructor(private ws: WebSocketService) { }

  logout() {
    this.ws.close();
    // TODO: navigate to logout (use auth.logout())
  }

}
