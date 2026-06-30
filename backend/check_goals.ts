import { getDb } from "./src/lib/db.js";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  const sql = getDb();
  console.log("Checking goals...");
  const goals = await sql`SELECT * FROM "Goal"`;
  console.log("GOALS:", goals);
  console.log("\nChecking rules...");
  const rules = await sql`SELECT * FROM "Rule"`;
  console.log("RULES:", rules);
  process.exit(0);
}
check();
