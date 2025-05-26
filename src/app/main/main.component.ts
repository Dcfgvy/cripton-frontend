import { Component, computed, signal } from '@angular/core';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { RouterLink } from '@angular/router';
import { PricesService } from '../app-settings/prices.service';

interface AffiliateCalcResult {
  monthlyEarnings: number;
  yearlyEarnings: number;
  usdValue: number;
}

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    FormsModule,
    SliderModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    DividerModule,
    RouterLink,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  readonly appName = environment.serviceName;
  constructor(
    public settingsService: AppSettingsService,
    public pricesService: PricesService,
  ) {}

  // Calculator inputs
  numReferrals = signal<number>(10);
  tokensPerReferral = signal<number>(3);
  private readonly FEE_PER_TOKEN: number = 0.08;

  calculatedEarnings = computed<AffiliateCalcResult>(() => {
    const monthlyEarnings = this.numReferrals() * this.tokensPerReferral() * this.FEE_PER_TOKEN * (this.pricesService.prices().solanaAffiliateSharePercents.cost / 100);
    
    const yearlyEarnings = monthlyEarnings * 12;
    const usdValue = yearlyEarnings * this.pricesService.cryptoPrices().SOL;
    
    // Update result
    return {
      monthlyEarnings,
      yearlyEarnings,
      usdValue,
    };
  })
}
