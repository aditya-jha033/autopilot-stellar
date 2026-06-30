"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, ExternalLink, Zap, Shield, Crown,
  AlertTriangle, LogOut, Loader2, ChevronRight,
  DollarSign, Calendar, TrendingUp, Clock, X,
  CheckCircle2, ArrowUpRight, ArrowDownLeft,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AccountData {
  publicKey: string;
  dailyLimit: number | null;
  weeklyLimit: number | null;
  plan: "free" | "premium";
  activeRules: number;
  transactions: Tx[];
}

interface Tx {
  id: string;
  type: string;
  amount: number;
  memo: string | null;
  txHash: string | null;
  createdAt: string;
}

const FREE_RULE_LIMIT = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Section Wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.05]">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  );
}

// ── Wallet Card ───────────────────────────────────────────────────────────────
function WalletCard({ publicKey }: { publicKey: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Section title="Wallet">
      <div className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
            {publicKey.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Stellar Public Key</p>
            <p className="text-sm font-mono text-white/70 truncate">{publicKey}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copy}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition-colors"
              title="Copy address"
            >
              <AnimatePresence mode="wait">
                {copied
                  ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4 text-green-400" /></motion.div>
                  : <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy className="w-4 h-4 text-white/40" /></motion.div>
                }
              </AnimatePresence>
            </button>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
              target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition-colors"
              title="View on Stellar Expert"
            >
              <ExternalLink className="w-4 h-4 text-white/40" />
            </a>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-white/30">Connected · Stellar Testnet</span>
        </div>
      </div>
    </Section>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  activeRules,
  onUpgrade,
}: {
  plan: "free" | "premium";
  activeRules: number;
  onUpgrade: () => void;
}) {
  const isPremium = plan === "premium";

  return (
    <Section title="Plan">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isPremium ? "bg-amber-500/20 border border-amber-500/30" : "bg-white/[0.05] border border-white/[0.08]"
            }`}>
              {isPremium ? <Crown className="w-5 h-5 text-amber-400" /> : <Zap className="w-5 h-5 text-white/40" />}
            </div>
            <div>
              <p className="font-semibold text-white capitalize">{plan}</p>
              <p className="text-xs text-white/35 mt-0.5">
                {isPremium ? "Unlimited rules · Priority execution" : `${activeRules} / ${FREE_RULE_LIMIT} rules used`}
              </p>
            </div>
          </div>
          {!isPremium && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/[0.05] text-white/25 border border-white/[0.06]">
              FREE
            </span>
          )}
        </div>

        {/* Rule usage bar (free plan only) */}
        {!isPremium && (
          <div className="mb-5">
            <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
              <span>Rules used</span>
              <span>{activeRules} / {FREE_RULE_LIMIT}</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((activeRules / FREE_RULE_LIMIT) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  activeRules >= FREE_RULE_LIMIT ? "bg-red-500" : "bg-blue-500"
                }`}
              />
            </div>
          </div>
        )}

        {/* Feature comparison */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { feature: "Active rules", free: "3 max", premium: "Unlimited", icon: Zap },
            { feature: "Execution speed", free: "30s polling", premium: "Real-time", icon: Clock },
            { feature: "Transaction history", free: "30 days", premium: "All-time", icon: Calendar },
            { feature: "AI Coach insights", free: "Weekly", premium: "Daily", icon: TrendingUp },
          ].map(({ feature, free, premium, icon: Icon }) => (
            <div key={feature} className="bg-white/[0.02] rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3 h-3 text-white/25" />
                <p className="text-[10px] text-white/35 uppercase tracking-wider">{feature}</p>
              </div>
              <p className={`text-xs font-medium ${isPremium ? "text-amber-400" : "text-white/60"}`}>
                {isPremium ? premium : free}
              </p>
            </div>
          ))}
        </div>

        {!isPremium && (
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/25 hover:border-amber-500/40 text-amber-400 font-semibold text-sm transition-all"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Premium
          </button>
        )}

        {isPremium && (
          <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400 font-medium">Premium active — all features unlocked</p>
          </div>
        )}
      </div>
    </Section>
  );
}

