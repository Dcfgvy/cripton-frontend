import { Component } from '@angular/core';
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
  ) {
    this.calculateEarnings();
  }

  // Calculator inputs
  numReferrals: number = 10;
  tokensPerReferral: number = 3;
  
  // Constants
  private readonly SOL_PRICE_USD: number = 150; // Example SOL price in USD
  private readonly FEE_PER_TOKEN: number = 0.1; // 0.1 SOL fee per token creation
  private readonly AFFILIATE_PERCENT: number = 0.3; // 30% affiliate commission
  
  // Results
  result: AffiliateCalcResult = {
    monthlyEarnings: 0,
    yearlyEarnings: 0,
    usdValue: 0
  };
  
  calculateEarnings(): void {
    // Calculate monthly earnings
    const monthlyEarnings = this.numReferrals * this.tokensPerReferral * this.FEE_PER_TOKEN * this.AFFILIATE_PERCENT;
    
    // Calculate yearly earnings
    const yearlyEarnings = monthlyEarnings * 12;
    
    // Calculate USD value
    const usdValue = yearlyEarnings * this.SOL_PRICE_USD;
    
    // Update result
    this.result = {
      monthlyEarnings,
      yearlyEarnings,
      usdValue
    };
  }
}
