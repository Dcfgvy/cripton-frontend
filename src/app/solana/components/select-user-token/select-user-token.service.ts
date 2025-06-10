import { Injectable } from '@angular/core';
import { AccountInfo, Connection, ParsedAccountData, PublicKey, RpcResponseAndContext } from '@solana/web3.js';
import { WalletService } from '../../../wallet/wallet.service';
import { NetworkService } from '../../../network-switch/network-switch.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ExtensionType, getExtensionData, getMetadataPointerState, Mint, TOKEN_PROGRAM_ID, unpackMint } from '@solana/spl-token';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { deserializeMetadata, Metadata } from '@dcfgvy/mpl-token-metadata';
import { fromWeb3JsPublicKey, toWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { sol } from '@metaplex-foundation/umi';
import { unpack, TokenMetadata as SplTokenMetadata } from '@solana/spl-token-metadata';
import { METADATA_PROGRAM_ID } from '../../constants/token.constants';

export interface TokenData {
  mint: PublicKey;
  tokenProgram: PublicKey;
  balanceInDecimals: bigint;
  supplyInDecimals: bigint;
  decimals: number;
  name: string;

  freezeAuthority: PublicKey | null;
  mintAuthority: PublicKey | null;

  metadata?: {
    symbol: string;
    uri: string;
    imageUrl?: string;
    /** Always points either to the token metadata extension or to the Metaplex metadata account. */
    metadataPointer?: {
      metadataAddress: PublicKey;
      authority: PublicKey | null;
    };
    /** Only one of `tokenMetadata` or `metaplexMetadata` can be present at a time. */
    tokenMetadata?: {
      updateAuthority: PublicKey | null;
    },
    /** Only one of `tokenMetadata` or `metaplexMetadata` can be present at a time. */
    metaplexMetadata?: {
      updateAuthority: PublicKey | null;
      isMutable: boolean;
    }
  }
}

interface ParsedTokenAccountInfo {
  extensions?: any[];
  isNative: boolean;
  mint: PublicKey;
  owner: PublicKey;
  state: string;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  }
  programId: PublicKey;
}

@Injectable({
  providedIn: 'root'
})
export class SelectUserTokenService {
  constructor(
    private readonly walletService: WalletService,
    private readonly networkService: NetworkService,
    private readonly http: HttpClient,
  ) { }

  async fetchUserTokens(): Promise<TokenData[]> {
    const connection = this.networkService.connection;
    const pubKey = this.walletService.selectedWallet?.publicKey;
    if (!pubKey) return [];

    const { mintAddresses, tokenAccountsInfos } = await this.getParsedTokenAccounts(connection, pubKey);

    // console.log('mintAddresses', mintAddresses);
    // console.log('tokenAccountsInfos', tokenAccountsInfos);
    
    const metaplexMetadataAddresses = this.getMetaplexMetadataAccounts(mintAddresses);
    const { mintAccountsInfoMap, metaplexAccountsInfoMap } = await this.fetchMintAndMetaplexAccountsInfo(connection, mintAddresses, tokenAccountsInfos, metaplexMetadataAddresses);

    // console.log('mintAccountsInfoMap', mintAccountsInfoMap);
    // console.log('metaplexAccountsInfoMap', metaplexAccountsInfoMap);
    // console.log('metaplexAccountsInfoMap keys', Array.from(metaplexAccountsInfoMap.keys()).map(key => key.toBase58()));

    const tokens = await this.parseTokensMetadata(tokenAccountsInfos, mintAccountsInfoMap, metaplexAccountsInfoMap, metaplexMetadataAddresses);
    return this.filterTokens(tokens, tokenAccountsInfos, mintAccountsInfoMap, mintAddresses);
  }

