import DashboardShell from "@/components/DashboardShell";
import RulesClient from "./RulesClient";
import { getSession } from "@/lib/session";
import { neon } from "@neondatabase/serverless";

export default async function RulesPage() {
  const session = await getSession();
  const sql = neon(process.env.DATABASE_URL!);

  const rules = await sql`
    SELECT r.* FROM "Rule" r
    JOIN "User" u ON r."userId" = u.id
    WHERE u."publicKey" = ${session.publicKey}
    ORDER BY r."createdAt" DESC
  `.catch(() => []);

  return (
    <DashboardShell publicKey={session.publicKey}>
      <RulesClient initialRules={rules as any} />
    </DashboardShell>
  );
}
