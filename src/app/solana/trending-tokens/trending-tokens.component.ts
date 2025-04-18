import { ChangeDetectorRef, Component, computed, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Card } from 'primeng/card';
import { TrendingToken, TrendingTokensService } from './trending-tokens.service';
import { isPlatformBrowser } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { formatNumberShort } from '../../utils/functions';
import { TextLinkComponent } from "../../components/text-link/text-link.component";
import { AppSettingsService } from '../../app-settings/app-settings.service';

@Component({
  selector: 'app-trending-tokens',
  imports: [Card, ToggleSwitch, FormsModule, ButtonDirective, TextLinkComponent],
  templateUrl: './trending-tokens.component.html',
  styleUrl: './trending-tokens.component.scss'
})
export class TrendingTokensComponent implements OnInit, OnDestroy {
  private fetchInterval: number | null = null;
  private isBrowser: boolean;

  constructor(
    private readonly trendingTokensService: TrendingTokensService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private settingsService: AppSettingsService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  isAutoUpdateOn: boolean = true;
  tokens: TrendingToken[] = [];

  private fetchTokens(){
    this.trendingTokensService.fetchTrendingTokens().pipe(
      tap((data) => {
        this.tokens = [...data.data];
        this.cdr.detectChanges();
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    ).subscribe();
  }

  formatMarketCap(n: number): string {
    return formatNumberShort(n);
  }

  ngOnInit(): void {
    this.fetchTokens();
    if(this.isBrowser && this.fetchInterval === null){
      this.fetchInterval = setInterval(() => {
        if(this.isAutoUpdateOn){
          this.fetchTokens();
        }
      }, 5000) as unknown as number;
    }
  }

  ngOnDestroy(): void {
    if(this.isBrowser && this.fetchInterval !== null){
      clearInterval(this.fetchInterval);
    }
  }

  confirmationWindowOpened: boolean = false;
  createdWindowOpened: boolean = false;
  baseCost = computed<number>(() => {
    return this.settingsService.currentSettings?.baseTokenCreationCost || 0;
  });
}
