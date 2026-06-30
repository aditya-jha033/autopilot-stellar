"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, RefreshCw, CheckCircle2, XCircle,
  ArrowUpRight, Activity, Cpu, ExternalLink,
} from "lucide-react";

interface EngineStatus {
  enginePublicKey: string;
  engineBalance: string;
  activeRules: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    memo: string | null;
    txHash: string | null;
    createdAt: string;
  }>;
}

function TxRow({ tx }: { tx: EngineStatus["recentTransactions"][number] }) {
  const stellarExpertUrl = tx.txHash
    ? `https://stellar.expert/explorer/testnet/tx/${tx.txHash}`
    : null;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
        tx.type === "save"
          ? "bg-green-500/10 text-green-400"
          : tx.type === "invest"
          ? "bg-blue-500/10 text-blue-400"
          : "bg-purple-500/10 text-purple-400"
      }`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white/70 capitalize">{tx.type}</p>
        <p className="text-[10px] text-white/30 truncate">{tx.memo ?? "AutoPilot rule triggered"}</p>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2">
        <span className="text-xs font-semibold text-white/60">
          {Number(tx.amount).toFixed(4)} XLM
        </span>
        {stellarExpertUrl && (
          <a
            href={stellarExpertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-blue-400 transition-colors"
            title="View on Stellar Expert"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function EngineStatusPanel() {
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastTrigger, setLastTrigger] = useState<{ count: number; ts: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/autopilot/status");
      if (res.ok) {
        const data = await res.json();
        // Guard: ensure recentTransactions is always an array
        setStatus({
          ...data,
          recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : [],
        });
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 30_000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const triggerNow = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/autopilot/monitor", { method: "POST" });
      const data = await res.json();
      setLastTrigger({
        count: data.processed ?? 0,
        ts: new Date().toLocaleTimeString(),
      });
      await fetchStatus();
    } catch {}
    setTriggering(false);
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden mt-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/70">Automation Engine</p>
            <p className="text-[10px] text-white/30">Stellar Testnet · polling every 30s</p>
          </div>
        </div>
        <button
          onClick={triggerNow}
          disabled={triggering}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-white/50 hover:text-white/80 transition-all disabled:opacity-40"
          title="Trigger engine manually (dev)"
        >
          <RefreshCw className={`w-3 h-3 ${triggering ? "animate-spin" : ""}`} />
          {triggering ? "Running…" : "Run now"}
        </button>
      </div>

      {/* Last trigger result */}
      <AnimatePresence>
        {lastTrigger && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`flex items-center gap-2 px-5 py-2.5 text-xs border-b border-white/[0.04] ${
              lastTrigger.count > 0
                ? "bg-green-500/[0.05] text-green-400"
                : "bg-white/[0.02] text-white/30"
            }`}>
              {lastTrigger.count > 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Activity className="w-3.5 h-3.5" />
              )}
              {lastTrigger.count > 0
                ? `${lastTrigger.count} rule(s) executed at ${lastTrigger.ts}`
                : `No new payments detected at ${lastTrigger.ts}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      {status && (
        <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-b border-white/[0.05]">
          <div className="px-5 py-3">
            <p className="text-[10px] text-white/25 uppercase tracking-wider">Engine XLM</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {status.engineBalance === "N/A"
                ? "N/A"
                : parseFloat(status.engineBalance).toFixed(2)}
            </p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[10px] text-white/25 uppercase tracking-wider">Active Rules</p>
            <p className="text-sm font-bold text-white mt-0.5">{status.activeRules}</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[10px] text-white/25 uppercase tracking-wider">Executions</p>
            <p className="text-sm font-bold text-white mt-0.5">{status.recentTransactions.length}</p>
          </div>
        </div>
      )}

      {/* Recent automated transactions */}
      <div className="px-5 py-3">
        {loading ? (
          <p className="text-xs text-white/25 text-center py-4">Loading…</p>
        ) : !status || (status.recentTransactions ?? []).length === 0 ? (
          <div className="text-center py-5">
            <Zap className="w-5 h-5 text-white/15 mx-auto mb-2" />
            <p className="text-xs text-white/25">Waiting for incoming payments…</p>
            <p className="text-[10px] text-white/15 mt-1">
              Send XLM to your wallet to trigger rules
            </p>
          </div>
        ) : (
          <div>
            {(status.recentTransactions ?? []).map(tx => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Engine key */}
      {status && (
        <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
          <p className="text-[10px] text-white/20 font-mono">
            Engine: {status.enginePublicKey.slice(0, 8)}…{status.enginePublicKey.slice(-4)}
          </p>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${status.enginePublicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-white/20 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            View on-chain <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}
