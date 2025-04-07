import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, makeStateKey, OnInit, PLATFORM_ID, TransferState } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-main',
  imports: [RouterLink, FormsModule, CheckboxModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  constructor(
    public settingsService: AppSettingsService,
    
  ) {}

  checked = false;
}
