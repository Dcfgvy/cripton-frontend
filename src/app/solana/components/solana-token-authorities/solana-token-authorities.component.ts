import { Component, computed, input, model } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AddOn, AddOnComponent } from '../../../components/add-on/add-on.component';
import { AlertBannerComponent } from '../../../components/alert-banner/alert-banner.component';
import { PUMP_FUN_MINT_AUTHORITY } from '../../constants/token.constants';

@Component({
  selector: 'app-solana-token-authorities',
  imports: [
    AddOnComponent,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    AlertBannerComponent
  ],
  templateUrl: './solana-token-authorities.component.html',
  styleUrl: './solana-token-authorities.component.scss'
})
export class SolanaTokenAuthoritiesComponent {
  form = model.required<FormGroup>();
  addOns = model.required<Record<string, AddOn>>();
  smallerGap = input<boolean>(true);  // it works, so just don't touch it

  pastePumpFunUpdateAddress() {
    this.form().get('updateAuthority')?.setValue(PUMP_FUN_MINT_AUTHORITY);
  }

  authorityBlockClass = computed(() => {
    return 'field col-12 flex' + (this.smallerGap() ? ' mb-0' : '');
  });
} 