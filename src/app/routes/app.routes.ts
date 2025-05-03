import { Routes } from '@angular/router';
import { MainComponent } from '../main/main.component';
import { SolanaComponent } from '../solana/solana.component';
import { SeoResolver } from './seo.resolver';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    data: {
      title: 'SPL Token Creator',
      description: 'Create Solana SPL token without coding. Copy trending meme coins on Pump Fun',
      keywords: 'create solana token, free tokens generator, create SPL token, copy trending meme coins, copy trending coins'
    },
    resolve: { seo: SeoResolver }
  },
  {
    path: 'solana',
    component: SolanaComponent,
    children: [
      {
        path: 'create-token',
        loadComponent: () => import('../solana/create-token/create-token.component').then((m) => m.CreateTokenComponent),
        data: {
          title: 'Create Solana SPL Token',
          description: 'Create Solana SPL token in under one minute without coding. Update token metadata, supply, logo and mint tokens. Get a custom token address, distribute supply across different wallets! Revoke Freeze, Mint and Update authorities.',
          keywords: 'memecoin creator, solana creator, SPL, create Solana token, SPL token, tokens, blockchain'
        },
        resolve: { seo: SeoResolver }
      },
      {
        path: 'trending',
        loadComponent: () => import('../solana/trending-tokens/trending-tokens.component').then((m) => m.TrendingTokensComponent),
        data: {
          title: 'Copy Trending Meme Coins on Pump Fun',
          description: 'Copy the hottest trending Solana meme coins on Pump.fun in one click and launch them on Raydium. Create exact replicas with metadata, creators, and full Pump Fun authority',
          keywords: 'Solana meme coins, Pump.fun coins, copy trending tokens, Solana crypto launch, meme coin creator, Pump Fun copy tool, launch Solana tokens, Raydium meme coins, create meme coin Solana, top Solana coins, trending tokens Solana'
        },
        resolve: { seo: SeoResolver }
      },
    ]
  },
  {
    path: 'affiliate',
    loadComponent: () => import('../affiliate-program/affiliate-program.component').then((m) => m.AffiliateProgramComponent),
    data: {
      title: 'Affiliate Program',
      description: 'Invite other people via your link and get revenue in SOL, ETH, TON, SUI and more!',
    },
    resolve: { seo: SeoResolver }
  },
  {
    path: '**',
    loadComponent: () => import('../not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
