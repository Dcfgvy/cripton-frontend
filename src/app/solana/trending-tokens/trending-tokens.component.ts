import { ChangeDetectorRef, Component, computed, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Card } from 'primeng/card';
import { TrendingToken, TrendingTokensService } from './trending-tokens.service';
import { isPlatformBrowser } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { formatNumberShort } from '../../utils/functions';
import { TextLinkComponent } from "../../components/text-link/text-link.component";
import { PricesService } from '../../app-settings/prices.service';
import type { Price } from '../../app-settings/app-settings.service';
import { TokenCreatedPopupComponent } from "../token-creation/token-created-popup/token-created-popup.component";
import { TokenConfirmationPopupComponent } from "../token-creation/token-confirmation-popup/token-confirmation-popup.component";
import { NetworkService } from '../../network-switch/network-switch.service';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { WalletService } from '../../wallet/wallet.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { TokenCreationService } from '../token-creation/token-creation.service';
import { ToolHeaderComponent } from "../../components/tool-header/tool-header.component";
import { CreateTokenData } from '../token-creation/interfaces/create-token-data.interface';

@Component({
  selector: 'app-trending-tokens',
  imports: [
    Card,
    ToggleSwitch,
    FormsModule,
    ButtonDirective,
    TextLinkComponent,
    TokenCreatedPopupComponent,
    TokenConfirmationPopupComponent,
    Toast,
    ToolHeaderComponent
],
  templateUrl: './trending-tokens.component.html',
  styleUrl: './trending-tokens.component.scss',
  providers: [MessageService]
})
export class TrendingTokensComponent implements OnInit, OnDestroy {
  private fetchInterval: number | null = null;
  private isBrowser: boolean;
  creationCost: Price;

  constructor(
    private readonly trendingTokensService: TrendingTokensService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private readonly pricesService: PricesService,
    public readonly networkService: NetworkService,
    private readonly walletService: WalletService,
    private readonly messageService: MessageService,
    private readonly tokenCreationService: TokenCreationService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.creationCost = this.pricesService.prices().solanaTrendingTokenCreation;
  }

  isAutoUpdateOn: boolean = true;
  tokens: TrendingToken[] = [];

  private fetchTokens(){
    this.trendingTokensService.fetchTrendingTokens().pipe(
      tap((data) => {
        this.tokens = [...data.data];
        this.cdr.detectChanges();
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    ).subscribe();
  }

  formatMarketCap(n: number): string {
    return formatNumberShort(n);
  }

  ngOnInit(): void {
    this.fetchTokens();
    if(this.isBrowser && this.fetchInterval === null){
      this.fetchInterval = setInterval(() => {
        if(this.isAutoUpdateOn){
          this.fetchTokens();
        }
      }, 5000) as unknown as number;
    }
  }

  ngOnDestroy(): void {
    if(this.isBrowser && this.fetchInterval !== null){
      clearInterval(this.fetchInterval);
    }
  }

  tokenLaunchLoading: boolean = false;
  confirmationWindowOpened: boolean = false;
  createdWindowOpened: boolean = false;

  selectedToken: TrendingToken | null = null;
  selectedTokenSupply = computed(() => {
    if(!this.selectedToken) return BigInt(0);
    // MTODO change it back; Pump Fun tokens supply is often a bit smaller than 1,000,000,000. Maybe there is a deflationary mechanism
    // return BigInt(this.selectedToken.supply) / BigInt(10 ** this.selectedToken.decimals);
    return BigInt(1_000_000_000);
  });
  mintKeypair = Keypair.generate();
  createdMintKeypair: Keypair | null = null;

  createToken(token: TrendingToken){
    this.selectedToken = token;
    this.confirmationWindowOpened = true;
  }
  async launchToken(){
    this.tokenLaunchLoading = true;

    const balance = await this.walletService.getBalanceLamports();
    if(balance < this.creationCost.cost * LAMPORTS_PER_SOL){
      this.messageService.add({ severity: 'error', summary: 'Insufficient balance', detail: `You must have at least ${this.creationCost.cost} SOL` });
      this.tokenLaunchLoading = false;
      return;
    }

    const userPublicKey = this.walletService.selectedWallet?.publicKey;
    if(!userPublicKey) throw new Error('User wallet disconnected');

    const metadataUri = this.selectedToken!.metadataUri;
    const errorOccured = await this.sendCreateTokenTx(metadataUri, userPublicKey);
    this.tokenLaunchLoading = false;
    if(!errorOccured){
      this.createdMintKeypair = Keypair.fromSecretKey(this.mintKeypair.secretKey);
      this.mintKeypair = Keypair.generate();
      this.confirmationWindowOpened = false;
      this.createdWindowOpened = true;
    }
  }

  private createCreateTokenTx(uri: string, userPublicKey: PublicKey): CreateTokenData {
    const data: Partial<CreateTokenData> = {};
    const token = this.selectedToken!;
    data.name = token.name;
    data.symbol = token.symbol;
    data.decimals = token.decimals;
    data.supply = this.selectedTokenSupply();
    data.metadataUri = uri;
    data.creators = token.creators.map((t) => {
      return {
        address: new PublicKey(t.address),
        share: t.share,
        verified: t.verified,
      }
    });
    data.totalCost = this.creationCost.cost;

    // mint
    data.mint = this.mintKeypair;
    // supply distribution
    data.supplyDistribution = [{
      address: userPublicKey.toBase58(),
      share: 100
    }];
    // Freeze Authority
    data.freezeAuthority = undefined;
    // Mint Authority
    data.mintAuthority = undefined;
    // Update Authority
    data.updateAuthority = token.updateAuthority || undefined;
    data.isMutable = token.isMutable;

    return data as CreateTokenData;
  }

  private async sendCreateTokenTx(uri: string, userPublicKey: PublicKey): Promise<boolean> { // true if an error occured
    const data = this.createCreateTokenTx(uri, userPublicKey);
    try{
      await this.tokenCreationService.createToken(data, userPublicKey);
      return false;
    } catch(err) {
      const error = err as Error;
      console.error(error);
      this.messageService.add({ severity: 'error', summary: error.message });
      return true;
    }
  }
}
