import type { Environment } from "./environment.interface";

export const environment: Environment = {
  production: false,
  serviceName: 'Cripton',
  serviceWebsite: 'https://cripton.app',
  apiUrl: 'http://localhost:3444',
  socials: {
    telegram: 'https://t.me/cripton_app',
  },

  solana: {
    rpcUrls: {
      'mainnet-beta': 'https://lb.drpc.org/ogrpc?network=solana&dkey=AnwthBMQyk6Nn04E_iyiffZt40l9H4sR8LjzxiVsY8sN',
      'devnet': 'https://lb.drpc.org/ogrpc?network=solana-devnet&dkey=AnwthBMQyk6Nn04E_iyiffZt40l9H4sR8LjzxiVsY8sN'
    },
    feeMultiplier: 3, // indicates current discount that will be shown
  },

  ssrApiUrl: 'http://localhost:3444',
  ssrCacheExpirySeconds: 1,
}