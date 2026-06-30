import { FastifyInstance } from "fastify";
import { verifyAuth } from "../middleware/auth";
import { getDb } from "../lib/db";

export default async function goalsRoutes(server: FastifyInstance) {
  server.addHook("onRequest", verifyAuth);

  server.get("/", async (request, reply) => {
    const sql = getDb();
    const goals = await sql`
      SELECT * FROM "Goal" 
      WHERE "userId" = ${request.user!.id}::uuid 
      ORDER BY "createdAt" DESC
    `;
    return reply.send(goals);
  });

  server.post("/", async (request, reply) => {
    const body = request.body as any;
    const sql = getDb();

    if (!body.name || !body.targetAmount) {
      return reply.status(400).send({ error: "Name and target amount are required" });
    }

    const result = await sql`
      INSERT INTO "Goal" (
        "userId", name, "targetAmount", "currentAmount", emoji
      )
      VALUES (
        ${request.user!.id}::uuid,
        ${body.name},
        ${body.targetAmount},
        0,
        ${body.emoji || "🎯"}
      )
      RETURNING *
    `;

    return reply.send({ success: true, goal: result[0] });
  });

  server.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const sql = getDb();

    // Verify ownership
    const existing = await sql`SELECT id FROM "Goal" WHERE id = ${id}::uuid AND "userId" = ${request.user!.id}::uuid`;
    if (existing.length === 0) {
      return reply.status(404).send({ error: "Goal not found" });
    }

    const result = await sql`
      UPDATE "Goal"
      SET 
        "linkedRuleId" = CASE WHEN ${body.linkedRuleId !== undefined} THEN ${body.linkedRuleId ?? null}::uuid ELSE "linkedRuleId" END,
        "currentAmount" = CASE WHEN ${body.currentAmount !== undefined} THEN ${body.currentAmount ?? 0} ELSE "currentAmount" END,
        "updatedAt" = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    return reply.send({ success: true, goal: result[0] });
  });

  server.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const sql = getDb();

    const result = await sql`
      DELETE FROM "Goal" 
      WHERE id = ${id}::uuid AND "userId" = ${request.user!.id}::uuid
      RETURNING id
    `;

    if (result.length === 0) {
      return reply.status(404).send({ error: "Goal not found" });
    }

    return reply.send({ success: true });
  });
}
