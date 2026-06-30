import { getDb } from "./src/lib/db.js";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  const sql = getDb();
  console.log("Recent transactions:");
  const txs = await sql`SELECT * FROM "AutomatedTransaction" ORDER BY "createdAt" DESC LIMIT 5`;
  console.log(txs);
  process.exit(0);
}
check();
