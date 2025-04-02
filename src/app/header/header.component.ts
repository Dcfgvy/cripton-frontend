import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NetworkSwitchComponent } from '../network-switch/network-switch.component';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WalletComponent } from "../wallet/wallet.component";

@Component({
  selector: 'app-header',
  imports: [
    ButtonModule,
    NetworkSwitchComponent,
    NgTemplateOutlet,
    RouterLink,
    WalletComponent
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
