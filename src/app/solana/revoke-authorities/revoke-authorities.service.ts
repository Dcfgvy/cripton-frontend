import { Injectable } from '@angular/core';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createSetAuthorityInstruction, AuthorityType } from '@solana/spl-token';
import { TransactionsHandlerService, SendTransactionWithFeesArgs } from '../transactions-handler/transactions-handler.service';
import { WalletService } from '../../wallet/wallet.service';
import { NetworkService } from '../../network-switch/network-switch.service';

export interface UpdateAuthoritiesData {
  mint: PublicKey;
  freezeAuthority?: {
    currentAuthority: PublicKey;
    newAuthority: string | null;
  };
  mintAuthority?: {
    currentAuthority: PublicKey;
    newAuthority: string | null;
  };
  totalCost: number;
}

@Injectable({
  providedIn: 'root'
})
export class RevokeAuthoritiesService {
  constructor(
    private readonly transactionsHandler: TransactionsHandlerService,
    private readonly walletService: WalletService,
    private readonly networkService: NetworkService,
  ) {}

  public async updateAuthorities(data: UpdateAuthoritiesData): Promise<string> {
    const userPublicKey = this.walletService.selectedWallet?.publicKey;
    if (!userPublicKey) throw new Error('Wallet not connected');

    const connection = this.networkService.connection;
    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new Transaction();

    // Add Freeze Authority update instruction if requested
    if (data.freezeAuthority) {
      transaction.add(
        createSetAuthorityInstruction(
          data.mint,
          data.freezeAuthority.currentAuthority,
          AuthorityType.FreezeAccount,
          data.freezeAuthority.newAuthority ? new PublicKey(data.freezeAuthority.newAuthority) : null
        )
      );
    }

    // Add Mint Authority update instruction if requested
    if (data.mintAuthority) {
      transaction.add(
        createSetAuthorityInstruction(
          data.mint,
          data.mintAuthority.currentAuthority,
          AuthorityType.MintTokens,
          data.mintAuthority.newAuthority ? new PublicKey(data.mintAuthority.newAuthority) : null
        )
      );
    }

    transaction.feePayer = userPublicKey;
    transaction.recentBlockhash = blockhash;

    // Calculate network fees
    const fees = await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed');
    if (fees.value === undefined) throw new Error('Failed to calculate network fees');

    const txData: SendTransactionWithFeesArgs = {
      tx: transaction,
      txFeesLamports: fees.value || 0, // Default to 0 if null
      txCostLamports: Math.round(data.totalCost * 10 ** 9), // Convert SOL to lamports
      blockhash,
      userPublicKey,
      additionalSigners: [],
      connection,
    };

    return await this.transactionsHandler.sendTransactionWithFees(txData);
  }
} 