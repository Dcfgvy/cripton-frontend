import { afterNextRender, Injectable } from '@angular/core';
import { clusterApiUrl } from '@solana/web3.js';

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
      url: 'https://lb.drpc.org/ogrpc?network=solana&dkey=AnwthBMQyk6Nn04E_iyiffZOTHAXDV4R8LjOjk6iId46', // TODO: clusterApiUrl('mainnet-beta')
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

  constructor(){
    afterNextRender(async () => {
      const network = localStorage.getItem('network');
      if(network === 'mainnet-beta' || network === 'testnet' || network === 'devnet'){
        this.selectedNetwork = this.networks.find((v) => v.code === network) || this.networks[0];
      }
      else{
        this.selectedNetwork = this.networks[0];
        this.updateStorageData();
      }
    })
  }

  updateStorageData(){
    localStorage.setItem('network', this.selectedNetwork.code);
  }
}
