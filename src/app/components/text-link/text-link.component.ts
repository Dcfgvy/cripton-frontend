import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-text-link',
  imports: [RouterLink],
  templateUrl: './text-link.component.html',
  styleUrl: './text-link.component.scss'
})
export class TextLinkComponent {
  link = input.required<string>();
  showRedirectIcon = input<boolean>(false);

  get isRouterLink(){
    return !this.link().startsWith('http://') && !this.link().startsWith('https://');
  }
}
