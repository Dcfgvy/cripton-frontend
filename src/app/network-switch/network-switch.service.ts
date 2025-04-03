import { Injectable } from '@angular/core';

export interface Network {
  name: string;
  code: string;
  isTest: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkSwitchService {
  networks: Network[] = [
    {
      name: 'Mainnet',
      code: 'mainnet-beta',
      isTest: false
    },
    {
      name: 'Devnet',
      code: 'devnet',
      isTest: true
    }
  ]

  selectedNetwork: Network = this.networks[0];
}