// ── Spending Limits ───────────────────────────────────────────────────────────
function LimitRow({
  label, sublabel, icon: Icon, value, onSave,
}: {
  label: string;
  sublabel: string;
  icon: React.ElementType;
  value: number | null;
  onSave: (val: number | null) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value !== null ? String(value) : "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const parsed = input.trim() === "" ? null : parseFloat(input);
    await onSave(isNaN(parsed as number) ? null : parsed);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-white/35" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-xs text-white/30 mt-0.5">{sublabel}</p>
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <input
              type="number"
              min="0"
              step="any"
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="∞"
              className="w-24 bg-white/[0.07] border border-blue-500/40 rounded-lg px-3 py-1.5 text-sm text-white text-right focus:outline-none"
            />
            <span className="text-xs text-white/30">XLM</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Check className="w-3.5 h-3.5 text-white" />}
            </button>
            <button
              onClick={() => { setEditing(false); setInput(value !== null ? String(value) : ""); }}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] transition-colors group"
          >
            <span className={`text-sm font-semibold ${value !== null ? "text-white/80" : "text-white/25"}`}>
              {value !== null ? `${value} XLM` : "No limit"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpendingLimits({
  dailyLimit, weeklyLimit, onUpdate,
}: {
  dailyLimit: number | null;
  weeklyLimit: number | null;
  onUpdate: (key: "dailyLimit" | "weeklyLimit", val: number | null) => void;
}) {
  const save = async (key: "dailyLimit" | "weeklyLimit", val: number | null) => {
    await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: val }),
    });
    onUpdate(key, val);
  };

  return (
    <Section title="Spending Limits">
      <div className="px-6 py-3.5 flex items-center gap-2 bg-blue-500/[0.04] border-b border-white/[0.04]">
        <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <p className="text-xs text-blue-400/80">
          Caps enforced by the automation engine. Rules will not execute beyond these limits.
        </p>
      </div>
      <LimitRow
        label="Daily cap"
        sublabel="Max XLM automated per 24h"
        icon={Clock}
        value={dailyLimit}
        onSave={v => save("dailyLimit", v)}
      />
      <LimitRow
        label="Weekly cap"
        sublabel="Max XLM automated per 7 days"
        icon={Calendar}
        value={weeklyLimit}
        onSave={v => save("weeklyLimit", v)}
      />
    </Section>
  );
}

