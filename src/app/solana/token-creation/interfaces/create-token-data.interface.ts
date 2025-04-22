import type { Keypair, PublicKey } from "@solana/web3.js";

export type SupplyDistributionArray = {
  address: string;
  share: number; // in percents, guaranteed to sum up to 100
}[];

export interface CreateTokenData {
  mint: Keypair;
  name: string;
  symbol: string;
  decimals: number;
  supply: bigint;
  metadataUri: string;
  supplyDistribution: SupplyDistributionArray;
  freezeAuthority?: string;
  mintAuthority?: string;
  updateAuthority?: string;
  isMutable: boolean;
  creators: {
    address: PublicKey;
    verified: boolean;
    share: number;
  }[];
  
  totalCost: number;
}