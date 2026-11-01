import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { jwtSecret } from '../../config/env.js';

/**
 * AES-256-GCM for secrets stored in the database (Google refresh tokens), so
 * a leaked database dump alone does not grant access to anyone's calendar.
 *
 * The key is derived from JWT_SECRET with a purpose label. Rotating
 * JWT_SECRET therefore makes stored tokens unreadable; hosts then reconnect.
 */
const KEY = createHash('sha256').update(`calendly:secret-box:v1:${jwtSecret}`).digest();
const IV_BYTES = 12;
const TAG_BYTES = 16;

/** Returns base64 of iv | auth tag | ciphertext. */
export function sealSecret(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64');
}

/** Returns the plaintext, or null if the value was tampered with or the key changed. */
export function openSecret(sealed: string): string | null {
  try {
    const raw = Buffer.from(sealed, 'base64');
    const iv = raw.subarray(0, IV_BYTES);
    const tag = raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
    const decipher = createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    const ciphertext = raw.subarray(IV_BYTES + TAG_BYTES);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
