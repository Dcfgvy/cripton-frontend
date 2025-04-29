import { Component } from '@angular/core';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-main',
  imports: [FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  constructor(
    public settingsService: AppSettingsService,
  ) {}

  readonly appName = environment.serviceName;
}
