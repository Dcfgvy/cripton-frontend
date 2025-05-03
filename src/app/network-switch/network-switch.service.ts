import { afterNextRender, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Connection } from '@solana/web3.js';

export interface Network {
  name: string;
  code: string;
  url: string;
  image: string;
  isTest: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  networks: Network[] = [
    {
      name: 'Mainnet',
      code: 'mainnet-beta',
      url: environment.solana.rpcUrls['mainnet-beta'],
      image: 'images/blockchain_logos/solana.svg',
      isTest: false
    },
    {
      name: 'Devnet',
      code: 'devnet',
      url: environment.solana.rpcUrls.devnet,
      image: 'images/blockchain_logos/solana_devnet.svg',
      isTest: true
    }
  ]

  public connection: Connection = new Connection(this.networks[0].url);

  selectedNetwork: Network = this.networks[0];
  private selectedNetworkSubject = new BehaviorSubject<Network>(this.networks[0]);
  selectedNetwork$: Observable<Network> = this.selectedNetworkSubject.asObservable();

  constructor(){
    afterNextRender(async () => {
      const network = localStorage.getItem('network');
      if(network === 'mainnet-beta' || network === 'testnet' || network === 'devnet'){
        this.updateSelectedNetwork(this.networks.find((v) => v.code === network) || this.networks[0]);
      }
      else{
        this.updateSelectedNetwork(this.networks[0]);
        this.updateStorageData();
      }
    })
  }

  private updateSelectedNetwork(network: Network){
    this.selectedNetwork = network;
    this.connection = new Connection(network.url, 'confirmed');
    this.selectedNetworkSubject.next(network);
  }

  private updateStorageData(){
    localStorage.setItem('network', this.selectedNetwork.code);
  }

  updateData(){
    this.updateSelectedNetwork(this.selectedNetwork);
    this.updateStorageData();
  }
}
