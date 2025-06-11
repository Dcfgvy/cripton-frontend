import { Component } from '@angular/core';
import { NetworkSwitchComponent } from '../network-switch/network-switch.component';
import { RouterLink } from '@angular/router';
import { WalletComponent } from "../wallet/wallet.component";
import { LogoComponent } from "../components/logo/logo.component";
import { CommonModule } from '@angular/common';
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'app-header',
  imports: [
    NetworkSwitchComponent,
    RouterLink,
    WalletComponent,
    LogoComponent,
    CommonModule,
    Drawer,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public showMobileMenu = false;

  constructor(
  ) {}

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeDrawerWithTimeout(){
    setTimeout(() => {
      this.showMobileMenu = false;
    }, 400)
  }
}
