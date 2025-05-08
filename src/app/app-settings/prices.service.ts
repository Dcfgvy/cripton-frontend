import { computed, Injectable } from '@angular/core';
import { AppSettingsService, Price } from './app-settings.service';
import { SolanaServiceName } from './enums/solana-service-name.enum';

@Injectable({
  providedIn: 'root'
})
export class PricesService {
  constructor(
    private readonly settingsService: AppSettingsService
  ) {}

  prices = computed(() => {
    let solanaPrices: Record<string, Price> | undefined = this.settingsService.currentSettings?.prices['solana'];
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
}
