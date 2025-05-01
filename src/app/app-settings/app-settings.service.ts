import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceName } from './types/service-name.type';

const EXAMPLE_DATA_KEY = makeStateKey<IAppSettings>('appSettings');

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private _settings = new BehaviorSubject<IAppSettings|null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState,
    private http: HttpClient
  ) {}

  settings$ = this._settings.asObservable();
  get currentSettings(): IAppSettings | null {
    return this._settings.value;
  }

  init(): void {
    if (isPlatformServer(this.platformId)) {
      this.fetchDataOnServer();
    } else {
      this.handleDataOnClient();
    }
  }

  private fetchDataOnServer(): void {
    this.http.get(`${environment.ssrApiUrl}/api/settings`).subscribe(data => {
      this.transferState.set(EXAMPLE_DATA_KEY, data);
    });
  }

  private handleDataOnClient(): void {
    const storedData = this.transferState.get(EXAMPLE_DATA_KEY, null);
    
    if (storedData) {
      // console.log('Using server-fetched data', storedData);
      this._settings.next(storedData);
    } else {
      // Client-side fallback fetch
      // console.log('Client-side fetch initiated');
      this.http.get<IAppSettings>(`${environment.apiUrl}/api/settings`).subscribe(data => {
        // console.log('Client-side fetch completed', data);
        this._settings.next(data);
      });
    }
  }
}

export interface IAppSettings {
  solanaAddress: string;
  tokenExpirationTimeMin: number;
  maxImageSize: number; // in MB

  prices: Record<string, Record<ServiceName, Price>>;
}

export interface Price {
  cost: number;
  isTemporarilyFree: boolean;
  isNetworkFeeIncluded: boolean;
}