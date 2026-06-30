/**
 * Horizon SSE Stream Listener
 *
 * Opens a real-time payment stream for each active wallet.
 * When a payment arrives:
 *   1. Process the payment DIRECTLY (primary — works without Redis)
 *   2. Save cursor to Redis for resume on restart (best-effort)
 *   3. Also enqueue to BullMQ for retry reliability (best-effort)
 *
 * Stream management:
 *   - Polls DB every 60s for new wallets with active rules
 *   - Opens one stream per unique public key
 *   - Cleans up streams for wallets with no active rules
 *   - Resumes from the last saved cursor on restart
 */

import { getHorizon } from "../stellar/horizon";
import { saveHorizonCursor, getHorizonCursor } from "../lib/redis";
import { getPaymentQueue, PaymentJobData } from "./queue";
import { processPaymentDirect } from "./processor";
import { getDb } from "../lib/db";

interface StreamHandle {
  close: () => void;
}

const activeStreams = new Map<string, StreamHandle>(); // publicKey → close fn

// ── Open a single wallet stream ───────────────────────────────────────────

async function openStream(userId: string, publicKey: string) {
  if (activeStreams.has(publicKey)) return; // Already watching

  // Resume from last cursor if available
  const cursor = (await getHorizonCursor(publicKey)) ?? "now";

  console.log(`[Stream] 👀 Watching ${publicKey.slice(0, 8)}… (cursor: ${cursor})`);

  try {
    const closeFn = getHorizon()
      .payments()
      .forAccount(publicKey)
      .cursor(cursor)
      .stream({
        onmessage: async (record: any) => {
          // We only care about incoming native payments to this wallet
          if (record.type !== "payment") return;
          if (record.to !== publicKey) return;

          const asset = record.asset_type === "native"
            ? "XLM"
            : `${record.asset_code}:${record.asset_issuer}`;

          console.log(
            `[Stream] 💸 Payment detected | ${record.amount} ${asset} → ${publicKey.slice(0, 8)}…`
          );

          // Save cursor so we can resume on restart (best-effort)
          try {
            await saveHorizonCursor(publicKey, record.paging_token);
          } catch {}

          const jobData: PaymentJobData = {
            userId,
            publicKey,
            paymentHorizonId: record.id,
            amount: record.amount,
            asset,
            from: record.from,
            createdAt: record.created_at,
          };

          // ─── PRIMARY: Process DIRECTLY without needing Redis/BullMQ ───
          try {
            const result = await processPaymentDirect(jobData);
            console.log(`[Stream] ✅ Direct processing done:`, JSON.stringify(result));
          } catch (directErr: any) {
            console.error(`[Stream] ✗ Direct processing failed:`, directErr?.message);
          }

          // ─── SECONDARY: Also try BullMQ for retry reliability (best-effort) ───
          try {
            await getPaymentQueue().add(
              `payment:${record.id}`,
              jobData,
              { jobId: record.id } // deduplication — won't double-process
            );
          } catch (queueErr: any) {
            // This is fine — direct processing already ran above
            console.warn(`[Stream] ⚠ BullMQ queue unavailable (Redis not connected): ${queueErr?.message}`);
          }
        },
        onerror: (err: any) => {
          const msg = err?.message ?? String(err);
          // Ignore "Account not found" (unfunded testnet wallets)
          if (msg.includes("404") || msg.includes("Not Found")) return;
          console.error(`[Stream] ✗ Error on ${publicKey.slice(0, 8)}…:`, msg);

          // Auto-recover on network reset errors — next syncStreams() will reopen
          if (msg.includes("ECONNRESET") || msg.includes("timeout") || msg.includes("socket hang up")) {
            const handle = activeStreams.get(publicKey);
            if (handle) {
              try { handle.close(); } catch {}
              activeStreams.delete(publicKey);
              console.log(`[Stream] 🔄 Stream removed for ${publicKey.slice(0, 8)}… — will reopen on next sync`);
            }
          }
        },
      });

    activeStreams.set(publicKey, { close: closeFn as unknown as () => void });

  } catch (err: any) {
    // 404 = account not funded yet — silently skip
    if (err?.response?.status === 404 || err?.message?.includes("404")) return;
    console.error(`[Stream] ✗ Failed to open stream for ${publicKey.slice(0, 8)}…:`, err?.message);
  }
}

// ── Sync active streams with DB ───────────────────────────────────────────

async function syncStreams() {
  const sql = getDb();

  try {
    // Get all unique public keys that have at least one active rule
    const rows = await sql`
      SELECT DISTINCT u.id, u."publicKey"
      FROM "User" u
      INNER JOIN "Rule" r ON r."userId" = u.id
      WHERE r.status = 'active'
    `;

    const activeKeys = new Set(rows.map((r: any) => r.publicKey as string));

    // Open streams for new wallets
    for (const row of rows) {
      await openStream(row.id as string, row.publicKey as string);
    }

    // Close streams for wallets that no longer have active rules
    for (const [pk, handle] of activeStreams) {
      if (!activeKeys.has(pk)) {
        console.log(`[Stream] 🔕 Closing stream for ${pk.slice(0, 8)}… (no active rules)`);
        handle.close();
        activeStreams.delete(pk);
      }
    }

    if (rows.length > 0) {
      console.log(`[Stream] 📡 Watching ${activeStreams.size} wallet(s)`);
    }
  } catch (err: any) {
    console.error("[Stream] ✗ syncStreams error:", err?.message);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────

export async function startHorizonStreams() {
  console.log("[Stream] 🌊 Starting Horizon SSE stream manager…");

  // Initial sync
  await syncStreams();

  // Re-sync every 30 seconds (was 60) to pick up new wallets / paused rules faster
  const intervalId = setInterval(syncStreams, 30_000);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    for (const [pk, handle] of activeStreams) {
      handle.close();
      activeStreams.delete(pk);
    }
    console.log("[Stream] 🛑 All Horizon streams closed");
  };
}
