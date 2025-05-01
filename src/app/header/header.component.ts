import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WalletComponent } from "../wallet/wallet.component";
import { LogoComponent } from "../components/logo/logo.component";

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    WalletComponent,
    LogoComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
