/**
 * DB Migration: Add spending limit columns to User table
 * and ensure AutomatedTransaction table exists.
 *
 * Run: npx tsx src/migrations/addLimitsAndTxTable.ts
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env");
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Running migration: addLimitsAndTxTable...\n");

  // ── 1. Add dailyLimit + weeklyLimit to User (safe — only if missing) ────
  console.log("1. Adding dailyLimit and weeklyLimit columns to User table...");
  await sql`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "dailyLimit"  DECIMAL(18, 7) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "weeklyLimit" DECIMAL(18, 7) DEFAULT NULL
  `;
  console.log("   ✅ dailyLimit and weeklyLimit columns added (or already exist)\n");

  // ── 2. Ensure AutomatedTransaction table exists ───────────────────────
  console.log("2. Creating AutomatedTransaction table (if not exists)...");
  await sql`
    CREATE TABLE IF NOT EXISTS "AutomatedTransaction" (
      id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId"   UUID        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "ruleId"   UUID        REFERENCES "Rule"(id) ON DELETE SET NULL,
      amount     DECIMAL(18, 7) NOT NULL,
      type       TEXT        NOT NULL,
      memo       TEXT,
      "txHash"   TEXT        NOT NULL UNIQUE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "atx_user_idx" ON "AutomatedTransaction" ("userId")
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "atx_created_idx" ON "AutomatedTransaction" ("createdAt" DESC)
  `;
  console.log("   ✅ AutomatedTransaction table ready\n");

  // ── 3. Ensure Goal table has all required columns ─────────────────────
  console.log("3. Ensuring Goal table has savedAmount column...");
  await sql`
    ALTER TABLE "Goal"
    ADD COLUMN IF NOT EXISTS "savedAmount" DECIMAL(18, 7) NOT NULL DEFAULT 0
  `.catch(() => {}); // ignore if Goal table doesn't exist yet
  console.log("   ✅ Goal table checked\n");

  console.log("╔════════════════════════════════════╗");
  console.log("║   ✅ Migration complete!            ║");
  console.log("╚════════════════════════════════════╝");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
