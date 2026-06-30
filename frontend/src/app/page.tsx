"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import EngineStatusPanel from "@/components/EngineStatusPanel";
import {
  TrendingUp,
  Shield,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Metric Tile ─────────────────────────────────────────────────────────────
function MetricTile({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/30 font-medium">{label}</p>
        <div className={`w-7 h-7 rounded-lg ${accent}/10 border ${accent}/20 flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${accent.replace("bg-", "text-")}`} />
        </div>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/25 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({
  type,
  memo,
  amount,
  createdAt,
}: {
  type: string;
  memo: string | null;
  amount: number;
  createdAt: string;
}) {
  const isIncoming = type === "save" || type === "invest";
  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/[0.04] last:border-0">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isIncoming
            ? "bg-green-500/10 text-green-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {isIncoming ? (
          <ArrowDownLeft className="w-4 h-4" />
        ) : (
          <ArrowUpRight className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white/70 capitalize">{type}</p>
        <p className="text-[10px] text-white/30 truncate">
          {memo ?? "AutoPilot rule triggered"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-white/60">
          {Number(amount).toFixed(4)} XLM
        </p>
        <p className="text-[10px] text-white/25">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function EmptyActivity() {
  return (
    <div className="py-10 text-center">
      <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
        <Activity className="w-5 h-5 text-white/20" />
      </div>
      <p className="text-sm text-white/30 font-medium">No activity yet</p>
      <p className="text-xs text-white/20 mt-1">
        Create your first automation rule to see activity here
      </p>
      <Link
        href="/chat"
        className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium justify-center"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Create a rule
      </Link>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [publicKey, setPublicKey] = useState("");
  const [xlmBalance, setXlmBalance] = useState("0");
  const [isUnfunded, setIsUnfunded] = useState(false);
  const [txRows, setTxRows] = useState<any[]>([]);
  const [activeRules, setActiveRules] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Try to load account (if cookie is not set → redirect to onboarding)
        const [accountRes, txRes, rulesRes] = await Promise.all([
          fetch("/api/account"),
          fetch("/api/transactions"),
          fetch("/api/rules"),
        ]);

        if (accountRes.status === 401) {
          router.push("/onboarding");
          return;
        }

        // Safe JSON parse — avoids crash when server returns a 500 HTML body
        const safeJson = async (res: Response) => {
          if (!res.ok) return null;
          try { return await res.json(); } catch { return null; }
        };

        const account  = await safeJson(accountRes);
        const txData   = await safeJson(txRes);
        const rulesData = await safeJson(rulesRes);

        if (!account) return; // not logged in / server error

        const userPublicKey = account.publicKey ?? "";
        setPublicKey(userPublicKey);
        setActiveRules(account.activeRules ?? (Array.isArray(rulesData) ? rulesData.length : 0));
        setTxRows(Array.isArray(txData) ? txData.slice(0, 10) : []);

        // Fetch the USER's own live Stellar balance from Horizon
        if (userPublicKey) {
          try {
            const horizonRes = await fetch(
              `https://horizon-testnet.stellar.org/accounts/${userPublicKey}`
            );
            if (horizonRes.ok) {
              const horizonData = await horizonRes.json();
              const native = (horizonData.balances ?? []).find(
                (b: any) => b.asset_type === "native"
              );
              setXlmBalance(native?.balance ?? "0");
              setIsUnfunded(false);
            } else {
              // 404 = account not funded yet on testnet
              setXlmBalance("0");
              setIsUnfunded(true);
            }
          } catch {
            setXlmBalance("0");
          }
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      }

      setLoading(false);
    }

    loadDashboard();

    // Auto-refresh every 30 seconds so balance and activity stay live
    const interval = setInterval(loadDashboard, 30_000);
    return () => clearInterval(interval);
  }, [router]);


  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const savedThisMonth = txRows
    .filter((tx: any) => tx.type === "save" && new Date(tx.createdAt) >= startOfMonth)
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

  const totalInvested = txRows
    .filter((tx: any) => tx.type === "invest")
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

  const xlmNum = parseFloat(xlmBalance);
  const savingsRate = xlmNum > 0 ? Math.min(Math.round((savedThisMonth / xlmNum) * 100), 100) : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const shortKey = publicKey
    ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`
    : "…";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/30">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell publicKey={publicKey}>
      <div className="px-4 py-6 md:px-6 md:py-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="text-white/30 text-sm mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {greeting},{" "}
            <span className="font-mono text-white/50 text-lg md:text-xl">{shortKey}</span>
          </h1>
        </div>

        {/* Balance Card */}
        <div className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-3xl p-5 md:p-7 mb-6 overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[20%] w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <p className="text-white/40 text-[11px] font-medium tracking-widest uppercase">
                Total Balance
              </p>
              <div className="flex items-center gap-2">
                {isUnfunded && (
                  <span className="text-xs text-amber-400/70 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                    Not funded
                  </span>
                )}
                <span className="text-xs text-blue-400/80 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-full font-medium">
                  ✦ Stellar Testnet
                </span>
              </div>
            </div>

            <div className="flex items-end gap-2 md:gap-3 mb-2 flex-wrap">
              <span className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none break-all">
                {parseFloat(xlmBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xl md:text-2xl font-medium text-white/30 mb-1">XLM</span>
            </div>

            <p className="text-white/25 text-sm">
              Live balance from Stellar Horizon API
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricTile label="Saved this month" value={`${savedThisMonth.toFixed(2)} XLM`} sub="via active rules" icon={Shield} accent="bg-green-500" />
          <MetricTile label="Active rules" value={String(activeRules)} sub={activeRules === 0 ? "Create your first" : "automations running"} icon={Zap} accent="bg-blue-500" />
          <MetricTile label="Invested" value={`${totalInvested.toFixed(2)} XLM`} sub="total automated" icon={TrendingUp} accent="bg-purple-500" />
          <MetricTile label="Savings rate" value={`${savingsRate}%`} sub="of balance saved" icon={Activity} accent="bg-amber-500" />
        </div>

        {/* Activity Feed */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
              <p className="text-xs text-white/30 mt-0.5">Last 10 automated transactions</p>
            </div>
            <Link href="/rules" className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
              View rules <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="px-4 md:px-6">
            {txRows.length === 0 ? (
              <EmptyActivity />
            ) : (
              txRows.map((tx: any) => (
                <ActivityItem key={tx.id} type={tx.type} memo={tx.memo} amount={tx.amount} createdAt={tx.createdAt} />
              ))
            )}
          </div>
        </div>

        {/* CTA if no rules */}
        {activeRules === 0 && (
          <Link href="/chat">
            <div className="mt-6 flex items-center justify-between p-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Create your first automation rule</p>
                  <p className="text-xs text-white/40 mt-0.5">Tell AutoPilot what to do in plain English</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
          </Link>
        )}
        <EngineStatusPanel />
      </div>
    </DashboardShell>
  );
}
