"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vault,
  TrendingUp,
  PiggyBank,
  Plus,
  ArrowDownLeft,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

// ─── Types ─────────────────────────────────────────────────────────────────

interface VaultData {
  id: string;
  type: "savings" | "investment";
  publicKey: string;
  xlmBalance: string;
  usdcBalance: string;
  fundTxHash: string | null;
  createdAt: string;
}

interface VaultBalance {
  type: string;
  publicKey: string;
  xlm: number;
  usdc: number;
  isActive: boolean;
  explorerUrl: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const VAULT_META = {
  savings: {
    label: "Savings Vault",
    icon: PiggyBank,
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
    desc: "Auto-saves a % of every incoming payment",
  },
  investment: {
    label: "Investment Vault",
    icon: TrendingUp,
    gradient: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/10",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dot: "bg-purple-400",
    desc: "Auto-invests on a recurring schedule",
  },
};

// ─── Withdraw Modal ────────────────────────────────────────────────────────

function WithdrawModal({
  vaultType,
  balance,
  onClose,
  onSuccess,
}: {
  vaultType: "savings" | "investment";
  balance: VaultBalance | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [asset, setAsset] = useState<"xlm" | "usdc">("xlm");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleWithdraw = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError("Enter a valid amount");
      return;
    }
    
    // Check reserve limit for XLM
    if (asset === "xlm" && balance) {
      const maxWithdrawable = Math.max(0, balance.xlm - 2.5);
      if (parseFloat(amount) > maxWithdrawable) {
        setError(`Insufficient funds. Minimum 2.5 XLM reserve required. Max: ${maxWithdrawable.toFixed(2)}`);
        return;
      }
    } else if (asset === "usdc" && balance) {
      if (parseFloat(amount) > balance.usdc) {
        setError(`Insufficient USDC. Max: ${balance.usdc.toFixed(2)}`);
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/vault/${vaultType}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ asset, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-white">
            Withdraw from {VAULT_META[vaultType].label}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Asset selector */}
        <div className="flex gap-2 mb-4">
          {(["xlm", "usdc"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAsset(a)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                asset === a
                  ? "bg-white/10 text-white border border-white/15"
                  : "text-white/30 hover:text-white/50 border border-white/[0.05]"
              }`}
            >
              {a.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 mb-3">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => {
                if (balance) {
                  const max = asset === "xlm" ? Math.max(0, balance.xlm - 2.5) : balance.usdc;
                  setAmount(((pct / 100) * max).toFixed(4));
                }
              }}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-colors border border-white/[0.04]"
            >
              {pct === 100 ? "Max" : `${pct}%`}
            </button>
          ))}
        </div>

        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 mb-3"
        />

        {error && (
          <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}

        <p className="text-xs text-white/30 mb-4">
          Funds will be sent to your connected wallet. A minimum reserve of 2.5 XLM must remain in the vault.
        </p>

        <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border border-white/[0.04] rounded-lg mb-4 text-[10px] text-white/40">
          <span>Estimated Network Fee:</span>
          <span className="font-mono text-white/70">~0.00001 XLM (1-3s)</span>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownLeft className="w-4 h-4" />}
          {loading ? "Processing…" : "Withdraw"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Vault Card ────────────────────────────────────────────────────────────

function VaultCard({
  vault,
  onRefresh,
}: {
  vault: VaultData;
  onRefresh: () => void;
}) {
  const meta = VAULT_META[vault.type];
  const Icon = meta.icon;
  const [balance, setBalance] = useState<VaultBalance | null>(null);
  const [analytics, setAnalytics] = useState<{ raw: number[]; scaled: number[] } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const fetchBalance = useCallback(async () => {
    setRefreshing(true);
    try {
      const [res, analyticsRes] = await Promise.all([
        fetch(`/api/vault/${vault.type}/balance`, { credentials: "include" }),
        fetch(`/api/vault/${vault.type}/analytics`, { credentials: "include" })
      ]);
      if (res.ok) setBalance(await res.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch {}
    setRefreshing(false);
  }, [vault.type]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.gradient} p-5 shadow-xl ${meta.glow}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${meta.border} bg-black/30`}>
              <Icon className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{meta.label}</h3>
              <p className="text-xs text-white/35 mt-0.5">{meta.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium border ${meta.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shadow-[0_0_4px] animate-pulse`} />
              Active
            </span>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/20 rounded-xl px-4 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">XLM</p>
            <p className="text-xl font-bold text-white font-mono">
              {refreshing ? (
                <span className="text-white/20">—</span>
              ) : (
                (balance?.xlm ?? parseFloat(vault.xlmBalance)).toFixed(4)
              )}
            </p>
          </div>

          <div className="bg-black/20 rounded-xl px-4 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">USDC</p>
            <p className="text-xl font-bold text-white font-mono">
              {refreshing ? (
                <span className="text-white/20">—</span>
              ) : (
                (balance?.usdc ?? parseFloat(vault.usdcBalance)).toFixed(2)
              )}
            </p>
          </div>
        </div>

        {/* Public Key */}
        <div className="bg-black/20 rounded-xl px-3 py-2 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/25 mb-0.5">Stellar Address</p>
            <p className="text-xs font-mono text-white/50">
              {vault.publicKey.slice(0, 10)}…{vault.publicKey.slice(-6)}
            </p>
          </div>
          {balance?.explorerUrl && (
            <a
              href={balance.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-white/60 transition-colors"
              title="View on Stellar Expert"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={fetchBalance}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Withdraw
          </button>
          {vault.fundTxHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${vault.fundTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 bg-white/[0.04] border border-white/[0.06] transition-all"
            >
              Fund Tx <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Spending Limits (Saurav Kar Feedback) */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-md relative overflow-hidden group mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            Spending Limits
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-2">Daily (USDC)</label>
              <input type="number" placeholder="e.g. 50" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-2">Weekly (USDC)</label>
              <input type="number" placeholder="e.g. 300" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/30">
              Save Limits
            </button>
          </div>
        </div>

        {/* Vault Analytics (Soumen Das Feedback) */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-md relative overflow-hidden group mb-2">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            </div>
            7-Day Growth
          </h3>
          <div className="h-24 flex items-end justify-between gap-2 mt-4 px-2">
            {(analytics?.scaled || [5, 5, 5, 5, 5, 5, 5]).map((height, i) => {
              const rawVal = analytics?.raw?.[i] ?? 0;
              return (
                <div key={i} className="relative flex flex-col items-center group/bar w-full">
                  <div className="w-full bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500/40 transition-all cursor-pointer" style={{ height: `${height}%` }}></div>
                  <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 text-[9px] text-emerald-300 font-mono transition-opacity whitespace-nowrap bg-black/50 px-1.5 rounded">+{rawVal}</div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-2 text-[9px] text-white/30 uppercase">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - 6 + i);
              return <span key={i}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>;
            })}
          </div>
        </div>

      </motion.div>

      <AnimatePresence>
        {showWithdraw && (
          <WithdrawModal
            vaultType={vault.type}
            balance={balance}
            onClose={() => setShowWithdraw(false)}
            onSuccess={onRefresh}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Create Vault Card ─────────────────────────────────────────────────────

function CreateVaultCard({
  type,
  onCreate,
}: {
  type: "savings" | "investment";
  onCreate: () => void;
}) {
  const meta = VAULT_META[type];
  const Icon = meta.icon;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/vault/${type}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`${meta.label} created! Tx: ${data.fundTxHash?.slice(0, 16)}…`);
      setTimeout(onCreate, 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-dashed ${meta.border} bg-gradient-to-br ${meta.gradient} p-5 flex flex-col items-center justify-center text-center min-h-[240px] gap-3`}
    >
      <div className={`p-3 rounded-2xl border ${meta.border} bg-black/30 mb-1`}>
        <Icon className="w-6 h-6 text-white/40" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">{meta.label}</h3>
        <p className="text-xs text-white/35 max-w-[200px] leading-relaxed mb-3">{meta.desc}</p>
        <div className="flex flex-col gap-1 items-center bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] text-white/40">
          <span>Stellar Account Reserve: ~2.5 XLM</span>
          <span>Network Fee: ~0.00001 XLM</span>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1.5 max-w-[240px] text-center">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
      {success && (
        <p className="text-green-400 text-xs flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> {success}
        </p>
      )}

      <button
        onClick={handleCreate}
        disabled={loading || !!success}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-60 ${meta.badge} hover:brightness-125`}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        {loading ? "Creating on Stellar…" : `Create ${type} vault`}
      </button>

      <div className="flex flex-col items-center gap-0.5 mt-1">
        <p className="text-[10px] text-white/40">Estimated Network Fee: ~0.00001 XLM (1-3s)</p>
        <p className="text-[10px] text-white/20">Costs ~2.5 XLM reserve from engine account</p>
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function VaultPage() {
  const [publicKey, setPublicKey] = useState("");
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setPublicKey(data.user?.publicKey ?? "");
    }
  };

  const fetchVaults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vault", { credentials: "include" });
      if (res.ok) setVaults(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
    fetchVaults();
  }, [fetchVaults]);

  const savingsVault = vaults.find((v) => v.type === "savings");
  const investVault = vaults.find((v) => v.type === "investment");

  return (
    <DashboardShell publicKey={publicKey}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-8 w-full">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                <Vault className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Vaults</h1>
                <p className="text-xs text-white/35">
                  Server-controlled Stellar accounts. Your rules deposit here automatically.
                </p>
              </div>
            </div>

            {/* Info banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-blue-500/[0.06] border border-blue-500/[0.12] flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
              <div className="text-xs text-white/50 leading-relaxed">
                Vaults are real Stellar accounts with USDC trustlines. Funds are held on-chain and
                withdrawable at any time. Your secret keys are AES-256-GCM encrypted and never exposed.
              </div>
            </div>
          </div>

          {/* Vaults Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-white/20" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {savingsVault ? (
                <VaultCard vault={savingsVault} onRefresh={fetchVaults} />
              ) : (
                <CreateVaultCard type="savings" onCreate={fetchVaults} />
              )}

              {investVault ? (
                <VaultCard vault={investVault} onRefresh={fetchVaults} />
              ) : (
                <CreateVaultCard type="investment" onCreate={fetchVaults} />
              )}
            </div>
          )}

          {/* How it works */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-blue-500" />
                How vaults work
              </h3>
              <div className="space-y-3">
                {[
                  ["Rule fires", "AutoPilot detects an incoming Stellar payment that matches your rule"],
                  ["Amount calculated", "10% of $50 → $5.00 USDC (7 decimal place precision)"],
                  ["Limit checked", "Redis checks your daily/weekly spend cap before executing"],
                  ["On-chain transfer", "Stellar tx built, signed by engine, submitted to Horizon"],
                  ["Vault funded", "Funds arrive in your savings or investment vault on-chain"],
                ].map(([step, desc], i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold text-white/40 flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white/70">{step}</p>
                      <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                    {i < 4 && <ChevronRight className="w-3.5 h-3.5 text-white/10 ml-auto mt-0.5 shrink-0" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Testnet USDC */}
          {!loading && (
            <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/50">Get testnet USDC</p>
                <p className="text-[11px] text-white/25 mt-0.5">Free from the Stellar Anchor testnet</p>
              </div>
              <a
                href="https://testanchor.stellar.org/sep24/info"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Faucet <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
    </DashboardShell>
  );
}
