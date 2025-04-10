import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js';
import { WalletService } from '../wallet/wallet.service';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { NetworkService } from '../network-switch/network-switch.service';

// import {
//   TOKEN_PROGRAM_ID,
//   MintLayout,
//   AuthorityType,
//   createInitializeMintInstruction,
//   createAssociatedTokenAccountInstruction,
//   createMintToInstruction,
//   createSetAuthorityInstruction,
//   getAssociatedTokenAddressSync
// } from '@solana/spl-token';
// import { Buffer } from 'buffer';
// import {
//   createMetadataAccountV3,
//   findMetadataPda
// } from '@metaplex-foundation/mpl-token-metadata';
// import { createUmi } from '@metaplex-foundation/umi';
// import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
// import { WalletAdapter } from '@solana/wallet-adapter-base';

export interface TokenSocials {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  youtube?: string;
  medium?: string;
  github?: string;
  instagram?: string;
  reddit?: string;
  facebook?: string;
}

export interface TokenImageData {
  imageData?: File;
  imageUrl?: string;
}

export interface TokenUploadMetadata {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  creatorName?: string;
  creatorWebsite?: string;
  tags: string[];
  tokenSocials: TokenSocials;
}

export interface CreateTokenData {
  mint: Keypair;
  name: string;
  symbol: string;
  decimals: number;
  supply: bigint;
  metadataUri: string;
  supplyDistribution: {
    address: string;
    share: number; // in percents, guaranteed to sum up to 100
  }[];
  freezeAuthority?: string;
  mintAuthority?: string;
  updateAuthority?: string;
  isMutable: boolean;
  
