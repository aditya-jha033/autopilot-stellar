import { getDb } from "../lib/db";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  console.log("Running migration: AddGoalTable...");
  const sql = getDb();

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "Goal" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        "targetAmount" DOUBLE PRECISION NOT NULL,
        "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        emoji TEXT NOT NULL,
        "linkedRuleId" UUID REFERENCES "Rule"(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Add indexes for quick lookup
    await sql`
      CREATE INDEX IF NOT EXISTS goal_user_idx ON "Goal"("userId");
    `;

    console.log("✅ Goal table created successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
