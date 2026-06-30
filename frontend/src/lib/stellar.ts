export interface StellarBalance {
  xlm: string;
  otherAssets: Array<{ asset: string; balance: string }>;
  isUnfunded: boolean;
}

export async function fetchStellarBalance(publicKey: string): Promise<StellarBalance> {
  try {
    const res = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${publicKey}`,
      { next: { revalidate: 30 } }
    );

    if (!res.ok) {
      return { xlm: "0.0000000", otherAssets: [], isUnfunded: true };
    }

    const data = await res.json();
    const balances: any[] = data.balances ?? [];

    const xlmBalance = balances.find((b) => b.asset_type === "native");
    const otherAssets = balances
      .filter((b) => b.asset_type !== "native")
      .map((b) => ({
        asset: b.asset_code ?? "Unknown",
        balance: b.balance,
      }));

    return {
      xlm: xlmBalance?.balance ?? "0.0000000",
      otherAssets,
      isUnfunded: false,
    };
  } catch {
    return { xlm: "0.0000000", otherAssets: [], isUnfunded: true };
  }
}

export function formatXLM(balance: string): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num);
}
