// lib/crypto.ts
// FIX 1: AES-256-GCM encryption for GitHub tokens stored in the database.
// ENCRYPTION_SECRET must be exactly 32 bytes (64 hex chars).
// Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALG = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_SECRET;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_SECRET must be a 64-character hex string (32 bytes). " +
      "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt plaintext → "iv:authTag:ciphertext" (all hex)
 * Safe to store in the database.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv  = randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = createCipheriv(ALG, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypt "iv:authTag:ciphertext" → plaintext.
 * Returns null if decryption fails (e.g. tampered data, wrong key).
 */
export function decrypt(stored: string): string | null {
  try {
    const [ivHex, authTagHex, encryptedHex] = stored.split(":");
    if (!ivHex || !authTagHex || !encryptedHex) return null;

    const key       = getKey();
    const iv        = Buffer.from(ivHex,        "hex");
    const authTag   = Buffer.from(authTagHex,   "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher  = createDecipheriv(ALG, key, iv);
    decipher.setAuthTag(authTag);

    return decipher.update(encrypted) + decipher.final("utf8");
  } catch {
    return null;
  }
}

/**
 * Detect whether a stored value looks like an encrypted token
 * (i.e. contains our delimiter structure) vs a raw token (legacy).
 */
export function isEncrypted(value: string): boolean {
  return value.split(":").length === 3;
}

/**
 * Safe decrypt — handles legacy plaintext tokens stored before encryption
 * was introduced, so existing rows don't break immediately.
 */
export function safeDecrypt(stored: string): string {
  if (isEncrypted(stored)) {
    return decrypt(stored) ?? stored; // fallback to raw if decrypt fails
  }
  return stored; // legacy plaintext token
}
