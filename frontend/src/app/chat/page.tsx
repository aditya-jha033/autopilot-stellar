/* eslint-disable */
import DashboardShell from "@/components/DashboardShell";
import ChatClient from "./ChatClient";
import { getSession } from "@/lib/session";
import { neon } from "@neondatabase/serverless";

export default async function ChatPage() {
  const session = await getSession();
  let rawRules: any[] = [];
  let hasVaults = false;

  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const [rulesData, vaultData] = await Promise.all([
        sql`
          SELECT r.id,
                 r.trigger,
                 r.action,
                 r.amount,
                 r."isPercentage",
                 r.status,
                 r.description
          FROM   "Rule" r
          JOIN   "User" u ON r."userId" = u.id
          WHERE  u."publicKey" = ${session.publicKey}
          ORDER  BY r."createdAt" DESC
        `,
        sql`
          SELECT 1 FROM "Vault" v
          JOIN "User" u ON v."userId" = u.id
          WHERE u."publicKey" = ${session.publicKey}
          LIMIT 1
        `
      ]);
      rawRules = rulesData;
      hasVaults = vaultData.length > 0;
    } catch (e) {
      console.error("Database connection failed", e);
    }
  }

  // Normalise to camelCase so ChatClient never receives undefined fields
  const rules = (rawRules as any[])
    .filter((r) => r != null && r.id != null)
    .map((r) => ({
      id:          r.id,
      trigger:     r.trigger     ?? "",
      action:      r.action      ?? "",
      amount:      r.amount      ?? 0,
      isPercentage: r.isPercentage ?? false,
      status:      r.status      ?? "paused",
      description: r.description ?? null,
    }));

  return (
    <DashboardShell publicKey={session.publicKey}>
      <ChatClient initialRules={rules} hasVaults={hasVaults} />
    </DashboardShell>
  );
}
