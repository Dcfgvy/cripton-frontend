import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WalletService } from '../../../wallet/wallet.service';
import { NetworkService } from '../../../network-switch/network-switch.service';
import { AccountInfo, ParsedAccountData, PublicKey, RpcResponseAndContext } from '@solana/web3.js';
import { 
  TOKEN_2022_PROGRAM_ID, 
  TOKEN_PROGRAM_ID, 
  unpackMint,
  getExtensionTypes,
  getMetadataPointerState,
  Mint,
  ExtensionType,
  getExtensionData
} from '@solana/spl-token';
import { unpack } from '@solana/spl-token-metadata';
import { deserializeMetadata } from '@dcfgvy/mpl-token-metadata';
import { fromWeb3JsPublicKey, toWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { sol } from '@metaplex-foundation/umi';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

interface TokenData {
  mint: PublicKey;
  tokenProgram: PublicKey;
  name: string;
  symbol: string;
  balanceInDecimals: bigint;
  supplyInDecimals: bigint;
  decimals: number;
  uri: string;
  imageUrl?: string;

  freezeAuthority: PublicKey | null;
  mintAuthority: PublicKey | null;
  updateAuthority: PublicKey | null;
  isMutable: boolean;

  metadataDetails?: {
    metadataPointer?: {
      metadataAddress: PublicKey;
      authority: PublicKey;
    };
    tokenMetadata?: {
      updateAuthority: PublicKey | null;
    },
    metaplexMetadata?: {
      updateAuthority: PublicKey | null;
      isMutable: boolean;
    }
  }
}

interface TokenMetadata {
  image?: string;
}

// @Injectable({
//   providedIn: 'root'
// })
class SelectUserTokenService {
  private readonly METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

  constructor(
    private readonly walletService: WalletService,
    private readonly networkService: NetworkService,
    private readonly http: HttpClient,
  ) { }

  // private async processToken2022Metadata(
  //   tokenMint: PublicKey,
  //   mintAccountInfo: AccountInfo<Buffer>,
  //   parsedInfo: any,
  //   mintAccount: any
  // ): Promise<TokenData | null> {
  //   try {
  //     // Check if it's a Token2022 token
  //     if (!mintAccountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
  //       return null;
  //     }

  //     // Get extension types
  //     const extensionTypes = getExtensionTypes(mintAccountInfo.data) as number[];
      
  //     // Check for metadata pointer extension
  //     if (!extensionTypes.includes(51716)) {
  //       // No metadata pointer - check for TokenMetadata extension first
  //       if (extensionTypes.includes(51712)) {
  //         // Process TokenMetadata directly from mint account
  //         const metadata = await getTokenMetadata(
  //           this.networkService.connection,
  //           tokenMint,
  //           'confirmed',
  //           TOKEN_2022_PROGRAM_ID,
  //         );

  //         if (!metadata) {
  //           return null;
  //         }

  //         const tokenBalance = BigInt(parsedInfo.tokenAmount.amount);
  //         const tokenDecimals = Number(parsedInfo.tokenAmount.decimals);

  //         return {
  //           name: metadata.name,
  //           symbol: metadata.symbol,
  //           uri: metadata.uri,
  //           mint: tokenMint,
  //           tokenProgram: TOKEN_2022_PROGRAM_ID,
  //           balanceInDecimals: tokenBalance,
  //           supplyInDecimals: mintAccount.supply,
  //           decimals: tokenDecimals,
  //           freezeAuthority: mintAccount.freezeAuthority,
  //           mintAuthority: mintAccount.mintAuthority,
  //           updateAuthority: metadata.updateAuthority ?? null,
  //           isMutable: true, // Token2022 metadata is always mutable
  //         };
  //       }
  //       // No TokenMetadata extension - try Metaplex metadata as fallback
  //       return this.processMetaplexMetadata(
  //         tokenMint,
  //         mintAccountInfo,
  //         parsedInfo,
  //         mintAccount,
  //         this.METADATA_PROGRAM_ID,
  //         await this.networkService.connection.getAccountInfo(this.METADATA_PROGRAM_ID)
  //       );
  //     }

  //     // Get metadata pointer state by first unpacking the mint account
  //     const unpackedMint = unpackMint(tokenMint, mintAccountInfo, mintAccountInfo.owner);
  //     const metadataPointer = getMetadataPointerState(unpackedMint);
  //     if (!metadataPointer?.authority || !metadataPointer?.metadataAddress) {
  //       return null;
  //     }

  //     // Get metadata account info
  //     const metadataAccountInfo = await this.networkService.connection.getAccountInfo(
  //       metadataPointer.metadataAddress
  //     );

  //     if (!metadataAccountInfo) {
  //       return null;
  //     }

  //     // If metadata address points to a Metaplex account
  //     if (metadataAccountInfo.owner.equals(this.METADATA_PROGRAM_ID)) {
  //       return this.processMetaplexMetadata(
  //         tokenMint,
  //         mintAccountInfo,
  //         parsedInfo,
  //         mintAccount,
  //         metadataPointer.metadataAddress,
  //         metadataAccountInfo
  //       );
  //     }

  //     // Get Token2022 native metadata
  //     const metadata = await getTokenMetadata(
  //       this.networkService.connection,
  //       metadataPointer.metadataAddress,
  //       'confirmed',
  //       TOKEN_2022_PROGRAM_ID,
  //     );

  //     if (!metadata) {
  //       return null;
  //     }

  //     const tokenBalance = BigInt(parsedInfo.tokenAmount.amount);
  //     const tokenDecimals = Number(parsedInfo.tokenAmount.decimals);

  //     return {
  //       name: metadata.name,
  //       symbol: metadata.symbol,
  //       uri: metadata.uri,
  //       mint: tokenMint,
  //       tokenProgram: TOKEN_2022_PROGRAM_ID,
  //       balanceInDecimals: tokenBalance,
  //       supplyInDecimals: mintAccount.supply,
  //       decimals: tokenDecimals,
  //       freezeAuthority: mintAccount.freezeAuthority,
  //       mintAuthority: mintAccount.mintAuthority,
  //       updateAuthority: metadataPointer.authority,
  //       isMutable: true, // Token2022 metadata is always mutable
  //     };
  //   } catch (error) {
  //     console.error(`Failed to process Token2022 metadata for ${tokenMint.toString()}:`, error);
  //     return null;
  //   }
  // }
  private getTokenMetadataByMintData(mintInfo: Mint){
    const data = getExtensionData(ExtensionType.TokenMetadata, mintInfo.tlvData);
    if (data === null) {
      return null;
    }
    return unpack(data);
  }

  private processMetaplexMetadata(
    tokenMint: PublicKey,
    mintAccountInfo: AccountInfo<Buffer>,
    parsedInfo: any,
    mintAccount: any,
    metadataAddress: PublicKey,
    metadataAccountInfo: AccountInfo<Buffer> | null
  ): TokenData | null {
    try {
      if (!metadataAccountInfo || !metadataAccountInfo.data) {
        return null;
      }

      const metadata = deserializeMetadata({
        ...metadataAccountInfo,
        data: metadataAccountInfo.data,
        executable: false,
        owner: fromWeb3JsPublicKey(this.METADATA_PROGRAM_ID),
        lamports: sol(0),
        rentEpoch: BigInt(0),
        publicKey: fromWeb3JsPublicKey(metadataAddress)
      });

      const tokenBalance = BigInt(parsedInfo.tokenAmount.amount);
      const tokenDecimals = Number(parsedInfo.tokenAmount.decimals);
      const name = metadata.name.replace(/\0/g, '').trim();

      return {
        name,
        symbol: metadata.symbol.replace(/\0/g, '').trim(),
        uri: metadata.uri.replace(/\0/g, '').trim(),
        mint: toWeb3JsPublicKey(metadata.mint),
        tokenProgram: mintAccountInfo.owner,
        balanceInDecimals: tokenBalance,
        supplyInDecimals: mintAccount.supply,
        decimals: tokenDecimals,
        freezeAuthority: mintAccount.freezeAuthority,
        mintAuthority: mintAccount.mintAuthority,
        updateAuthority: toWeb3JsPublicKey(metadata.updateAuthority),
        isMutable: metadata.isMutable,
      };
    } catch (error) {
      console.error(`Failed to process Metaplex metadata for ${tokenMint.toString()}:`, error);
      return null;
    }
  }

  /** fetch all user tokens in 3 RPC calls */
  async getUserTokens(): Promise<TokenData[]> {
    try {
      const connection = this.networkService.connection;
      const pubKey = this.walletService.selectedWallet?.publicKey;
      if (!pubKey) return [];

      // Fetch token accounts for both programs with a timeout
      const [standardTokens, token2022] = await Promise.race([
        Promise.all([
          connection.getParsedTokenAccountsByOwner(
            pubKey,
            { programId: TOKEN_PROGRAM_ID },
          ).catch(() => ({ value: [] })),
          connection.getParsedTokenAccountsByOwner(
            pubKey,
            { programId: TOKEN_2022_PROGRAM_ID },
          ).catch(() => ({ value: [] })),
        ]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Failed to fetch token accounts after 10 seconds')), 10_000)
        )
      ]) as [RpcResponseAndContext<Array<{
        pubkey: PublicKey;
        account: AccountInfo<ParsedAccountData>;
      }>>, RpcResponseAndContext<Array<{
        pubkey: PublicKey;
        account: AccountInfo<ParsedAccountData>;
      }>>];

      const response = {
        value: [...standardTokens.value, ...token2022.value]
      };

      // Collect all accounts we need to fetch
      const mintAddresses: PublicKey[] = [];
      const metaplexMetadataAddresses: PublicKey[] = [];
      const tokenInfos: { parsedInfo: any; isToken2022: boolean }[] = [];

      for (const item of response.value) {
        const parsedInfo = item.account.data.parsed.info;
        const tokenBalance = Number(parsedInfo.tokenAmount.amount);
        const tokenMint = new PublicKey(parsedInfo.mint);
        const isToken2022 = item.account.owner.equals(TOKEN_2022_PROGRAM_ID);

        if (tokenBalance === 0) continue;

        // Always add mint address
        mintAddresses.push(tokenMint);
        tokenInfos.push({ parsedInfo, isToken2022 });

        // For all tokens, derive potential Metaplex metadata address
        const [metaplexAddress] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            this.METADATA_PROGRAM_ID.toBuffer(),
            tokenMint.toBuffer(),
          ],
          this.METADATA_PROGRAM_ID
        );
        metaplexMetadataAddresses.push(metaplexAddress);
      }

      // Fetch all mint accounts and potential Metaplex metadata accounts in parallel
      const [mintAccountsInfo, metaplexAccountsInfo] = await Promise.all([
        connection.getMultipleAccountsInfo(mintAddresses),
        connection.getMultipleAccountsInfo(metaplexMetadataAddresses)
      ]);

      // Collect Token2022 metadata addresses from metadata pointers
      const token2022MetadataAddresses: PublicKey[] = [];
      const token2022MetadataIndices: number[] = [];
      const token2022UnpackedMints: Map<PublicKey, Mint> = new Map();

      mintAccountsInfo?.forEach((mintInfo, index) => {
        if (!mintInfo || !tokenInfos[index].isToken2022) return;

        const extensionTypes = getExtensionTypes(mintInfo.data) as number[];
        
        const unpackedMint = unpackMint(mintAddresses[index], mintInfo, mintInfo.owner);
        token2022UnpackedMints.set(mintAddresses[index], unpackedMint);
        if (extensionTypes.includes(51716)) { // MetadataPointer
          const metadataPointer = getMetadataPointerState(unpackedMint);
          if (metadataPointer?.metadataAddress) {
            token2022MetadataAddresses.push(metadataPointer.metadataAddress);
            token2022MetadataIndices.push(index);
          }
        }
      });

      // Fetch Token2022 metadata accounts in one batch if any exist
      const token2022AccountsInfo = token2022MetadataAddresses.length > 0 
        ? await connection.getMultipleAccountsInfo(token2022MetadataAddresses)
        : [];
      token2022MetadataAddresses.forEach((address, index) => {
        if(!token2022AccountsInfo[index]) return;
        const unpackedMint = unpackMint(address, token2022AccountsInfo[index], token2022AccountsInfo[index].owner);
        token2022UnpackedMints.set(address, unpackedMint);
      });

      // Process all tokens
      const nameOccurrences = new Map<string, number>();
      let parsedMetadata: (TokenData | null)[] = await Promise.all(
        mintAddresses.map(async (tokenMint, index) => {
          if (!mintAccountsInfo?.[index]) return null;

          const mintInfo = mintAccountsInfo[index];
          const { parsedInfo, isToken2022 } = tokenInfos[index];
          const mintAccount = unpackMint(tokenMint, mintInfo, mintInfo.owner);

          if (!isToken2022) {
            // Try Metaplex metadata
            const metaplexInfo = metaplexAccountsInfo?.[index];
            if (!metaplexInfo) return null;

            return this.processMetaplexMetadata(
              tokenMint,
              mintInfo,
              parsedInfo,
              mintAccount,
              metaplexMetadataAddresses[index],
              metaplexInfo
            );
          }

          // Process Token2022
          const extensionTypes = getExtensionTypes(mintInfo.data) as number[];

          // Check for metadata pointer
          if (extensionTypes.includes(51716)) {
            const token2022Index = token2022MetadataIndices.indexOf(index);
            if (token2022Index === -1) return null;

            const metadataInfo = token2022AccountsInfo[token2022Index];
            if (!metadataInfo) return null;

            // If points to Metaplex account
            if (metadataInfo.owner.equals(this.METADATA_PROGRAM_ID)) {
              return this.processMetaplexMetadata(
                tokenMint,
                mintInfo,
                parsedInfo,
                mintAccount,
                token2022MetadataAddresses[token2022Index],
                metadataInfo
              );
            }

            // Process Token2022 metadata
            const unpackedMint = token2022UnpackedMints.get(token2022MetadataAddresses[token2022Index]);
            if (!unpackedMint) return null;
            const metadata = this.getTokenMetadataByMintData(
              unpackedMint
            );
            if (!metadata) return null;

            return {
              name: metadata.name,
              symbol: metadata.symbol,
              uri: metadata.uri,
              mint: tokenMint,
              tokenProgram: TOKEN_2022_PROGRAM_ID,
              balanceInDecimals: BigInt(parsedInfo.tokenAmount.amount),
              supplyInDecimals: mintAccount.supply,
              decimals: Number(parsedInfo.tokenAmount.decimals),
              freezeAuthority: mintAccount.freezeAuthority,
              mintAuthority: mintAccount.mintAuthority,
              updateAuthority: metadata.updateAuthority ?? null,
              isMutable: true,
            };
          }

          // Check for direct TokenMetadata
          if (extensionTypes.includes(51712)) {
            const unpackedMint = token2022UnpackedMints.get(tokenMint);
            if (!unpackedMint) return null;
            const metadata = this.getTokenMetadataByMintData(
              unpackedMint
            );

            if (!metadata) return null;

            return {
              name: metadata.name,
              symbol: metadata.symbol,
              uri: metadata.uri,
              mint: tokenMint,
              tokenProgram: TOKEN_2022_PROGRAM_ID,
              balanceInDecimals: BigInt(parsedInfo.tokenAmount.amount),
              supplyInDecimals: mintAccount.supply,
              decimals: Number(parsedInfo.tokenAmount.decimals),
              freezeAuthority: mintAccount.freezeAuthority,
              mintAuthority: mintAccount.mintAuthority,
              updateAuthority: metadata.updateAuthority ?? null,
              isMutable: true
            };
          }

          // Try Metaplex as fallback
          const metaplexInfo = metaplexAccountsInfo?.[index];
          if (!metaplexInfo) return null;

          return this.processMetaplexMetadata(
            tokenMint,
            mintInfo,
            parsedInfo,
            mintAccount,
            metaplexMetadataAddresses[index],
            metaplexInfo
          );
        })
      );

      // Filter out nulls and handle name collisions
      parsedMetadata = parsedMetadata.filter(token => {
        if (!token) return false;
        
        nameOccurrences.set(token.name, (nameOccurrences.get(token.name) || 0) + 1);
        return true;
      });

      // Add mint address suffix for duplicate names
      parsedMetadata = parsedMetadata.map(token => {
        if (!token) return token;
        
        if (nameOccurrences.get(token.name)! > 1) {
          const mintAddress = token.mint;
          const prefix = mintAddress.toBase58().slice(0, 4);
          const suffix = mintAddress.toBase58().slice(-4);
          token.name = `${token.name} (${prefix}...${suffix})`;
        }
        return token;
      });

      parsedMetadata.sort((a, b) => a!.name.localeCompare(b!.name));
      return parsedMetadata as TokenData[];
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      return [];
    }
  }

  loadTokenImages(tokens: TokenData[]): Observable<TokenData[]> {
    const fetchImageUrl = (token: TokenData) => {
      return this.http.get<TokenMetadata>(token.uri).pipe(
        map(metadata => {
          if (metadata.image && typeof metadata.image === 'string') {
            try {
              new URL(metadata.image);
              token.imageUrl = metadata.image;
            } catch {
              console.warn(`Invalid image URL for token ${token.name}: ${metadata.image}`);
            }
          }
          return token;
        }),
        catchError(error => {
          console.warn(`Failed to fetch metadata for token ${token.name}:`, error);
          return of(token);
        })
      );
    };

    return forkJoin(tokens.map(token => fetchImageUrl(token)));
  }
}