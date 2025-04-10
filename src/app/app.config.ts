import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppSettingsService } from './app-settings/app-settings.service';
import { NetworkService } from './network-switch/network-switch.service';
import { WalletService } from './wallet/wallet.service';
import { primengProviders } from './primeng.config';

export const appConfig: ApplicationConfig = {
  providers: 
  [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    ...primengProviders,
    AppSettingsService,
    NetworkService,
    WalletService,
  ],
};