// ── Transaction History ───────────────────────────────────────────────────────
function TxHistory({ transactions }: { transactions: Tx[] }) {
  const [filter, setFilter] = useState<"all" | "save" | "invest">("all");

  const filtered = filter === "all"
    ? transactions
    : transactions.filter(t => t.type === filter);

  const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    save:    { label: "Save",    color: "text-green-400",  bg: "bg-green-500/10",  icon: ArrowDownLeft },
    invest:  { label: "Invest",  color: "text-blue-400",   bg: "bg-blue-500/10",   icon: TrendingUp },
    buffer:  { label: "Buffer",  color: "text-amber-400",  bg: "bg-amber-500/10",  icon: Shield },
    default: { label: "Auto",    color: "text-white/50",   bg: "bg-white/[0.05]",  icon: Zap },
  };

  return (
    <Section title={`Transaction History (${transactions.length})`}>
      {/* Filter pills */}
      <div className="px-6 py-3 border-b border-white/[0.05] flex gap-2">
        {(["all", "save", "invest"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              filter === f
                ? "bg-white/[0.10] text-white"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {f === "all" ? `All (${transactions.length})` : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Zap className="w-6 h-6 text-white/15 mx-auto mb-3" />
          <p className="text-sm text-white/25">No transactions yet</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {filtered.map(tx => {
            const cfg = typeConfig[tx.type] ?? typeConfig.default;
            const Icon = cfg.icon;
            const stellarUrl = tx.txHash
              ? `https://stellar.expert/explorer/testnet/tx/${tx.txHash}`
              : null;

            return (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-white/20">·</span>
                    <span className="text-[10px] text-white/30">{formatDate(tx.createdAt)}</span>
                  </div>
                  <p className="text-sm text-white/70 mt-0.5 truncate">
                    {tx.memo ?? "AutoPilot rule triggered"}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`text-sm font-semibold ${cfg.color}`}>
                    {Number(tx.amount).toFixed(4)} XLM
                  </span>
                  {stellarUrl ? (
                    <a
                      href={stellarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-white/20 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title="View on Stellar Expert"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="w-7 h-7" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ── Upgrade Modal ─────────────────────────────────────────────────────────────
function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#0a0a0a] border border-white/[0.10] rounded-3xl p-8 max-w-sm w-full relative overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <button onClick={onClose} className="absolute top-5 right-5 text-white/25 hover:text-white/60 transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-5">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-xl font-bold text-white text-center mb-2">AutoPilot Premium</h2>
            <p className="text-sm text-white/40 text-center mb-6">Unlock the full power of automated finance</p>

            <div className="space-y-3 mb-6">
              {[
                "Unlimited automation rules",
                "Real-time payment detection",
                "Daily AI Coach insights",
                "Full transaction history",
                "Priority rule execution",
                "Advanced spending limits",
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-sm text-white/70">{f}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5 text-center">
              <p className="text-3xl font-bold text-white">$4.99 <span className="text-lg font-normal text-white/40">/ mo</span></p>
              <p className="text-xs text-white/30 mt-1">Billed monthly · Cancel anytime</p>
            </div>

            <button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              onClick={() => alert("Payment integration coming soon! This is a testnet demo.")}
            >
              <Crown className="w-4 h-4" />
              Upgrade Now — $4.99/mo
            </button>
            <p className="text-[11px] text-white/20 text-center mt-3">
              Testnet demo · Payment integration coming soon
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Danger Zone ───────────────────────────────────────────────────────────────
function DangerZone() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    await fetch("/api/account/disconnect", { method: "POST" });
    router.push("/onboarding");
  };

  return (
    <div className="bg-red-500/[0.04] border border-red-500/15 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-red-500/10">
        <p className="text-xs font-semibold text-red-500/60 uppercase tracking-wider">Danger Zone</p>
      </div>
      <div className="px-4 md:px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80">Disconnect wallet</p>
            <p className="text-xs text-white/35 mt-1">
              Clears your session and pauses all active automation rules. Your rules and history are preserved.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showConfirm ? (
              <motion.button
                key="show"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowConfirm(true)}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/25 bg-red-500/[0.07] hover:bg-red-500/[0.12] text-red-400 text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="shrink-0 flex items-center gap-2"
              >
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {disconnecting
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <AlertTriangle className="w-3.5 h-3.5" />
                  }
                  {disconnecting ? "Disconnecting…" : "Yes, disconnect"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AccountClient({ publicKey }: { publicKey: string }) {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/account");
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateLimit = (key: "dailyLimit" | "weeklyLimit", val: number | null) => {
    setData(prev => prev ? { ...prev, [key]: val } : prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-3xl mx-auto w-full space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Account</h1>
        <p className="text-sm text-white/35 mt-1">Manage your wallet, limits, plan, and history</p>
      </div>

      <WalletCard publicKey={publicKey} />

      <PlanCard
        plan={data?.plan ?? "free"}
        activeRules={data?.activeRules ?? 0}
        onUpgrade={() => setShowUpgrade(true)}
      />

      <SpendingLimits
        dailyLimit={data?.dailyLimit ?? null}
        weeklyLimit={data?.weeklyLimit ?? null}
        onUpdate={updateLimit}
      />

      <TxHistory transactions={data?.transactions ?? []} />

      <DangerZone />

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
