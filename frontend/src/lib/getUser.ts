import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { neon } from "@neondatabase/serverless";

/**
 * Returns the authenticated user from DB using the neon() HTTP driver.
 * This connects over HTTPS (port 443), avoiding all TCP IPv4/IPv6 issues.
 */
export async function getUserFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, "publicKey", "createdAt", "updatedAt"
    FROM "User"
    WHERE "publicKey" = ${payload.publicKey}
    LIMIT 1
  `;

  return rows[0] ?? null;
}
