import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BlockchainTool, BlockchainToolsComponent } from "../components/blockchain-tools/blockchain-tools.component";
import { Divider } from 'primeng/divider';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-solana',
  imports: [
    RouterOutlet,
    BlockchainToolsComponent,
    Divider,
    Card,
  ],
  templateUrl: './solana.component.html',
  styleUrl: './solana.component.scss'
})
export class SolanaComponent {
  toolsList: BlockchainTool[] = [
    {
      title: 'Create Token',
      url: 'create-token',
      icon: 'add_circle',
      isIconMD: true,
    },
    {
      title: 'Copy Trending Coins',
      url: 'trending-coins',
      icon: 'whatshot',
      isIconMD: true,
    },
    {
      title: 'Solana Multisender',
      url: 'trwefwefwefwes',
      icon: 'send_money',
      isIconMD: true,
    },
    {
      title: 'Revoke Freeze Authority',
      url: 'trwefwefwefwes',
      icon: 'ac_unit',
      isIconMD: true,
    },
    {
      title: 'Revoke Mint Authority',
      url: 'trwefwefwefwes',
      icon: 'cancel',
      isIconMD: true,
    },
    {
      title: 'Update Token Metadata',
      url: 'trwefwefwefwes',
      icon: 'repeat',
      isIconMD: true,
    },
    {
      title: 'Revoke Update Authority',
      url: 'trwefwefwefwes',
      icon: 'lock',
      isIconMD: true,
    },
    {
      title: 'Create OpenBook Market',
      url: 'trwefwefwefwes',
      icon: 'menu_book',
      isIconMD: true,
    },
    {
      title: 'Mint Tokens',
      url: 'trwefwefwefwes',
      icon: 'database',
      isIconMD: true,
    },
    {
      title: 'Burn Tokens',
      url: 'trwefwefwefwes',
      icon: 'mode_heat',
      isIconMD: true,
    },
    {
      title: 'Freeze Accounts',
      url: 'trwefwefwefwes',
      icon: 'mode_cool',
      isIconMD: true,
    },
    {
      title: 'Unfreeze Accounts',
      url: 'trwefwefwefwes',
      icon: 'mode_cool_off',
      isIconMD: true,
    },
    {
      title: 'Create Liquidity Pool',
      url: 'trwefwefwefwes',
      icon: 'water',
      isIconMD: true,
    },
    {
      title: 'Manage Liquidity',
      url: 'trwefwefwefwes',
      icon: 'water_drop',
      isIconMD: true,
    },
  ];
}
