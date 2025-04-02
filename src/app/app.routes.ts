import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { CreateTokenComponent } from './create-token/create-token.component';
import { TrendingTokensComponent } from './trending-tokens/trending-tokens.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'create-token',
    component: CreateTokenComponent,
  },
  {
    path: 'trending-tokens',
    component: TrendingTokensComponent,
  },
  {
    path: '**',
    redirectTo: '/'
  },
];
