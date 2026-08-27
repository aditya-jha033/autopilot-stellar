import { FastifyInstance } from "fastify";
import { StrKey, Utils, Networks, Transaction, Keypair } from "@stellar/stellar-sdk";
import { getDb } from "../lib/db";
import { checkRateLimit } from "../lib/redis";

export default async function authRoutes(server: FastifyInstance) {
  const SERVER_SIGNING_KEY = process.env.AUTOPILOT_SECRET_KEY || Keypair.random().secret();
  const SERVER_KP = Keypair.fromSecret(SERVER_SIGNING_KEY);
  const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

  /**
   * GET /api/auth/challenge
   * Initiates SEP-10 Authentication flow.
   * Accepts a Stellar account public key and returns a base64 encoded transaction challenge.
   */
  server.get("/challenge", async (request, reply) => {
    const { account } = request.query as { account: string };

    if (!account || !StrKey.isValidEd25519PublicKey(account)) {
      return reply.status(400).send({ error: "Valid 'account' query parameter is required" });
    }

    try {
      const challengeTx = Utils.buildChallengeTx(
        SERVER_KP,
        account,
        "AutoPilot Stellar DEX Automation",
        15 * 60, // 15 minutes timeout
        NETWORK_PASSPHRASE
      );
      
      return reply.send({ transaction: challengeTx });
    } catch (err: any) {
      request.log.error("Auth challenge error:", err);
      return reply.status(500).send({ error: "Failed to build SEP-10 challenge" });
    }
  });

  /**
   * POST /api/auth/login (SEP-10 Verify)
   * 
   * Accepts a signed SEP-10 challenge transaction.
   * Issues a JWT stored in an HttpOnly cookie.
   */
  server.post("/login", async (request, reply) => {
    const { transaction } = request.body as { transaction: string };

    if (!transaction) {
      return reply.status(400).send({ error: "transaction is required for SEP-10 login" });
    }

    // Rate limit: max 10 login attempts per IP per minute
    const ip = request.ip ?? "unknown";
    const { allowed } = await checkRateLimit(`login:${ip}`, 10, 60);
    if (!allowed) {
      return reply.status(429).send({ error: "Too many login attempts. Please wait a minute." });
    }

    try {
      // Verify the SEP-10 transaction envelope
      const verified = Utils.verifyChallengeTxThreshold(
        transaction,
        SERVER_KP.publicKey(),
        NETWORK_PASSPHRASE,
        1, // Threshold required (1 for user's own key)
        "AutoPilot Stellar DEX Automation"
      );

      // The verified object returns the set of signers who signed the transaction.
      // We extract the user's public key (the client account).
      const tx = new Transaction(transaction, NETWORK_PASSPHRASE);
      const publicKey = tx.source;

      const sql = getDb();

      // Upsert user ?" create if new, return existing if not
      const users = await sql`
        INSERT INTO "User" (id, "publicKey", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${publicKey}, NOW(), NOW())
        ON CONFLICT ("publicKey") DO UPDATE
          SET "updatedAt" = NOW()
        RETURNING id, "publicKey"
      `;

      const user = users[0];

      // Issue JWT ?" stored in HttpOnly cookie (7 day expiry)
      const token = server.jwt.sign(
        { id: user.id, publicKey: user.publicKey },
        { expiresIn: "7d" }
      );

      const isProd = process.env.NODE_ENV === "production";
      reply.setCookie("session", token, {
        path: "/",
        httpOnly: true,
        secure: isProd,
        // cross-domain (Vercel frontend + Render backend) requires sameSite "none" + secure
        sameSite: isProd ? "none" : "strict",
        maxAge: 60 * 60 * 24 * 7,
      });

      return reply.send({ success: true, user: { id: user.id, publicKey: user.publicKey } });
    } catch (err: any) {
      request.log.error("Auth login error:", err);
      return reply.status(401).send({ error: "Invalid SEP-10 challenge signature", details: err.message });
    }
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
   * Returns current user info if logged in (requires JWT).
   */
  server.get("/me", async (request, reply) => {
    try {
      await request.jwtVerify();
      return reply.send({ user: request.user });
    } catch (err) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });
}
