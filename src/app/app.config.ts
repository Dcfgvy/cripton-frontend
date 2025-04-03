import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppSettingsService } from './app-settings/app-settings.service';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
import { PhantomWalletAdapter, SolflareWalletAdapter, SolongWalletAdapter } from '@solana/wallet-adapter-wallets';
import { NetworkSwitchService } from './network-switch/network-switch.service';

export const appConfig: ApplicationConfig = {
  providers: 
  [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }),
    importProvidersFrom(HdWalletAdapterModule.forRoot({
      adapters: [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new SolongWalletAdapter(),
      ],
      autoConnect: true
    })),
    AppSettingsService,
    NetworkSwitchService,
  ],
};
