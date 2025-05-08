import { Component, input } from '@angular/core';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-copy-string',
  imports: [
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    Button,
  ],
  templateUrl: './copy-string.component.html',
  styleUrl: './copy-string.component.scss'
})
export class CopyStringComponent {
  value = input.required<string>();

  addressCopiedState = false;
  copyData(){
    navigator.clipboard.writeText(this.value());
    this.addressCopiedState = true;
    setTimeout(() => {
      this.addressCopiedState = false;
    }, 3000)
  }
}
