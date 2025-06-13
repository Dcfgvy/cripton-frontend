import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, input, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { filter, Subscription } from 'rxjs';

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
export class BlockchainToolsComponent implements OnInit, OnDestroy {
  tools = input.required<BlockchainTool[]>();
  private routerSubscription: Subscription | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ){}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.routerSubscription = this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.scrollToContent();
      });
    }
    this.scrollToContent();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  scrollToContent(delayMs: number = 400){
    if(isPlatformBrowser(this.platformId)){
      const element = document.getElementById('content-start');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, delayMs);
      }
    }
  }

  scrollToContentIfOnTheSamePage(url: string){
    if(this.router.url === url){
      this.scrollToContent(0);
    }
  }
}