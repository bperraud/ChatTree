import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

// Services
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { LoginRoutingModule } from './login/login-routing.module';

import { ToastCustomOptions } from './toast-custom-options';
import { ToastModule, ToastOptions } from 'ng2-toastr';
import { AuthService } from './_services/auth.service';
import { WebSocketService } from './home/_services/web-socket.service';
import { ToastService } from './home/_services/toast.service';


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
    AuthService,
    WebSocketService,
    ToastService,
    { provide: ToastOptions, useClass: ToastCustomOptions }
  ],
  bootstrap   : [AppComponent]
})

export class AppModule {}
