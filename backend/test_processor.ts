import { getDb } from "./src/lib/db.js";
import { processPaymentDirect } from "./src/engine/processor.js";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  const sql = getDb();
  
  const userId = "aebcb237-e649-4d32-aefc-4ac3b86b6ee9"; // User from DB dump
  
  console.log("Fetching user...");
  const users = await sql`SELECT * FROM "User" WHERE id = ${userId}`;
  if (!users.length) return console.log("User not found");
  const user = users[0];

  console.log("Simulating 50 XLM payment to user locally using updated processor.ts...");
  
  const fakePaymentId = `test-payment-${Date.now()}`;
  const jobData = {
    userId: user.id,
    publicKey: user.publicKey,
    paymentHorizonId: fakePaymentId,
    amount: "50",
    asset: "XLM",
    from: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
    createdAt: new Date().toISOString(),
  };

  const result = await processPaymentDirect(jobData);
  console.log("Processor result:", result);

  console.log("\nChecking goals after processor run...");
  const goals = await sql`SELECT id, "currentAmount", "targetAmount" FROM "Goal" WHERE "userId" = ${userId}`;
  console.log("GOALS:", goals);

  process.exit(0);
}
check();
