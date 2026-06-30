"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, X, ChevronRight, Trash2, Link as LinkIcon,
  Sparkles, TrendingUp, Clock, CheckCircle2, Loader2,
} from "lucide-react";
import Link from "next/link";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  linkedRuleId: string | null;
  createdAt: string;
}

interface Rule {
  id: string;
  description: string | null;
  action: string;
  amount: number;
  isPercentage: boolean;
  status: string;
}

// ── AI ETA calc ───────────────────────────────────────────────────────────────
function calcETA(goal: Goal, rules: Rule[]): string {
  const remaining = (goal.targetAmount ?? 0) - (goal.currentAmount ?? 0);
  if (remaining <= 0) return "Completed! 🎉";

  const linked = rules.find(r => r.id === goal.linkedRuleId);
  if (!linked) return "Link a savings rule to get an ETA";

  // Estimate: assume rule triggers ~4x per week (rough)
  const weeklyAmount = linked.isPercentage
    ? (linked.amount / 100) * 50  // 50 XLM avg payment estimate
    : linked.amount * 4;

  if (weeklyAmount <= 0) return "Calculating…";

  const weeks = Math.ceil(remaining / weeklyAmount);
  if (weeks <= 1) return "This week";
  if (weeks <= 4) return `~${weeks} weeks`;
  const months = Math.ceil(weeks / 4);
  if (months <= 12) return `~${months} month${months > 1 ? "s" : ""}`;
  return `~${Math.ceil(months / 12)} year${Math.ceil(months / 12) > 1 ? "s" : ""}`;
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="relative w-full h-2 bg-white/[0.07] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className={`h-full rounded-full ${
          pct >= 100
            ? "bg-green-500"
            : pct > 60
            ? "bg-blue-500"
            : "bg-gradient-to-r from-blue-600 to-purple-500"
        }`}
      />
    </div>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────────────────
function GoalCard({
  goal,
  rules,
  onDelete,
  onLinkRule,
}: {
  goal: Goal;
  rules: Rule[];
  onDelete: (id: string) => void;
  onLinkRule: (goalId: string, ruleId: string | null) => void;
}) {
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cur = goal.currentAmount ?? 0;
  const tgt = goal.targetAmount ?? 1;
  const pct = Math.min(Math.round((cur / tgt) * 100), 100);
  const eta = calcETA(goal, rules);
  const linked = rules.find(r => r.id === goal.linkedRuleId);
  const isDone = pct >= 100;

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/goals/${goal.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    onDelete(goal.id);
  };

  const handleLink = async (ruleId: string | null) => {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ linkedRuleId: ruleId }),
    });
    onLinkRule(goal.id, ruleId);
    setShowLinkPanel(false);
  };

  return (
    <motion.div
      layout
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.11] transition-colors"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goal.emoji}</span>
            <div>
              <p className="font-semibold text-white/90 text-base leading-tight">{goal.name}</p>
              <p className="text-xs text-white/30 mt-0.5">
                {(goal.currentAmount ?? 0).toFixed(2)} / {(goal.targetAmount ?? 0).toFixed(2)} XLM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isDone && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar value={goal.currentAmount ?? 0} max={goal.targetAmount ?? 1} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/40">{pct}% complete</span>
          <span className="text-xs text-white/40 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {eta}
          </span>
        </div>

        {/* Linked rule */}
        <button
          onClick={() => setShowLinkPanel(!showLinkPanel)}
          className="mt-4 w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-colors text-xs"
        >
          <span className="flex items-center gap-2 text-white/50">
            <LinkIcon className="w-3.5 h-3.5" />
            {linked
              ? (linked.description ?? `${linked.action} ${linked.amount}${linked.isPercentage ? "%" : " XLM"}`)
              : "Link a savings rule"}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 text-white/25 transition-transform ${showLinkPanel ? "rotate-90" : ""}`} />
        </button>

        {/* Rule picker */}
        <AnimatePresence>
          {showLinkPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1.5 pt-1">
                {linked && (
                  <button
                    onClick={() => handleLink(null)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/[0.06] transition-colors"
                  >
                    ✕ Remove link
                  </button>
                )}
                {rules.filter(r => r.status === "active").map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleLink(r.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors ${
                      r.id === goal.linkedRuleId
                        ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                        : "text-white/50 hover:bg-white/[0.05]"
                    }`}
                  >
                    {r.description ?? `${r.action} ${r.amount}${r.isPercentage ? "%" : " XLM"}`}
                  </button>
                ))}
                {rules.filter(r => r.status === "active").length === 0 && (
                  <p className="text-xs text-white/25 px-3 py-2">No active rules to link</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── New Goal Form ─────────────────────────────────────────────────────────────
const EMOJIS = ["🎯", "🏠", "✈️", "📱", "🚗", "💻", "💰", "🎓", "💍", "🌴"];

function NewGoalSheet({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (goal: Goal) => void;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), targetAmount: parseFloat(target), emoji }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreate(data.goal);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />
      <motion.div
        key="sheet"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:left-64 bg-[#0a0a0a] border-t border-white/[0.08] rounded-t-3xl p-6 pb-10"
      >
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">New Goal</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-white/30" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <p className="text-xs text-white/40 mb-2">Choose an emoji</p>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e} type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl w-10 h-10 rounded-xl transition-all ${
                    emoji === e ? "bg-blue-500/20 border border-blue-500/40 scale-110" : "bg-white/[0.04] hover:bg-white/[0.08]"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Goal name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Emergency fund"
              required
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/40 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Target amount (XLM)</label>
            <input
              type="number" min="1" step="any"
              value={target} onChange={e => setTarget(e.target.value)}
              placeholder="e.g. 1000"
              required
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/40 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit" disabled={loading || !name.trim() || !target}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            {loading ? "Creating…" : "Create Goal"}
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GoalsClient({
  initialGoals,
  rules,
}: {
  initialGoals: Goal[];
  rules: Rule[];
}) {
  // Filter out any undefined/null items that may slip through from the DB
  const safeInitial = (initialGoals ?? []).filter(
    (g) => g != null && g.id != null
  );
  const [goals, setGoals] = useState<Goal[]>(safeInitial);
  const [showNew, setShowNew] = useState(false);

  const handleCreate = (goal: Goal) => setGoals(prev => [goal, ...prev]);
  const handleDelete = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const handleLinkRule = (goalId: string, ruleId: string | null) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, linkedRuleId: ruleId } : g));
  };

  const completed = goals.filter(g => (g.currentAmount ?? 0) >= (g.targetAmount ?? 1)).length;

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Goals</h1>
          <p className="text-sm text-white/35 mt-1">
            {goals.length === 0
              ? "Track your financial milestones"
              : `${completed} of ${goals.length} completed`}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Goals", value: goals.length, icon: Target },
            { label: "Completed", value: completed, icon: CheckCircle2 },
            { label: "In Progress", value: goals.length - completed, icon: TrendingUp },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/35 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-5">
            <Target className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-sm font-semibold text-white/50">No goals yet</p>
          <p className="text-xs text-white/25 mt-1.5 max-w-xs">
            Set a savings target and link it to an AutoPilot rule to track your progress.
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Create first goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                rules={rules}
                onDelete={handleDelete}
                onLinkRule={handleLinkRule}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* AI hint */}
      <Link href="/chat">
        <div className="mt-6 flex items-center justify-between p-5 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI can suggest rules for your goals</p>
              <p className="text-xs text-white/40 mt-0.5">Ask the AutoPilot coach to build a savings plan</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
        </div>
      </Link>

      {showNew && (
        <NewGoalSheet onClose={() => setShowNew(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
