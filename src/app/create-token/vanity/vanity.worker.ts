/// <reference lib="webworker" />
import { Keypair } from '@solana/web3.js';

addEventListener('message', ({ data }) => {
  const { prefix, suffix, caseSensitive } = data;

  while (true) {
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const compareKey = caseSensitive ? publicKey : publicKey.toLowerCase();

    if (compareKey.startsWith(prefix) && compareKey.endsWith(suffix)) {
      postMessage({
        publicKey: keypair.publicKey.toBase58(),
        secretKey: Array.from(keypair.secretKey),
      });
      break;
    }
  }
});
