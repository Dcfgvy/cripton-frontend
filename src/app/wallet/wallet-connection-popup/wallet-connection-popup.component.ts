import { Component, model, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { WalletService } from '../wallet.service';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-wallet-connection-popup',
  imports: [
    ButtonDirective,
    Dialog,
    Toast,
  ],
  templateUrl: './wallet-connection-popup.component.html',
  styleUrl: './wallet-connection-popup.component.scss',
  providers: [MessageService]
})
export class WalletConnectionPopupComponent {
  showIf = model.required<boolean>();
  
	constructor(
    public readonly walletService: WalletService,
    private readonly messageService: MessageService,
	) {}


  async connect(walletName: string) {
    try{
      await this.walletService.connect(walletName);
      this.showIf.set(false);
      this.messageService.add({ severity: 'success', summary: 'Connected', detail: `${walletName} wallet was successfully connected`, life: 3000 });
    }
    catch{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `${walletName} wallet connection failed`, life: 3000 });
    }
  }
}
