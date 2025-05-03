import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-terms-of-use',
  imports: [],
  templateUrl: './terms-of-use.component.html',
  styleUrl: './terms-of-use.component.scss'
})
export class TermsOfUseComponent {
  serviceName = environment.serviceName;
  serviceWebsite = environment.serviceWebsite;
  
  serviceHost = new URL(this.serviceWebsite).host;
}
