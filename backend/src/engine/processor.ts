/**
 * BullMQ Payment Event Processor
 *
 * Steps for every payment job:
 *  1. Query active rules for this user
 *  2. Match rules against the payment trigger
 *  3. Calculate execution amount (flat or percentage)
 *  4. Check daily/weekly spending limit via Redis
 *  5. Build + sign + submit the Stellar transaction
 *  6. Record the transaction in the DB
 *  7. Update Redis spend counters
 *
 * processPaymentDirect() is also exported for direct invocation
 * from the Horizon stream — so rules fire even when BullMQ/Redis is down.
 */

import { Worker, Job } from "bullmq";
import { getDb } from "../lib/db";
import { executeRuleTransaction } from "../lib/engine";
import { checkSpendingLimit, recordSpend } from "./limitGuard";
import { PAYMENT_QUEUE_NAME, PaymentJobData, CronJobData, CRON_QUEUE_NAME, getConnectionOptions } from "./queue";

// ── Helpers ───────────────────────────────────────────────────────────────

function doesPaymentMatchTrigger(trigger: string, asset: string): boolean {
  const t = trigger.toLowerCase();
  const isXLM = asset === "XLM";

  const matchesTrigger =
    t.includes("every payment") ||
    t.includes("payment received") ||
    t.includes("payment") ||
    t.includes("receive") ||
    t.includes("received") ||
    t.includes("incoming") ||
    t.includes("deposit") ||
    t.includes("salary") ||
    t.includes("income") ||
    t.includes("transfer") ||
    t.includes("xlm");

  return matchesTrigger && isXLM;
}

/**
 * Core payment processing logic — exported for direct use.
 * Called by both the BullMQ worker AND directly from the Horizon stream.
 */
export async function processPaymentDirect(data: PaymentJobData): Promise<any> {
  const { userId, publicKey, paymentHorizonId, amount, asset } = data;
  const sql = getDb();

  console.log(`[Processor] ⚡ Processing ${amount} ${asset} for ${publicKey.slice(0, 8)}…`);

  // ── Step 1: Deduplicate
  const existing = await sql`
    SELECT 1 FROM "AutomatedTransaction"
    WHERE "txHash" = ${paymentHorizonId}
    LIMIT 1
  `;
  if (existing.length > 0) {
    console.log(`[Processor] ⏭ Already processed ${paymentHorizonId.slice(0, 16)}… — skipping`);
    return { skipped: true, reason: "duplicate" };
  }

  // ── Step 2: Fetch user + active rules
  const [userRows, rules] = await Promise.all([
    sql`SELECT id, "dailyLimit", "weeklyLimit" FROM "User" WHERE id = ${userId}::uuid LIMIT 1`,
    sql`
      SELECT * FROM "Rule"
      WHERE "userId" = ${userId}::uuid AND status = 'active'
      ORDER BY "createdAt" ASC
    `,
  ]);

  if (userRows.length === 0) {
    console.warn(`[Processor] ⚠ User ${userId} not found`);
    return { skipped: true, reason: "user_not_found" };
  }

  console.log(`[Processor] 📋 ${rules.length} active rule(s) for user ${userId.slice(0, 8)}…`);
  if (rules.length === 0) return { skipped: true, reason: "no_rules" };

  const user = userRows[0];
  const dailyLimit  = user.dailyLimit  ? parseFloat(user.dailyLimit)  : null;
  const weeklyLimit = user.weeklyLimit ? parseFloat(user.weeklyLimit) : null;
  const paymentAmountXLM = parseFloat(amount);

  // ── Step 3: Fetch vaults
  const vaults = await sql`
    SELECT type, "publicKey", "encryptedSecret" FROM "Vault"
    WHERE "userId" = ${userId}::uuid
  `;
  const savingsVault = vaults.find((v: any) => v.type === "savings");
  const investVault  = vaults.find((v: any) => v.type === "investment");

  const results: any[] = [];

  // ── Step 4: Match + execute each rule
  for (const rule of rules) {
    const triggerMatches = doesPaymentMatchTrigger(rule.trigger as string, asset);
    console.log(`[Processor] 🔍 Rule "${rule.trigger}" | matches: ${triggerMatches}`);
    if (!triggerMatches) continue;

    const execAmount = (rule.isPercentage as boolean)
      ? (parseFloat(rule.amount) / 100) * paymentAmountXLM
      : parseFloat(rule.amount);

    console.log(`[Processor] 💰 Exec: ${execAmount} XLM (${rule.isPercentage ? `${rule.amount}%` : "flat"} of ${paymentAmountXLM})`);

    if (execAmount <= 0.0000001) { console.log("[Processor] ⚠ Amount too small — skipping"); continue; }
    if (execAmount > paymentAmountXLM) {
      console.log(`[Processor] ⚠ Rule amount ${execAmount} > payment ${paymentAmountXLM} — skipping`);
      continue;
    }

    const execAmountStr = execAmount.toFixed(7);

    // ── Spending limit check (best-effort — skips gracefully if Redis down)
    try {
      const { allowed, reason } = await checkSpendingLimit(userId, execAmount, dailyLimit, weeklyLimit);
      if (!allowed) {
        console.log(`[Processor] 🚫 Limit blocked rule ${rule.id}: ${reason}`);
        results.push({ ruleId: rule.id, status: "blocked", reason });
        continue;
      }
    } catch (limitErr: any) {
      console.warn("[Processor] ⚠ Limit check skipped (Redis unavailable):", limitErr?.message);
    }

    // ── Determine destination vault
    const action = (rule.action as string).toLowerCase();
    let destination: string | null = null;

    if (action.includes("save") || action.includes("saving")) {
      destination = savingsVault?.publicKey ?? null;
    } else if (action.includes("invest") || action.includes("investment")) {
      destination = investVault?.publicKey ?? null;
    }

    if (!destination) {
      console.warn(`[Processor] ⚠ No ${action} vault found — user must create one in the Vault tab`);
      results.push({ ruleId: rule.id, status: "failed", error: "No vault found — create one in the Vault tab" });
      continue;
    }

    const memo = (rule.memo as string | null) ?? `AutoPilot:${action}`.slice(0, 28);
    console.log(`[Processor] 🚀 Sending ${execAmountStr} XLM → ${destination.slice(0, 8)}… (${action})`);

    try {
      const txHash = await executeRuleTransaction(destination, execAmountStr, memo);

      await sql`
        INSERT INTO "AutomatedTransaction"
          (id, "userId", "ruleId", amount, type, memo, "txHash", "createdAt")
        VALUES
          (gen_random_uuid(), ${userId}::uuid, ${rule.id}::uuid,
           ${execAmount}, ${action}, ${memo}, ${txHash}, NOW())
      `;

      // ── Step 8: Increment linked Goal's currentAmount ──────────────
      try {
        await sql`
          UPDATE "Goal"
          SET
            "currentAmount" = "currentAmount" + ${execAmount},
            "updatedAt" = NOW()
          WHERE "linkedRuleId" = ${rule.id}::uuid
            AND "userId" = ${userId}::uuid
            AND "currentAmount" < "targetAmount"
        `;
      } catch (goalErr: any) {
        console.warn(`[Processor] ⚠ Could not update goal for rule ${rule.id}:`, goalErr?.message);
      }

      try { await recordSpend(userId, execAmount); } catch {}

      console.log(`[Processor] ✅ Rule "${rule.action}" | ${execAmountStr} XLM → vault | tx: ${txHash.slice(0, 20)}…`);
      results.push({ ruleId: rule.id, status: "executed", txHash, amount: execAmountStr, destination });

    } catch (txErr: any) {
      console.error(`[Processor] ✗ Tx failed for rule ${rule.id}:`, txErr?.message ?? txErr);
      results.push({ ruleId: rule.id, status: "failed", error: txErr?.message });
    }
  }

  return { processed: results.length, results };
}

