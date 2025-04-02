import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';

// u64 max value: 18,446,744,073,709,551,615 (2^64-1)
// Our limit: 10,000,000,000,000,000,000 (10 * 10^18)
const MAX_SUPPLY_WITH_DECIMALS = 10_000_000_000_000_000_000n;

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
  imports: [StepperModule, ButtonModule, NgTemplateOutlet],
  templateUrl: './create-token-form.component.html',
  styleUrl: './create-token-form.component.scss'
})
export class CreateTokenFormComponent {
  tokenSettingsForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(30),
    ]),
    symbol: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(10),
    ]),
    decimals: new FormControl(6, [
      Validators.required,
      Validators.min(0),
      Validators.max(9),
    ]),
    supply: new FormControl<bigint>(1_000_000_000n, [
      Validators.required,
      Validators.min(1),
      Validators.maxLength(MAX_SUPPLY_WITH_DECIMALS.toString().length),
      Validators.max(Number(MAX_SUPPLY_WITH_DECIMALS.toString())),
      supplyValidator(),
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(1000),
    ]),

    
    creatorInfo: new FormGroup({
      name: new FormControl('Token Generator', [Validators.maxLength(100)]),
      website: new FormControl('https://blablabla176437.com', [Validators.maxLength(1000)]),
    }),


    mintAuthority: new FormControl('', [
      Validators.maxLength(50),
    ]),
    freezeAuthority: new FormControl('', [
      Validators.maxLength(50),
    ]),
    updateAuthority: new FormControl('', [
      Validators.maxLength(50),
    ]),
  },
  // {
  //   validators: [
  //     // Add cross-field validation to re-check when decimals change
  //     (group: AbstractControl) => {
  //       const supplyControl = group.get('supply');
  //       supplyControl?.updateValueAndValidity();
  //       return null;
  //     }
  //   ]
  // }
  );

  tokenSocialsForm = new FormGroup({
    website: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    twitter: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    telegram: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    discord: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    youtube: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    medium: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    github: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    instagram: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    reddit: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ]),
    facebook: new FormControl('', [
      Validators.maxLength(1000),
      this.urlValidator()
    ])
  });

  private urlValidator() {
    return Validators.pattern(
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    );
  }
}
