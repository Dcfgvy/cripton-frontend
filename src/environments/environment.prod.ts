import type { Environment } from "./environment.interface";

export const environment: Environment = {
  production: true,
  serviceName: 'Cripton',
  serviceWebsite: 'https://cripton.app',
  apiUrl: 'https://cripton.app',
  socials: {
    telegram: 'https://t.me/cripton_app',
  },

  solana: {
    rpcUrls: {
      'mainnet-beta': 'https://lb.drpc.org/ogrpc?network=solana&dkey=AnwthBMQyk6Nn04E_iyiffaqkpYPOHsR8KxEbrRhIxXF',
      'devnet': 'https://lb.drpc.org/ogrpc?network=solana-devnet&dkey=AnwthBMQyk6Nn04E_iyiffaqkpYPOHsR8KxEbrRhIxXF'
    },
    feeMultiplier: 3, // indicates current discount that will be shown
  },

  ssrApiUrl: 'https://cripton.app',
  ssrCacheExpirySeconds: 60,
}