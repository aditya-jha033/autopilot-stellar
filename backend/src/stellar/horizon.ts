/**
 * stellar/horizon.ts
 *
 * Horizon API wrapper:
 *  - Fetch full account details (balances, sequence number)
 *  - Get XLM + USDC balances formatted
 *  - Fetch recent payments for an account
 *  - Submit a signed transaction envelope
 */

import { Horizon, Networks, Asset } from "@stellar/stellar-sdk";

// ── Config ────────────────────────────────────────────────────────────────

export const HORIZON_URL =
  process.env.HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  process.env.STELLAR_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;

export const IS_TESTNET = process.env.STELLAR_NETWORK !== "mainnet";

/**
 * USDC asset on Stellar.
 * Testnet issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
 * Mainnet issuer: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN  (Circle)
 */
export const USDC_ASSET = IS_TESTNET
  ? new Asset("USDC", "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5")
  : new Asset("USDC", "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");

export const XLM_ASSET = Asset.native();

// ── Horizon server singleton ──────────────────────────────────────────────

let _server: Horizon.Server | null = null;

export function getHorizon(): Horizon.Server {
  if (!_server) _server = new Horizon.Server(HORIZON_URL);
  return _server;
}

// ── Account operations ────────────────────────────────────────────────────

export interface AccountBalance {
  asset: string;        // "XLM" or "USDC" or "TOKEN:ISSUER"
  balance: string;      // decimal string e.g. "100.0000000"
  isNative: boolean;
}

/**
 * Fetch all balances for an account.
 * Returns empty array if account is unfunded (404).
 */
export async function fetchAccountBalances(
  publicKey: string
): Promise<AccountBalance[]> {
  try {
    const account = await getHorizon().accounts().accountId(publicKey).call();

    return account.balances.map((b: any) => ({
      asset: b.asset_type === "native" ? "XLM" : `${b.asset_code}:${b.asset_issuer}`,
      balance: b.balance,
      isNative: b.asset_type === "native",
    }));
  } catch (err: any) {
    if (err?.response?.status === 404) return []; // Unfunded account
    throw err;
  }
}

/** Get just the XLM balance as a number. Returns 0 for unfunded accounts. */
export async function fetchXLMBalance(publicKey: string): Promise<number> {
  const balances = await fetchAccountBalances(publicKey);
  const xlm = balances.find((b) => b.isNative);
  return xlm ? parseFloat(xlm.balance) : 0;
}

/** Get just the USDC balance as a number. Returns 0 if no trustline or unfunded. */
export async function fetchUSDCBalance(publicKey: string): Promise<number> {
  const balances = await fetchAccountBalances(publicKey);
  const usdc = balances.find((b) => b.asset.startsWith("USDC:"));
  return usdc ? parseFloat(usdc.balance) : 0;
}

/** Load a full AccountResponse (needed for building transactions). */
export async function loadAccount(publicKey: string) {
  return getHorizon().loadAccount(publicKey);
}

/** Check if an account exists and is funded. */
export async function accountExists(publicKey: string): Promise<boolean> {
  try {
    await getHorizon().accounts().accountId(publicKey).call();
    return true;
  } catch (err: any) {
    if (err?.response?.status === 404) return false;
    throw err;
  }
}

// ── Payment history ───────────────────────────────────────────────────────

export interface StellarPayment {
  id: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
  createdAt: string;
  pagingToken: string;
  transactionHash: string;
}

/**
 * Fetch the N most recent incoming payments for an account.
 * Filters to only payments WHERE `to === accountId`.
 */
export async function fetchRecentPayments(
  accountId: string,
  limit = 20
): Promise<StellarPayment[]> {
  try {
    const records = await getHorizon()
      .payments()
      .forAccount(accountId)
      .order("desc")
      .limit(limit)
      .call();

    return records.records
      .filter((r: any) => r.type === "payment" && r.to === accountId)
      .map((r: any) => ({
        id: r.id,
        type: "payment",
        from: r.from,
        to: r.to,
        amount: r.amount,
        asset:
          r.asset_type === "native"
            ? "XLM"
            : `${r.asset_code}:${r.asset_issuer}`,
        createdAt: r.created_at,
        pagingToken: r.paging_token,
        transactionHash: r.transaction_hash,
      }));
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

/** Submit a signed transaction XDR to Horizon. Returns the tx hash. */
export async function submitTransaction(
  transaction: Parameters<Horizon.Server["submitTransaction"]>[0]
): Promise<string> {
  const result = await getHorizon().submitTransaction(transaction);
  return result.hash;
}

/** Generate a Stellar Laboratory URL for a tx or account (useful in DB records). */
export function explorerUrl(type: "tx" | "account", id: string): string {
  const net = IS_TESTNET ? "testnet" : "public";
  return `https://stellar.expert/explorer/${net}/${type}/${id}`;
}
