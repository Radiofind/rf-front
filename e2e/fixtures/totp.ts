import { createHmac } from 'node:crypto';

const BASE32_ALPHABET: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const STEP_MS: number = 30_000;

const decodeBase32 = (secret: string): Buffer => {
  const bytes: number[] = [];
  let buffer: number = 0;
  let bits: number = 0;

  for (const character of secret) {
    buffer = (buffer << 5) | BASE32_ALPHABET.indexOf(character);
    bits += 5;

    if (bits >= 8) {
      bytes.push((buffer >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
};

export const currentStep = (): number => Math.floor(Date.now() / STEP_MS);

export const totpAt = (secret: string, step: number): string => {
  const counter: Buffer = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hash: Buffer = createHmac('sha1', decodeBase32(secret)).update(counter).digest();
  const offset: number = hash.readUInt8(hash.length - 1) & 0x0f;

  return String((hash.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
};
