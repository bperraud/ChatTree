import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../_services/auth-guard.service';
//import { DefaultConversationResolver } from './default-conversation-resolver.service';
import { LogoutResolver } from "app/login/logout-resolver.service";
import { HomeComponent } from './home.component';
import { HomeEmptyComponent } from './home-empty/home-empty.component';
import { ConversationComponent } from './conversation/conversation.component';
import { ThreadComponent } from './thread/thread.component';
import { InitWebSocketResolver } from './init-web-socket-resolver.service';

const homeRoutes: Routes = [
  {
    path     : '',
    component: HomeComponent,
    data     : { title: 'Accueil' },
    resolve  : {
      InitWebSocketResolver
    },
    children : [
      {
        path     : '',
        component: HomeEmptyComponent
        //resolve  : {
        //  convIdToRedirect: DefaultConversationResolver
        //}
      },
      {
        path     : 'conversation/:id',
        component: ConversationComponent,
        data : { title: 'Conversation' },
        children : [
          {
            path     : 'thread/:id',
            component: ThreadComponent,
            data: { title: 'Fil d\'une conversation' }
          }
        ]
      }
      //{
      //  path     : 'thread/:id',
      //  component: ThreadComponent
      //}
    ]
  }
];

@NgModule({
  imports  : [
    RouterModule.forChild(homeRoutes)
  ],
  exports  : [
    RouterModule
  ],
  providers: [
    LogoutResolver,
    InitWebSocketResolver,
    //DefaultConversationResolver,
    AuthGuard
  ]
})
export class HomeRoutingModule {
}
