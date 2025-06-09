import { Injectable } from '@angular/core';
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { createSetAuthorityInstruction, AuthorityType } from '@solana/spl-token';
import { TransactionsHandlerService, SendTransactionWithFeesArgs } from '../transactions-handler/transactions-handler.service';
import { WalletService } from '../../wallet/wallet.service';
import { NetworkService } from '../../network-switch/network-switch.service';
import { findMetadataPda, updateMetadataAccountV2 } from '@dcfgvy/mpl-token-metadata';
import { createNoopSigner, createUmi, Umi } from '@metaplex-foundation/umi';
import { defaultProgramRepository } from '@metaplex-foundation/umi-program-repository';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { fromWeb3JsPublicKey, toWeb3JsInstruction } from '@metaplex-foundation/umi-web3js-adapters';

export interface UpdateAuthoritiesData {
  mint: PublicKey;
  tokenProgram: PublicKey;
  totalCost: number;
  isNetworkFeeIncluded: boolean;
  freezeAuthority?: {
    currentAuthority: PublicKey;
    newAuthority: PublicKey | null;
  };
  mintAuthority?: {
    currentAuthority: PublicKey;
    newAuthority: PublicKey | null;
  };
  updateAuthority?: {
    currentAuthority: PublicKey;
    newAuthority: PublicKey | null;
    isMutable?: boolean;
  };
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

  private getUmiContext(): Umi {
    const umi = createUmi()
    .use(defaultProgramRepository())
    .use(web3JsEddsa())

    return umi;
  }

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
          data.freezeAuthority.newAuthority
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
          data.mintAuthority.newAuthority
        )
      );
    }

    if (data.updateAuthority) {
      const metadataPDA = findMetadataPda(this.getUmiContext(), { mint: fromWeb3JsPublicKey(data.mint) })[0];

      let updateAuthority: PublicKey | null | undefined = data.updateAuthority.newAuthority;
      if(updateAuthority === null || updateAuthority === data.updateAuthority.currentAuthority) updateAuthority = undefined;

      const transferInstructions = updateMetadataAccountV2(this.getUmiContext(), {
        metadata: metadataPDA,
        updateAuthority: createNoopSigner(fromWeb3JsPublicKey(data.updateAuthority.currentAuthority)),
        newUpdateAuthority: updateAuthority ? fromWeb3JsPublicKey(updateAuthority) : undefined,
        isMutable: data.updateAuthority.isMutable,
      }).getInstructions();

      for(const inst of transferInstructions){
        transaction.add(toWeb3JsInstruction(inst));
      }
    }

    transaction.feePayer = userPublicKey;
    transaction.recentBlockhash = blockhash;

    const txData: SendTransactionWithFeesArgs = {
      tx: transaction,
      txFeesLamports: 0,  // CUs for these operations are extremely small, so the network fee doesn't increase at all
      txCostLamports: Math.round(data.totalCost * LAMPORTS_PER_SOL),
      blockhash,
      userPublicKey,
      additionalSigners: [],
      connection,
    };

    return await this.transactionsHandler.sendTransactionWithFees(txData);
  }
}