import { afterNextRender, Injectable } from '@angular/core';
import { clusterApiUrl } from '@solana/web3.js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

export interface Network {
  name: string;
  code: string;
  url: string;
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
      url: environment.mainnetUrls.solana,
      isTest: false
    },
    {
      name: 'Testnet',
      code: 'testnet',
      url: clusterApiUrl('testnet'),
      isTest: true
    },
    {
      name: 'Devnet',
      code: 'devnet',
      url: clusterApiUrl('devnet'),
      isTest: true
    }
  ]

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
