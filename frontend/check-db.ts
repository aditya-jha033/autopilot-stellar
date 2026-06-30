import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Adding columns to User table...");

  const addCol = async (col: string, type: string) => {
    const exists = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = ${col}
    `;
    if (exists.length === 0) {
      await sql.unsafe(`ALTER TABLE "User" ADD COLUMN "${col}" ${type}`);
      console.log(`  + ${col} added`);
    } else {
      console.log(`  - ${col} already exists`);
    }
  };

  await addCol("dailyLimit",  "DOUBLE PRECISION");
  await addCol("weeklyLimit", "DOUBLE PRECISION");
  await addCol("plan",        "TEXT NOT NULL DEFAULT 'free'");

  console.log("\nDone!");
}

main().catch(console.error);
