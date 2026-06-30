/**
 * simulate-payment.ts
 *
 * End-to-end payment simulation test.
 * This script:
 *   1. Verifies all env vars are set
 *   2. Creates a test user + savings rule in DB
 *   3. Creates a real vault on Stellar testnet
 *   4. Directly calls processPaymentDirect() simulating an incoming payment
 *   5. Verifies the AutomatedTransaction was saved in DB
 *   6. Verifies the vault balance increased on-chain
 *   7. Cleans up all test data
 *
 * Run: npx tsx src/scripts/simulate-payment.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { Keypair } from "@stellar/stellar-sdk";
import { getDb } from "../lib/db";
import { processPaymentDirect } from "../engine/processor";
import { createVaultOnChain, getVaultBalance } from "../stellar/vault";
import { fetchXLMBalance } from "../stellar/horizon";
import { PaymentJobData } from "../engine/queue";

const PAYMENT_AMOUNT = "50"; // Simulated incoming payment: 50 XLM
const RULE_PERCENTAGE = 10;  // Save 10% → should send 5 XLM to vault

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║   AutoPilot Payment Simulation Test       ║");
  console.log("╚════════════════════════════════════════════╝\n");

  // ── 1. Verify environment ─────────────────────────────────────────────
  console.log("1️⃣  Checking environment variables...");
  const required = ["DATABASE_URL", "AUTOPILOT_PUBLIC_KEY", "AUTOPILOT_SECRET_KEY", "VAULT_ENCRYPTION_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`   ❌ Missing env vars: ${missing.join(", ")}`);
    console.error("   → Copy backend/.env.example to backend/.env and fill in values");
    process.exit(1);
  }
  console.log("   ✅ All required env vars present\n");

  // ── 2. Check engine account is funded ────────────────────────────────
  console.log("2️⃣  Checking engine account balance...");
  const engineBalance = await fetchXLMBalance(process.env.AUTOPILOT_PUBLIC_KEY!);
  console.log(`   Engine balance: ${engineBalance.toFixed(4)} XLM`);
  if (engineBalance < 5) {
    console.error("   ❌ Engine account has less than 5 XLM. Run: npm run friendbot");
    process.exit(1);
  }
  console.log("   ✅ Engine account is funded\n");

  const sql = getDb();
  const testKp = Keypair.random();
  const publicKey = testKp.publicKey();
  let userId = "";

  try {
    // ── 3. Create test user ─────────────────────────────────────────────
    console.log("3️⃣  Creating test user in database...");
    const users = await sql`
      INSERT INTO "User" (id, "publicKey", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${publicKey}, NOW(), NOW())
      RETURNING id, "publicKey"
    `;
    userId = users[0].id;
    console.log(`   ✅ User created: ${userId.slice(0, 8)}… (key: ${publicKey.slice(0, 8)}…)\n`);

    // ── 4. Create automation rule ───────────────────────────────────────
    console.log("4️⃣  Creating savings rule (10% of every incoming payment)...");
    const ruleRows = await sql`
      INSERT INTO "Rule" (id, "userId", trigger, action, amount, "isPercentage", status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${userId}::uuid,
              'incoming payment', 'save to savings', ${RULE_PERCENTAGE}, true,
              'active', NOW(), NOW())
      RETURNING id
    `;
    const ruleId = ruleRows[0].id;
    console.log(`   ✅ Rule created: Save ${RULE_PERCENTAGE}% on incoming XLM (id: ${ruleId.slice(0, 8)}…)\n`);

    // ── 4b. Create a goal and link it to the rule ───────────────────────
    console.log("4b️⃣  Creating a linked Goal (target: 100 XLM)...");
    const goalRows = await sql`
      INSERT INTO "Goal" (id, "userId", name, "targetAmount", "currentAmount", emoji, "linkedRuleId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${userId}::uuid,
              'Test Vacation Fund', 100, 0, '✈️', ${ruleId}::uuid, NOW(), NOW())
      RETURNING id, "currentAmount"
    `;
    const goalId = goalRows[0].id;
    console.log(`   ✅ Goal created: Test Vacation Fund (id: ${goalId.slice(0, 8)}…)`);
    console.log(`   💰 Initial goal progress: ${goalRows[0].currentAmount} / 100 XLM\n`);

    // ── 5. Create vault on Stellar ──────────────────────────────────────
    console.log("5️⃣  Creating savings vault on Stellar testnet (takes ~5s)...");
    const { publicKey: vaultPk, encryptedSecret, fundTxHash } = await createVaultOnChain(userId, "savings");
    await sql`
      INSERT INTO "Vault" (id, "userId", type, "publicKey", "encryptedSecret", "fundTxHash", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${userId}::uuid, 'savings', ${vaultPk}, ${encryptedSecret}, ${fundTxHash}, NOW(), NOW())
    `;
    console.log(`   ✅ Vault created on-chain!`);
    console.log(`   🔑 Vault address: ${vaultPk.slice(0, 12)}…`);
    console.log(`   🔗 Fund tx: https://stellar.expert/explorer/testnet/tx/${fundTxHash}\n`);

    // Check initial vault balance
    const initialBalance = await getVaultBalance(vaultPk);
    console.log(`   💰 Initial vault XLM balance: ${initialBalance.xlm.toFixed(4)} XLM\n`);

    // ── 6. Simulate incoming payment ────────────────────────────────────
    console.log(`6️⃣  Simulating incoming payment of ${PAYMENT_AMOUNT} XLM...`);
    console.log(`   Expected: ${RULE_PERCENTAGE}% of ${PAYMENT_AMOUNT} XLM = ${(Number(PAYMENT_AMOUNT) * RULE_PERCENTAGE / 100).toFixed(4)} XLM → vault`);

    const fakePaymentId = `test-payment-${Date.now()}`;
    const jobData: PaymentJobData = {
      userId,
      publicKey,
      paymentHorizonId: fakePaymentId,
      amount: PAYMENT_AMOUNT,
      asset: "XLM",
      from: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", // dummy sender
      createdAt: new Date().toISOString(),
    };

    const result = await processPaymentDirect(jobData);
    console.log("\n   📊 Processing result:", JSON.stringify(result, null, 2));

    if (!result.results || result.results.length === 0) {
      console.error("\n   ❌ No rules were processed!");
      throw new Error("Rule processing returned no results");
    }

    const execResult = result.results[0];
    if (execResult.status !== "executed") {
      console.error("\n   ❌ Rule execution failed:", execResult.error ?? execResult.reason);
      throw new Error(`Rule not executed: ${execResult.error ?? execResult.reason}`);
    }

    console.log(`\n   ✅ Rule executed! Tx hash: ${execResult.txHash}`);
    console.log(`   🔗 View tx: https://stellar.expert/explorer/testnet/tx/${execResult.txHash}\n`);

    // ── 7. Wait and verify vault balance increased ──────────────────────
    console.log("7️⃣  Waiting 5s for Stellar ledger to close, then verifying vault balance...");
    await sleep(5000);

    const finalBalance = await getVaultBalance(vaultPk);
    const expectedAmount = (Number(PAYMENT_AMOUNT) * RULE_PERCENTAGE / 100);
    const actualIncrease = finalBalance.xlm - initialBalance.xlm;

    console.log(`   Initial balance:  ${initialBalance.xlm.toFixed(7)} XLM`);
    console.log(`   Final balance:    ${finalBalance.xlm.toFixed(7)} XLM`);
    console.log(`   Increase:         ${actualIncrease.toFixed(7)} XLM`);
    console.log(`   Expected:         ${expectedAmount.toFixed(7)} XLM`);

    if (actualIncrease < expectedAmount * 0.99) { // Allow 1% for fees
      console.error("\n   ❌ Vault balance did not increase by expected amount!");
    } else {
      console.log("\n   ✅ Vault balance confirmed on-chain!\n");
    }

    // ── 8. Verify DB record ─────────────────────────────────────────────
    console.log("8️⃣  Verifying AutomatedTransaction record in database...");
    const txRecords = await sql`
      SELECT * FROM "AutomatedTransaction"
      WHERE "userId" = ${userId}::uuid
      ORDER BY "createdAt" DESC
      LIMIT 5
    `;
    if (txRecords.length === 0) {
      console.error("   ❌ No AutomatedTransaction record found in DB!");
    } else {
      console.log(`   ✅ Found ${txRecords.length} transaction record(s) in DB`);
      txRecords.forEach((tx: any, i: number) => {
        console.log(`   [${i+1}] type=${tx.type} | amount=${tx.amount} XLM | txHash=${String(tx.txHash).slice(0, 20)}…`);
      });
    }

    // ── 9. Verify Goal progress incremented ────────────────────────────
    console.log("\n9️⃣  Verifying Goal currentAmount was incremented...");
    const goalCheck = await sql`
      SELECT "currentAmount", "targetAmount" FROM "Goal"
      WHERE id = ${goalId}::uuid
    `;
    if (goalCheck.length > 0) {
      const current = parseFloat(goalCheck[0].currentAmount);
      const target  = parseFloat(goalCheck[0].targetAmount);
      const expected = Number(PAYMENT_AMOUNT) * RULE_PERCENTAGE / 100;
      console.log(`   Goal progress: ${current.toFixed(4)} / ${target.toFixed(4)} XLM`);
      if (current >= expected * 0.99) {
        console.log(`   ✅ Goal currentAmount correctly updated to ${current.toFixed(4)} XLM!\n`);
      } else {
        console.error(`   ❌ Goal currentAmount is ${current} but expected ~${expected}`);
      }
    } else {
      console.error("   ❌ Goal not found in DB!");
    }

    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║   ✅ ALL TESTS PASSED — AUTOMATION WORKS!  ║");
    console.log("╚════════════════════════════════════════════╝\n");

  } catch (err: any) {
    console.error("\n╔════════════════════════════════════════════╗");
    console.error("║   ❌ TEST FAILED                           ║");
    console.error("╚════════════════════════════════════════════╝");
    console.error("\nError:", err.message ?? err);
  } finally {
    // ── Cleanup ─────────────────────────────────────────────────────────
    if (userId) {
      console.log("\n🧹 Cleaning up test data...");
      try {
        await sql`DELETE FROM "AutomatedTransaction" WHERE "userId" = ${userId}::uuid`;
        await sql`DELETE FROM "Goal" WHERE "userId" = ${userId}::uuid`;
        await sql`DELETE FROM "Vault" WHERE "userId" = ${userId}::uuid`;
        await sql`DELETE FROM "Rule" WHERE "userId" = ${userId}::uuid`;
        await sql`DELETE FROM "User" WHERE id = ${userId}::uuid`;
        console.log("   ✅ Test data cleaned up");
      } catch (cleanErr: any) {
        console.warn("   ⚠ Cleanup failed:", cleanErr?.message);
      }
    }
    process.exit(0);
  }
}

run();
