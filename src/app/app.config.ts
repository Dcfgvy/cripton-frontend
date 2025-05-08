import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './routes/app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppSettingsService } from './app-settings/app-settings.service';
import { NetworkService } from './network-switch/network-switch.service';
import { primengProviders } from './primeng.config';
import { WalletService } from './wallet/wallet.service';
import { AffiliateService } from './affiliate-program/affiliate.service';
import { PricesService } from './app-settings/prices.service';

export const appConfig: ApplicationConfig = {
  providers: 
  [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    ...primengProviders,
    AppSettingsService,
    PricesService,
    NetworkService,
    WalletService,
    AffiliateService,
  ],
};
