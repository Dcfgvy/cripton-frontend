import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface TrendingTokenSocials {
  website?: string;
  twitter?: string;
  telegram?: string;
}

export interface TrendingToken {
  tokenUrl: string;
  mint: string;
  name: string;
  symbol: string;
  metadataUri: string;
  imageUrl: string;
  supply: string;
  decimals: number;

  isMutable: boolean;
  updateAuthority: string | null;
  sellerFeeBasisPoints: number;
  creators: {
    readonly address: string;
    readonly verified: boolean;
    readonly share: number;
  }[];
  socials: TrendingTokenSocials;

  collection: any;
  collectionDetails: any;
  uses: any;

  holdersCount: number;
  sniperCount: number;
  marketCap: number;
  graduationProgress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrendingTokensService {

  constructor(
    private readonly http: HttpClient
  ) {}

  fetchTrendingTokens(){
    return this.http.get<{ data: TrendingToken[] }>(`${environment.apiUrl}/api/trending-tokens`);
  }
}
