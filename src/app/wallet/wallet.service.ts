import { Injectable } from '@angular/core';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { NetworkSwitchService } from '../network-switch/network-switch.service';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private connection: Connection;
  private wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  public selectedWallet: PhantomWalletAdapter | SolflareWalletAdapter | null = null;
  public publicKey: PublicKey | null = null;

	constructor(
		private readonly networkSwitchService: NetworkSwitchService,
	){
		this.connection = new Connection(clusterApiUrl(
			this.networkSwitchService.selectedNetwork.code as ('mainnet-beta' | 'devnet' | 'testnet') // TODO: update network when user changes it
		));
	}

  async connect(walletName: string): Promise<void> {
    const wallet = this.wallets.find((w) => w.name === walletName);
    if (!wallet) throw new Error('Wallet not found');

    await wallet.connect();
    this.selectedWallet = wallet;
    this.publicKey = wallet.publicKey;
  }

  async disconnect(): Promise<void> {
    if (this.selectedWallet) {
      await this.selectedWallet.disconnect();
      this.selectedWallet = null;
      this.publicKey = null;
    }
  }
}