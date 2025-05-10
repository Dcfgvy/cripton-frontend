import { computed, Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { AppSettingsService, Price } from './app-settings.service';
import { SolanaServiceName } from './enums/solana-service-name.enum';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

interface CryptoPrices {
  SOL: number;
}

@Injectable({
  providedIn: 'root'
})
export class PricesService {
  constructor(
    private readonly settingsService: AppSettingsService,
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  prices = computed(() => {
    let solanaPrices: Record<string, Price> | undefined = this.settingsService.settingsSignal()?.prices['solana'];
    if(solanaPrices === undefined){
      solanaPrices = {};
      const solanaServices = [
        SolanaServiceName.TokenCreation,
        SolanaServiceName.CustomCreatorInfo,
        SolanaServiceName.CustomAddress,
        SolanaServiceName.MultiWalletSupplyDistribution,
        SolanaServiceName.FreezeAuthority,
        SolanaServiceName.MintAuthority,
        SolanaServiceName.UpdateAuthority,
        SolanaServiceName.TrendingTokenCreation,
        SolanaServiceName.MultisenderProTransfer,
        SolanaServiceName.AffiliateSharePercents,
      ];
      for(const service of solanaServices){
        solanaPrices[service] = {
          cost: 0,
          isNetworkFeeIncluded: true,
          isTemporarilyFree: false,
        };
      }
    }
    return {
      solanaTokenCreation: solanaPrices[SolanaServiceName.TokenCreation],
      solanaCustomCreatorInfo: solanaPrices[SolanaServiceName.CustomCreatorInfo],
      solanaCustomAddress: solanaPrices[SolanaServiceName.CustomAddress],
      solanaMultiWalletSupplyDistribution: solanaPrices[SolanaServiceName.MultiWalletSupplyDistribution],
      solanaFreezeAuthority: solanaPrices[SolanaServiceName.FreezeAuthority],
      solanaMintAuthority: solanaPrices[SolanaServiceName.MintAuthority],
      solanaUpdateAuthority: solanaPrices[SolanaServiceName.UpdateAuthority],
      solanaTrendingTokenCreation: solanaPrices[SolanaServiceName.TrendingTokenCreation],
      solanaMultisenderProTransfer: solanaPrices[SolanaServiceName.MultisenderProTransfer],
      solanaAffiliateSharePercents: solanaPrices[SolanaServiceName.AffiliateSharePercents],
    };
  });

  cryptoPrices = signal<CryptoPrices>({
    SOL: 0,
  });
  fetchCryptoPrices(){
  // Get SOL price
  this.http.get<{ price: string }>('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT').subscribe({
    next: (data) => {
      // Update the signal AFTER we receive the data
      this.cryptoPrices.update(prices => ({
        ...prices,
        SOL: Number(data.price)
      }));
    },
    error: (err) => {
      console.error(err);
    }
  });
  }
  initCryptoPrices(){
    if(isPlatformBrowser(this.platformId)){
      this.fetchCryptoPrices();
      setInterval(() => this.fetchCryptoPrices(), 1000 * 60 * 60);
    }
  }
}
