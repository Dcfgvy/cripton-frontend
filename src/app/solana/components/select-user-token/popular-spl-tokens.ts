interface SplToken {
  symbol: string;
  name: string;
  imageUrl: string;
}

export interface TokensByNetwork {
  'mainnet-beta': { [mintAddress: string]: SplToken };
  'devnet': { [mintAddress: string]: SplToken };
}

export const popularSplTokens: TokensByNetwork = {
  'mainnet-beta': {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
      symbol: 'USDC',
      name: 'USD Coin',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
      symbol: 'USDT',
      name: 'Tether USD',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
    },
    'USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX': {
      symbol: 'USDH',
      name: 'Hedge USD',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX/logo.png'
    },
    'Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS': {
      symbol: 'PAI',
      name: 'Parrot USD',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS/logo.png'
    },
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': {
      symbol: 'soBTC',
      name: 'Wrapped Bitcoin (Sollet)',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png'
    },
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': {
      symbol: 'soETH',
      name: 'Wrapped Ethereum (Sollet)',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png'
    },
    'So11111111111111111111111111111111111111112': {
      symbol: 'wSOL',
      name: 'Wrapped SOL',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    'KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE': {
      symbol: 'WAVAX',
      name: 'Wrapped AVAX',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE/logo.png'
    },
    'Gz7VkD4MacbEB6yC5XD3HcumEiYx2EtDYYrfikGsvopG': {
      symbol: 'WMATIC',
      name: 'Wrapped MATIC',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Gz7VkD4MacbEB6yC5XD3HcumEiYx2EtDYYrfikGsvopG/logo.png'
    },
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': {
      symbol: 'RAY',
      name: 'Raydium',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png'
    },
    'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': {
      symbol: 'SRM',
      name: 'Serum',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png'
    }
  },

  'devnet': {
    'So11111111111111111111111111111111111111112': {
      symbol: 'wSOL',
      name: 'Wrapped SOL',
      imageUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    }
  }
};