import { Component, computed, inject } from '@angular/core';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { formatTimeMinutes } from '../../utils/functions';
import { NetworkService } from '../../network-switch/network-switch.service';
import { WarningComponent } from "../warning/warning.component";

@Component({
  selector: 'app-testnet-token-data-removal-warning',
  imports: [WarningComponent],
  templateUrl: './testnet-token-data-removal-warning.component.html',
  styleUrl: './testnet-token-data-removal-warning.component.scss'
})
export class TestnetTokenDataRemovalWarningComponent {
  settingsService = inject(AppSettingsService);
  networkService = inject(NetworkService);

  metadataExpirationTime = computed<string>(() => {
    return formatTimeMinutes(this.settingsService.settingsSignal()?.tokenExpirationTime || 0);
  })
}
