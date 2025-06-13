import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BaseWalletAdapter, WalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { NetworkService } from '../network-switch/network-switch.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust';
import { AlphaWalletAdapter } from '@solana/wallet-adapter-alpha';
import { AvanaWalletAdapter } from '@solana/wallet-adapter-avana';
import { BitgetWalletAdapter } from '@solana/wallet-adapter-bitkeep';
import { BitpieWalletAdapter } from '@solana/wallet-adapter-bitpie';
import { Coin98WalletAdapter } from '@solana/wallet-adapter-coin98';
import { CoinhubWalletAdapter } from '@solana/wallet-adapter-coinhub';
import { HyperPayWalletAdapter } from '@solana/wallet-adapter-hyperpay';
import { KrystalWalletAdapter } from '@solana/wallet-adapter-krystal';
import { MathWalletAdapter } from '@solana/wallet-adapter-mathwallet';
import { NightlyWalletAdapter } from '@solana/wallet-adapter-nightly';
import { SafePalWalletAdapter } from '@solana/wallet-adapter-safepal';
import { SaifuWalletAdapter } from '@solana/wallet-adapter-saifu';
import { SkyWalletAdapter } from '@solana/wallet-adapter-sky';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger';

export type SolanaWalletAdapter = WalletAdapter;

