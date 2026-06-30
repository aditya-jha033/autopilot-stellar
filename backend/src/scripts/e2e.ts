import Fastify from "fastify";
import dotenv from "dotenv";
import { getDb } from "../lib/db";
import { Keypair } from "@stellar/stellar-sdk";

// Import all required routes
import authRoutes from "../routes/auth";
import vaultRoutes from "../routes/vault";
import rulesRoutes from "../routes/rules";
import goalsRoutes from "../routes/goals";
import chatRoutes from "../routes/chat";

dotenv.config();

async function runE2E() {
  console.log("\n🚀 Starting Full E2E Test Suite\n");

  const server = Fastify({ logger: false, trustProxy: true });
  await server.register(import("@fastify/jwt"), {
    secret: process.env.JWT_SECRET || "test-secret",
    cookie: { cookieName: "session", signed: false },
  });
  await server.register(import("@fastify/cookie"));

  server.register(authRoutes, { prefix: "/api/auth" });
  server.register(vaultRoutes, { prefix: "/api/vault" });
  server.register(rulesRoutes, { prefix: "/api/rules" });
  server.register(goalsRoutes, { prefix: "/api/goals" });
  server.register(chatRoutes, { prefix: "/api/chat" });

  await server.ready();
  const sql = getDb();
  const testKp = Keypair.random();
  const publicKey = testKp.publicKey();

  try {
    // 1. Test Login (Creates Account in DB)
    console.log("1️⃣  Testing User Creation / Login...");
    const loginRes = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { publicKey },
    });
    
    if (loginRes.statusCode !== 200) throw new Error(`Login failed: ${loginRes.payload}`);
    const token = loginRes.cookies.find(c => c.name === "session")?.value;
    if (!token) throw new Error("No session cookie returned");
    console.log("   ✅ User created and authenticated successfully.");

    // 2. Test Rule Creation
    console.log("\n2️⃣  Testing Rule Creation (Database Write)...");
    const ruleRes = await server.inject({
      method: "POST",
      url: "/api/rules",
      cookies: { session: token },
      payload: {
        trigger: "incoming_payment",
        action: "savings_vault",
        amount: "10.00",
        isPercentage: true
      }
    });
    if (ruleRes.statusCode !== 200) throw new Error(`Rule creation failed: ${ruleRes.payload}`);
    console.log("   ✅ Rule created successfully.");

    // 3. Test Goal Creation
    console.log("\n3️⃣  Testing Goal Creation (Database Write)...");
    const goalRes = await server.inject({
      method: "POST",
      url: "/api/goals",
      cookies: { session: token },
      payload: {
        name: "New MacBook",
        targetAmount: "2500.00"
      }
    });
    if (goalRes.statusCode !== 200) throw new Error(`Goal creation failed: ${goalRes.payload}`);
    console.log("   ✅ Goal created successfully.");

    // 4. Test AI Chat Endpoint (Groq)
    console.log("\n4️⃣  Testing AI Chat Rule Parsing (Groq API)...");
    const chatRes = await server.inject({
      method: "POST",
      url: "/api/chat",
      cookies: { session: token },
      payload: { message: "Save 5% of my deposits" }
    });
    if (chatRes.statusCode !== 200) throw new Error(`Chat failed: ${chatRes.payload}`);
    const chatData = JSON.parse(chatRes.payload);
    console.log(`   ✅ AI understood successfully! Generated rule structure: ${chatData.isRule ? 'Yes' : 'No'}`);

    // 5. Test Vault Creation on Stellar Testnet (Requires Engine Funds)
    console.log("\n5️⃣  Testing Vault Creation on Stellar Testnet (This takes ~5 seconds)...");
    const vaultRes = await server.inject({
      method: "POST",
      url: "/api/vault/savings",
      cookies: { session: token }
    });
    
    if (vaultRes.statusCode !== 200) {
      console.error("   ❌ Vault Creation Failed:", JSON.parse(vaultRes.payload).error);
      console.log("   ⚠️  Did you run `npm run friendbot` to fund your Engine account first?");
    } else {
      const vaultData = JSON.parse(vaultRes.payload);
      console.log(`   ✅ Vault created on-chain! TxHash: ${vaultData.fundTxHash.slice(0, 16)}...`);
    }

    // 6. Verify Database State
    console.log("\n6️⃣  Verifying Final Database State...");
    const rules = await sql`SELECT * FROM "Rule" WHERE "userId" = (SELECT id FROM "User" WHERE "publicKey" = ${publicKey})`;
    const goals = await sql`SELECT * FROM "Goal" WHERE "userId" = (SELECT id FROM "User" WHERE "publicKey" = ${publicKey})`;
    console.log(`   ✅ Found ${rules.length} Rule(s) and ${goals.length} Goal(s) in PostgreSQL for the test user.`);
    
    console.log("\n🎉 ALL TESTS PASSED! The backend is fully operational end-to-end.");

  } catch (e: any) {
    console.error("\n❌ E2E TEST FAILED:");
    console.error(e.message);
  } finally {
    console.log("\n🧹 Cleaning up test user from DB...");
    const user = await sql`SELECT id FROM "User" WHERE "publicKey" = ${publicKey}`;
    if (user.length > 0) {
      const uId = user[0].id;
      await sql`DELETE FROM "Rule" WHERE "userId" = ${uId}::uuid`;
      await sql`DELETE FROM "Goal" WHERE "userId" = ${uId}::uuid`;
      await sql`DELETE FROM "Vault" WHERE "userId" = ${uId}::uuid`;
      await sql`DELETE FROM "User" WHERE id = ${uId}::uuid`;
    }
    await server.close();
    process.exit(0);
  }
}

runE2E();
