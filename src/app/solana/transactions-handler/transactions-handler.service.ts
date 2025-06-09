import { Injectable } from '@angular/core';
import { WalletService } from '../../wallet/wallet.service';
import { Connection, PublicKey, Signer, SystemProgram, Transaction, TransactionSignature } from '@solana/web3.js';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { AffiliateService } from '../../affiliate-program/affiliate.service';

export interface SendTransactionWithFeesArgs {
  tx: Transaction;
  /** Simulated transaction network fee. Pass 0 if network fees are not included in the price */
  txFeesLamports: number;
  /** The total cost of a service */
  txCostLamports: number;
  blockhash: string;
  userPublicKey: PublicKey;
  additionalSigners: Array<Signer>;
  connection: Connection;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsHandlerService {
  constructor(
    private walletService: WalletService,
    private settingsService: AppSettingsService,
    private affiliateService: AffiliateService,
  ) {}

  public async sendTransactionWithFees(data: SendTransactionWithFeesArgs): Promise<TransactionSignature>{
    const developerAddress = this.settingsService.currentSettings?.solanaAddress;
    if (!developerAddress) throw new Error('Internal error');

    if(data.txFeesLamports < data.txCostLamports){
      // Calculate the remaining amount to transfer to developer
      const remainingAmount = data.txCostLamports - data.txFeesLamports;
      
      const txInstructions = [...data.tx.instructions];
      // Add transfer instructions
      const [affiliateShare, devShare] = this.affiliateService.calculateAffiliateShare(remainingAmount, 'solana');
      const affiliateAddress = this.affiliateService.getReferralData()?.solana;
      if(affiliateShare > 0 && affiliateAddress){
        txInstructions.push(
          SystemProgram.transfer({
            fromPubkey: data.userPublicKey,
            toPubkey: new PublicKey(affiliateAddress),
            lamports: Math.round(Number(affiliateShare.toString()))
          })
        );
      }
      if(devShare > 0){
        txInstructions.push(
          SystemProgram.transfer({
            fromPubkey: data.userPublicKey,
            toPubkey: new PublicKey(developerAddress),
            lamports: Math.round(Number(devShare.toString()))
          })
        );
      }
      
      // Rebuild transaction with the fee transfer
      const finalTransaction = new Transaction().add(...txInstructions);
      finalTransaction.feePayer = data.userPublicKey;
      finalTransaction.recentBlockhash = data.blockhash;
      for(const signer of data.additionalSigners){
        finalTransaction.partialSign(signer);
      }
      
      // Send transaction for signing and broadcasting
      if(!this.walletService.selectedWallet) throw new Error('User wallet is not connected');

      const txid = await this.walletService.selectedWallet.sendTransaction(finalTransaction, data.connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      return txid;
    } else {
      // If fees exceed or equal totalCost, just send the transaction without developer fee
      if(!this.walletService.selectedWallet) throw new Error('User wallet is not connected');

      const txid = await this.walletService.selectedWallet.sendTransaction(data.tx, data.connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      return txid;
    }
  }
}