@Injectable({ providedIn: 'root' })
export class WalletService {
  // IMPORTANT: some wallet adapters like the ones for Keystone, Fractal, Torus require React, so we can't use them
  private wallets: SolanaWalletAdapter[] = [
    new PhantomWalletAdapter(),
    new BraveWalletAdapter(),
    this.getSolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    this.getTrustWalletAdapter(),
    new AlphaWalletAdapter(),
    new AvanaWalletAdapter(),
    new BitgetWalletAdapter(),
    new BitpieWalletAdapter(),
    new Coin98WalletAdapter(),
    new CoinhubWalletAdapter(),
    new HyperPayWalletAdapter(),
    new KrystalWalletAdapter(),
    new MathWalletAdapter(),
    new NightlyWalletAdapter(),
    new SafePalWalletAdapter(),
    new SaifuWalletAdapter(),
    new SkyWalletAdapter(),
    new LedgerWalletAdapter(),
  ];
  private getSolflareWalletAdapter(){
    const adapter = new SolflareWalletAdapter();
    adapter.icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjkwIiBoZWlnaHQ9IjI5MCIgdmlld0JveD0iMCAwIDI5MCAyOTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xNDZfMjk5KSI+CjxwYXRoIGQ9Ik02My4yOTUxIDFIMjI2LjcwNUMyNjEuMTEgMSAyODkgMjguODkwNSAyODkgNjMuMjk1MVYyMjYuNzA1QzI4OSAyNjEuMTEgMjYxLjExIDI4OSAyMjYuNzA1IDI4OUg2My4yOTUxQzI4Ljg5MDUgMjg5IDEgMjYxLjExIDEgMjI2LjcwNVY2My4yOTUxQzEgMjguODkwNSAyOC44OTA1IDEgNjMuMjk1MSAxWiIgZmlsbD0iI0ZGRUY0NiIgc3Ryb2tlPSIjRUVEQTBGIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTE0MC41NDggMTUzLjIzMUwxNTQuODMyIDEzOS40MzJMMTgxLjQ2MiAxNDguMTQ3QzE5OC44OTMgMTUzLjk1OCAyMDcuNjA5IDE2NC42MSAyMDcuNjA5IDE3OS42MkMyMDcuNjA5IDE5MC45OTkgMjAzLjI1MSAxOTguNTA0IDE5NC41MzYgMjA4LjE4OEwxOTEuODczIDIxMS4wOTNMMTkyLjg0MSAyMDQuMzE0QzE5Ni43MTQgMTc5LjYyIDE4OS40NTIgMTY4Ljk2OCAxNjUuNDg0IDE2MS4yMkwxNDAuNTQ4IDE1My4yMzFaTTEwNC43MTcgNjguNzM5TDE3Ny4zNDcgOTIuOTQ4OEwxNjEuNjEgMTA3Ljk1OUwxMjMuODQzIDk1LjM2OThDMTEwLjc3IDkxLjAxMiAxMDYuNDEyIDgzLjk5MTEgMTA0LjcxNyA2OS4yMjMyVjY4LjczOVpNMTAwLjM1OSAxOTEuNzI1TDExNi44MjIgMTc1Ljk4OEwxNDcuODExIDE4Ni4xNTdDMTY0LjAzMSAxOTEuNDgzIDE2OS41OTkgMTk4LjUwNCAxNjcuOTA1IDIxNi4xNzdMMTAwLjM1OSAxOTEuNzI1Wk03OS41MzkgMTIxLjUxNkM3OS41MzkgMTE2LjkxNyA4MS45NTk5IDExMi41NTkgODYuMDc1NiAxMDguOTI3QzkwLjQzMzQgMTE1LjIyMiA5Ny45Mzg0IDEyMC43OSAxMDkuODAxIDEyNC42NjRMMTM1LjQ2NCAxMzMuMTM3TDEyMS4xOCAxNDYuOTM3TDk2LjAwMTYgMTM4LjcwNUM4NC4zODA5IDEzNC44MzIgNzkuNTM5IDEyOS4wMjEgNzkuNTM5IDEyMS41MTZaTTE1NS41NTggMjQ4LjYxOEMyMDguODE5IDIxMy4yNzIgMjM3LjM4NyAxODkuMzA0IDIzNy4zODcgMTU5Ljc2OEMyMzcuMzg3IDE0MC4xNTggMjI1Ljc2NiAxMjkuMjYzIDIwMC4xMDQgMTIwLjc5TDE4MC43MzYgMTE0LjI1M0wyMzMuNzU2IDYzLjQxMjhMMjIzLjEwMyA1Mi4wMzQyTDIwNy4zNjcgNjUuODMzN0wxMzMuMDQzIDQxLjM4MThDMTEwLjA0MyA0OC44ODY5IDgwLjk5MTYgNzAuOTE3OCA4MC45OTE2IDkyLjk0ODdDODAuOTkxNiA5NS4zNjk3IDgxLjIzMzcgOTcuNzkwNyA4MS45NiAxMDAuNDU0QzYyLjgzNDIgMTExLjM0OCA1NS4wODcxIDEyMS41MTYgNTUuMDg3MSAxMzQuMTA1QzU1LjA4NzEgMTQ1Ljk2OCA2MS4zODE2IDE1Ny44MzEgODEuNDc1OCAxNjQuMzY4TDk3LjQ1NDIgMTY5LjY5NEw0Mi4yNTU5IDIyMi43MTNMNTIuOTA4MiAyMzQuMDkyTDcwLjA5NzIgMjE4LjM1NkwxNTUuNTU4IDI0OC42MThaIiBmaWxsPSIjMDIwNTBBIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTQ2XzI5OSI+CjxyZWN0IHdpZHRoPSIyOTAiIGhlaWdodD0iMjkwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=';
    return adapter;
  }
  private getTrustWalletAdapter(){
    const adapter = new TrustWalletAdapter();
    adapter.icon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ijc3OS4zNjI1IDI2My4wMjk3IDQ0Mi45MSA1MDAuNTIiIHdpZHRoPSI0NDIuOTFweCIgaGVpZ2h0PSI1MDAuNTJweCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudCIgeDE9IjExMjMuMjYiIHkxPSIxODY1Ljc4IiB4Mj0iOTU0LjYxIiB5Mj0iMTMzNy41IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMjE4Mikgc2NhbGUoMSAtMSkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwLjAyIiBzdG9wLWNvbG9yPSJibHVlIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMC4wOCIgc3RvcC1jb2xvcj0iIzAwOTRmZiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjAuMTYiIHN0b3AtY29sb3I9IiM0OGZmOTEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIwLjQyIiBzdG9wLWNvbG9yPSIjMDA5NGZmIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMC42OCIgc3RvcC1jb2xvcj0iIzAwMzhmZiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjAuOSIgc3RvcC1jb2xvcj0iIzA1MDBmZiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxzdHlsZT4uY2xzLTF7ZmlsbDp1cmwoI2xpbmVhci1ncmFkaWVudCk7fS5jbHMtMntmaWxsOiMwNTAwZmY7fTwvc3R5bGU+CiAgPC9kZWZzPgogIDxnIHRyYW5zZm9ybT0ibWF0cml4KDAuOTk5OTk5OTk5OTk5OTk5OSwgMCwgMCwgMC45OTk5OTk5OTk5OTk5OTk5LCA0MC42NTI0NDI5MzIxMjg5MDYsIC04OC4wODAyOTE3NDgwNDY4OSkiPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNzM4LjcxLDQyMy40MWwyMjEuNDUtNzIuM3Y1MDAuNTJjLTE1OC4xOC02Ni43NC0yMjEuNDUtMTk0LjY1LTIyMS40NS0yNjYuOTR2LTE2MS4yOFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTExODEuNjIsNDIzLjQxbC0yMjEuNDUtNzIuM3Y1MDAuNTJjMTU4LjE4LTY2Ljc0LDIyMS40NS0xOTQuNjUsMjIxLjQ1LTI2Ni45NHYtMTYxLjI4WiIvPgogIDwvZz4KPC9zdmc+';
    return adapter;
  }


