/**
 * scripts/genKeypair.ts
 *
 * Generate a new random Stellar keypair for use as the AutoPilot engine account.
 *
 * Usage: npx tsx src/scripts/genKeypair.ts
 *
 * Copy the output into your backend/.env:
 *   AUTOPILOT_SECRET_KEY=S...
 *   AUTOPILOT_PUBLIC_KEY=G...
 *
 * Then fund the account on testnet:
 *   npm run friendbot
 */

import { Keypair } from "@stellar/stellar-sdk";
import { randomBytes } from "crypto";

const kp = Keypair.random();
const encryptionKey = randomBytes(32).toString("hex");

console.log("\n🔑 New Stellar Keypair generated:\n");
console.log(`  Public Key  (G...): ${kp.publicKey()}`);
console.log(`  Secret Key  (S...): ${kp.secret()}`);
console.log("\n📋 Add these to your backend/.env:\n");
console.log(`AUTOPILOT_PUBLIC_KEY="${kp.publicKey()}"`);
console.log(`AUTOPILOT_SECRET_KEY="${kp.secret()}"`);
console.log(`VAULT_ENCRYPTION_KEY="${encryptionKey}"`);
console.log("\n⚠️  NEVER commit the secret key or encryption key to git!");
console.log("\n💸 Fund this account on testnet:");
console.log(`   npm run friendbot ${kp.publicKey()}`);
console.log("\n🔗 View on Stellar Expert:");
console.log(`   https://stellar.expert/explorer/testnet/account/${kp.publicKey()}\n`);
