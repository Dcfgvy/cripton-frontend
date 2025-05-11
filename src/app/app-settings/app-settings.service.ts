import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceName } from './types/service-name.type';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private _settings = new BehaviorSubject<IAppSettings|null>(null);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  settings$ = this._settings.asObservable();
  get currentSettings(): IAppSettings | null {
    return this._settings.value;
  }
  settingsSignal = signal<IAppSettings | null>(null);

  init(): void {
    if(isPlatformBrowser(this.platformId)){
      this.fetchSettings();
    }
  }

  private fetchSettings(): void {
    this.http.get<IAppSettings>(`${environment.apiUrl}/api/settings`).subscribe(data => {
      this._settings.next(data);
      this.settingsSignal.set(data);
    });
  }
}

export interface IAppSettings {
  solanaAddress: string;
  tokenExpirationTime: number;
  maxImageSize: number; // in MB

  prices: Record<string, Record<ServiceName, Price>>;
}

export interface Price {
  cost: number;
  isTemporarilyFree: boolean;
  isNetworkFeeIncluded: boolean;
}