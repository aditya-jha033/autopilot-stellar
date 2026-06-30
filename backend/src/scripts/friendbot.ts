/**
 * scripts/friendbot.ts
 *
 * Fund a Stellar testnet account using the Friendbot faucet.
 * Friendbot gives you 10,000 XLM for free on testnet.
 *
 * Usage:
 *   npx tsx src/scripts/friendbot.ts                         ← funds AUTOPILOT_PUBLIC_KEY from .env
 *   npx tsx src/scripts/friendbot.ts GABC...XYZ              ← funds a specific public key
 *   npx tsx src/scripts/friendbot.ts GABC...XYZ GDEF...UVW  ← funds multiple accounts
 */

import dotenv from "dotenv";
dotenv.config();

const FRIENDBOT_URL = "https://friendbot.stellar.org";

async function fundAccount(publicKey: string): Promise<void> {
  console.log(`\n💸 Funding ${publicKey.slice(0, 8)}… via Friendbot…`);

  const res = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
  const body = await res.json() as any;

  if (!res.ok) {
    const detail = body?.detail ?? body?.extras?.result_codes ?? JSON.stringify(body);
    // "already exists" just means the account is already funded — that's fine
    if (detail?.toString().includes("already exists") || detail?.toString().includes("op_already_exists")) {
      console.log(`  ℹ  Account already exists — Friendbot skipped (account is already funded)`);
      return;
    }
    throw new Error(`Friendbot failed (${res.status}): ${detail}`);
  }

  const txHash = body?.hash ?? body?.id ?? "unknown";
  console.log(`  ✅ Funded! tx hash: ${txHash}`);
  console.log(`  🔗 https://stellar.expert/explorer/testnet/tx/${txHash}`);
  console.log(`  🏦 Balance: https://stellar.expert/explorer/testnet/account/${publicKey}`);
}

async function main() {
  const args = process.argv.slice(2);

  // Use CLI args if provided, otherwise fall back to AUTOPILOT_PUBLIC_KEY from .env
  const accounts = args.length > 0
    ? args
    : [process.env.AUTOPILOT_PUBLIC_KEY].filter(Boolean) as string[];

  if (accounts.length === 0) {
    console.error("❌ No public key provided.");
    console.error("   Usage: npx tsx src/scripts/friendbot.ts G...\n");
    console.error("   Or set AUTOPILOT_PUBLIC_KEY in your .env file.");
    process.exit(1);
  }

  for (const key of accounts) {
    await fundAccount(key);
  }

  console.log("\n✅ Done! Your testnet accounts are funded with 10,000 XLM each.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
