import { FastifyInstance } from "fastify";
import { verifyAuth } from "../middleware/auth";
import { getDb } from "../lib/db";

export default async function transactionsRoutes(server: FastifyInstance) {
  server.addHook("onRequest", verifyAuth);

  server.get("/", async (request, reply) => {
    const sql = getDb();
    const txRows = await sql`
      SELECT * FROM "AutomatedTransaction"
      WHERE "userId" = ${request.user!.id}::uuid
      ORDER BY "createdAt" DESC
      LIMIT 100
    `;
    return reply.send(txRows);
  });
}
