/* eslint-disable n/prefer-global/buffer */
/* eslint-disable unicorn/prefer-node-protocol */
import { Buffer } from 'buffer';

if (!globalThis.Buffer) {
  (globalThis as typeof globalThis & { Buffer?: typeof Buffer }).Buffer = Buffer;
}

export {};
