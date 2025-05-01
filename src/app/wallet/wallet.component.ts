import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { SolanaWalletAdapter, WalletService } from './wallet.service';
import { Popover } from 'primeng/popover';
import { WalletConnectionPopupComponent } from "./wallet-connection-popup/wallet-connection-popup.component";

@Component({
  selector: 'app-wallet',
  imports: [
    CommonModule,
    ButtonModule,
    Popover,
    WalletConnectionPopupComponent
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent implements OnInit {
  dialogOpened = false;
  addressCopiedState = false;

	constructor(
    public readonly walletService: WalletService,
	) {}

  currentSelectedWallet: SolanaWalletAdapter | null = null;

  ngOnInit(): void {
    this.currentSelectedWallet = this.walletService.selectedWallet;
    this.walletService.selectedWallet$.subscribe((wallet) => {
      this.currentSelectedWallet = wallet;
    })
  }

  copyAddress(){
    if(this.walletService.selectedWallet){
      navigator.clipboard.writeText(this.walletService.selectedWallet.publicKey?.toBase58() || '');
      this.addressCopiedState = true;
      setTimeout(() => {
        this.addressCopiedState = false;
      }, 3000)
    }
  }

  disconnect(): void {
    this.walletService.disconnect().catch(console.error);
  }
}
