import DashboardShell from "@/components/DashboardShell";
import RulesClient from "./RulesClient";
import { getSession } from "@/lib/session";
import { neon } from "@neondatabase/serverless";

export default async function RulesPage() {
  const session = await getSession();
  let rules: any[] = [];
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      rules = await sql`
        SELECT r.* FROM "Rule" r
        JOIN "User" u ON r."userId" = u.id
        WHERE u."publicKey" = ${session.publicKey}
        ORDER BY r."createdAt" DESC
      `.catch(() => []);
    } catch (e) {
      console.error("Database connection failed", e);
    }
  }

  return (
    <DashboardShell publicKey={session.publicKey}>
      <RulesClient initialRules={rules as any} />
    </DashboardShell>
  );
}