// ── BullMQ worker wrapper ─────────────────────────────────────────────────

async function processPaymentJob(job: Job<PaymentJobData>) {
  return processPaymentDirect(job.data);
}

async function processCronJob(job: Job<CronJobData>) {
  const { userId, ruleId, amount, isPercentage, action, memo } = job.data;
  const sql = getDb();

  console.log(`[Processor] ⏰ Cron job for rule ${ruleId}`);

  const execAmount = amount;
  if (execAmount <= 0) return { skipped: true, reason: "zero_amount" };

  const userRows = await sql`
    SELECT id, "dailyLimit", "weeklyLimit" FROM "User" WHERE id = ${userId}::uuid LIMIT 1
  `;
  if (userRows.length === 0) return { skipped: true, reason: "user_not_found" };

  const user = userRows[0];
  const { allowed, reason } = await checkSpendingLimit(
    userId, execAmount,
    user.dailyLimit ? parseFloat(user.dailyLimit) : null,
    user.weeklyLimit ? parseFloat(user.weeklyLimit) : null
  );

  if (!allowed) {
    console.log(`[Processor] 🚫 Cron rule ${ruleId} blocked: ${reason}`);
    return { status: "blocked", reason };
  }

  const destination = process.env.AUTOPILOT_PUBLIC_KEY!;
  const memoText = (memo ?? `AutoPilot:${action}:${execAmount}`).slice(0, 28);
  const execAmountStr = execAmount.toFixed(7);

  try {
    const txHash = await executeRuleTransaction(destination, execAmountStr, memoText);
    await sql`
      INSERT INTO "AutomatedTransaction"
        (id, "userId", "ruleId", amount, type, memo, "txHash", "createdAt")
      VALUES
        (gen_random_uuid(), ${userId}::uuid, ${ruleId}::uuid,
         ${execAmount}, ${action.toLowerCase()}, ${memoText}, ${txHash}, NOW())
    `;
    try { await recordSpend(userId, execAmount); } catch {}
    console.log(`[Processor] ✅ Cron rule "${action}" | ${execAmountStr} XLM | tx: ${txHash.slice(0, 20)}…`);
    return { status: "executed", txHash, amount: execAmountStr };
  } catch (err: any) {
    console.error(`[Processor] ✗ Cron tx failed:`, err?.message);
    throw err;
  }
}

// ── Start workers ─────────────────────────────────────────────────────────

export function startWorkers() {
  const connection = getConnectionOptions();

  const paymentWorker = new Worker<PaymentJobData>(PAYMENT_QUEUE_NAME, processPaymentJob, {
    connection,
    concurrency: 5,
  });

  const cronWorker = new Worker<CronJobData>(CRON_QUEUE_NAME, processCronJob, {
    connection,
    concurrency: 2,
  });

  paymentWorker.on("completed", (job, result) => {
    console.log(`[Worker] ✓ Payment job ${job.id} done:`, JSON.stringify(result));
  });

  paymentWorker.on("failed", (job, err) => {
    console.error(`[Worker] ✗ Payment job ${job?.id} failed:`, err.message);
  });

  cronWorker.on("failed", (job, err) => {
    console.error(`[Worker] ✗ Cron job ${job?.id} failed:`, err.message);
  });

  console.log("[Worker] 🚀 BullMQ workers started (payment + cron)");

  return { paymentWorker, cronWorker };
}
