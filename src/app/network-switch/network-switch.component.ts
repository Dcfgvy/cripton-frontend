import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { NetworkService } from './network-switch.service';

@Component({
  selector: 'app-network-switch',
  imports: [Select, FormsModule, NgTemplateOutlet],
  templateUrl: './network-switch.component.html',
  styleUrl: './network-switch.component.scss'
})
export class NetworkSwitchComponent {
  constructor(
    public networkService: NetworkService
  ) {}

  onNetworkChange(){
    this.networkService.updateData();
  }
}
