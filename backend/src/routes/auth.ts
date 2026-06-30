import { FastifyInstance } from "fastify";
import { StrKey } from "@stellar/stellar-sdk";
import { getDb } from "../lib/db";
import { checkRateLimit } from "../lib/redis";

export default async function authRoutes(server: FastifyInstance) {

  /**
   * POST /api/auth/login
   * 
   * Accepts a Stellar public key from the Freighter wallet.
   * The public key itself acts as the identity (no password).
   * Optionally accepts a signed message for stronger verification
   * (signature + message fields are optional for MVP).
   * 
   * Issues a JWT stored in an HttpOnly cookie.
   */
  server.post("/login", async (request, reply) => {
    const { publicKey, signature, message } = request.body as {
      publicKey?: string;
      signature?: string;
      message?: string;
    };

    if (!publicKey) {
      return reply.status(400).send({ error: "publicKey is required" });
    }

    // Validate it's a real Stellar public key (G...)
    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      return reply.status(400).send({ error: "Invalid Stellar public key format" });
    }

    // Rate limit: max 10 login attempts per IP per minute
    const ip = request.ip ?? "unknown";
    const { allowed } = await checkRateLimit(`login:${ip}`, 10, 60);
    if (!allowed) {
      return reply.status(429).send({ error: "Too many login attempts. Please wait a minute." });
    }

    // Optional: signature verification (enabled when both fields provided)
    if (signature && message) {
      try {
        const { Keypair } = await import("@stellar/stellar-sdk");
        const kp = Keypair.fromPublicKey(publicKey);
        const sigBuffer = Buffer.from(signature, "base64");
        const isValid = kp.verify(Buffer.from(message), sigBuffer);
        if (!isValid) {
          return reply.status(401).send({ error: "Invalid wallet signature" });
        }
      } catch {
        return reply.status(400).send({ error: "Signature verification failed" });
      }
    }

    const sql = getDb();

    // Upsert user — create if new, return existing if not
    const users = await sql`
      INSERT INTO "User" (id, "publicKey", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${publicKey}, NOW(), NOW())
      ON CONFLICT ("publicKey") DO UPDATE
        SET "updatedAt" = NOW()
      RETURNING id, "publicKey"
    `;

    const user = users[0];

    // Issue JWT — stored in HttpOnly cookie (7 day expiry)
    const token = server.jwt.sign(
      { id: user.id, publicKey: user.publicKey },
      { expiresIn: "7d" }
    );

    const isProd = process.env.NODE_ENV === "production";
    reply.setCookie("session", token, {
      path: "/",
      httpOnly: true,
      secure: isProd,
      // cross-domain (Vercel frontend ↔ Render backend) requires sameSite "none" + secure
      sameSite: isProd ? "none" : "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.send({ success: true, user: { id: user.id, publicKey: user.publicKey } });
  });

  /**
   * POST /api/auth/logout
   * Clears the session cookie.
   */
  server.post("/logout", async (request, reply) => {
    const isProd = process.env.NODE_ENV === "production";
    reply.setCookie("session", "", {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "strict",
      maxAge: 0,
    });
    return reply.send({ success: true });
  });

  /**
   * GET /api/auth/me
   * Returns the currently logged-in user from the JWT cookie.
   */
  server.get("/me", async (request, reply) => {
    try {
      await request.jwtVerify();
      return reply.send({ user: request.user });
    } catch {
      return reply.status(401).send({ error: "Not authenticated" });
    }
  });
}
