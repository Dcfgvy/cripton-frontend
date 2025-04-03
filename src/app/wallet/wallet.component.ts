import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { WalletService } from './wallet.service';

@Component({
  selector: 'app-wallet',
  imports: [
    ButtonModule,
    CommonModule,
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent {
	constructor(
    public readonly walletService: WalletService,
	) {}

  connect(walletName: string): void {
    this.walletService.connect(walletName).catch(console.error);
  }

  disconnect(): void {
    this.walletService.disconnect().catch(console.error);
  }
}
