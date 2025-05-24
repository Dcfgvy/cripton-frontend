import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { environment } from '../../environments/environment';
import { CopyStringComponent } from '../components/copy-string/copy-string.component';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { WalletService } from '../wallet/wallet.service';
import { SolanaWalletConnectedGuardComponent } from "../solana/components/solana-wallet-connected-guard/solana-wallet-connected-guard.component";
import { Divider } from 'primeng/divider';
import { AffiliateService } from './affiliate.service';
import { PricesService } from '../app-settings/prices.service';
import { ToolHeaderComponent } from "../components/tool-header/tool-header.component";

@Component({
  selector: 'app-affiliate-program',
  imports: [
    Card,
    ButtonModule,
    CopyStringComponent,
    Toast,
    SolanaWalletConnectedGuardComponent,
    Divider,
    ToolHeaderComponent
],
  templateUrl: './affiliate-program.component.html',
  styleUrl: './affiliate-program.component.scss',
  providers: [MessageService]
})
export class AffiliateProgramComponent {
  serviceName = environment.serviceName;
  serviceWebsite = environment.serviceWebsite;
  
  loading = false;
  referralId = '';

  private affiliateService = inject(AffiliateService);
  constructor(
    private messageService: MessageService,
    public walletService: WalletService,
    public pricesService: PricesService,
  ) {}

  createLink(){
    if(!this.walletService.selectedWallet) return;
    this.loading = true;

    this.affiliateService.createReferralId({ solana: this.walletService.selectedWallet.publicKey?.toBase58() || '' }).subscribe({
      next: (response) => {
        this.loading = false;
        this.referralId = response.id;
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Referral link successfully created' });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating referral link:', error);
      },
    })
  }
}
