import { Component } from '@angular/core';
import { WarningComponent } from '../warning/warning.component';
import { NetworkService } from '../../network-switch/network-switch.service';
import { TextLinkComponent } from "../text-link/text-link.component";

@Component({
  selector: 'app-testnet-warning',
  imports: [WarningComponent, TextLinkComponent],
  templateUrl: './testnet-warning.component.html',
  styleUrl: './testnet-warning.component.scss'
})
export class TestnetWarningComponent {
  constructor(
    public readonly networkService: NetworkService,
  ) {}
}
