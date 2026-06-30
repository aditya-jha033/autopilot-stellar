/**
 * stellar/transaction.ts
 *
 * Transaction builder + signer + submitter.
 *
 * Supports:
 *  - sendXLM(from, to, amount, memo)
 *  - sendUSDC(from, to, amount, memo)
 *  - createTrustline(account, asset)       ← needed before receiving USDC
 *  - fundAccount(destination)              ← activate a new Stellar account (min 1 XLM)
 *  - mergeStellarAccount(from, destination) ← send all XLM + close account
 *
 * All functions accept a Keypair for signing and return the tx hash.
 */

import {
  TransactionBuilder,
  Operation,
  Memo,
  Asset,
  BASE_FEE,
  Keypair,
} from "@stellar/stellar-sdk";
import {
  loadAccount,
  submitTransaction,
  NETWORK_PASSPHRASE,
  XLM_ASSET,
  USDC_ASSET,
} from "./horizon";

const TX_TIMEOUT_SECONDS = 30;

/** Build a standard transaction with a single operation. */
async function buildTx(
  sourcePublicKey: string,
  fee = BASE_FEE
): Promise<TransactionBuilder> {
  const account = await loadAccount(sourcePublicKey);
  return new TransactionBuilder(account, {
    fee,
    networkPassphrase: NETWORK_PASSPHRASE,
  });
}

// ── XLM Transfer ─────────────────────────────────────────────────────────

/**
 * Send XLM from one Stellar account to another.
 * @param signer  Keypair of the sending account
 * @param to      Destination public key (G...)
 * @param amount  Amount as string with up to 7 decimal places (e.g. "10.0000000")
 * @param memo    Optional text memo (max 28 chars)
 */
export async function sendXLM(
  signer: typeof Keypair.prototype,
  to: string,
  amount: string,
  memo?: string
): Promise<string> {
  const builder = await buildTx(signer.publicKey());

  builder.addOperation(
    Operation.payment({
      destination: to,
      asset: XLM_ASSET,
      amount,
    })
  );

  if (memo) builder.addMemo(Memo.text(memo.slice(0, 28)));

  const tx = builder.setTimeout(TX_TIMEOUT_SECONDS).build();
  tx.sign(signer);

  return submitTransaction(tx);
}

// ── USDC Transfer ─────────────────────────────────────────────────────────

/**
 * Send USDC from one Stellar account to another.
 * Both accounts must have a USDC trustline before this will work.
 */
export async function sendUSDC(
  signer: typeof Keypair.prototype,
  to: string,
  amount: string,
  memo?: string
): Promise<string> {
  const builder = await buildTx(signer.publicKey());

  builder.addOperation(
    Operation.payment({
      destination: to,
      asset: USDC_ASSET,
      amount,
    })
  );

  if (memo) builder.addMemo(Memo.text(memo.slice(0, 28)));

  const tx = builder.setTimeout(TX_TIMEOUT_SECONDS).build();
  tx.sign(signer);

  return submitTransaction(tx);
}

// ── Trustline ─────────────────────────────────────────────────────────────

/**
 * Create a trustline for an asset (required before receiving USDC).
 * Sets the limit to the maximum possible (unlimited).
 */
export async function createTrustline(
  signer: typeof Keypair.prototype,
  asset: Asset
): Promise<string> {
  const builder = await buildTx(signer.publicKey());

  builder.addOperation(
    Operation.changeTrust({
      asset,
      limit: "922337203685.4775807", // max Stellar amount
    })
  );

  const tx = builder.setTimeout(TX_TIMEOUT_SECONDS).build();
  tx.sign(signer);

  return submitTransaction(tx);
}

/** Shorthand: create USDC trustline */
export async function createUSDCTrustline(
  signer: typeof Keypair.prototype
): Promise<string> {
  return createTrustline(signer, USDC_ASSET);
}

// ── Account Funding ────────────────────────────────────────────────────────

/**
 * Activate a new (unfunded) Stellar account by sending it the minimum XLM
 * needed to exist on the ledger (1.5 XLM covers base reserve + one trustline).
 *
 * Uses createAccount operation instead of payment (required for new accounts).
 *
 * @param engineSigner  The engine keypair that pays for the activation
 * @param destination   New account public key to fund
 * @param startingBalance  How much XLM to send (minimum 1 XLM). Default: 2 XLM
 */
export async function fundNewAccount(
  engineSigner: typeof Keypair.prototype,
  destination: string,
  startingBalance = "2.0000000"
): Promise<string> {
  const builder = await buildTx(engineSigner.publicKey());

  builder.addOperation(
    Operation.createAccount({
      destination,
      startingBalance,
    })
  );

  builder.addMemo(Memo.text("AutoPilot vault"));

  const tx = builder.setTimeout(TX_TIMEOUT_SECONDS).build();
  tx.sign(engineSigner);

  return submitTransaction(tx);
}

// ── Account Merge ──────────────────────────────────────────────────────────

/**
 * Close a vault account by merging all its XLM back to a destination.
 * Used when a user disconnects and wants their funds returned.
 */
export async function mergeAccount(
  signer: typeof Keypair.prototype,
  destination: string
): Promise<string> {
  const builder = await buildTx(signer.publicKey());

  builder.addOperation(
    Operation.accountMerge({ destination })
  );

  builder.addMemo(Memo.text("AutoPilot close vault"));

  const tx = builder.setTimeout(TX_TIMEOUT_SECONDS).build();
  tx.sign(signer);

  return submitTransaction(tx);
}

// ── Multi-op batch ─────────────────────────────────────────────────────────

/**
 * Fund a new vault AND immediately add a USDC trustline in one atomic transaction.
 * This is more efficient than two separate transactions (one fee, one ledger slot).
 *
 * @param engineSigner  Pays for account creation
 * @param vaultSigner   Signs the trustline (must be the new account's keypair)
 */
export async function fundAndTrustlineVault(
  engineSigner: typeof Keypair.prototype,
  vaultSigner: typeof Keypair.prototype
): Promise<string> {
  const account = await loadAccount(engineSigner.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: String(parseInt(BASE_FEE) * 2), // 2 operations
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.createAccount({
        destination: vaultSigner.publicKey(),
        startingBalance: "2.5000000", // covers base reserve + trustline reserve
      })
    )
    .addOperation(
      Operation.changeTrust({
        source: vaultSigner.publicKey(),
        asset: USDC_ASSET,
        limit: "922337203685.4775807",
      })
    )
    .addMemo(Memo.text("AutoPilot vault init"))
    .setTimeout(TX_TIMEOUT_SECONDS)
    .build();

  // Both accounts must sign
  tx.sign(engineSigner);
  tx.sign(vaultSigner);

  return submitTransaction(tx);
}

/** Format an amount to Stellar's 7-decimal-place precision */
export function toStellarAmount(amount: number): string {
  return amount.toFixed(7);
}
