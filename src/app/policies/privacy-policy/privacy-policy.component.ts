import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  serviceName = environment.serviceName;
  serviceWebsite = environment.serviceWebsite;
  
  serviceHost = new URL(this.serviceWebsite).host;
}