  private async getParsedTokenAccounts(
    connection: Connection,
    userPublicKey: PublicKey,
  ): Promise<{ mintAddresses: PublicKey[]; tokenAccountsInfos: ParsedTokenAccountInfo[] }> {
    // Fetch token accounts for both token programs with a timeout
    const [standardTokens, token2022] = await Promise.race([
      Promise.all([
        connection.getParsedTokenAccountsByOwner(
          userPublicKey,
          { programId: TOKEN_PROGRAM_ID },
        ).catch(() => ({ value: [] })),
        connection.getParsedTokenAccountsByOwner(
          userPublicKey,
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
    const allTokenAccounts = [...standardTokens.value, ...token2022.value];

    const mintAddresses: PublicKey[] = [];
    const tokenAccountsInfos: ParsedTokenAccountInfo[] = [];
    for (const item of allTokenAccounts) {
      const parsedInfo = item.account.data.parsed.info;
      const tokenMint = new PublicKey(parsedInfo.mint);

      // const tokenBalance = Number(parsedInfo.tokenAmount.amount);
      // if (tokenBalance === 0) continue;  // also include 0-balance tokens

      mintAddresses.push(tokenMint);
      tokenAccountsInfos.push({
        ...parsedInfo,
        programId: item.account.owner,
        mint: tokenMint,
        owner: userPublicKey,  // no other options
      });
    }

    return { mintAddresses, tokenAccountsInfos };
  }

  private getMetaplexMetadataAccounts(mintAddresses: PublicKey[]): PublicKey[] {
    const metaplexMetadataAddresses: PublicKey[] = [];

    // For all tokens, derive potential Metaplex metadata address
    for(const tokenMint of mintAddresses){
      const [metaplexAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          tokenMint.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );
      metaplexMetadataAddresses.push(metaplexAddress);
    }

    return metaplexMetadataAddresses;
  }

  private async fetchMintAndMetaplexAccountsInfo(
    connection: Connection,
    mintAddresses: PublicKey[],
    tokenAccountsInfos: ParsedTokenAccountInfo[],
    metaplexMetadataAddresses: PublicKey[]
  ): Promise<{
    mintAccountsInfoMap: Map<PublicKey, Mint>;
    metaplexAccountsInfoMap: Map<PublicKey, Metadata>
  }> {
    // Fetch all mint accounts and potential Metaplex metadata accounts in parallel
    const [mintAccountsInfo, metaplexAccountsInfo] = await Promise.all([
      connection.getMultipleAccountsInfo(mintAddresses),
      connection.getMultipleAccountsInfo(metaplexMetadataAddresses)
    ]);

    const mintAccountsInfoMap = new Map<PublicKey, Mint>();
    for(let i = 0; i < mintAccountsInfo.length; i++){
      const mintAccountInfo = mintAccountsInfo[i];
      if(!mintAccountInfo) continue;
      const unpackedMint = unpackMint(mintAddresses[i], mintAccountInfo, tokenAccountsInfos[i].programId);
      mintAccountsInfoMap.set(mintAddresses[i], unpackedMint);
    }

    const metaplexAccountsInfoMap = new Map<PublicKey, Metadata>();
    for(let i = 0; i < metaplexAccountsInfo.length; i++){
      const metaplexAccountInfo = metaplexAccountsInfo[i];
      if(!metaplexAccountInfo) continue;
      const metadata = deserializeMetadata({
        ...metaplexAccountInfo,
        owner: fromWeb3JsPublicKey(METADATA_PROGRAM_ID),
        lamports: sol(0),
        rentEpoch: BigInt(0),
        publicKey: fromWeb3JsPublicKey(metaplexMetadataAddresses[i])
      });
      metaplexAccountsInfoMap.set(mintAddresses[i], metadata);
    }

    return { mintAccountsInfoMap, metaplexAccountsInfoMap };
  }

  private async parseTokensMetadata(
    tokenAccountsInfos: ParsedTokenAccountInfo[],
    mintAccountsInfoMap: Map<PublicKey, Mint>,
    metaplexAccountsInfoMap: Map<PublicKey, Metadata>,
    metaplexMetadataAddresses: PublicKey[],
  ) {
    const processMetaplexMetadata = (tokenAccountInfo: ParsedTokenAccountInfo, mint: Mint, metadata: Metadata | undefined): TokenData | null => {
      if(metadata === undefined) return null;
      
      const tokenBalance = BigInt(tokenAccountInfo.tokenAmount.amount);
      const tokenDecimals = Number(tokenAccountInfo.tokenAmount.decimals);
      const name = metadata.name.replace(/\0/g, '').trim();

      return {
        mint: mint.address,
        tokenProgram: tokenAccountInfo.programId,
        balanceInDecimals: tokenBalance,
        supplyInDecimals: mint.supply,
        decimals: tokenDecimals,
        freezeAuthority: mint.freezeAuthority,
        mintAuthority: mint.mintAuthority,
        name,
        metadata: {
          symbol: metadata.symbol.replace(/\0/g, '').trim(),
          uri: metadata.uri.replace(/\0/g, '').trim(),
        }
      };
    };
    const getTokenMetadataByMintData = (mintInfo: Mint): SplTokenMetadata | null => {
      const data = getExtensionData(ExtensionType.TokenMetadata, mintInfo.tlvData);
      if (data === null) {
        return null;
      }
      return unpack(data);
    };
    const useJustTheMetaplexMetadata = (tokenAccountInfo: ParsedTokenAccountInfo, mint: Mint, metaplexMetadata: Metadata | undefined): TokenData | null => {
      const data = processMetaplexMetadata(tokenAccountInfo, mint, metaplexMetadata);
      if(data !== null && data.metadata){
        data.metadata.metaplexMetadata = {
          isMutable: metaplexMetadata?.isMutable ?? false,
          updateAuthority: metaplexMetadata?.updateAuthority ? toWeb3JsPublicKey(metaplexMetadata.updateAuthority) : null,
        };
      }
      return data;
    };

    let parsedMetadata: (TokenData | null)[] = await Promise.all(
      tokenAccountsInfos.map(async (tokenAccountInfo, index) => {
        const mint = mintAccountsInfoMap.get(tokenAccountInfo.mint);
        const metaplexMetadata = metaplexAccountsInfoMap.get(tokenAccountInfo.mint);
        if(!mint) return null;

        if(tokenAccountInfo.programId.equals(TOKEN_2022_PROGRAM_ID)) {
          const metadataPointerState = getMetadataPointerState(mint);
          // if there is a metadata pointer
          if(metadataPointerState !== null && metadataPointerState.metadataAddress){

            // if it points to the token metadata extension (stored in the mint itself)
            if(metadataPointerState.metadataAddress.equals(mint.address)){
              const tokenMetadata = getTokenMetadataByMintData(mint);
              if(tokenMetadata !== null){
                const tokenBalance = BigInt(tokenAccountInfo.tokenAmount.amount);
                const tokenDecimals = Number(tokenAccountInfo.tokenAmount.decimals);
                const name = tokenMetadata.name.replace(/\0/g, '').trim();

                return {
                  mint: mint.address,
                  tokenProgram: tokenAccountInfo.programId,
                  balanceInDecimals: tokenBalance,
                  supplyInDecimals: mint.supply,
                  decimals: tokenDecimals,
                  freezeAuthority: mint.freezeAuthority,
                  mintAuthority: mint.mintAuthority,
                  name,
                  metadata: {
                    symbol: tokenMetadata.symbol.replace(/\0/g, '').trim(),
                    uri: tokenMetadata.uri.replace(/\0/g, '').trim(),
                    metadataPointer: {
                      authority: metadataPointerState.authority ?? null,
                      metadataAddress: metadataPointerState.metadataAddress,
                    },
                    tokenMetadata: {
                      updateAuthority: tokenMetadata.updateAuthority ?? null,
                    },
                  },
                };
              }
              return null;
            }

            // if it points to a Metaplex metadata account
            else if(metadataPointerState.metadataAddress.equals(metaplexMetadataAddresses[index])){
              const data = processMetaplexMetadata(tokenAccountInfo, mint, metaplexMetadata);
              if(data !== null && data.metadata){
                data.metadata.metadataPointer = {
                  authority: metadataPointerState.authority ?? null,
                  metadataAddress: metadataPointerState.metadataAddress,
                };
                data.metadata.metaplexMetadata = {
                  isMutable: metaplexMetadata?.isMutable ?? false,
                  updateAuthority: metaplexMetadata?.updateAuthority ? toWeb3JsPublicKey(metaplexMetadata.updateAuthority) : null,
                };
              }
              return data;
            }

            // if points somewhere else
            else {
              return useJustTheMetaplexMetadata(tokenAccountInfo, mint, metaplexMetadata);
            }
          }
          // if there is no metadata pointer
          else {
            return useJustTheMetaplexMetadata(tokenAccountInfo, mint, metaplexMetadata);
          }
        }

        // if it's not a token 2022 token
        else {
          return useJustTheMetaplexMetadata(tokenAccountInfo, mint, metaplexMetadata);
        }
      })
    );
    return parsedMetadata;
  }

  private filterTokens(
    tokens: (TokenData | null)[],
    tokenAccountsInfos: ParsedTokenAccountInfo[],
    mintAccountsInfoMap: Map<PublicKey, Mint>,
    mintAddresses: PublicKey[],
  ): TokenData[] {
    // TODO add defaut images and names for popular tokens like USDC, USDT, etc. that don't have metadata
    const nameOccurrences = new Map<string, number>();
    const unknownTokensMints = new Set<PublicKey>();

    let allTokens = tokens.map((token, index) => {
      if(token !== null){
        nameOccurrences.set(token.name, (nameOccurrences.get(token.name) || 0) + 1);
        return token;
      }
      const mint = mintAccountsInfoMap.get(mintAddresses[index])!;
      unknownTokensMints.add(mint.address);

      const mintAddress = mint.address.toBase58();
      const prefix = mintAddress.slice(0, 4);
      const suffix = mintAddress.slice(-4);
      return {
        mint: mint.address,
        tokenProgram: tokenAccountsInfos[index].programId,
        balanceInDecimals: BigInt(tokenAccountsInfos[index].tokenAmount.amount),
        supplyInDecimals: mint.supply,
        decimals: mint.decimals,
        freezeAuthority: mint.freezeAuthority,
        mintAuthority: mint.mintAuthority,
        name: `Unknown Token (${prefix}...${suffix})`,
      };
    });

    // Add mint address suffix for duplicate names
    allTokens = allTokens.map(token => {
      if (!token) return token;
      
      if (nameOccurrences.get(token.name)! > 1) {
        const mintAddress = token.mint.toBase58();
        const prefix = mintAddress.slice(0, 4);
        const suffix = mintAddress.slice(-4);
        token.name = `${token.name} (${prefix}...${suffix})`;
      }
      return token;
    });
    allTokens.sort((a, b) => {
      const aIsUnknown = unknownTokensMints.has(a.mint);
      const bIsUnknown = unknownTokensMints.has(b.mint);
      
      if (aIsUnknown && !bIsUnknown) return 1;
      if (!aIsUnknown && bIsUnknown) return -1;
      
      return a.name.localeCompare(b.name);
    });

    return allTokens;
  }

  // -------- IMAGES --------

  loadTokenImages(tokens: TokenData[]): Observable<TokenData[]> {
    interface TokenMetadata {
      image?: string;
      logo?: string;

      logoUrl?: string;
      logoURL?: string;
      logoUri?: string;
      logoURI?: string;

      imageUrl?: string;
      imageURL?: string;
      imageUri?: string;
      imageURI?: string;
    }

    // TODO think about the IPFS, Arweave and other rate limits
    const fetchImageUrl = (token: TokenData) => {
      if (token.metadata === undefined) return of(token);
      
      return this.http.get<TokenMetadata>(token.metadata.uri).pipe(
        map(metadata => {
          let imageUrl: string | undefined;
          
          if(metadata.image) imageUrl = metadata.image;
          else if(metadata.logo) imageUrl = metadata.logo;

          else if(metadata.logoUrl) imageUrl = metadata.logoUrl;
          else if(metadata.logoURL) imageUrl = metadata.logoURL;
          else if(metadata.logoUri) imageUrl = metadata.logoUri;
          else if(metadata.logoURI) imageUrl = metadata.logoURI;

          else if(metadata.imageUrl) imageUrl = metadata.imageUrl;
          else if(metadata.imageURL) imageUrl = metadata.imageURL;
          else if(metadata.imageUri) imageUrl = metadata.imageUri;
          else if(metadata.imageURI) imageUrl = metadata.imageURI;

          if(imageUrl && typeof imageUrl === 'string'){
            new URL(imageUrl);
            token.metadata!.imageUrl = imageUrl;
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