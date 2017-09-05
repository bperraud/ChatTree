import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }            from '../_services/auth-guard.service';
import { LoginComponent }       from './login.component';
import { LogoutResolver } from "app/login/logout-resolver.service";

const loginRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data : { title: 'Connexion' }
  },
  {
    path   : 'logout',
    component: LoginComponent,
    data : { title: 'Connexion' },
    resolve: {
      logoutSuccessful: LogoutResolver
    }
  }
];

@NgModule({
  imports  : [
    RouterModule.forChild(loginRoutes)
  ],
  exports  : [
    RouterModule
  ],
  providers: [
    LogoutResolver,
    AuthGuard
  ]
})
export class LoginRoutingModule {}
