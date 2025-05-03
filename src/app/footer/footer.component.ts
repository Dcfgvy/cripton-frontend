import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { environment } from '../../environments/environment';
import { TextLinkComponent } from "../components/text-link/text-link.component";

@Component({
  selector: 'app-footer',
  imports: [Card, TextLinkComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  readonly creationYear = 2025;
  readonly year = new Date().getFullYear();
  readonly serviceName = environment.serviceName;
}