  public selectedWallet: SolanaWalletAdapter | null = null;
  public selectedWalletSignal = signal<SolanaWalletAdapter | null>(null);
  private selectedWalletSubject = new BehaviorSubject<SolanaWalletAdapter | null>(this.selectedWallet);
  public selectedWallet$: Observable<SolanaWalletAdapter | null> = this.selectedWalletSubject.asObservable();

	constructor(
		private readonly networkService: NetworkService,
    @Inject(PLATFORM_ID) private platformId: Object,
	){
    if(isPlatformBrowser(platformId)){
      this.restoreConnectedWallet();
    }
	}

  getAvailableWalletesForConnection(): SolanaWalletAdapter[] {
    let res: SolanaWalletAdapter[] = [];
    for(const wal of this.wallets){
      if(
        (wal.readyState === WalletReadyState.Installed || wal.readyState === WalletReadyState.Loadable) &&
        wal.name !== this.selectedWallet?.name
      ){
        res.push(wal);
      }
    }
    return res;
  }

  async getBalanceLamports(): Promise<number> {
    if(!this.selectedWallet?.publicKey) return 0;
    try{
      const accountInfo = await this.networkService.connection.getAccountInfo(this.selectedWallet.publicKey);
      return accountInfo?.lamports || 0;
    } catch(err) {
      return 0;
    }
  }

  async restoreConnectedWallet(){
    const walletName = localStorage.getItem('wallet');
    if(walletName !== null && walletName !== ''){
      try {
        await this.connect(walletName, true);
      } catch(err) {
        localStorage.removeItem('wallet');
      }
    }
  }

  async connect(walletName: string, auto: boolean = false): Promise<void> {
    const wallet = this.wallets.find(
      (w) => w.name === walletName && (w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable)
    );
    if(!wallet) throw new Error('Wallet not found');

    if(auto) await wallet.autoConnect();
    else await wallet.connect();
    await this.selectedWallet?.disconnect();
    
    localStorage.setItem('wallet', walletName);
    this.selectedWallet = wallet;
    this.selectedWalletSignal.set(wallet);
    this.selectedWalletSubject.next(wallet);
    this.selectedWallet?.addListener('connect', () => {
      // user switched to a different wallet in the same wallet extension
      this.selectedWallet = wallet;
      this.selectedWalletSignal.set(wallet);
      this.selectedWalletSubject.next(wallet);
    });
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('wallet');
    if(this.selectedWallet){
      try{
        await this.selectedWallet.disconnect();
      } catch (err) {
        // ignore
      }
      this.selectedWallet = null;
      this.selectedWalletSignal.set(null);
      this.selectedWalletSubject.next(null);
    }
  }
}