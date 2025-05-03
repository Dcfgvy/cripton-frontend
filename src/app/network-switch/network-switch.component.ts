import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Network, NetworkService } from './network-switch.service';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-network-switch',
  imports: [
    FormsModule,
    ButtonModule,
    Dialog,
    Tag,
  ],
  templateUrl: './network-switch.component.html',
  styleUrl: './network-switch.component.scss'
})
export class NetworkSwitchComponent {
  constructor(
    public networkService: NetworkService
  ) {}

  dialogOpened = false;
  openNetworkPopup(){
    this.dialogOpened = true;
  }
  selectNetwork(network: Network){
    this.networkService.selectedNetwork = network;
    this.networkService.updateData();
    this.dialogOpened = false;
  }

  onNetworkChange(){
    this.networkService.updateData();
  }
}
