import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService } from './app-settings/app-settings.service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from "./footer/footer.component";
import { AffiliateService } from './affiliate-program/affiliate.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Solana Token Generator';

  constructor(
    private settingsService: AppSettingsService,
    private affiliateService: AffiliateService,
  ) {}

  ngOnInit(): void {
    this.settingsService.init();
    this.affiliateService.init();
  }
}
