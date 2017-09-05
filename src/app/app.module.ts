import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

// Services
import { PostsService } from './_services/posts.service';
import { DialogService } from "app/_services/dialog.service";

import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { LoginRoutingModule } from './login/login-routing.module';

import { ToastCustomOptions } from './toast-custom-options';
import { ToastModule, ToastOptions } from 'ng2-toastr';
import { AuthService } from './_services/auth.service';


@NgModule({
  imports     : [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ToastModule.forRoot(),
    LoginRoutingModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent
  ],
  providers   : [ // Add the global services
    PostsService,
    DialogService,
    AuthService,
    { provide: ToastOptions, useClass: ToastCustomOptions }
  ],
  bootstrap   : [AppComponent]
})

export class AppModule {}
