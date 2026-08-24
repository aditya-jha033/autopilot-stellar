import { FastifyInstance } from "fastify";
import { verifyAuth } from "../middleware/auth";
import { getDb } from "../lib/db";

export default async function rulesRoutes(server: FastifyInstance) {
  server.addHook("onRequest", verifyAuth);

  server.get("/", async (request, reply) => {
    const sql = getDb();
    const rules = await sql`
      SELECT * FROM "Rule"
      WHERE "userId" = ${request.user!.id}::uuid
      ORDER BY "createdAt" DESC
    `;
    return reply.send(rules);
  });

  server.post("/", async (request, reply) => {
    const body = request.body as any;
    const sql = getDb();

    if (body.isPercentage && body.amount > 100) {
      return reply.status(400).send({ error: "Percentage amount cannot exceed 100%" });
    }

    const result = await sql`
      INSERT INTO "Rule" (
        id, "userId", trigger, action, amount, "isPercentage", limits, status, memo, description, "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${request.user!.id}::uuid,
        ${body.trigger},
        ${body.action},
        ${body.amount},
        ${body.isPercentage ?? false},
        ${body.limits ? JSON.stringify(body.limits) : null}::jsonb,
        ${body.status ?? "active"},
        ${body.memo ?? null},
        ${body.description ?? null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return reply.send(result[0]);
  });

  server.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const sql = getDb();

    // Verify ownership
    const rules = await sql`SELECT id, amount, "isPercentage" FROM "Rule" WHERE id = ${id}::uuid AND "userId" = ${request.user!.id}::uuid`;
    if (rules.length === 0) {
      return reply.status(404).send({ error: "Rule not found" });
    }

    const currentRule = rules[0];
    const newIsPercentage = body.isPercentage !== undefined ? body.isPercentage : currentRule.isPercentage;
    const newAmount = body.amount !== undefined ? body.amount : currentRule.amount;

    if (newIsPercentage && newAmount > 100) {
      return reply.status(400).send({ error: "Percentage amount cannot exceed 100%" });
    }

    const result = await sql`
      UPDATE "Rule"
      SET 
        status = CASE WHEN ${body.status !== undefined} THEN ${body.status} ELSE status END,
        "updatedAt" = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    return reply.send(result[0]);
  });

  server.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const sql = getDb();

    const rules = await sql`SELECT id FROM "Rule" WHERE id = ${id}::uuid AND "userId" = ${request.user!.id}::uuid`;
    if (rules.length === 0) {
      return reply.status(404).send({ error: "Rule not found" });
    }

    await sql`DELETE FROM "Rule" WHERE id = ${id}::uuid`;
    return reply.send({ success: true });
  });
}
