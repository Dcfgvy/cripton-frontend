import { Component } from '@angular/core';
import { NetworkSwitchComponent } from '../network-switch/network-switch.component';
import { RouterLink } from '@angular/router';
import { WalletComponent } from "../wallet/wallet.component";

@Component({
  selector: 'app-header',
  imports: [
    NetworkSwitchComponent,
    RouterLink,
    WalletComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
