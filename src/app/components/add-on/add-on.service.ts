import { Injectable, computed, signal } from '@angular/core';
import { ServiceName } from '../../app-settings/types/service-name.type';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { environment } from '../../../environments/environment';
import { AddOn } from './add-on.component';

@Injectable({
  providedIn: 'root'
})
export class AddOnService {
  constructor(
    private readonly settingsService: AppSettingsService,
  ) {}

  private getCurrentNetworkPrices(blockchain: string) {
    return this.settingsService.currentSettings?.prices[blockchain];
  }

  private getAddOnCost(serviceName: ServiceName, blockchain: string): number {
    const prices = this.getCurrentNetworkPrices(blockchain);
    return prices ? prices[serviceName].cost : 0;
  }

  calculateTotalCost(baseCost: number, addOns: Record<string, AddOn>, blockchain: string = 'solana') {
    return computed(() => {
      const isFree = (serviceName: ServiceName) => {
        const prices = this.getCurrentNetworkPrices(blockchain);
        if (!prices) return false;
        return prices[serviceName]?.isTemporarilyFree || false;
      };

      let total = baseCost;
      for (const addon of Object.values(addOns)) {
        if (addon.added() && !isFree(addon.serviceName)) {
          total += this.getAddOnCost(addon.serviceName, blockchain);
        }
      }
      return total;
    });
  }

  calculateTotalCostWithoutDiscounts(baseCost: number, addOns: Record<string, AddOn>, blockchain: string = 'solana') {
    return computed(() => {
      let total = baseCost;
      for (const addon of Object.values(addOns)) {
        if (addon.added()) {
          total += this.getAddOnCost(addon.serviceName, blockchain);
        }
      }
      return total * environment.solana.feeMultiplier;
    });
  }
} 