import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BaseWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { Connection } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave';
import { NetworkService } from '../network-switch/network-switch.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

// TODO add more wallets & lazy-load them
export type WalletAdapter = PhantomWalletAdapter | SolflareWalletAdapter | BraveWalletAdapter;

// const a: BaseWalletAdapter = null as any as BaseWalletAdapter;
// a.se

@Injectable({ providedIn: 'root' })
export class WalletService {
  // IMPORTANT: some wallet adapters like the one for Keystone require React, so we can't use them
  private wallets: WalletAdapter[] = [
    new PhantomWalletAdapter(),
    new BraveWalletAdapter(),
    new SolflareWalletAdapter(),
  ];
  public selectedWallet: WalletAdapter | null = null;
  private selectedWalletSubject = new BehaviorSubject<WalletAdapter | null>(this.selectedWallet);
  public selectedWallet$: Observable<WalletAdapter | null> = this.selectedWalletSubject.asObservable();
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

  getAvailableWalletes(): WalletAdapter[] {
    let res: WalletAdapter[] = [];
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

    // use connect() anyway
    if(auto) await wallet.connect();
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