export interface Environment {
  production: boolean;
  serviceName: string;
  serviceWebsite: string;
  apiUrl: string;
  socials: {
    telegram: string;
  };
  
  solana: {
    rpcUrls: {
      'mainnet-beta': string;
      'devnet': string;
    };
    feeMultiplier: number;
  };
  
  ssrApiUrl: string;
  ssrCacheExpirySeconds: number;
}