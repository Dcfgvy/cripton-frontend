import { Component, input } from '@angular/core';

@Component({
  selector: 'app-solana-explorer-link',
  imports: [],
  templateUrl: './solana-explorer-link.component.html',
  styleUrl: './solana-explorer-link.component.scss'
})
export class SolanaExplorerLinkComponent {
  explorer = input.required<'explorer' | 'solscan'>();
  address = input.required<string>();
  network = input.required<string>();
  type = input.required<'token' | 'transaction'>();
}
