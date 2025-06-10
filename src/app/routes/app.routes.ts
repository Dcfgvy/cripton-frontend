import { Routes } from '@angular/router';
import { SolanaComponent } from '../solana/solana.component';
import { SeoResolver } from './seo.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../main/main.component').then((m) => m.MainComponent),
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
          description: 'Create Solana SPL token in under one minute without coding for just 0.05 SOL! Update token metadata, supply, logo and mint tokens. Get a custom token address, distribute supply across different wallets! Revoke Freeze, Mint and Update authorities',
          keywords: 'memecoin creator, solana creator, SPL, create Solana token, SPL token, tokens, blockchain'
        },
        resolve: { seo: SeoResolver }
      },
      {
        path: 'trending',
        loadComponent: () => import('../solana/trending-tokens/trending-tokens.component').then((m) => m.TrendingTokensComponent),
        data: {
          title: 'Copy Trending Meme Coins on Pump Fun',
          description: 'Copy the hottest trending Solana meme coins on Pump.fun for just 0.1 SOL and launch them on Raydium. Create exact replicas with metadata, creators, and full Pump Fun authority',
          keywords: 'Solana meme coins, Pump.fun coins, copy trending tokens, Solana crypto launch, meme coin creator, Pump Fun copy tool, launch Solana tokens, Raydium meme coins, create meme coin Solana, Pump fun authority, top Solana coins, trending tokens Solana'
        },
        resolve: { seo: SeoResolver }
      },
      {
        path: 'authorities',
        loadComponent: () => import('../solana/revoke-authorities/revoke-authorities.component').then((m) => m.RevokeAuthoritiesComponent),
        data: {
          title: 'Revoke or Transfer Solana Token Authorities',
          description: 'Revoke or Transfer Freeze, Mint and Update authorities of your Solana tokens for just 0.01 SOL! Works with both original SPL tokens and Token 2022 extensions',
          keywords: 'revoke freeze authority, revoke mint authority, revoke update authority, Solana SPL token, SPL token, Solana Token 2022, Token 2022, tokens, blockchain'
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
    path: 'privacy-policy',
    loadComponent: () => import('../policies/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
    data: {
      title: 'Privacy Policy',
    },
    resolve: { seo: SeoResolver }
  },
  {
    path: 'terms-of-use',
    loadComponent: () => import('../policies/terms-of-use/terms-of-use.component').then((m) => m.TermsOfUseComponent),
    data: {
      title: 'Terms of use',
    },
    resolve: { seo: SeoResolver }
  },
  {
    path: '**',
    loadComponent: () => import('../not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
