/**
 * stellar/keypair.ts
 *
 * Generates Stellar keypairs and encrypts secret keys using AES-256-GCM.
 * Secret keys are NEVER stored in plaintext — only the encrypted blob goes to DB.
 *
 * Encryption schema:
 *   { iv: base64, authTag: base64, ciphertext: base64 } → JSON → base64 stored in DB
 *
 * Requires: VAULT_ENCRYPTION_KEY in .env (32-byte hex string)
 * Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { Keypair } from "@stellar/stellar-sdk";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const hex = process.env.VAULT_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "[Keypair] VAULT_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).\n" +
      "Generate one: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/** Encrypt a Stellar secret key (S...) and return an opaque base64 blob */
export function encryptSecret(secretKey: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // 96-bit IV for GCM

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(secretKey, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const payload = {
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/** Decrypt an encrypted blob back to the Stellar secret key (S...) */
export function decryptSecret(blob: string): string {
  const key = getEncryptionKey();
  const { iv, authTag, ciphertext } = JSON.parse(
    Buffer.from(blob, "base64").toString("utf8")
  );

  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}

/**
 * Generate a brand-new random Stellar keypair.
 * Returns publicKey (G...) and encryptedSecret (opaque blob for DB storage).
 */
export function generateVaultKeypair(): {
  publicKey: string;
  encryptedSecret: string;
} {
  const kp = Keypair.random();
  return {
    publicKey: kp.publicKey(),
    encryptedSecret: encryptSecret(kp.secret()),
  };
}

/** Reconstruct a Keypair from an encrypted DB blob */
export function loadKeypairFromBlob(encryptedSecret: string): typeof Keypair.prototype {
  const secret = decryptSecret(encryptedSecret);
  return Keypair.fromSecret(secret);
}
