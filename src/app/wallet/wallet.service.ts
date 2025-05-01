import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BaseWalletAdapter, WalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { NetworkService } from '../network-switch/network-switch.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { AlphaWalletAdapter } from '@solana/wallet-adapter-alpha';
import { AvanaWalletAdapter } from '@solana/wallet-adapter-avana';
import { BitgetWalletAdapter } from '@solana/wallet-adapter-bitkeep';
import { BitpieWalletAdapter } from '@solana/wallet-adapter-bitpie';
import { Coin98WalletAdapter } from '@solana/wallet-adapter-coin98';
import { CoinhubWalletAdapter } from '@solana/wallet-adapter-coinhub';
import { HyperPayWalletAdapter } from '@solana/wallet-adapter-hyperpay';
import { KrystalWalletAdapter } from '@solana/wallet-adapter-krystal';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger';
import { MathWalletAdapter } from '@solana/wallet-adapter-mathwallet';
import { NightlyWalletAdapter } from '@solana/wallet-adapter-nightly';
import { SafePalWalletAdapter } from '@solana/wallet-adapter-safepal';
import { SaifuWalletAdapter } from '@solana/wallet-adapter-saifu';
import { SkyWalletAdapter } from '@solana/wallet-adapter-sky';

export type SolanaWalletAdapter = WalletAdapter;

@Injectable({ providedIn: 'root' })
export class WalletService {
  // IMPORTANT: some wallet adapters like the ones for Keystone, Fractal, Torus require React, so we can't use them
  private wallets: SolanaWalletAdapter[] = [
    new PhantomWalletAdapter(),
    new BraveWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new AlphaWalletAdapter(),
    new AvanaWalletAdapter(),
    new BitgetWalletAdapter(),
    new BitpieWalletAdapter(),
    new Coin98WalletAdapter(),
    new CoinhubWalletAdapter(),
    new HyperPayWalletAdapter(),
    new KrystalWalletAdapter(),
    new LedgerWalletAdapter(),
    new MathWalletAdapter(),
    new NightlyWalletAdapter(),
    new SafePalWalletAdapter(),
    new SaifuWalletAdapter(),
    new SkyWalletAdapter(),
  ];
  public selectedWallet: SolanaWalletAdapter | null = null;
  private selectedWalletSubject = new BehaviorSubject<SolanaWalletAdapter | null>(this.selectedWallet);
  public selectedWallet$: Observable<SolanaWalletAdapter | null> = this.selectedWalletSubject.asObservable();
  // private sub: any;
  // private connection: Connection;

	constructor(
		private readonly networkService: NetworkService,
    @Inject(PLATFORM_ID) private platformId: Object,
	){
		// this.connection = new Connection(this.networkService.selectedNetwork.url);
    // this.sub = this.networkService.selectedNetwork$.subscribe(network => {
    //   this.connection = new Connection(network.url);
    // });

    if(isPlatformBrowser(platformId)){
      this.restoreConnectedWallet();
    }
	}

  getAvailableWalletes(): SolanaWalletAdapter[] {
    let res: SolanaWalletAdapter[] = [];
    for(const wal of this.wallets){
      if(
        wal.readyState === WalletReadyState.Installed ||
        wal.readyState === WalletReadyState.Loadable
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
    this.selectedWalletSubject.next(wallet);
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
      this.selectedWalletSubject.next(null);
    }
  }
}