import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

interface Network {
  name: string;
  code: string;
  isTest: boolean;
}

@Component({
  selector: 'app-network-switch',
  imports: [SelectModule, FormsModule, NgTemplateOutlet],
  templateUrl: './network-switch.component.html',
  styleUrl: './network-switch.component.scss'
})
export class NetworkSwitchComponent {
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
