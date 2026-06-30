/**
 * Engine Bootstrap
 *
 * Starts all automation components in the correct order:
 *   1. BullMQ workers (processor)
 *   2. Horizon SSE stream listener
 *   3. Cron scheduler
 *
 * If REDIS_URL is not configured, logs a warning and skips
 * queue-dependent features (SSE stream still works via polling).
 */

import { startWorkers } from "./processor";
import { startHorizonStreams } from "./horizonStream";
import { startScheduler } from "./scheduler";

export async function startEngine() {
  const hasRedis = !!process.env.REDIS_URL;

  if (!hasRedis) {
    console.warn(
      "[Engine] ⚠  REDIS_URL not set — BullMQ job queue and cron scheduler disabled.\n" +
      "           Set REDIS_URL in backend/.env to enable full automation.\n" +
      "           Get a free Redis DB at https://console.upstash.com"
    );
  }

  const cleanupFns: Array<() => void | Promise<void>> = [];

  // ── Start BullMQ workers (requires Redis)
  if (hasRedis) {
    try {
      const { paymentWorker, cronWorker } = startWorkers();
      cleanupFns.push(async () => {
        await paymentWorker.close();
        await cronWorker.close();
      });
    } catch (err: any) {
      console.error("[Engine] ✗ Failed to start workers:", err.message);
    }
  }

  // ── Start Horizon SSE stream (works without Redis, but jobs won't queue)
  try {
    const stopStreams = await startHorizonStreams();
    cleanupFns.push(stopStreams);
  } catch (err: any) {
    console.error("[Engine] ✗ Failed to start Horizon streams:", err.message);
  }

  // ── Start cron scheduler (requires Redis for queuing)
  if (hasRedis) {
    try {
      const stopScheduler = await startScheduler();
      cleanupFns.push(stopScheduler);
    } catch (err: any) {
      console.error("[Engine] ✗ Failed to start scheduler:", err.message);
    }
  }

  console.log(`[Engine] 🚀 AutoPilot engine running${hasRedis ? " (full mode)" : " (no-Redis mode)"}`);

  // Return cleanup function for graceful shutdown
  return async () => {
    console.log("[Engine] 🛑 Shutting down…");
    for (const fn of cleanupFns.reverse()) {
      try { await fn(); } catch {}
    }
    console.log("[Engine] ✅ Shutdown complete");
  };
}
