import { Component, computed, model, OnInit, signal } from '@angular/core';
import { SelectUserTokenComponent } from "../components/select-user-token/select-user-token.component";
import { ToolHeaderComponent } from "../../components/tool-header/tool-header.component";
import { Card } from 'primeng/card';
import { TokenData } from '../components/select-user-token/select-user-token.service';
import { TotalFeesComponent } from "../../components/total-fees/total-fees.component";
import { Button } from 'primeng/button';
import { AddOn } from '../../components/add-on/add-on.component';
import { SolanaServiceName } from '../../app-settings/enums/solana-service-name.enum';
import { AddOnService } from '../../components/add-on/add-on.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { solanaAddressValidator } from '../../utils/solana-address.validator';
import { SolanaTokenAuthoritiesComponent } from "../components/solana-token-authorities/solana-token-authorities.component";
import { WalletService } from '../../wallet/wallet.service';
import { ErrorComponent } from "../../components/error/error.component";
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { RevokeAuthoritiesService } from './revoke-authorities.service';

@Component({
  selector: 'app-revoke-authorities',
  imports: [
    SelectUserTokenComponent,
    ToolHeaderComponent,
    Card,
    TotalFeesComponent,
    Button,
    SolanaTokenAuthoritiesComponent,
    ReactiveFormsModule,
    ErrorComponent,
    Toast
  ],
  templateUrl: './revoke-authorities.component.html',
  styleUrl: './revoke-authorities.component.scss',
  providers: [MessageService]
})
export class RevokeAuthoritiesComponent implements OnInit {
  selectedToken = model<TokenData | null>(null);
  
  constructor(
    private readonly addOnService: AddOnService,
    private readonly walletService: WalletService,
    private readonly revokeAuthoritiesService: RevokeAuthoritiesService,
    private readonly messageService: MessageService,
  ) {}

  addOns: Record<string, AddOn> = {
    freezeAuthority: {
      added: signal(false),
      serviceName: SolanaServiceName.FreezeAuthority,
    },
    mintAuthority: {
      added: signal(false),
      serviceName: SolanaServiceName.MintAuthority,
    },
    updateAuthority: {
      added: signal(false),
      serviceName: SolanaServiceName.UpdateAuthority,
    },
  };

  authoritiesForm = new FormGroup({
    freezeAuthority: new FormControl('', [
      solanaAddressValidator()
    ]),
    mintAuthority: new FormControl('', [
      solanaAddressValidator()
    ]),
    updateAuthority: new FormControl('', [
      solanaAddressValidator()
    ]),
  });

  authoritiesFormValid = signal(false);
  ngOnInit(): void {
    // Forms validation
    this.authoritiesFormValid.set(this.authoritiesForm.valid);
    this.authoritiesForm.statusChanges.subscribe(() => {
      this.authoritiesFormValid.set(this.authoritiesForm.valid);
    });
  }

  totalCost = computed<number>(() => this.addOnService.calculateTotalCost(
    0,
    this.addOns
  )());
  totalCostWithoutDiscounts = computed<number>(() => this.addOnService.calculateTotalCostWithoutDiscounts(
    0,
    this.addOns
  )());

  authorityErrors = computed<string[]>(() => {
    const errors: string[] = [];
    const userPublicKey: string | undefined = this.walletService.selectedWalletSignal()?.publicKey?.toBase58();
    
    if(!userPublicKey || !this.selectedToken()) {
      return errors;
    }

    if(this.addOns['freezeAuthority']?.added()) {
      const currentAuthority = this.selectedToken()?.freezeAuthority?.toBase58();
      if(!currentAuthority || currentAuthority !== userPublicKey) {
        errors.push('You must be the current Freeze Authority to transfer or revoke it');
      }

      const newAuthority = this.authoritiesForm.get('freezeAuthority')?.value;
      if(newAuthority) {
        if(newAuthority === userPublicKey) {
          errors.push('New Freeze Authority cannot be the same as current authority');
        }
        if(newAuthority === this.selectedToken()?.mint.toBase58()) {
          errors.push('New Freeze Authority cannot be the token\'s mint address');
        }
      }
    }

    if(this.addOns['mintAuthority']?.added()) {
      const currentAuthority = this.selectedToken()?.mintAuthority?.toBase58();
      if(!currentAuthority || currentAuthority !== userPublicKey) {
        errors.push('You must be the current Mint Authority to transfer or revoke it');
      }
      
      const newAuthority = this.authoritiesForm.get('mintAuthority')?.value;
      if(newAuthority) {
        if(newAuthority === userPublicKey) {
          errors.push('New Mint Authority cannot be the same as current authority');
        }
        if(newAuthority === this.selectedToken()?.mint.toBase58()) {
          errors.push('New Mint Authority cannot be the token\'s mint address');
        }
      }
    }

    if(this.addOns['updateAuthority']?.added()) {
      if(!this.selectedToken()?.isMutable) {
        errors.push('Token metadata is immutable, Update Authority cannot be changed');
      }
      const currentAuthority = this.selectedToken()?.updateAuthority?.toBase58();
      if(!currentAuthority || currentAuthority !== userPublicKey) {
        errors.push('You must be the current Update Authority to transfer or revoke it');
      }

      const newAuthority = this.authoritiesForm.get('updateAuthority')?.value;
      if(newAuthority) {
        if(newAuthority === userPublicKey) {
          errors.push('New Update Authority cannot be the same as current authority');
        }
        if(newAuthority === this.selectedToken()?.mint.toBase58()) {
          errors.push('New Update Authority cannot be the token\'s mint address');
        }
      }
    }

    return errors;
  });
  authoritiesInvalid = computed<boolean>(() => {
    return this.authorityErrors().length > 0;
  });

  buttonDisabled = computed<boolean>(() => {
    console.log(this.selectedToken());  // TODO: remove
    // basic checks
    if(!this.selectedToken()) return true;
    if(!this.authoritiesFormValid()) return true;

    // check if at least one authority is being updated
    let totalAddOns = 0;
    for(const addOn of Object.values(this.addOns)) { if(addOn.added()) totalAddOns++; }
    if(totalAddOns === 0) return true;

    // check if the new authorities are possible
    if(this.authoritiesInvalid()) return true;

    return false;
  });

  loading = false;
  async updateAuthorities() {
    const token = this.selectedToken();
    if (!token) {
      this.messageService.add({ severity: 'error', summary: 'No token selected' });
      return;
    }

    try {
      this.loading = true;

      // Prepare the update data
      const data: any = {
        mint: token.mint,
        totalCost: this.totalCost(),
      };

      // Add Freeze Authority update if selected
      if (this.addOns['freezeAuthority'].added()) {
        const newAuthority = this.authoritiesForm.get('freezeAuthority')?.value || null;
        data.freezeAuthority = {
          currentAuthority: token.freezeAuthority!,
          newAuthority
        };
      }

      // Add Mint Authority update if selected
      if (this.addOns['mintAuthority'].added()) {
        const newAuthority = this.authoritiesForm.get('mintAuthority')?.value || null;
        data.mintAuthority = {
          currentAuthority: token.mintAuthority!,
          newAuthority
        };
      }

      // Send transaction
      const signature = await this.revokeAuthoritiesService.updateAuthorities(data);
      
      this.messageService.add({ 
        severity: 'success', 
        summary: `Successfully updated ${token.symbol} authorities!`,
        detail: `Transaction signature: ${signature}` 
      });

    } catch (error: any) {
      console.error('Error updating authorities:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Failed to update authorities', 
        detail: error.message || 'Unknown error occurred' 
      });
    } finally {
      this.loading = false;
    }
  }
}
