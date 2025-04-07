import { afterNextRender, Injectable } from '@angular/core';
import { WalletAdapterNetwork, WalletReadyState } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave';
import { NetworkSwitchService } from '../network-switch/network-switch.service';

export type WalletAdapter = PhantomWalletAdapter | SolflareWalletAdapter | BraveWalletAdapter;

@Injectable({ providedIn: 'root' })
export class WalletService {
  private connection: Connection;
  // IMPORTANT: some wallet adapters like for Keystone require React, so we can't use them
  private wallets: WalletAdapter[] = [
    new PhantomWalletAdapter(),
    new BraveWalletAdapter(),
    new SolflareWalletAdapter(),
  ];
  public selectedWallet: WalletAdapter | null = null;

	constructor(
		private readonly networkSwitchService: NetworkSwitchService,
	){
		this.connection = new Connection(clusterApiUrl(
			this.networkSwitchService.selectedNetwork.code as ('mainnet-beta' | 'devnet' | 'testnet') // TODO: update network when user changes it
		));

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