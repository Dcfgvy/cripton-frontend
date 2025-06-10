import { Component, computed, model, OnInit, signal } from '@angular/core';
import { SelectUserTokenComponent } from "../components/select-user-token/select-user-token.component";
import { ToolHeaderComponent } from "../../components/tool-header/tool-header.component";
import { Card } from 'primeng/card';
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
import { RevokeAuthoritiesService, UpdateAuthoritiesData } from './revoke-authorities.service';
import { PublicKey } from '@solana/web3.js';
import { PricesService } from '../../app-settings/prices.service';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenData } from '../components/select-user-token/select-user-token.service';
import { METADATA_PROGRAM_ID } from '../constants/token.constants';
import { WarningComponent } from "../../components/warning/warning.component";

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
    Toast,
    WarningComponent
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
    private readonly pricesService: PricesService,
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
    this.pricesService.prices().solanaUpdateAuthorities.cost,
    this.addOns
  )());
  totalCostWithoutDiscounts = computed<number>(() => this.addOnService.calculateTotalCostWithoutDiscounts(
    this.pricesService.prices().solanaUpdateAuthorities.cost,
    this.addOns
  )());

  private getUpdateAuthorityErrors(token: TokenData, userPublicKey: string): string[] {
    const errors: string[] = [];
    const metadata = token.metadata;
    if(!metadata) {
      errors.push('Token metadata is not available');
      return errors;
    }

    let currentAuthority: PublicKey | null = null;
    // if Token Metadata is used
    if(metadata.metadataPointer?.metadataAddress.equals(token.mint)){
      if(!metadata.tokenMetadata){
        errors.push('Token metadata is not available');
        return errors;
      }
      currentAuthority = metadata.tokenMetadata.updateAuthority;
    }

    // if Metaplex Metadata is used
    else if(metadata.metaplexMetadata){
      if(!metadata.metaplexMetadata?.isMutable) {
        errors.push('Token metadata is immutable, Update Authority cannot be changed');
        return errors;
      }
      currentAuthority = metadata.metaplexMetadata.updateAuthority;
    }

    // checking authorities
    const currentAuthorityString = currentAuthority?.toBase58();
    const newAuthority = this.authoritiesForm.get('updateAuthority')?.value;

    if(!currentAuthorityString || currentAuthorityString !== userPublicKey) {
      errors.push('You must be the current Update Authority to transfer or revoke it');
    }
    if(newAuthority) {
      if(newAuthority === userPublicKey) {
        errors.push('New Update Authority cannot be the same as current authority');
      }
      if(newAuthority === token.mint.toBase58()) {
        errors.push('New Update Authority cannot be the token\'s mint address');
      }
    }

    return errors;
  }

  authorityErrors = computed<string[]>(() => {
    const errors: string[] = [];
    const userPublicKey: string | undefined = this.walletService.selectedWalletSignal()?.publicKey?.toBase58();
    const token = this.selectedToken();

    if(!userPublicKey || !token) {
      return errors;
    }

    if(this.addOns['freezeAuthority']?.added()) {
      const currentAuthority = token.freezeAuthority?.toBase58();
      if(!currentAuthority || currentAuthority !== userPublicKey) {
        errors.push('You must be the current Freeze Authority to transfer or revoke it');
      }

      const newAuthority = this.authoritiesForm.get('freezeAuthority')?.value;
      if(newAuthority) {
        if(newAuthority === userPublicKey) {
          errors.push('New Freeze Authority cannot be the same as current authority');
        }
        if(newAuthority === token.mint.toBase58()) {
          errors.push('New Freeze Authority cannot be the token\'s mint address');
        }
      }
    }

    if(this.addOns['mintAuthority']?.added()) {
      const currentAuthority = token.mintAuthority?.toBase58();
      if(!currentAuthority || currentAuthority !== userPublicKey) {
        errors.push('You must be the current Mint Authority to transfer or revoke it');
      }
      
      const newAuthority = this.authoritiesForm.get('mintAuthority')?.value;
      if(newAuthority) {
        if(newAuthority === userPublicKey) {
          errors.push('New Mint Authority cannot be the same as current authority');
        }
        if(newAuthority === token.mint.toBase58()) {
          errors.push('New Mint Authority cannot be the token\'s mint address');
        }
      }
    }

    if(this.addOns['updateAuthority']?.added()) {
      errors.push(...this.getUpdateAuthorityErrors(token, userPublicKey));
    }

    return errors;
  });
  authoritiesInvalid = computed<boolean>(() => {
    return this.authorityErrors().length > 0;
  });

  warnings = computed<string[]>(() => {
    const warnings: string[] = [];
    const token = this.selectedToken();
    if(!token) return warnings;

    if(this.addOns['updateAuthority']?.added() && token.tokenProgram.equals(TOKEN_2022_PROGRAM_ID)){
      const pointerAuthority = token.metadata?.metadataPointer?.authority;
      let metadataAuthority: PublicKey | null = null;
      if(token.metadata?.metadataPointer?.metadataAddress.equals(token.mint)){
        metadataAuthority = token.metadata?.tokenMetadata?.updateAuthority || null;
      }
      else if(token.metadata?.metaplexMetadata){
        metadataAuthority = token.metadata?.metaplexMetadata?.updateAuthority || null;
      }
      
      if(!pointerAuthority?.equals(metadataAuthority!)){
        warnings.push('Token metadata and metadata pointer have different authorities, so only the metadata authority will be updated');
      }
    }

    return warnings;
  });

  buttonDisabled = computed<boolean>(() => {
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

      const data: Partial<UpdateAuthoritiesData> = {
        mint: token.mint,
        tokenProgram: token.tokenProgram,
        totalCost: this.totalCost(),
        isNetworkFeeIncluded: this.pricesService.prices().solanaUpdateAuthorities.isNetworkFeeIncluded,
      };

      if (this.addOns['freezeAuthority'].added()) {
        const newAuthority = this.authoritiesForm.get('freezeAuthority')?.value || null;
        data.freezeAuthority = {
          currentAuthority: token.freezeAuthority!,
          newAuthority: newAuthority ? new PublicKey(newAuthority) : null
        };
      }

      if (this.addOns['mintAuthority'].added()) {
        const newAuthority = this.authoritiesForm.get('mintAuthority')?.value || null;
        data.mintAuthority = {
          currentAuthority: token.mintAuthority!,
          newAuthority: newAuthority ? new PublicKey(newAuthority) : null
        };
      }

      if (this.addOns['updateAuthority'].added()) {
        const newAuthorityRaw = this.authoritiesForm.get('updateAuthority')?.value || null;
        const newAuthority = newAuthorityRaw ? new PublicKey(newAuthorityRaw) : null;
        const metadata = token.metadata!;

        if(token.tokenProgram.equals(TOKEN_2022_PROGRAM_ID) && metadata.metadataPointer !== undefined){
          if(metadata.metadataPointer.metadataAddress.equals(token.mint)){
            data.updateAuthority = {
              currentAuthority: metadata.tokenMetadata!.updateAuthority!,
              newAuthority: newAuthority,
              updateInMetadata: true,
              updateInPointer: metadata.metadataPointer.authority?.equals(metadata.tokenMetadata!.updateAuthority!),
            }
          }
          else if(metadata.metaplexMetadata !== undefined) {
            data.updateAuthority = {
              currentAuthority: metadata.metaplexMetadata!.updateAuthority!,
              newAuthority: newAuthority,
              updateInMetaplex: true,
              updateInPointer: metadata.metadataPointer.authority?.equals(metadata.metaplexMetadata!.updateAuthority!),
              isMutable: newAuthority !== null // do not update if we're revoking the authority
            }
          }
        }
        // Original token program with Metaplex Metadata
        else {
          if(metadata.metaplexMetadata !== undefined) {
            data.updateAuthority = {
              currentAuthority: metadata.metaplexMetadata!.updateAuthority!,
              newAuthority: newAuthority,
              updateInMetaplex: true,
              isMutable: newAuthority !== null // do not update if we're revoking the authority
            }
          }
        }
      }

      const signature = await this.revokeAuthoritiesService.updateAuthorities(data as UpdateAuthoritiesData);
      
      // TODO refetch user's tokens after transaction is executed (because the metadata and authorities are changed)
      this.messageService.add({ 
        severity: 'success', 
        summary: `Successfully updated ${token.metadata ? ' $' + token.metadata.symbol : ''}authorities!`,
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
// TODO add FAQ