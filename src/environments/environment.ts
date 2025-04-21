export const environment = {
  production: false,
  serviceName: 'Token Generator',
  serviceWebsite: 'https://token-generator.com',
  apiUrl: 'http://localhost:3444',

  solana: {
    rpcUrls: {
      'mainnet-beta': 'https://lb.drpc.org/ogrpc?network=solana&dkey=AnwthBMQyk6Nn04E_iyiffYNqNFpGh4R8K8gokw6Xrs6',
      'devnet': 'https://lb.drpc.org/ogrpc?network=solana-devnet&dkey=AnwthBMQyk6Nn04E_iyiffYNqNFpGh4R8K8gokw6Xrs6'
    },
    feeMultiplier: 3, // indicates current discount that will be shown
  },

  ssrApiUrl: 'http://localhost:3444',
  ssrCacheExpirySeconds: 1,
}