import { Component, input } from '@angular/core';
import { NetworkService } from '../../../../network-switch/network-switch.service';
import { ButtonDirective } from 'primeng/button';
import { SolanaExplorerLinkComponent } from "../../../components/solana-explorer-link/solana-explorer-link.component";

@Component({
  selector: 'app-token-created-body',
  imports: [ButtonDirective, SolanaExplorerLinkComponent],
  templateUrl: './token-created-body.component.html',
  styleUrl: './token-created-body.component.scss'
})
export class TokenCreatedBodyComponent {
  address = input.required<string>();

  tokenNetwork: string;
  isTestnet: boolean;
  constructor(
    public readonly networkService: NetworkService
  ) {
    this.tokenNetwork = `${this.networkService.selectedNetwork.code}`;
    this.isTestnet = this.networkService.selectedNetwork.isTest;
  }

  addressCopiedState = false;
  copyAddress(){
    navigator.clipboard.writeText(this.address());
    this.addressCopiedState = true;
    setTimeout(() => {
      this.addressCopiedState = false;
    }, 3000);
  }
}
