/**
 * Cron-based Rule Scheduler
 *
 * Handles time-based rules like:
 *   "Invest 5 XLM every Monday"
 *   "Save 10 XLM on the 1st of every month"
 *
 * On startup:
 *   1. Load all active rules with a cron trigger from DB
 *   2. Register a node-cron job for each
 *   3. Each cron tick enqueues a CronJob in BullMQ
 *
 * Re-syncs every 5 minutes to pick up newly created / paused cron rules.
 */

import cron, { ScheduledTask } from "node-cron";
import { getDb } from "../lib/db";
import { getCronQueue, CronJobData } from "./queue";

const activeCronJobs = new Map<string, ScheduledTask>(); // ruleId → cron task

// ── Parse trigger string into a cron expression ──────────────────────────

function parseTriggerToCron(trigger: string): string | null {
  const t = trigger.toLowerCase().trim();

  // "every monday" → "0 9 * * 1" (every Monday at 9am)
  if (t.includes("every monday"))    return "0 9 * * 1";
  if (t.includes("every tuesday"))   return "0 9 * * 2";
  if (t.includes("every wednesday")) return "0 9 * * 3";
  if (t.includes("every thursday"))  return "0 9 * * 4";
  if (t.includes("every friday"))    return "0 9 * * 5";
  if (t.includes("every saturday"))  return "0 9 * * 6";
  if (t.includes("every sunday"))    return "0 9 * * 0";

  // "every week" → every Monday
  if (t.includes("every week") || t.includes("weekly")) return "0 9 * * 1";

  // "every month" or "monthly" → 1st of month
  if (t.includes("every month") || t.includes("monthly")) return "0 9 1 * *";

  // "every day" or "daily" → every day at 9am
  if (t.includes("every day") || t.includes("daily")) return "0 9 * * *";

  // "1st of every month"
  if (t.match(/1st.*(month|monthly)/)) return "0 9 1 * *";
  if (t.match(/15th.*(month|monthly)/)) return "0 9 15 * *";

  // If the trigger looks like a raw cron expression (5 or 6 parts)
  const cronPattern = /^[\d\*\/\-,\s]{5,}$/;
  if (cronPattern.test(trigger.trim()) && cron.validate(trigger.trim())) {
    return trigger.trim();
  }

  return null; // Not a cron-type trigger
}

// ── Register one cron rule ────────────────────────────────────────────────

function registerCronRule(rule: {
  id: string;
  userId: string;
  trigger: string;
  action: string;
  amount: number;
  isPercentage: boolean;
  memo: string | null;
  publicKey: string;
}) {
  if (activeCronJobs.has(rule.id)) return; // Already registered

  const expression = parseTriggerToCron(rule.trigger);
  if (!expression) return; // Not a time-based rule

  console.log(`[Scheduler] ⏰ Registered cron rule ${rule.id.slice(0, 8)}… — "${expression}"`);

  const task = cron.schedule(expression, async () => {
    console.log(`[Scheduler] ⚡ Cron tick: rule ${rule.id.slice(0, 8)}… firing`);

    const jobData: CronJobData = {
      userId: rule.userId,
      publicKey: rule.publicKey,
      ruleId: rule.id,
      amount: rule.isPercentage ? 0 : rule.amount, // percentage cron rules need live balance — skip for now
      isPercentage: rule.isPercentage,
      action: rule.action,
      memo: rule.memo,
    };

    await getCronQueue().add(`cron:${rule.id}:${Date.now()}`, jobData);
  });

  activeCronJobs.set(rule.id, task);
}

// ── Sync cron jobs with DB ────────────────────────────────────────────────

async function syncCronSchedules() {
  const sql = getDb();

  try {
    const rules = await sql`
      SELECT r.*, u.id AS "userId", u."publicKey"
      FROM "Rule" r
      INNER JOIN "User" u ON u.id = r."userId"
      WHERE r.status = 'active'
    `;

    const activeIds = new Set<string>();

    for (const rule of rules) {
      const expression = parseTriggerToCron(rule.trigger as string);
      if (!expression) continue; // Skip non-cron rules

      activeIds.add(rule.id as string);
      registerCronRule({
        id: rule.id as string,
        userId: rule.userId as string,
        trigger: rule.trigger as string,
        action: rule.action as string,
        amount: parseFloat(String(rule.amount)),
        isPercentage: rule.isPercentage as boolean,
        memo: rule.memo as string | null,
        publicKey: rule.publicKey as string,
      });
    }

    // Stop cron jobs for rules that are now paused/deleted
    for (const [ruleId, task] of activeCronJobs) {
      if (!activeIds.has(ruleId)) {
        task.stop();
        activeCronJobs.delete(ruleId);
        console.log(`[Scheduler] 🔕 Stopped cron for rule ${ruleId.slice(0, 8)}…`);
      }
    }
  } catch (err: any) {
    console.error("[Scheduler] ✗ syncCronSchedules error:", err?.message);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────

export async function startScheduler() {
  console.log("[Scheduler] 🕐 Starting cron scheduler…");

  await syncCronSchedules();

  // Re-sync every 5 minutes
  const intervalId = setInterval(syncCronSchedules, 5 * 60 * 1000);

  return () => {
    clearInterval(intervalId);
    for (const task of activeCronJobs.values()) task.stop();
    activeCronJobs.clear();
    console.log("[Scheduler] 🛑 All cron jobs stopped");
  };
}
