import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { CreateTokenComponent } from './solana/create-token/create-token.component';
import { TrendingTokensComponent } from './solana/trending-tokens/trending-tokens.component';
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
        component: CreateTokenComponent,
        title: 'Create Token',
      },
      {
        path: 'trending-coins',
        component: TrendingTokensComponent,
        title: 'Trending Coins',
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  },
];
