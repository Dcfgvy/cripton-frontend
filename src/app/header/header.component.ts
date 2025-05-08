import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NetworkSwitchComponent } from '../network-switch/network-switch.component';
import { RouterLink } from '@angular/router';
import { WalletComponent } from "../wallet/wallet.component";
import { LogoComponent } from "../components/logo/logo.component";
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  public isMobileView = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if(isPlatformBrowser(this.platformId)){
      this.checkScreenSize();
      window.addEventListener('resize', () => this.checkScreenSize());
    }
  }

  ngOnDestroy() {
    if(isPlatformBrowser(this.platformId)){
      window.removeEventListener('resize', () => this.checkScreenSize());
    }
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth < 768;
    if (!this.isMobileView) {
      this.showMobileMenu = false;
    }
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeDrawerWithTimeout(){
    setTimeout(() => {
      this.showMobileMenu = false;
    }, 400)
  }
}
