import { Component, input, model } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { TokenCreatedBodyComponent } from "./token-created-body/token-created-body.component";

@Component({
  selector: 'app-token-created-popup',
  imports: [Dialog, TokenCreatedBodyComponent],
  templateUrl: './token-created-popup.component.html',
  styleUrl: './token-created-popup.component.scss'
})
export class TokenCreatedPopupComponent {
  visible = model.required<boolean>();
  address = input.required<string>();
}
