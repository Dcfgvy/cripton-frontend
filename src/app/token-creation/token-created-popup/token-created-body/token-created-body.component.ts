import { Component, input } from '@angular/core';
import { NetworkService } from '../../../network-switch/network-switch.service';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-token-created-body',
  imports: [ButtonDirective],
  templateUrl: './token-created-body.component.html',
  styleUrl: './token-created-body.component.scss'
})
export class TokenCreatedBodyComponent {
  address = input.required<string>();

  constructor(
    public readonly networkService: NetworkService
  ) {}

  addressCopiedState = false;
  copyAddress(){
    navigator.clipboard.writeText(this.address());
    this.addressCopiedState = true;
    setTimeout(() => {
      this.addressCopiedState = false;
    }, 3000);
  }
}
