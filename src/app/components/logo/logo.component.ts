import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss'
})
export class LogoComponent {
  serviceName = environment.serviceName;
}
