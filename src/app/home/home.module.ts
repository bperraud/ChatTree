import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { ConversationComponent } from './conversation/conversation.component';
import { ConversationsPanelComponent } from './conversations-panel/conversations-panel.component';
import { ProfileComponent } from './profile/profile.component';
import { ThreadComponent } from './thread/thread.component';
import { TreeComponent } from './tree/tree.component';
import { ConversationService } from './_services/conversation.service';
import { ThreadService } from './_services/thread.service';
import { HomeEmptyComponent } from './home-empty/home-empty.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SafeBase64ImgPipe } from './_pipes/safe-base64-img.pipe';
import { UserNamePipe } from './_pipes/user-name.pipe';
import { Nl2BrPipe } from 'nl2br-pipe';
import { NewMessageComponent } from './thread/new-message/new-message.component';
import { LogoutService } from './_services/logout.service';
import { ImgFallbackModule } from 'ngx-img-fallback';
import TreeModule from 'angular-tree-component';

@NgModule({
  declarations: [
    HomeComponent,
    HomeEmptyComponent,
    ConversationComponent,
    ConversationsPanelComponent,
    ProfileComponent,
    ThreadComponent,
    NewMessageComponent,
    SafeBase64ImgPipe,
    UserNamePipe,
    Nl2BrPipe,
    TreeComponent
  ],
  imports: [
    HomeRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    JsonpModule,
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    ImgFallbackModule,
    TreeModule
  ],
  entryComponents: [],
  providers   : [
    LogoutService,
    ConversationService,
    ThreadService
  ]
})
export class HomeModule {}
