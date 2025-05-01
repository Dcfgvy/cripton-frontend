import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { WalletService } from '../../wallet/wallet.service';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { NetworkService } from '../../network-switch/network-switch.service';
import { TokenImageData, TokenUploadMetadata } from './interfaces/token-metadata.interface';
import { CreateTokenData } from './interfaces/create-token-data.interface';

import {
  TOKEN_PROGRAM_ID,
  MintLayout,
  AuthorityType,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';

import { Creator, DataV2Args, createMetadataAccountV3, findMetadataPda, mplTokenMetadata, updateMetadataAccountV2 } from "@dcfgvy/mpl-token-metadata";
import { fromWeb3JsPublicKey, toWeb3JsInstruction } from '@metaplex-foundation/umi-web3js-adapters';
import { createNoopSigner, createUmi, Umi } from '@metaplex-foundation/umi';
import { defaultProgramRepository } from '@metaplex-foundation/umi-program-repository';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';

@Injectable({
  providedIn: 'root'
})
export class TokenCreationService {
  constructor(
    private http: HttpClient,
    private walletService: WalletService,
    private settingsService: AppSettingsService,
    private networkService: NetworkService,
  ) {}

  public uploadMetadata(data: TokenUploadMetadata, imageData: TokenImageData){
    let dataObj: any = {...data};
    const formData = new FormData();
    if(imageData.imageData){
      formData.append('image', imageData.imageData);
    } else {
      dataObj.imageUrl = imageData.imageUrl;
    }

    if(!data.creatorName){ dataObj.creatorName = undefined; }
    if(!data.creatorWebsite){ dataObj.creatorWebsite = undefined; }
    formData.append('data', JSON.stringify(dataObj));

    return this.http.post(`${environment.apiUrl}/api/tokens/create`, formData);
  }
  
  private getUmiContext(): Umi {
    const umi = createUmi()
    // .use(signerIdentity(createNoopSigner(fromWeb3JsPublicKey(userPublicKey)), true))
    .use(defaultProgramRepository())
    .use(web3JsEddsa())
    // .use(web3JsRpc(connection.rpcEndpoint))

    return umi;
  }

  private createTokenMetadataInstructions(data: CreateTokenData, userPublicKey: PublicKey, updateAuthority: PublicKey){
    const umiCreators = data.creators.map((c) => {
      const umiCreator: Creator = {
        address: fromWeb3JsPublicKey(c.address),
        share: c.share,
        verified: c.verified,
      };
      return umiCreator;
    });
    const metadataData: DataV2Args = {
      name: data.name,
      symbol: data.symbol,
      uri: data.metadataUri,
      sellerFeeBasisPoints: 0,
      creators: umiCreators,
      collection: null,
      uses: null,
    };
    
    const umi = this.getUmiContext().use(mplTokenMetadata());
    const metadataPDA = findMetadataPda(umi, { mint: fromWeb3JsPublicKey(data.mint.publicKey) })[0];
    let instructions: TransactionInstruction[] = [];

    // if update authority is on of the signers
    if(updateAuthority === userPublicKey || updateAuthority === data.mint.publicKey){
      const createInstructions = createMetadataAccountV3(umi, {
        collectionDetails: null,
        isMutable: true,
        data: metadataData,
        mint: fromWeb3JsPublicKey(data.mint.publicKey),
        mintAuthority: createNoopSigner(fromWeb3JsPublicKey(userPublicKey)),
        updateAuthority: fromWeb3JsPublicKey(updateAuthority),
        payer: createNoopSigner(fromWeb3JsPublicKey(userPublicKey)),
      })
      .getInstructions();

      for(const inst of createInstructions){
        instructions.push(toWeb3JsInstruction(inst));
      }
    } else {
      // initial update authority is user, then transfer it
      const createInstructions = createMetadataAccountV3(umi, {
        collectionDetails: null,
        isMutable: true,
        data: metadataData,
        mint: fromWeb3JsPublicKey(data.mint.publicKey),
        mintAuthority: createNoopSigner(fromWeb3JsPublicKey(userPublicKey)),
        updateAuthority: fromWeb3JsPublicKey(userPublicKey),
        payer: createNoopSigner(fromWeb3JsPublicKey(userPublicKey)),
      })
      .getInstructions();

      for(const inst of createInstructions){
        instructions.push(toWeb3JsInstruction(inst));
      }

      const transferInstructions = updateMetadataAccountV2(umi, {
        metadata: metadataPDA,
        updateAuthority: createNoopSigner(fromWeb3JsPublicKey(userPublicKey)),
        newUpdateAuthority: fromWeb3JsPublicKey(updateAuthority),
        isMutable: data.isMutable,
      }).getInstructions();

      for(const inst of transferInstructions){
        instructions.push(toWeb3JsInstruction(inst));
      }
    }
    
    return instructions;
  }
  
  private async buildRawTokenCreationTx(
    data: CreateTokenData,
    connection: Connection,
    userPublicKey: PublicKey,
    mintRent: number,
    blockhash: string,
  ): Promise<Transaction> {
    const instructions: TransactionInstruction[] = [];
    
    // Create mint account
    instructions.push(
      SystemProgram.createAccount({
        fromPubkey: userPublicKey,
        newAccountPubkey: data.mint.publicKey,
        lamports: mintRent,
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID
      })
    );
    
    // Convert freeze authority if provided
    let freezeAuthority: PublicKey | null = null;
    if (data.freezeAuthority) {
      freezeAuthority = new PublicKey(data.freezeAuthority);
    }
    
    // Initialize mint
    instructions.push(
      createInitializeMintInstruction(
        data.mint.publicKey,
        data.decimals,
        userPublicKey, // Initial mint authority is user
        freezeAuthority,
        TOKEN_PROGRAM_ID
      )
    );


    // Convert update authority if provided
    let updateAuthority: PublicKey = userPublicKey;
    if (data.updateAuthority) {
      updateAuthority = new PublicKey(data.updateAuthority);
    }

    const metadataInstructions = this.createTokenMetadataInstructions(data, userPublicKey, updateAuthority);
    instructions.push(...metadataInstructions);
    
    // Create ATAs and mint tokens
    for (const recipient of data.supplyDistribution) {
      const recipientPubkey = new PublicKey(recipient.address);
      
      // Calculate amount to mint for this recipient
      const shareAmount = (BigInt(data.supply) * BigInt(recipient.share)) / BigInt(100);
      const mintAmount = BigInt(shareAmount) * BigInt(10) ** BigInt(data.decimals);
      
      // Get or create ATA for recipient
      const ata = getAssociatedTokenAddressSync(
        data.mint.publicKey,
        recipientPubkey,
        false
      );
      
      // Create ATA if it doesn't exist
      instructions.push(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          ata,
          recipientPubkey,
          data.mint.publicKey
        )
      );
      
      // Mint tokens to ATA
      instructions.push(
        createMintToInstruction(
          data.mint.publicKey,
          ata,
          userPublicKey,
          mintAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }
    
    // Transfer mint authority if specified
    const newMintAuthority = data.mintAuthority ? new PublicKey(data.mintAuthority) : null;
    if(newMintAuthority !== userPublicKey){
      instructions.push(
        createSetAuthorityInstruction(
          data.mint.publicKey,
          userPublicKey,
          AuthorityType.MintTokens,
          newMintAuthority,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }
    
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = userPublicKey;
    transaction.recentBlockhash = blockhash;

    // Add signer
    transaction.partialSign(data.mint);

    return transaction;
  }

  /*
  private async getTokenCreationCost(data: CreateTokenData, connection: Connection, userPublicKey: PublicKey, mintRent: number, blockhash: string): Promise<number> {
    function calculateRentCosts(
      numATAs: number, 
      numMintOperations: number, 
      numAuthorityTransfers: number
    ): number {
      // Constants for rent-exempt minimums in lamports
      const TOKEN_ACCOUNT_RENT = 2039280; // ~0.00203928 SOL in lamports
      const MINT_RENT = 1518480; // ~0.00151848 SOL in lamports
      const METADATA_RENT = 3000000; // ~0.003 SOL in lamports
      const ATA_RENT = 2039280; // Same as token account
      
      // Fixed costs - one-time operations
      let rentCostLamports = 0;
      
      // Always include one token account, one mint, and one metadata creation
      rentCostLamports += TOKEN_ACCOUNT_RENT; // Creating the main token account
      rentCostLamports += MINT_RENT; // Initializing the mint
      rentCostLamports += METADATA_RENT; // Creating metadata record
      
      // Variable costs - based on provided counts
      // Add ATA creation costs
      rentCostLamports += numATAs * ATA_RENT;
      
      // Minting tokens doesn't require additional rent, just compute units
      // But we'll add a small compute fee per mint operation
      const MINT_OPERATION_COMPUTE = 10000; // Approximate compute units per mint
      const COMPUTE_UNIT_PRICE = 1; // lamports per compute unit (adjust as needed)
      rentCostLamports += numMintOperations * MINT_OPERATION_COMPUTE * COMPUTE_UNIT_PRICE;
      
      // Authority transfers use minimal compute, no rent
      const AUTHORITY_TRANSFER_COMPUTE = 5000; // Approximate compute units per authority transfer
      rentCostLamports += numAuthorityTransfers * AUTHORITY_TRANSFER_COMPUTE * COMPUTE_UNIT_PRICE;
      
      return rentCostLamports;
    }

    const tx = await this.buildRawTokenCreationTx(data, userPublicKey, mintRent, blockhash);

    const feesResponse = (await connection.simulateTransaction(tx)).value;
    if(feesResponse.err !== null){
      console.error(feesResponse.err);
      throw new Error('Error simulating transaction');
    }

    // CU fees
    const unitsConsumed = feesResponse.unitsConsumed || 0;
    const computeFee = unitsConsumed * 1;
    // Signature fees
    const lamportsPerSignature = 5000;
    const numSignatures = tx.signatures.length;
    const signatureFee = lamportsPerSignature * numSignatures;
    // Rent costs fees
    const numATAs = data.supplyDistribution.length;
    const numMintOperations = data.supplyDistribution.length;
    let numAuthorityTransfers = 0;
    const newMintAuthority = data.mintAuthority ? new PublicKey(data.mintAuthority) : null;
    if(newMintAuthority !== userPublicKey) numAuthorityTransfers++;
    const rentCosts = calculateRentCosts(
      numATAs, 
      numMintOperations, 
      numAuthorityTransfers
    );

    // Total fee in lamports
    const totalFeeInLamports = computeFee + signatureFee + rentCosts;
      
    console.log(`Estimated fees breakdown:
      - Compute: ${computeFee} lamports
      - Signatures: ${signatureFee} lamports
      - Rent/Account Creation: ${rentCosts} lamports
      - Total: ${totalFeeInLamports} lamports (${totalFeeInLamports / 1e9} SOL)`);
    
    return totalFeeInLamports;
  }
  */

  private async getTokenCreationCost(
    data: CreateTokenData,
    connection: Connection,
    userPublicKey: PublicKey,
    mintRent: number,
    blockhash: string
  ): Promise<number> {
    try {
      // ========================
      // 1. Fetch Dynamic Rent Costs
      // ========================
      const [tokenAccountRent, mintRent, metadataRent] = await Promise.all([
        connection.getMinimumBalanceForRentExemption(165), // Token account size
        connection.getMinimumBalanceForRentExemption(82),   // Mint account size
        connection.getMinimumBalanceForRentExemption(679)  // Metaplex metadata size
      ]);
  
      // ========================
      // 2. Get Current Fee Structure
      // ========================
      const lamportsPerSignature = 5000;
  
      // ========================
      // 3. Estimate Priority Fees
      // ========================
      const prioritizationFees = await connection.getRecentPrioritizationFees();
      const medianPriorityFee = this.calculateMedianPriorityFee(prioritizationFees);
  
      // ========================
      // 4. Simulate Transaction
      // ========================
      const tx = await this.buildRawTokenCreationTx(data, connection, userPublicKey, mintRent, blockhash);
      const simulation = await connection.simulateTransaction(tx);
      
      if (simulation.value.err) {
        throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }
  
      // ========================
      // 5. Calculate Component Fees
      // ========================
      // Compute Fees
      const unitsConsumed = simulation.value.unitsConsumed || 0;
      const computeFee = (unitsConsumed * medianPriorityFee) / 1_000_000; // Convert micro-lamports → lamports
  
      // Signature Fees
      const signatureFee = lamportsPerSignature * tx.signatures.length;
  
      // Rent Costs (with ATA existence checks)
      const rentCosts = this.calculateActualRentCosts(
        connection,
        data,
        userPublicKey,
        tokenAccountRent,
        mintRent,
        metadataRent
      );
  
      // ========================
      // 6. Return Total Cost
      // ========================
      const totalFee = computeFee + signatureFee + rentCosts + 7_450_000;  // TODO: fix fees calculation
      
      console.log(`
        🟢 Fee Breakdown (SOL):
        - Compute:       ${computeFee / 1e9}
        - Signatures:    ${signatureFee / 1e9}
        - Rent/Storage:  ${rentCosts / 1e9}
        --------------------------
        Total:           ${totalFee / 1e9} SOL
        (${totalFee} lamports)
      `);
  
      return totalFee;
  
    } catch (error) {
      console.error('❌ Error in getTokenCreationCost:', error);
      throw new Error(`Failed to estimate creation cost: ${(error as any).message}`);
    }
  }
  
  // ========================
  // Helper Methods
  // ========================
  
  private calculateMedianPriorityFee(fees: { prioritizationFee: number }[]): number {
    if (fees.length === 0) return 5000; // Default fallback (0.000005 SOL)
    
    const sorted = [...fees]
      .map(f => f.prioritizationFee)
      .sort((a, b) => a - b);
    
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  private calculateActualRentCosts(
    connection: Connection,
    data: CreateTokenData,
    userPublicKey: PublicKey,
    tokenAccountRent: number,
    mintRent: number,
    metadataRent: number
  ): number {
    let totalRent = 0;
    totalRent += tokenAccountRent; // Main token account
    totalRent += mintRent;         // Mint account
    totalRent += metadataRent;     // Metadata account
    totalRent += tokenAccountRent * data.supplyDistribution.length; // ATAs
    return totalRent;
  }
  
  public async createToken(data: CreateTokenData, userPublicKey: PublicKey) {
    const userWallet = this.walletService.selectedWallet;
    const developerAddress = this.settingsService.currentSettings?.solanaAddress;
    if (!userWallet?.publicKey || (userWallet.publicKey.toBase58() !== userPublicKey.toBase58())) throw new Error('User wallet disconnected');
    if (!developerAddress) throw new Error('Internal error');
  
    // Create connection to the network
    const connection = this.networkService.connection;
    const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = await this.buildRawTokenCreationTx(data, connection, userPublicKey, mintRent, blockhash);
    const txCost = await this.getTokenCreationCost(data, connection, userPublicKey, mintRent, blockhash);
    
    if(txCost < data.totalCost * LAMPORTS_PER_SOL){
      // Calculate the remaining amount to transfer to developer
      const remainingAmount = data.totalCost * LAMPORTS_PER_SOL - txCost;
      
      const txInstructions = [...transaction.instructions];
      // Add transfer instruction
      txInstructions.push(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: new PublicKey(developerAddress),
          lamports: Math.round(remainingAmount)
        })
      );
      
      // Rebuild transaction with the fee transfer
      const finalTransaction = new Transaction().add(...txInstructions);
      finalTransaction.feePayer = userPublicKey;
      finalTransaction.recentBlockhash = blockhash;
      finalTransaction.partialSign(data.mint);
      
      // Send transaction for signing and broadcasting
      if(!this.walletService.selectedWallet) throw new Error('User wallet is not connected');
      
      const txid = await this.walletService.selectedWallet.sendTransaction(finalTransaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      
      // console.log(txid, data.mint.publicKey.toBase58());
      return {
        txid,
        mintAddress: data.mint.publicKey.toBase58()
      };
    } else {
      // If fees exceed or equal totalCost, just send the transaction without developer fee
      if(!this.walletService.selectedWallet) throw new Error('User wallet is not connected');

      const txid = await this.walletService.selectedWallet.sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      return {
        txid,
        mintAddress: data.mint.publicKey.toBase58()
      };
    }
  }
}
