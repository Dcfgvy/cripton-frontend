import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { WalletService } from './wallet.service';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { WalletAdapter } from '@solana/wallet-adapter-base';

@Component({
  selector: 'app-wallet',
  imports: [
    CommonModule,
    ButtonModule,
    Dialog,
    Toast,
    Popover,
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
  providers: [WalletService, MessageService]
})
export class WalletComponent implements OnInit {
  dialogOpened = false;
  addressCopiedState = false;

	constructor(
    public readonly walletService: WalletService,
    private readonly messageService: MessageService,
	) {}

  currentSelectedWallet: WalletAdapter | null = null;

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

  connect(walletName: string): void {
    this.walletService.connect(walletName)
    .then(() => {
      this.dialogOpened = false;
      this.messageService.add({ severity: 'success', summary: 'Connected', detail: `${walletName} Wallet was successfully connected`, life: 3000 });
    })
    .catch(() => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `${walletName} Wallet connection failed`, life: 3000 });
    });
  }

  disconnect(): void {
    this.walletService.disconnect().catch(console.error);
  }
}
