import { Component } from '@angular/core';
import { WalletService } from '../../../wallet/wallet.service';
import { Button } from 'primeng/button';
import { WalletConnectionPopupComponent } from "../../../wallet/wallet-connection-popup/wallet-connection-popup.component";

@Component({
  selector: 'app-solana-wallet-connected-guard',
  imports: [Button, WalletConnectionPopupComponent],
  templateUrl: './solana-wallet-connected-guard.component.html',
  styleUrl: './solana-wallet-connected-guard.component.scss'
})
export class SolanaWalletConnectedGuardComponent {
  constructor(
    protected readonly walletService: WalletService
  ) {}

  dialogOpened = false;

  connectWallet(){
    this.dialogOpened = true;
  }
}
