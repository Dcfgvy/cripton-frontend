import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [Card],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  readonly creationYear = 2025;
  readonly year = new Date().getFullYear();
  readonly serviceName = environment.serviceName;
}
