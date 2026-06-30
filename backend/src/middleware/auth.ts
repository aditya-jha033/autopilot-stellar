import { FastifyReply, FastifyRequest } from "fastify";
import { checkRateLimit } from "../lib/redis";

/**
 * JWT auth hook — verifies the session cookie on protected routes.
 */
export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: "Unauthorized" });
  }
}

/**
 * Per-wallet API rate limit hook — 100 requests per minute.
 * Falls back to no-op if Redis is not configured.
 */
export async function walletRateLimit(request: FastifyRequest, reply: FastifyReply) {
  // Only apply rate limit on authenticated routes (user already verified)
  const user = (request as any).user;
  if (!user?.publicKey) return;

  const { allowed, remaining } = await checkRateLimit(`api:${user.publicKey}`, 100, 60);

  reply.header("X-RateLimit-Limit", "100");
  reply.header("X-RateLimit-Remaining", String(remaining));

  if (!allowed) {
    return reply.status(429).send({
      error: "Rate limit exceeded. Max 100 requests per minute per wallet.",
    });
  }
}
