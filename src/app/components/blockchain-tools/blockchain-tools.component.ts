import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, input, OnInit, PLATFORM_ID } from '@angular/core';
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
export class BlockchainToolsComponent implements OnInit{
  tools = input.required<BlockchainTool[]>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ){}

  ngOnInit(): void {
    this.scrollToContent();
  }

  scrollToContent(){
    if(isPlatformBrowser(this.platformId)){
      const element = document.getElementById('content-start');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, 400);
      }
    }
  }
}
// TODO scroll on load, not this 400ms kludge