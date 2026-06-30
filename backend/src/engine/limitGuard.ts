/**
 * Spending Limit Guard
 *
 * Uses Redis INCR + EXPIRE to track cumulative spend per user
 * within a rolling daily / weekly window.
 *
 * Key pattern: limit:{userId}:daily:{YYYY-MM-DD}
 *              limit:{userId}:weekly:{YYYY-WW}
 *
 * Values are stored in Lumens (XLM) × 10_000_000 (integer micro-XLM)
 * to avoid float precision issues.
 */

import { getRedis } from "../lib/redis";

const MICRO = 10_000_000; // 1 XLM = 10_000_000 micro-XLM

function todayKey(userId: string): string {
  const d = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `limit:${userId}:daily:${d}`;
}

function weekKey(userId: string): string {
  const now = new Date();
  // ISO week number
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `limit:${userId}:weekly:${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * Check whether executing `amountXLM` is allowed under the user's limits.
 * Returns { allowed: boolean, reason?: string }
 */
export async function checkSpendingLimit(
  userId: string,
  amountXLM: number,
  dailyLimitXLM: number | null,
  weeklyLimitXLM: number | null
): Promise<{ allowed: boolean; reason?: string }> {
  const redis = getRedis();

  // No Redis configured — skip limit check (degrade gracefully)
  if (!redis) {
    return { allowed: true };
  }

  const microAmount = Math.round(amountXLM * MICRO);

  if (dailyLimitXLM !== null) {
    const dailyMicroLimit = Math.round(dailyLimitXLM * MICRO);
    const currentDaily = await redis.get<number>(todayKey(userId)) ?? 0;
    const asNumber = typeof currentDaily === "string" ? parseInt(currentDaily, 10) : currentDaily;
    if (asNumber + microAmount > dailyMicroLimit) {
      return {
        allowed: false,
        reason: `Daily limit of ${dailyLimitXLM} XLM reached (spent ${asNumber / MICRO} XLM today)`,
      };
    }
  }

  if (weeklyLimitXLM !== null) {
    const weeklyMicroLimit = Math.round(weeklyLimitXLM * MICRO);
    const currentWeekly = await redis.get<number>(weekKey(userId)) ?? 0;
    const asNumber = typeof currentWeekly === "string" ? parseInt(currentWeekly, 10) : currentWeekly;
    if (asNumber + microAmount > weeklyMicroLimit) {
      return {
        allowed: false,
        reason: `Weekly limit of ${weeklyLimitXLM} XLM reached (spent ${asNumber / MICRO} XLM this week)`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Record a completed spend. Call AFTER a successful transaction.
 */
export async function recordSpend(userId: string, amountXLM: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const microAmount = Math.round(amountXLM * MICRO);

  const [dk, wk] = [todayKey(userId), weekKey(userId)];

  // Increment atomically
  await Promise.all([
    redis
      .pipeline()
      .incrby(dk, microAmount)
      .expire(dk, 60 * 60 * 25) // 25 hours TTL
      .exec(),
    redis
      .pipeline()
      .incrby(wk, microAmount)
      .expire(wk, 60 * 60 * 24 * 8) // 8 days TTL
      .exec(),
  ]);
}
