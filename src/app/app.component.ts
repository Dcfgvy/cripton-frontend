import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService } from './app-settings/app-settings.service';
import { HeaderComponent } from './header/header.component';
import { NetworkSwitchService } from './network-switch/network-switch.service';
import { WalletService } from './wallet/wallet.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Solana Token Generator';

  constructor(
    private settingsService: AppSettingsService,
		private readonly walletService: WalletService,
  ) {}

  ngOnInit(): void {
    this.settingsService.init();
    this.walletService.init();
  }
}
