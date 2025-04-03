import { Injectable } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { PhantomWalletAdapter, SolflareWalletAdapter, SolongWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { NetworkSwitchService } from '../network-switch/network-switch.service';

@Injectable({ providedIn: 'root' })
export class WalletService {
	constructor(
		private readonly _hdConnectionStore: ConnectionStore,
		private readonly _hdWalletStore: WalletStore,
    private readonly networkSwitchService: NetworkSwitchService,
	) {}

  init(){
		this._hdConnectionStore.setEndpoint(clusterApiUrl(
      this.networkSwitchService.selectedNetwork.code as ('mainnet-beta' | 'devnet') // TODO: update network when user changes it
    ));
		this._hdWalletStore.setAdapters([
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
			new SolongWalletAdapter(),
		]);
  }
}