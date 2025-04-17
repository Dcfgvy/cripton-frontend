import { afterNextRender, Injectable } from '@angular/core';
import { WalletAdapterNetwork, WalletReadyState } from '@solana/wallet-adapter-base';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave';
import { NetworkService } from '../network-switch/network-switch.service';

export type WalletAdapter = PhantomWalletAdapter | SolflareWalletAdapter | BraveWalletAdapter;

@Injectable({ providedIn: 'root' })
export class WalletService {
  private connection: Connection;
  // IMPORTANT: some wallet adapters like the one for Keystone require React, so we can't use them
  private wallets: WalletAdapter[] = [
    new PhantomWalletAdapter(),
    new BraveWalletAdapter(),
    new SolflareWalletAdapter(),
  ];
  public selectedWallet: WalletAdapter | null = null;
  sub: any;

	constructor(
		private readonly networkService: NetworkService,
	){
		this.connection = new Connection(this.networkService.selectedNetwork.url);
    this.sub = this.networkService.selectedNetwork$.subscribe(network => {
      this.connection = new Connection(network.url);
    });

    afterNextRender(async () => {
      const walletName = localStorage.getItem('wallet');
      if(walletName !== null && walletName !== ''){
        try {
          await this.connect(walletName);
        } catch(err) {
          localStorage.removeItem('wallet');
        }
      }
    })
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
    console.log(this.connection.rpcEndpoint);
    if(!this.selectedWallet?.publicKey) return 0;
    try{
      const accountInfo = await this.connection.getAccountInfo(this.selectedWallet.publicKey);
      return accountInfo?.lamports || 0;
    } catch(err) {
      return 0;
    }
  }

  async connect(walletName: string): Promise<void> {
    const wallet = this.wallets.find(
      (w) => w.name === walletName && (w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable)
    );
    if (!wallet) throw new Error('Wallet not found');

    if(this.selectedWallet !== null){
      try{
        await this.selectedWallet.disconnect();
        this.selectedWallet = null;
      } catch (err) {
        // ignore
      }
    }
    await wallet.connect();
    localStorage.setItem('wallet', walletName);
    this.selectedWallet = wallet;
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('wallet');
    if(this.selectedWallet){
      await this.selectedWallet.disconnect();
      this.selectedWallet = null;
    }
  }
}