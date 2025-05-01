import { Component, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { WalletService } from '../../../wallet/wallet.service';

interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  supply: bigint | number;
  decimals: number;
}

@Component({
  selector: 'app-select-user-token',
  imports: [Select, FormsModule],
  templateUrl: './select-user-token.component.html',
  styleUrl: './select-user-token.component.scss'
})
export class SelectUserTokenComponent implements OnInit {
  token = model.required<TokenData | null>();
  userTokens = [];
  isFetchingInProgress = true;

  constructor(
    private readonly walletService: WalletService,
  ) {}

  ngOnInit(): void {
    const pubKey = this.walletService.selectedWallet?.publicKey;
    if(!pubKey) return;
  }
}
