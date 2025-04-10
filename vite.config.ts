/*
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

console.log('Loading Vite config!');

export default defineConfig({
  plugins: [
    angular(),
    nodePolyfills({
      include: ['buffer', 'process', 'crypto'],
      // Using 'build' ensures the polyfill is available in both dev and production
      globals: {
        Buffer: 'build',
        global: 'build',
        process: 'build'
      }
    })
  ],
  define: {
    'globalThis.Buffer': 'Buffer'
  }
});
*/