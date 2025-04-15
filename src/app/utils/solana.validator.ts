import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { PublicKey } from '@solana/web3.js';

export const SOLANA_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$|^$/;

export function solanaAddressValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(!control.value) return null;
    if(!SOLANA_ADDRESS_PATTERN.test(control.value)) return { invalidAddress: true };
  
    // Try to re-generate base58 representation. The address is correct if no error occurs
    try {
      const pubKey = new PublicKey(control.value);
      const base58Representation = pubKey.toBase58();
      return null;
    } catch (err) {
      return { invalidAddress: true }
    }
  }
}