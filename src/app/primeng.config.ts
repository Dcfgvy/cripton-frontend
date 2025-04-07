import { providePrimeNG } from "primeng/config";
import Aura from '@primeng/themes/aura';
import { EnvironmentProviders, Provider } from "@angular/core";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const primengProviders: (EnvironmentProviders | Provider)[] = [
  provideAnimationsAsync(),
  providePrimeNG({
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.app-dark'
      }
    }
  }),
]