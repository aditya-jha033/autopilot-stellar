/**
 * DB Migration: Add Vault table
 *
 * Run this once to create the Vault table in your Neon PostgreSQL database.
 * Usage: npx tsx src/migrations/addVaultTable.ts
 *
 * The Vault table stores server-controlled Stellar accounts (savings + investment)
 * for each user. Secret keys are encrypted with AES-256-GCM before storage.
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env");
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Running migration: AddVaultTable...");

  await sql`
    CREATE TABLE IF NOT EXISTS "Vault" (
      id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId"          UUID        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      type              TEXT        NOT NULL CHECK (type IN ('savings', 'investment')),
      "publicKey"       TEXT        NOT NULL UNIQUE,
      "encryptedSecret" TEXT        NOT NULL,
      "xlmBalance"      TEXT        NOT NULL DEFAULT '0.0000000',
      "usdcBalance"     TEXT        NOT NULL DEFAULT '0.0000000',
      "fundTxHash"      TEXT,
      "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Index for fast lookups by userId
  await sql`
    CREATE INDEX IF NOT EXISTS "vault_user_idx" ON "Vault" ("userId")
  `;

  // Index for type lookups
  await sql`
    CREATE INDEX IF NOT EXISTS "vault_user_type_idx" ON "Vault" ("userId", type)
  `;

  // Ensure a user can only have one savings and one investment vault
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "vault_user_type_unique"
    ON "Vault" ("userId", type)
  `;

  console.log("✅ Vault table created successfully");
  console.log("   Columns: id, userId, type, publicKey, encryptedSecret,");
  console.log("            xlmBalance, usdcBalance, fundTxHash, createdAt, updatedAt");
  console.log("   Indexes: vault_user_idx, vault_user_type_idx, vault_user_type_unique");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
