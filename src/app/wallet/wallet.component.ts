import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
import { WalletService } from './wallet.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    ButtonModule,
    NgIf,
    BrowserModule,
    HdWalletAdapterModule,
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent {
	constructor(
    public readonly walletService: WalletService,
	) {}
}
