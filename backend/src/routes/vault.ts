/**
 * routes/vault.ts
 *
 * REST API for user vaults:
 *
 * GET    /api/vault           → list user's vaults (savings + investment)
 * POST   /api/vault/:type     → create a vault (type: savings | investment)
 * GET    /api/vault/:type/balance → live on-chain balance
 * POST   /api/vault/:type/withdraw → withdraw funds back to wallet
 * DELETE /api/vault/:type     → close vault (merge XLM back to wallet)
 */

import { FastifyInstance } from "fastify";
import { verifyAuth } from "../middleware/auth";
import { getDb } from "../lib/db";
import {
  createVaultOnChain,
  getVaultBalance,
  depositXLMToVault,
  depositUSDCToVault,
  withdrawXLMFromVault,
  withdrawUSDCFromVault,
  closeVault,
  VaultType,
} from "../stellar/vault";

const VALID_TYPES: VaultType[] = ["savings", "investment"];

export default async function vaultRoutes(server: FastifyInstance) {
  server.addHook("onRequest", verifyAuth);

  // ── List all vaults ───────────────────────────────────────────────────

  server.get("/", async (request, reply) => {
    const sql = getDb();
    const vaults = await sql`
      SELECT id, type, "publicKey", "xlmBalance", "usdcBalance", "fundTxHash", "createdAt"
      FROM "Vault"
      WHERE "userId" = ${request.user.id}::uuid
      ORDER BY "createdAt" ASC
    `;
    return reply.send(vaults);
  });

  // ── Create a vault ────────────────────────────────────────────────────

  server.post("/:type", async (request, reply) => {
    const { type } = request.params as { type: string };

    if (!VALID_TYPES.includes(type as VaultType)) {
      return reply.status(400).send({
        error: `Invalid vault type. Must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    const sql = getDb();

    // Check if vault already exists
    const existing = await sql`
      SELECT id, "publicKey" FROM "Vault"
      WHERE "userId" = ${request.user.id}::uuid AND type = ${type}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return reply.status(409).send({
        error: `A ${type} vault already exists for this account.`,
        vault: existing[0],
      });
    }

    // Check engine account is funded (needs ~2.5 XLM to create a vault)
    const { fetchXLMBalance } = await import("../stellar/horizon");
    const engineBalance = await fetchXLMBalance(process.env.AUTOPILOT_PUBLIC_KEY!);
    if (engineBalance < 3) {
      return reply.status(503).send({
        error:
          `Engine account needs at least 3 XLM to create a vault (current: ${engineBalance.toFixed(2)} XLM). ` +
          `Fund the engine at: ${process.env.AUTOPILOT_PUBLIC_KEY}`,
      });
    }

    try {
      const { publicKey, encryptedSecret, fundTxHash } = await createVaultOnChain(
        request.user.id,
        type as VaultType
      );

      const inserted = await sql`
        INSERT INTO "Vault"
          (id, "userId", type, "publicKey", "encryptedSecret", "fundTxHash", "createdAt", "updatedAt")
        VALUES
          (gen_random_uuid(), ${request.user.id}::uuid, ${type},
           ${publicKey}, ${encryptedSecret}, ${fundTxHash}, NOW(), NOW())
        RETURNING id, type, "publicKey", "fundTxHash", "createdAt"
      `;

      return reply.status(201).send({
        message: `${type} vault created on Stellar testnet`,
        vault: inserted[0],
        fundTxHash,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${fundTxHash}`,
      });
    } catch (err: any) {
      console.error(`[Vault] ✗ Failed to create ${type} vault:`, err?.message);
      return reply.status(500).send({
        error: `Failed to create vault: ${err?.message ?? "Unknown error"}`,
      });
    }
  });

  // ── Get live balance ──────────────────────────────────────────────────

  server.get("/:type/balance", async (request, reply) => {
    const { type } = request.params as { type: string };
    const sql = getDb();

    const vaults = await sql`
      SELECT "publicKey" FROM "Vault"
      WHERE "userId" = ${request.user.id}::uuid AND type = ${type}
      LIMIT 1
    `;

    if (vaults.length === 0) {
      return reply.status(404).send({ error: `No ${type} vault found. Create one first.` });
    }

    try {
      const balance = await getVaultBalance(vaults[0].publicKey as string);

      // Cache the balance in DB (best-effort)
      await sql`
        UPDATE "Vault"
        SET "xlmBalance" = ${balance.xlm.toFixed(7)},
            "usdcBalance" = ${balance.usdc.toFixed(7)},
            "updatedAt" = NOW()
        WHERE "userId" = ${request.user.id}::uuid AND type = ${type}
      `;

      return reply.send({
        type,
        publicKey: vaults[0].publicKey,
        xlm: balance.xlm,
        usdc: balance.usdc,
        isActive: balance.isActive,
        explorerUrl: balance.explorerUrl,
      });
    } catch (err: any) {
      return reply.status(500).send({ error: err?.message });
    }
  });

  // ── Withdraw from vault ───────────────────────────────────────────────

  server.post("/:type/withdraw", async (request, reply) => {
    const { type } = request.params as { type: string };
    const { asset = "xlm", amount } = request.body as {
      asset?: "xlm" | "usdc";
      amount: string;
    };

    if (!amount || isNaN(parseFloat(amount))) {
      return reply.status(400).send({ error: "amount is required and must be a number" });
    }

    const sql = getDb();
    const vaults = await sql`
      SELECT "publicKey", "encryptedSecret" FROM "Vault"
      WHERE "userId" = ${request.user.id}::uuid AND type = ${type}
      LIMIT 1
    `;

    if (vaults.length === 0) {
      return reply.status(404).send({ error: `No ${type} vault found.` });
    }

    const vault = vaults[0];

    try {
      let txHash: string;

      if (asset === "usdc") {
        txHash = await withdrawUSDCFromVault(
          vault.encryptedSecret as string,
          request.user.publicKey,
          parseFloat(amount).toFixed(7)
        );
      } else {
        txHash = await withdrawXLMFromVault(
          vault.encryptedSecret as string,
          request.user.publicKey,
          parseFloat(amount).toFixed(7)
        );
      }

      return reply.send({
        success: true,
        txHash,
        explorerUrl: `https://stellar.expert/explorer/${process.env.STELLAR_NETWORK === "mainnet" ? "public" : "testnet"}/tx/${txHash}`,
      });
    } catch (err: any) {
      return reply.status(500).send({ error: err?.message });
    }
  });

  // ── Close vault ───────────────────────────────────────────────────────

  server.delete("/:type", async (request, reply) => {
    const { type } = request.params as { type: string };
    const sql = getDb();

    const vaults = await sql`
      SELECT id, "publicKey", "encryptedSecret" FROM "Vault"
      WHERE "userId" = ${request.user.id}::uuid AND type = ${type}
      LIMIT 1
    `;

    if (vaults.length === 0) {
      return reply.status(404).send({ error: `No ${type} vault found.` });
    }

    const vault = vaults[0];

    try {
      const txHash = await closeVault(
        vault.encryptedSecret as string,
        request.user.publicKey
      );

      await sql`DELETE FROM "Vault" WHERE id = ${vault.id}::uuid`;

      return reply.send({
        success: true,
        message: `${type} vault closed. All XLM returned to your wallet.`,
        txHash,
      });
    } catch (err: any) {
      return reply.status(500).send({ error: err?.message });
    }
  });
}
