import { Component, computed, Inject, model, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { WalletService } from '../../../wallet/wallet.service';
import { NetworkService } from '../../../network-switch/network-switch.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { SelectUserTokenService, TokenData } from './select-user-token.service';

@Component({
  selector: 'app-select-user-token',
  imports: [Select, FormsModule],
  templateUrl: './select-user-token.component.html',
  styleUrl: './select-user-token.component.scss'
})
export class SelectUserTokenComponent implements OnInit, OnDestroy {
  token = model.required<TokenData | null>();
  userTokens: TokenData[] = [];
  isFetchingInProgress = signal(true);
  subscriptions: Subscription[] = [];

  constructor(
    public readonly walletService: WalletService,
    private readonly networkService: NetworkService,
    private readonly tokenService: SelectUserTokenService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {
    this.subscriptions.push(this.walletService.selectedWallet$.subscribe(() => {
      this.getTokenAccounts();
    }));
    this.subscriptions.push(this.networkService.selectedNetwork$.subscribe(() => {
      this.getTokenAccounts();
    }));
  }

  ngOnInit(): void {
    if(isPlatformBrowser(this.platformId)) {
      this.getTokenAccounts();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  selectPlaceholder = computed(() => {
    if(this.walletService.selectedWalletSignal() === null) {
      return 'Connect your wallet';
    }
    if(this.isFetchingInProgress()) {
      return 'Loading...';
    }
    return 'Select a token';
  });

  private async getTokenAccounts() {
    this.token.set(null);
    this.isFetchingInProgress.set(true);
    this.userTokens = [];

    try {
      this.userTokens = await this.tokenService.fetchUserTokens();
      this.tokenService.loadTokenImages(this.userTokens).subscribe();
    } catch (error) {
      console.error('Error fetching token accounts:', error);
    } finally {
      this.isFetchingInProgress.set(false);
    }
  }
}
