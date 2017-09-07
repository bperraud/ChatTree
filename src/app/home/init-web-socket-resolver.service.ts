import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { WebSocketService } from './_services/web-socket.service';
import { Observable } from 'rxjs/Observable';
import { WsMessage } from './_models/ws-message';

@Injectable()
export class InitWebSocketResolver implements Resolve<boolean> {
  constructor(private ws: WebSocketService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log("WS INIT!");
    return this.ws.connect().map(isConnected => {
      if (!isConnected) {
        console.log("Some error of ws connection... :/");
        //this.logout(); //TODO: logout service (+ redirect)
        return false;
      }

      //let user = JSON.parse(localStorage.getItem('currentUser'));
      //delete user.token;
      //
      //this.ws.sendRequest2(new WsMessage("init", { user }));
      console.log("WS CONNECTED, LET'S ROCK");
      return true;
    });
  }
}
