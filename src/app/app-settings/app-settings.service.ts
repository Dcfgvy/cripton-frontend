import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceName } from './types/service-name.type';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private _settings = new BehaviorSubject<IAppSettings|null>(null);

  constructor(
    private http: HttpClient
  ) {}

  settings$ = this._settings.asObservable();
  get currentSettings(): IAppSettings | null {
    return this._settings.value;
  }
  settingsSignal = signal<IAppSettings | null>(null);

  init(): void {
    // Always fetch fresh data regardless of platform
    this.fetchSettings();
  }

  private fetchSettings(): void {
    // Use the appropriate API URL depending on the environment
    const apiUrl = environment.apiUrl;
    
    this.http.get<IAppSettings>(`${apiUrl}/api/settings`).subscribe(data => {
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