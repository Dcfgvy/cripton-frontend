import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService } from './app-settings/app-settings.service';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Solana Token Generator';

  constructor(
    private settingsService: AppSettingsService,
  ) {}

  ngOnInit(): void {
    this.settingsService.init();
  }
}
