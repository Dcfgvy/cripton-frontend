// Create a new file called buffer-polyfill.ts
import { Buffer as BufferPolyfill } from 'buffer';

// This makes Buffer available globally to all modules
globalThis.Buffer = BufferPolyfill;