  totalCost: number;
}

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

  /*
  public async OLDcreateToken(data: CreateTokenData) {
    const userPublicKey = this.walletService.selectedWallet?.publicKey;
    const developerAddress = this.settingsService.currentSettings?.solanaAddress;
    if (!userPublicKey) throw new Error('User wallet is not connected');
    if (!developerAddress) throw new Error('Internal error');

    const umi = createUmi().use(walletAdapterIdentity(this.walletService.selectedWallet! as WalletAdapter))
  
    // Create connection to the network
    const connection = new Connection(this.networkService.selectedNetwork.url);
    
    // Prepare mint and instructions
    const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
    
    // Instructions array
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
    
    // Create metadata account
    const metadataAccount = findMetadataPda(data.mint.publicKey);
    
    // Convert update authority if provided
    let updateAuthority = userPublicKey;
    if (data.updateAuthority) {
      updateAuthority = new PublicKey(data.updateAuthority);
    }
    
    instructions.push(
      createMetadataAccountV3(umi,
        {
          mint
          data: {
            name: data.name,
            symbol: data.symbol,
            uri: data.metadataUri,
            sellerFeeBasisPoints: 0,
            creators: [{
              address: userPublicKey,
              verified: false,
              share: 100,
            }],
            collection: null,
            uses: null,
          },
          isMutable: data.isMutable,
          collectionDetails: null,
        }
      )
    );
    
    // Create ATAs and mint tokens
    for (const recipient of data.supplyDistribution) {
      const recipientPubkey = new PublicKey(recipient.address);
      
      // Calculate amount to mint for this recipient
      const shareAmount = (data.supply * BigInt(recipient.share)) / BigInt(100);
      const mintAmount = shareAmount * BigInt(10) ** BigInt(data.decimals);
      
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
    if (data.mintAuthority !== undefined) {
      const newMintAuthority = data.mintAuthority ? new PublicKey(data.mintAuthority) : null;
      
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
    
    // Calculate fees and add developer fee if necessary
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = userPublicKey;
    
    // Get recent blockhash for fee calculation
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Add signer
    transaction.sign(data.mint);
    
    // Calculate fees for current transaction
    const fees = await connection.getFeeForMessage(transaction.compileMessage());
    const feesValue = fees.value || 0;

    if (feesValue < data.totalCost) {
      // Calculate the remaining amount to transfer to developer
      const remainingAmount = data.totalCost - feesValue;
      
      // Add transfer instruction
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: new PublicKey(developerAddress),
          lamports: remainingAmount
        })
      );
      
      // Rebuild transaction with the fee transfer
      const finalTransaction = new Transaction().add(...instructions);
      finalTransaction.feePayer = userPublicKey;
      finalTransaction.recentBlockhash = blockhash;
      
      // Send transaction for signing and broadcasting
      if(!this.walletService.selectedWallet) throw new Error('User wallet is not connected');
      try {
        const signedTransaction = await this.walletService.selectedWallet.signTransaction(finalTransaction);
        const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        });
        
        return {
          txid,
          mintAddress: data.mint.publicKey.toBase58()
        };
      } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error('Failed to create token: ' + (error as any).message);
      }
    } else {
      // If fees exceed or equal totalCost, just send the transaction without developer fee
      if(!this.walletService.selectedWallet) throw new Error('User wallet is not connected');
      try {
        const signedTransaction = await this.walletService.selectedWallet.signTransaction(transaction as Transaction);
        const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        });
        
        return {
          txid,
          mintAddress: data.mint.publicKey.toBase58()
        };
      } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error('Failed to create token: ' + (error as any).message);
      }
    }
  }
  */

  /*
  public async createToken(data: CreateTokenData) {
    const userPublicKey = this.walletService.selectedWallet?.publicKey;
    const developerAddress = this.settingsService.currentSettings?.solanaAddress;
    if (!userPublicKey) throw new Error('User wallet is not connected');
    if (!developerAddress) throw new Error('Internal error');
  
    // Create connection to the network
    const connection = new Connection(this.networkService.selectedNetwork.url);
    
    // Prepare mint and instructions
    const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
    
    // Instructions array
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
    
    // Create metadata using the correct Metaplex token metadata program
    const metadataProgramId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    
    // Derive the metadata account PDA
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        metadataProgramId.toBuffer(),
        data.mint.publicKey.toBuffer()
      ],
      metadataProgramId
    );
    
    // Convert update authority if provided
    let updateAuthority = userPublicKey;
    if (data.updateAuthority) {
      updateAuthority = new PublicKey(data.updateAuthority);
    }
    
    // Create metadata account instruction
    const createMetadataInstruction = new TransactionInstruction({
      keys: [
        { pubkey: metadataAccount, isSigner: false, isWritable: true },
        { pubkey: data.mint.publicKey, isSigner: false, isWritable: false },
        { pubkey: userPublicKey, isSigner: true, isWritable: false },
        { pubkey: userPublicKey, isSigner: true, isWritable: false },
        { pubkey: updateAuthority, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: metadataProgramId,
      data: Buffer.from(
        Uint8Array.of(
          0, // Create metadata instruction
          ...Buffer.from(data.name),
          0, // Name terminator
          ...Buffer.from(data.symbol),
          0, // Symbol terminator
          ...Buffer.from(data.metadataUri),
          0, // URI terminator
          data.isMutable ? 1 : 0 // Is mutable
        )
      )
    });
    
    instructions.push(createMetadataInstruction);
    
    // Create ATAs and mint tokens
    for (const recipient of data.supplyDistribution) {
      const recipientPubkey = new PublicKey(recipient.address);
      
      // Calculate amount to mint for this recipient
      const shareAmount = (data.supply * BigInt(recipient.share)) / BigInt(100);
      const mintAmount = shareAmount * BigInt(10) ** BigInt(data.decimals);
      
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
    if (data.mintAuthority !== undefined) {
      const newMintAuthority = data.mintAuthority ? new PublicKey(data.mintAuthority) : null;
      
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
    
    // Calculate fees and add developer fee if necessary
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = userPublicKey;
    
    // Get recent blockhash for fee calculation
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Add signer
    transaction.partialSign(data.mint);
    
    // Calculate fees for current transaction
    const fees = await connection.getFeeForMessage(transaction.compileMessage());
    const feesValue = fees.value || 0;
    
    if (feesValue < data.totalCost * LAMPORTS_PER_SOL) {
      // Calculate the remaining amount to transfer to developer
      const remainingAmount = data.totalCost * LAMPORTS_PER_SOL - feesValue;
      
      // Add transfer instruction
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: new PublicKey(developerAddress),
          lamports: remainingAmount
        })
      );
      
      // Rebuild transaction with the fee transfer
      const finalTransaction = new Transaction().add(...instructions);
      finalTransaction.feePayer = userPublicKey;
      finalTransaction.recentBlockhash = blockhash;
      finalTransaction.partialSign(data.mint);
      
      // Send transaction for signing and broadcasting
      if(!this.walletService.selectedWallet) throw new Error('User wallet is not connected');
      try {
        // Use the correct type for signTransaction
        const txid = await this.walletService.selectedWallet.sendTransaction(finalTransaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        });
        
        return {
          txid,
          mintAddress: data.mint.publicKey.toBase58()
        };
      } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error('Failed to create token: ' + (error as Error).message);
      }
    } else {
      // If fees exceed or equal totalCost, just send the transaction without developer fee
      if(!this.walletService.selectedWallet) throw new Error('User wallet is not connected');
      try {
        const txid = await this.walletService.selectedWallet.sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        });
        
        return {
          txid,
          mintAddress: data.mint.publicKey.toBase58()
        };
      } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error('Failed to create token: ' + (error as Error).message);
      }
    }
  }
  */
}
