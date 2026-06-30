"use client";

import { useState, useCallback } from "react";
import {
  Zap, Pause, Play, Trash2, Edit3, DollarSign,
  Calendar, ChevronRight, Sparkles, CheckCircle2, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Rule {
  id: string;
  trigger: string;
  action: string;
  amount: number;
  isPercentage: boolean;
  status: string;
  description: string | null;
  memo: string | null;
  createdAt: string;
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
        active ? "bg-blue-600" : "bg-white/[0.10]"
      }`}
      aria-label="Toggle rule"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 40 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
        style={{ left: active ? "calc(100% - 1.375rem)" : "0.125rem" }}
      />
    </button>
  );
}

// ── Bottom Sheet ──────────────────────────────────────────────────────────────
function RuleSheet({
  rule,
  onClose,
  onDelete,
}: {
  rule: Rule;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/rules/${rule.id}`, { method: "DELETE" });
    onDelete(rule.id);
    onClose();
  };

  const accentMap: Record<string, string> = {
    Save: "text-green-400 bg-green-500/10 border-green-500/20",
    Invest: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Buffer: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Transfer: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };
  const accent = accentMap[rule.action] ?? "text-white/50 bg-white/[0.05] border-white/[0.08]";

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:left-64 bg-[#0a0a0a] border-t border-white/[0.08] rounded-t-3xl p-6 pb-10"
      >
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6" />

        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${accent}`}>
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-base leading-tight">
              {rule.description ?? `${rule.action} ${rule.amount}${rule.isPercentage ? "%" : " XLM"}`}
            </p>
            <p className="text-xs text-white/35 mt-1">{rule.trigger}</p>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/[0.04] rounded-2xl p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Amount</p>
            <p className="text-sm font-semibold text-white">
              {rule.amount}{rule.isPercentage ? "% per trigger" : " XLM / trigger"}
            </p>
          </div>
          <div className="bg-white/[0.04] rounded-2xl p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Created</p>
            <p className="text-sm font-semibold text-white">
              {new Date(rule.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href="/chat"
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-sm text-white/70 hover:text-white transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit rule via AI chat
            <ChevronRight className="w-4 h-4 ml-auto text-white/25" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl bg-red-500/[0.06] hover:bg-red-500/10 border border-red-500/10 text-sm text-red-400 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting…" : "Delete rule"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Rule Row ──────────────────────────────────────────────────────────────────
function RuleRow({
  rule,
  onClick,
  onToggle,
}: {
  rule: Rule;
  onClick: () => void;
  onToggle: () => void;
}) {
  const isActive = rule.status === "active";

  return (
    <motion.div
      layout
      className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">
          {rule.description ?? `${rule.action} ${rule.amount}${rule.isPercentage ? "%" : " XLM"}`}
        </p>
        <p className="text-xs text-white/35 mt-0.5 truncate">{rule.trigger}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          isActive
            ? "text-green-400 bg-green-500/10"
            : "text-white/30 bg-white/[0.04]"
        }`}>
          {isActive ? "Active" : "Paused"}
        </span>
        <Toggle active={isActive} onChange={onToggle} />
      </div>
    </motion.div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ rules }: { rules: Rule[] }) {
  const active = rules.filter(r => r.status === "active").length;
  const paused = rules.length - active;
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { label: "Total", value: rules.length },
        { label: "Active", value: active },
        { label: "Paused", value: paused },
      ].map(s => (
        <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{s.value}</p>
          <p className="text-xs text-white/35 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RulesClient({ initialRules }: { initialRules: Rule[] }) {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [selected, setSelected] = useState<Rule | null>(null);

  const handleToggle = useCallback(async (rule: Rule) => {
    const newStatus = rule.status === "active" ? "paused" : "active";

    // Optimistic update
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: newStatus } : r));

    const res = await fetch(`/api/rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      // Revert on failure
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: rule.status } : r));
    }
  }, []);

  const handleDelete = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-3xl mx-auto w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Rules</h1>
          <p className="text-sm text-white/35 mt-1">
            {rules.length === 0
              ? "No automation rules yet"
              : `${rules.filter(r => r.status === "active").length} active · ${rules.filter(r => r.status !== "active").length} paused`}
          </p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
        >
          <Sparkles className="w-4 h-4" />
          New Rule
        </Link>
      </div>

      {rules.length > 0 && <StatsBar rules={rules} />}

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
        {rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-5">
              <Zap className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-sm font-semibold text-white/50">No rules yet</p>
            <p className="text-xs text-white/25 mt-1.5 max-w-xs">
              Create your first automation rule using AutoPilot AI.
            </p>
            <Link
              href="/chat"
              className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Create first rule
            </Link>
          </div>
        ) : (
          <div>
            <div className="px-4 md:px-6 py-3.5 border-b border-white/[0.05]">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-wider">All Rules</p>
            </div>
            <AnimatePresence>
              {rules.map(rule => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onClick={() => setSelected(rule)}
                  onToggle={() => handleToggle(rule)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      {selected && (
        <RuleSheet
          rule={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
