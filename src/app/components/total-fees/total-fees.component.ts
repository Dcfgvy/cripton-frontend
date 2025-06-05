import { Component, input, computed, inject } from '@angular/core';
import { AppSettingsService } from '../../app-settings/app-settings.service';

@Component({
  selector: 'app-total-fees',
  imports: [],
  templateUrl: './total-fees.component.html',
  styleUrl: './total-fees.component.scss'
})
export class TotalFeesComponent {
  cost = input.required<number>();
  costWithoutDiscounts = input.required<number>();
  currency = input<string>('SOL');
  precision = input<number>(2);

  settingsService = inject(AppSettingsService);

  formattedCost = computed(() => Number(this.cost().toFixed(this.precision())));
  formattedCostWithoutDiscounts = computed(() => Number(this.costWithoutDiscounts().toFixed(this.precision())));
}
