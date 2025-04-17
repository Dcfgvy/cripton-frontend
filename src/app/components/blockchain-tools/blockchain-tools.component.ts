import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

export interface BlockchainTool {
  title: string;
  url: string;
  icon: string;
  isIconMD?: boolean;
}

@Component({
  selector: 'app-blockchain-tools',
  imports: [ButtonDirective, RouterLink],
  templateUrl: './blockchain-tools.component.html',
  styleUrl: './blockchain-tools.component.scss'
})
export class BlockchainToolsComponent {
  tools = input.required<BlockchainTool[]>();
}
