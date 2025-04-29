import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { SolanaComponent } from './solana/solana.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'solana',
    component: SolanaComponent,
    children: [
      {
        path: 'create-token',
        loadComponent: () => import('./solana/create-token/create-token.component').then(
          (m) => m.CreateTokenComponent
        ),
        title: 'Create Token',
      },
      {
        path: 'trending-coins',
        loadComponent: () => import('./solana/trending-tokens/trending-tokens.component').then(
          (m) => m.TrendingTokensComponent
        ),
        title: 'Trending Coins',
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  },
];
