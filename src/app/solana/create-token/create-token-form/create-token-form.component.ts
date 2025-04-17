import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, computed, output, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { WalletService } from '../../../wallet/wallet.service';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { AddOn, AddOnComponent } from '../../../components/add-on/add-on.component';
import { AppSettingsService } from '../../../app-settings/app-settings.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { FileSelectorComponent } from "../../../components/file-selector/file-selector.component";
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { formatElapsedTime } from '../../../utils/functions';
import { RequiredComponent } from "../../../components/required/required.component";
import { MessageService } from 'primeng/api';
import { ErrorComponent } from '../../../components/error/error.component';
import { urlValidator } from '../../../utils/url.validator';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AlertBannerComponent } from "../../../components/alert-banner/alert-banner.component";
import { TokenCreationService, TokenUploadMetadata, TokenImageData, CreateTokenData, SupplyDistributionArray } from '../../token-creation/token-creation.service';
import { catchError, of, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { solanaAddressValidator } from '../../../utils/solana-address.validator';
import { NetworkService } from '../../../network-switch/network-switch.service';
import { TokenConfirmationPopupComponent } from "../../token-creation/token-confirmation-popup/token-confirmation-popup.component";
import { TokenCreatedBodyComponent } from "../../token-creation/token-created-popup/token-created-body/token-created-body.component";
import { environment } from '../../../../environments/environment';

// u64 max value: 18,446,744,073,709,551,615 (2^64-1)
// Our limit: 10,000,000,000,000,000,000 (10 * 10^18)
const MAX_SUPPLY_WITH_DECIMALS = 10_000_000_000_000_000_000n;
const ONE_BYTE_SYMBOLS = /^[a-zA-Z0-9 _.!$?]+$/;
const ADDRESS_SYMBOLS = /^[1-9A-HJ-NP-Za-km-z]+$/;
export const PUMP_FUN_MINT_AUTHORITY = "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM";

export function supplyValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const formGroup = control.parent;
    if (!formGroup) return null;

    const decimalsControl = formGroup.get('decimals');
    const supplyControl = formGroup.get('supply');

    if (!decimalsControl || !supplyControl) return null;

    const decimals = decimalsControl.value;
    const supply = BigInt(supplyControl.value);

    try {
      const totalSupply = supply * (10n ** BigInt(decimals));
      
      if (totalSupply > MAX_SUPPLY_WITH_DECIMALS) {
        return { exceedsLimit: true };
      }
    } catch (e) {
      // Handle potential overflow (though BigInt shouldn't overflow)
      return { calculationError: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-create-token-form',
  imports: [
    StepperModule,
    ButtonModule,
    NgTemplateOutlet,
    CardModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    AddOnComponent,
    CheckboxModule,
    ChipModule,
    FormsModule,
    FileSelectorComponent,
    DividerModule,
    RequiredComponent,
    ToastModule,
    ErrorComponent,
    ToggleSwitchModule,
    AlertBannerComponent,
    CommonModule,
    TokenConfirmationPopupComponent,
    TokenCreatedBodyComponent
],
  templateUrl: './create-token-form.component.html',
  styleUrl: './create-token-form.component.scss',
  providers: [MessageService, TokenCreationService]
})
export class CreateTokenFormComponent {
  onReset = output();

  addOns: Record<string, AddOn> = {
    customCreatorInfo: {
      added: signal(false),
      isFree: false,
    },
    customAddress: {
      added: signal(false),
      isFree: true,
    },
    multiWalletDistribution: {
      added: signal(false),
      isFree: true,
    },
    freezeAuthority: {
      added: signal(false),
      isFree: true,
    },
    mintAuthority: {
      added: signal(false),
      isFree: true,
    },
    updateAuthority: {
      added: signal(false),
      isFree: true,
    },
  };

  readonly MAX_SUPPLY_WITH_DECIMALS_NUMBER = Number(MAX_SUPPLY_WITH_DECIMALS.toString());
  readonly MAX_SUPPLY_WITH_DECIMALS_LENGTH = MAX_SUPPLY_WITH_DECIMALS.toString().length;
  readonly MAX_WALLETS_SUPPLY_DISTRIBUTION = 10;
  readonly DEFAULT_CREATOR_NAME = environment.serviceName;
  readonly DEFAULT_CREATOR_WEBSITE = environment.serviceWebsite;
  readonly MAX_CUSTOM_ADDRESS_PREFIX_LENGTH = 4;

  constructor(
    private walletService: WalletService,
    private settingsService: AppSettingsService,
    private messageService: MessageService,
    private tokenCreationService: TokenCreationService,
    public readonly networkService: NetworkService,
  ) {
    // Supply distribution validation
    toObservable(this.addOns['multiWalletDistribution'].added).subscribe((value) => {
      if(value){
        this.supplyDistributions.enable();
        this.setInitialUserWalletSupply();
      } else {
        this.supplyDistributions.disable();
      }
    });
  }
  step: number = 1;

  baseCost = computed<number>(() => {
    return this.settingsService.currentSettings?.baseTokenCreationCost || 0;
  });
  addOnsCost = computed<number>(() => {
    return this.settingsService.currentSettings?.additionalOptionsCost || 0;
  });
  totalCost = computed<number>(() => {
    let total = this.baseCost();
    for(const addon of Object.values(this.addOns)){
      if(addon.added() && !addon.isFree){
        total += this.addOnsCost();
      }
    }
    return total;
  });
  totalCostWithoutDiscounts = computed<number>(() => {
    let total = this.baseCost();
    for(const addon of Object.values(this.addOns)){
      if(addon.added()){
        total += this.addOnsCost();
      }
    }
    return total;
  });

  infoForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(30),
      Validators.pattern(ONE_BYTE_SYMBOLS),
    ]),
    symbol: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(10),
      Validators.pattern(ONE_BYTE_SYMBOLS),
    ]),
    decimals: new FormControl(6, [
      Validators.required,
      Validators.min(0),
      Validators.max(9),
    ]),
    supply: new FormControl<bigint>(1_000_000_000n, [
      Validators.required,
      Validators.min(1),
      Validators.maxLength(this.MAX_SUPPLY_WITH_DECIMALS_LENGTH),
      Validators.max(this.MAX_SUPPLY_WITH_DECIMALS_NUMBER),
      supplyValidator(),
    ]),
    useImageUrl: new FormControl<boolean>(false),
    imageUrl: new FormControl('', [
      urlValidator(),
      Validators.maxLength(1000),
    ]),
    description: new FormControl('', [
      Validators.maxLength(1000),
    ]),
  });
  imageFile: File | null = null;
  imageDataURL: string = '';
  validateSupplyWithDecimals(){
    this.infoForm.get('supply')?.updateValueAndValidity();
  }

  socialsForm = new FormGroup({
    creatorInfo: new FormGroup({
      name: new FormControl({value: this.DEFAULT_CREATOR_NAME, disabled: false}, [Validators.maxLength(100)]),
      website: new FormControl({value: this.DEFAULT_CREATOR_WEBSITE, disabled: false}, [Validators.maxLength(1000)]),
      remove: new FormControl(false),
    }),

    tags: new FormControl<string[]>([]),

    website: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
    ]),
    twitter: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://x.com', 'https://twitter.com')
    ]),
    telegram: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://t.me')
    ]),
    discord: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://discord.gg', 'https://discord.com')
    ]),
    youtube: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://youtube.com', 'https://youtu.be')
    ]),
    medium: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://medium.com')
    ]),
    github: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://github.com')
    ]),
    instagram: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://instagram.com')
    ]),
    reddit: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://reddit.com', 'https://redd.it')
    ]),
    facebook: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator('https://facebook.com', 'https://fb.com')
    ])
  });
  socials_extended = false;
  get creatorInfoForm(){
    return this.socialsForm.get('creatorInfo') as unknown as FormGroup<any>;
  }
  onRemoveCreatorDataChange(event: any){
    const disabled: boolean = event.checked.length > 0;
    if(disabled){
      this.creatorInfoForm.get('name')?.disable();
      this.creatorInfoForm.get('website')?.disable();
    } else {
      this.creatorInfoForm.get('name')?.enable();
      this.creatorInfoForm.get('website')?.enable();
    }
  }
  tagsInput = '';
  onTagInputKeyPress(event: KeyboardEvent){
    if(event.key === 'Enter' || event.key === ' ' || event.key === ','){
      event.preventDefault();
      const trimmedVal = this.tagsInput.trim();
      if(trimmedVal.length > 0 && trimmedVal.length <= 30){
        const tags = this.socialsForm.get('tags')?.value || [];
        if(tags?.length < 5){
          let foundIndex = tags.indexOf(trimmedVal);
          if(foundIndex === -1){
            this.socialsForm.get('tags')?.setValue([...tags, trimmedVal]);
          }
        }
      }
      this.tagsInput = '';
    }
  }
  removeTag(tag: string){
    let tags = [...(this.socialsForm.get('tags')?.value || [])];
    tags = tags.filter((v) => v != tag)
    this.socialsForm.get('tags')?.setValue(tags);
  }

  settingsForm = new FormGroup({
    customAddressBeginning: new FormControl('', [
      Validators.maxLength(4),
      Validators.pattern(ADDRESS_SYMBOLS)
    ]),
    customAddressEnd: new FormControl('', [
      Validators.maxLength(4),
      Validators.pattern(ADDRESS_SYMBOLS),
    ]),
    customAddressCaseSensitive: new FormControl<boolean>(false),

    supplyDistribution: new FormArray([], [
      Validators.maxLength(10),
      (formArray: AbstractControl) => {
        let percentsSum = 0;
        for(const control of formArray.value){
          percentsSum += Number(control.share) || 0;
        }
        if(percentsSum !== 100){
          return { supplyDistributionPercentsFailure: true };
        }
        return null;
      },
      (formArray: AbstractControl) => {
        let addresses = new Set();
        let emptyCounter = 0;
        for(const control of formArray.value){
          if(control.address === ''){
            emptyCounter++;
          } else {
            addresses.add(control.address);
          }
        }
        if(addresses.size + emptyCounter !== formArray.value.length){
          return { dublicateWalletAddress: true };
        }
        return null;
      }
    ]),

    freezeAuthority: new FormControl('', [
      solanaAddressValidator()
    ]),
    mintAuthority: new FormControl('', [
      solanaAddressValidator()
    ]),
    updateAuthority: new FormControl('', [
      solanaAddressValidator()
    ]),
  }) 
  pastePumpFunUpdateAddress(){
    this.settingsForm.get('updateAuthority')?.setValue(PUMP_FUN_MINT_AUTHORITY);
  }

  infoFormValid: boolean = false;
  socialsFormValid: boolean = false;
  settingsFormValid: boolean = false;
  ngOnInit(): void {
    // Forms validation
    this.infoFormValid = this.infoForm.valid;
    this.infoForm.statusChanges.subscribe(() => {
      this.infoFormValid = this.infoForm.valid;
    });
    this.socialsFormValid = this.socialsForm.valid;
    this.socialsForm.statusChanges.subscribe(() => {
      this.socialsFormValid = this.socialsForm.valid;
    });
    this.settingsFormValid = this.settingsForm.valid;
    this.settingsForm.statusChanges.subscribe(() => {
      this.settingsFormValid = this.settingsForm.valid;
    });
  }

  // Supply distribution
  addDistribution(address: string = '', share: number = 0, disabled: boolean = false): void {
    if (this.supplyDistributions.length >= this.MAX_WALLETS_SUPPLY_DISTRIBUTION) return;
  
    this.supplyDistributions.push(
      new FormGroup({
        address: new FormControl({ value: address, disabled }, [
          Validators.required,
          solanaAddressValidator()
        ]),
        share: new FormControl(share, [
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.min(0),
          Validators.max(100)
        ]) // number pattern
      })
    );
  }
  setInitialUserWalletSupply = () => {
    if(this.supplyDistributions.length > 1) return;
    if(!this.walletService.selectedWallet?.publicKey){
      this.addOns['multiWalletDistribution'].added.set(false);
      this.messageService.add({ severity: 'error', summary: 'No Wallet Connected', detail: 'Please reconnect your wallet to proceed' });
      return;
    }
    this.supplyDistributions.clear();
    this.addDistribution(this.walletService.selectedWallet?.publicKey?.toBase58(), 100);
  }
  removeDistribution(index: number): void {
    if(this.supplyDistributions.length >= index + 1){
      this.supplyDistributions.removeAt(index);
    }
  }
  get supplyDistributions(): FormArray {
    return this.settingsForm.get('supplyDistribution') as FormArray;
  }

  // Mint Address generation
  mintKeypair: Keypair = Keypair.generate();
  defaultMintKeypair: Keypair = Keypair.fromSecretKey(this.mintKeypair.secretKey);
  mintPublicKey: string = this.mintKeypair.publicKey.toBase58();
  mintPrefix: string = '';
  mintSuffix: string = '';
  addressGenerationWorkers: Worker[] = [];
  addressGenerationInProgress: boolean = false;
  addressGenerationIntervalId: number = -1;
  addressGenerationTimeSpent: string = '0s';
  
  onCustomAddressInput(isPrefix: boolean){
    const currentFieldName: string = isPrefix ? 'customAddressBeginning' : 'customAddressEnd';
    const secondFieldName: string = isPrefix ? 'customAddressEnd' : 'customAddressBeginning';
    const field = this.settingsForm.get(currentFieldName)! as AbstractControl<string, string>;
    const field2 = this.settingsForm.get(secondFieldName)! as AbstractControl<string, string>;
    field.setValue(
      field.value.trim().split('').filter((v) => ADDRESS_SYMBOLS.test(v)).join('').slice(0, this.MAX_CUSTOM_ADDRESS_PREFIX_LENGTH)
    );
    
    if(field.value.length + field2.value.length > this.MAX_CUSTOM_ADDRESS_PREFIX_LENGTH){
      field2.setValue(
        field2.value.slice(0, Math.max(0, this.MAX_CUSTOM_ADDRESS_PREFIX_LENGTH - field.value.length))
      );
    }
  }

  async terminateAddressGeneration(){
    try {
      window.clearInterval(this.addressGenerationIntervalId);
    } catch (err) {
      console.error(err);
      // ignore
    }
    for(const w of this.addressGenerationWorkers){
      w?.terminate();
    }
    this.addressGenerationWorkers = [];
    this.addressGenerationInProgress = false;
  }

  async regenerateAddress(): Promise<void> {
    await this.terminateAddressGeneration();
    const initialTime = new Date();
    this.addressGenerationTimeSpent = formatElapsedTime(initialTime);
    this.addressGenerationIntervalId = window.setInterval(() => {
      this.addressGenerationTimeSpent = formatElapsedTime(initialTime);
    }, 1000);
    this.addressGenerationInProgress = true;

    const beginning = this.settingsForm.get('customAddressBeginning')?.value || '';
    const ending = this.settingsForm.get('customAddressEnd')?.value || '';
    const caseSensitive = this.settingsForm.get('customAddressCaseSensitive')?.value || false;
    const prefix = caseSensitive ? beginning : beginning.toLowerCase();
    const suffix = caseSensitive ? ending : ending.toLowerCase();

    const workerCount = Math.min(navigator.hardwareConcurrency, 32) || 4;
    for(let i = 0; i < workerCount; i++){
      const worker = new Worker(new URL('../vanity/vanity.worker', import.meta.url), { type: 'module' });
      worker.onmessage = async ({ data }) => {
        await this.terminateAddressGeneration();
        this.mintKeypair = Keypair.fromSecretKey(Uint8Array.from(data.secretKey as number[]));
        this.mintPublicKey = this.mintKeypair.publicKey.toBase58();
        this.mintPrefix = prefix;
        this.mintSuffix = suffix;
      }
      this.addressGenerationWorkers.push(worker);
      worker.postMessage({ prefix, suffix, caseSensitive });
    }
  }

  get actualTokenMint(): Keypair {
    if(this.addOns['customAddress'].added()){
      return this.mintKeypair;
    } else {
      return this.defaultMintKeypair;
    }
  }

  // Create Token
  private uploadMetadata(){
    const metadata: Partial<TokenUploadMetadata> = {}
    // mint
    metadata.mint = this.actualTokenMint.publicKey.toBase58();
    // creator info
    if(this.addOns['customCreatorInfo'].added()){
      const info = this.socialsForm.get('creatorInfo')?.value;
      if(!(info?.remove)){
        metadata.creatorName = info?.name || '';
        metadata.creatorWebsite = info?.website || '';
      }
    } else {
      metadata.creatorName = this.DEFAULT_CREATOR_NAME;
      metadata.creatorWebsite = this.DEFAULT_CREATOR_WEBSITE;
    }
    metadata.name = this.infoForm.get('name')!.value!;
    metadata.symbol = this.infoForm.get('symbol')!.value!.toLocaleUpperCase();
    metadata.description = this.infoForm.get('description')!.value!;
    metadata.tags = this.socialsForm.get('tags')!.value || [];
    metadata.tokenSocials = {
      website: this.socialsForm.get('website')?.value || undefined,
      twitter: this.socialsForm.get('twitter')?.value || undefined,
      telegram: this.socialsForm.get('telegram')?.value || undefined,
      discord: this.socialsForm.get('discord')?.value || undefined,
      youtube: this.socialsForm.get('youtube')?.value || undefined,
      medium: this.socialsForm.get('medium')?.value || undefined,
      github: this.socialsForm.get('github')?.value || undefined,
      instagram: this.socialsForm.get('instagram')?.value || undefined,
      reddit: this.socialsForm.get('reddit')?.value || undefined,
      facebook: this.socialsForm.get('facebook')?.value || undefined,
    }

    const imageData: TokenImageData = {};
    if(this.infoForm.get('useImageUrl')?.value){
      imageData.imageUrl = this.infoForm.get('imageUrl')!.value!;
    } else {
      imageData.imageData = this.imageFile!;
    }
    return this.tokenCreationService.uploadMetadata(metadata as TokenUploadMetadata, imageData);
  }

  private createCreateTokenTx(uri: string, userPublicKey: PublicKey): CreateTokenData {
    const data: Partial<CreateTokenData> = {};
    data.name = this.infoForm.get('name')!.value!;
    data.symbol = this.infoForm.get('symbol')!.value!.toLocaleUpperCase();
    data.decimals = this.infoForm.get('decimals')!.value!;
    data.supply = this.infoForm.get('supply')!.value!;
    data.metadataUri = uri;
    data.totalCost = this.totalCost();

    // mint
    data.mint = this.actualTokenMint;
    // supply distribution
    if(this.addOns['multiWalletDistribution'].added()){
      let supplyDistribution: SupplyDistributionArray = [];
      for(const distribution of this.supplyDistributions.controls){
        supplyDistribution.push({
          address: distribution.get('address')!.value! as string,
          share: distribution.get('share')!.value! as number,
        });
      }
      data.supplyDistribution = supplyDistribution;
    } else {
      data.supplyDistribution = [{
        address: userPublicKey.toBase58(),
        share: 100
      }];
    }
    // Freeze Authority
    if(this.addOns['freezeAuthority'].added()){
      const inputed = this.settingsForm.get('freezeAuthority')?.value || '';
      if(inputed){
        data.freezeAuthority = inputed;
      }
    } else {
      data.freezeAuthority = userPublicKey.toBase58();
    }
    // Mint Authority
    if(this.addOns['mintAuthority'].added()){
      const inputed = this.settingsForm.get('mintAuthority')?.value || '';
      if(inputed){
        data.mintAuthority = inputed;
      }
    } else {
      data.mintAuthority = userPublicKey.toBase58();
    }
    // Update Authority
    if(this.addOns['updateAuthority'].added()){
      const inputed = this.settingsForm.get('updateAuthority')?.value || '';
      if(inputed){
        data.updateAuthority = inputed;
        if(inputed === PUMP_FUN_MINT_AUTHORITY){
          data.isMutable = false;
        } else {
          data.isMutable = true;
        }
      } else {
        data.updateAuthority = userPublicKey.toBase58();
        data.isMutable = false;
      }
    } else {
      data.updateAuthority = userPublicKey.toBase58();
      data.isMutable = true;
    }

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

  confirmationWindowOpened: boolean = false;
  tokenLaunchLoading: boolean = false;
  createToken(){
    this.confirmationWindowOpened = true;
  }
  async launchToken(){
    this.tokenLaunchLoading = true;

    const balance = await this.walletService.getBalanceLamports();
    if(balance < this.totalCost() * LAMPORTS_PER_SOL){
      this.messageService.add({ severity: 'error', summary: 'Insufficient balance', detail: `You must have at least ${this.totalCost()} SOL` });
      this.tokenLaunchLoading = false;
      return;
    }

    const userPublicKey = this.walletService.selectedWallet?.publicKey;
    if(!userPublicKey) throw new Error('User wallet disconnected');
    this.uploadMetadata().pipe(
      tap(async (response: any) => {
        const metadataUri = response.uri;
        const errorOccured = await this.sendCreateTokenTx(metadataUri, userPublicKey);
        this.tokenLaunchLoading = false;
        if(!errorOccured){
          this.confirmationWindowOpened = false;
          this.step = 4;
        }
      }),
      catchError(error => {
        console.error('Error occurred:', error);
        this.tokenLaunchLoading = false;
        return of(null);
      }),
    ).subscribe();
  }
}
