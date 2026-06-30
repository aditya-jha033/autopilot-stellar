import { FastifyInstance } from "fastify";
import { verifyAuth } from "../middleware/auth";
import { getDb } from "../lib/db";
import { fetchRecentPayments, executeRuleTransaction, isPaymentAlreadyProcessed } from "../lib/engine";
import { getHorizon } from "../stellar/horizon";

export default async function autopilotRoutes(server: FastifyInstance) {
  
  // Status endpoint (protected)
  server.get("/status", { preHandler: [verifyAuth] }, async (request, reply) => {
    const sql = getDb();
    
    const [txRows, ruleRows, engineBalance] = await Promise.all([
      sql`
        SELECT * FROM "AutomatedTransaction"
        WHERE "userId" = ${request.user!.id}::uuid
        ORDER BY "createdAt" DESC
        LIMIT 5
      `,
      sql`
        SELECT COUNT(*) as count FROM "Rule"
        WHERE "userId" = ${request.user!.id}::uuid AND status = 'active'
      `,
      getHorizon()
        .accounts()
        .accountId(process.env.AUTOPILOT_PUBLIC_KEY!)
        .call()
        .then((acc: any) => {
          const native = acc.balances?.find((b: any) => b.asset_type === "native");
          return native?.balance ?? "0";
        })
        .catch(() => "N/A"),
    ]);

    return reply.send({
      enginePublicKey: process.env.AUTOPILOT_PUBLIC_KEY,
      engineBalance,
      activeRules: Number(ruleRows[0]?.count ?? 0),
      recentTransactions: txRows,
    });
  });

  // Monitor endpoint (called by worker, uses secret)
  server.post("/monitor", async (request, reply) => {
    const ENGINE_SECRET = process.env.ENGINE_SECRET ?? process.env.JWT_SECRET ?? "dev-engine-secret";
    const authHeader = request.headers["x-engine-secret"];
    
    if (authHeader !== ENGINE_SECRET) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const sql = getDb();

    try {
      const users = await sql`
        SELECT DISTINCT u.id, u."publicKey", u."dailyLimit", u."weeklyLimit"
        FROM "User" u
        INNER JOIN "Rule" r ON r."userId" = u.id
        WHERE r.status = 'active'
      `;

      const results: any[] = [];

      for (const user of users) {
        const rules = await sql`
          SELECT * FROM "Rule"
          WHERE "userId" = ${user.id}::uuid
            AND status = 'active'
          ORDER BY "createdAt" DESC
        `;

        const now = new Date();
        const startOfDay  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [daySpend, weekSpend] = await Promise.all([
          sql`SELECT COALESCE(SUM(amount), 0) AS total FROM "AutomatedTransaction" WHERE "userId" = ${user.id}::uuid AND "createdAt" >= ${startOfDay}`,
          sql`SELECT COALESCE(SUM(amount), 0) AS total FROM "AutomatedTransaction" WHERE "userId" = ${user.id}::uuid AND "createdAt" >= ${startOfWeek}`,
        ]);

        let spentToday  = parseFloat(daySpend[0]?.total  ?? "0");
        let spentWeek   = parseFloat(weekSpend[0]?.total ?? "0");
        const dailyLimit  = user.dailyLimit  ? parseFloat(user.dailyLimit)  : null;
        const weeklyLimit = user.weeklyLimit ? parseFloat(user.weeklyLimit) : null;

        const payments = await fetchRecentPayments(user.publicKey, 10);

        for (const payment of payments) {
          const alreadyDone = await isPaymentAlreadyProcessed(payment.id, sql);
          if (alreadyDone) continue;

          const paymentAmountXLM = parseFloat(payment.amount);

          for (const rule of rules) {
            const matches = doesPaymentMatchRule(payment, rule as any);
            if (!matches) continue;

            const execAmount = rule.isPercentage
              ? (rule.amount / 100) * paymentAmountXLM
              : rule.amount;

            if (execAmount <= 0.0000001) continue;
            if (execAmount > paymentAmountXLM) continue;

            const execAmountStr = execAmount.toFixed(7);

            if (dailyLimit !== null && spentToday + execAmount > dailyLimit) {
              console.log(`[Engine] ⚠ Daily limit reached for ${user.publicKey.slice(0, 8)}… (${spentToday.toFixed(2)} / ${dailyLimit} XLM today)`);
              continue;
            }
            if (weeklyLimit !== null && spentWeek + execAmount > weeklyLimit) {
              console.log(`[Engine] ⚠ Weekly limit reached for ${user.publicKey.slice(0, 8)}…`);
              continue;
            }

            const destination = process.env.AUTOPILOT_PUBLIC_KEY!;
            const memo = rule.memo ?? `AutoPilot: ${rule.action} ${execAmountStr} XLM`;

            try {
              const txHash = await executeRuleTransaction(destination, execAmountStr, memo);

              await sql`
                INSERT INTO "AutomatedTransaction" (
                  id, "userId", "ruleId", amount, type, memo, "txHash", "createdAt"
                )
                VALUES (
                  gen_random_uuid(),
                  ${user.id}::uuid,
                  ${rule.id}::uuid,
                  ${execAmount},
                  ${rule.action.toLowerCase()},
                  ${memo},
                  ${payment.id},
                  NOW()
                )
              `;

              results.push({
                userId: user.id,
                publicKey: user.publicKey,
                ruleId: rule.id,
                ruleAction: rule.action,
                amount: execAmountStr,
                txHash,
                paymentId: payment.id,
                status: "executed",
              });

              spentToday += execAmount;
              spentWeek  += execAmount;

              console.log(
                `[Engine] ✓ Rule "${rule.action}" executed for ${user.publicKey.slice(0, 8)}… | ${execAmountStr} XLM | tx: ${txHash.slice(0, 16)}…`
              );
            } catch (execErr: any) {
              console.error(`[Engine] ✗ Rule execution failed:`, execErr?.message ?? execErr);
              results.push({
                userId: user.id,
                publicKey: user.publicKey,
                ruleId: rule.id,
                ruleAction: rule.action,
                amount: execAmountStr,
                txHash: null,
                paymentId: payment.id,
                status: "failed",
                error: execErr?.message,
              });
            }
          }
        }
      }

      return reply.send({
        ok: true,
        processed: results.length,
        usersChecked: users.length,
        results,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Engine] Monitor error:", message);
      return reply.status(500).send({ ok: false, error: message });
    }
  });

  server.get("/monitor", async (request, reply) => {
    if (process.env.NODE_ENV !== "development") {
      return reply.status(403).send({ error: "Not allowed" });
    }
    // internal forward logic isn't easily mapped in fastify for GET->POST without plugin
    // for dev, we can just reject or extract the logic to a shared function
    return reply.status(405).send({ error: "Use POST" });
  });
}

function doesPaymentMatchRule(
  payment: { amount: string; asset: string; from: string },
  rule: { trigger: string; action: string }
): boolean {
  const trigger = rule.trigger.toLowerCase();
  const isXLM = payment.asset === "XLM";

  if (
    trigger.includes("every payment") ||
    trigger.includes("payment received") ||
    trigger.includes("receive") ||
    trigger.includes("incoming")
  ) {
    return isXLM;
  }
  return false;
}
