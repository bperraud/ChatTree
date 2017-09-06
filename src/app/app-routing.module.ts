import { NgModule }                 from '@angular/core';
import { RouterModule, Routes }     from '@angular/router';

import { PageNotFoundComponent }    from './page-not-found/page-not-found.component';

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
