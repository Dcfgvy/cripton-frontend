import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NetworkSwitchComponent } from '../network-switch/network-switch.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    ButtonModule,
    NetworkSwitchComponent,
    NgTemplateOutlet
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
