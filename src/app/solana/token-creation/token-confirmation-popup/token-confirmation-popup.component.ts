import { Component, input, model, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';

@Component({
  selector: 'app-token-confirmation-popup',
  imports: [Dialog, ButtonDirective, Divider],
  templateUrl: './token-confirmation-popup.component.html',
  styleUrl: './token-confirmation-popup.component.scss'
})
export class TokenConfirmationPopupComponent {
  visible = model.required<boolean>();
  network = input.required<string>();
  imageUrl = input<string | null | undefined>();
  
  name = input.required<string | null | undefined>();
  symbol = input.required<string | null | undefined>();
  supply = input.required<bigint | null | undefined>();
  decimals = input.required<number | null | undefined>();

  loading = input.required<boolean>();
  onClick = output();

  onButtonClick(){
    this.onClick.emit();
  }
  
  get zeroBigint(){ return 0n; }
}
