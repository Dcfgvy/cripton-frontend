import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { AppSettingsService } from './app-settings/app-settings.service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from "./footer/footer.component";
import { AffiliateService } from './affiliate-program/affiliate.service';
import { PricesService } from './app-settings/prices.service';
import { filter } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

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
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private settingsService: AppSettingsService,
    private affiliateService: AffiliateService,
    private pricesService: PricesService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {}
  
  private routerSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.settingsService.init();
    this.affiliateService.init();
    this.pricesService.initCryptoPrices();

    // reload settings and prices when user navigates to a new page
    if (isPlatformBrowser(this.platformId)) {
      this.routerSubscription = this.router.events.pipe(
        filter(event => event instanceof NavigationStart)
      ).subscribe(() => {
        this.settingsService.init();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}