import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, Signal, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { WalletService } from '../../wallet/wallet.service';
import { Keypair } from '@solana/web3.js';
import { AddOn, AddOnComponent } from '../../components/add-on/add-on.component';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { FileSelectorComponent } from "../../components/file-selector/file-selector.component";
import { DividerModule } from 'primeng/divider';
import { formatElapsedTime } from '../../utils/functions';
import { RequiredComponent } from "../../components/required/required.component";

// u64 max value: 18,446,744,073,709,551,615 (2^64-1)
// Our limit: 10,000,000,000,000,000,000 (10 * 10^18)
const MAX_SUPPLY_WITH_DECIMALS = 10_000_000_000_000_000_000n;
const ONE_BYTE_SYMBOLS = /^[a-zA-Z0-9 _.!$?]+$/;
const ADDRESS_SYMBOLS = /^[1-9A-HJ-NP-Za-km-z]+$/;
const PUMP_FUN_MINT_AUTHORITY = "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM";

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

export function urlValidator(): ValidatorFn {
  return Validators.pattern(
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  );
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
    RequiredComponent
],
  templateUrl: './create-token-form.component.html',
  styleUrl: './create-token-form.component.scss'
})
export class CreateTokenFormComponent {
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
  readonly DEFAULT_CREATOR_NAME = 'Token Generator'; // TODO: fix website name and link
  readonly DEFAULT_CREATOR_WEBSITE = 'https://token-blablabla.com';
  readonly MAX_CUSTOM_ADDRESS_PREFIX_LENGTH = 4;

  constructor(
    private walletService: WalletService,
    private settingsService: AppSettingsService,
  ) {}

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
      Validators.max(this.MAX_SUPPLY_WITH_DECIMALS_NUMBER), // TODO: revalidate when decimals change
      supplyValidator(),
    ]),
    description: new FormControl('', [
      Validators.maxLength(1000),
    ]),
  },
  {
    validators: [
      // Add cross-field validation to re-check when decimals change
      (group: AbstractControl) => {
        const supplyControl = group.get('supply');
        if(supplyControl === null) return null;
        const errors = supplyValidator()(supplyControl);
        return errors;
      }
    ]
  }
  );
  imageFile: string = '';

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
      urlValidator()
    ]),
    telegram: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
    ]),
    discord: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
    ]),
    youtube: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
    ]),
    medium: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
    ]),
    github: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
    ]),
    instagram: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
    ]),
    reddit: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
    ]),
    facebook: new FormControl('', [
      Validators.maxLength(1000),
      urlValidator()
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
    if(event.key === 'Enter' || event.key === ' '){
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
    console.log(this.socialsForm.get('tags')?.value);
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
      (formArray: AbstractControl) => { // TODO: show "Must sum up to 100%" error
        if(!this.addOns['multiWalletDistribution'].added) return null;
        if(formArray.value.length === 0) return null;
        
        let percentsSum = 0;
        for(const control of formArray.value){
          console.log(Number(control.share));
          percentsSum += Number(control.share) || 0;
        }
        console.log(percentsSum !== 100);
        if(percentsSum !== 100){
          return { supplyDistributionPercentsFailure: true };
        }
        return null;
      }
    ]),

    freezeAuthority: new FormControl('', [
      Validators.maxLength(50),
    ]),
    mintAuthority: new FormControl('', [
      Validators.maxLength(50),
    ]),
    updateAuthority: new FormControl('', [
      Validators.maxLength(50),
    ]),
  }, {
    validators: [
      // Add cross-field validation to check multiwallet percentage share sum
      
    ]
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
  addDistribution(address: string = '', share: number = 10, disabled: boolean = false): void {
    if (this.supplyDistributions.length >= this.MAX_WALLETS_SUPPLY_DISTRIBUTION) return;
  
    this.supplyDistributions.push(
      new FormGroup({
        address: new FormControl({ value: address, disabled }, [Validators.required, Validators.pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)]), // Solana address pattern
        share: new FormControl(share, [Validators.required, Validators.pattern(/^[0-9]*$/), Validators.min(1), Validators.max(100)]) // number pattern
      })
    );
  }
  setInitialUserWalletSupply = () => {
    if(this.supplyDistributions.length > 0) return;
    this.addDistribution(this.walletService.selectedWallet?.publicKey?.toBase58(), 100, true);
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

  // Create Token
  createToken(){

  }
}
