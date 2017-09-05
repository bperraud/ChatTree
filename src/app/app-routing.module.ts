import { NgModule }                 from '@angular/core';
import { RouterModule, Routes }     from '@angular/router';

import { PageNotFoundComponent }    from './page-not-found/page-not-found.component';
import { ComposeMessageComponent }  from './compose-message/compose-message.component';

import { AuthGuard }          from './_services/auth-guard.service';
import { CanDeactivateGuard } from './_services/can-deactivate-guard.service';

import { SelectivePreloadingStrategy } from './selective-preloading-strategy';

const appRoutes: Routes = [
  {
    path       : '',
    loadChildren: 'app/home/home.module#HomeModule',
    canActivate: [AuthGuard],
    data: { preload: true }
  },
  {
    path     : 'compose',
    component: ComposeMessageComponent,
    outlet   : 'popup'
  },
  //{ path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path        : 'crisis-center',
    loadChildren: 'app/crisis-center/crisis-center.module#CrisisCenterModule',
    data        : { preload: true }
  },
  {
    path        : 'admin',
    loadChildren: 'app/admin/admin.module#AdminModule',
    canLoad     : [AuthGuard]
  },
  //{ path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent, data: { title: 'Erreur : page introuvable' } }
];

@NgModule({
  imports  : [RouterModule.forRoot(
    appRoutes,
    {
      //enableTracing     : true, // <-- debugging purposes only
      preloadingStrategy: SelectivePreloadingStrategy
    }
  )],
  exports  : [RouterModule],
  providers: [
    CanDeactivateGuard,
    SelectivePreloadingStrategy
  ]
})
export class AppRoutingModule {
}
