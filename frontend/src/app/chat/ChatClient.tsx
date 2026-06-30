"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Sparkles, Bot, User, Zap, Clock, DollarSign,
  AlertCircle, CheckCircle2, Loader2, Edit3, TrendingUp,
  Shield, ArrowUpRight, RefreshCw, MessageCircle, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Rule {
  id: string;
  trigger: string;
  action: string;
  amount: number;
  isPercentage: boolean;
  status: string;
  description: string | null;
}

interface ParsedRule {
  trigger: string;
  action: string;
  amount: number;
  isPercentage: boolean;
  limits: { maxPerMonth: number | null };
  description: string;
  memo: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  rule?: ParsedRule;
  isConfirmation?: boolean;
  isError?: boolean;
}

interface InsightCard {
  id: string;
  icon: React.ElementType;
  title: string;
  body: string;
  actionLabel?: string;
  actionPrompt?: string;
  accent: string;
}

// ── Suggestion chips ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: "Save 10% of every payment", icon: "💰" },
  { label: "Invest 5 XLM weekly", icon: "📈" },
  { label: "Keep 200 XLM buffer", icon: "🛡️" },
];

// ── Build insight cards from rules ────────────────────────────────────────────
function buildInsights(rules: Rule[]): InsightCard[] {
  const cards: InsightCard[] = [];
  const safe = (rules ?? []).filter((r) => r != null && r.action != null);
  const saveRules   = safe.filter(r => r.action === "Save"   && r.status === "active");
  const investRules = safe.filter(r => r.action === "Invest" && r.status === "active");
  const pausedRules = safe.filter(r => r.status === "paused");

  if (saveRules.length > 0) {
    cards.push({
      id: "savings", icon: Shield,
      title: "Your savings are on track",
      body: `You have ${saveRules.length} active saving rule${saveRules.length > 1 ? "s" : ""}. AutoPilot is watching every payment and setting aside your target amount automatically.`,
      actionLabel: "Increase savings rate",
      actionPrompt: "Help me increase my savings rate — what rule should I create?",
      accent: "from-green-500/10 border-green-500/15 text-green-400",
    });
  }

  if (investRules.length > 0) {
    cards.push({
      id: "invest", icon: TrendingUp,
      title: "Investment automation active",
      body: `${investRules.length} investment rule${investRules.length > 1 ? "s are" : " is"} running. Consistent automated investing is one of the best strategies for long-term wealth building.`,
      accent: "from-blue-500/10 border-blue-500/15 text-blue-400",
    });
  }

  if (pausedRules.length > 0) {
    cards.push({
      id: "paused", icon: Clock,
      title: `${pausedRules.length} rule${pausedRules.length > 1 ? "s" : ""} paused`,
      body: `You have paused rules that aren't protecting your finances. Head to the Rules tab to resume them, or ask me to create a better replacement.`,
      actionLabel: "Replace with a better rule",
      actionPrompt: "I have some paused rules. Can you help me create better automations to replace them?",
      accent: "from-amber-500/10 border-amber-500/15 text-amber-400",
    });
  }

  if (saveRules.length === 0 && investRules.length === 0) {
    cards.push({
      id: "no-savings", icon: AlertCircle,
      title: "No savings automation yet",
      body: "You have rules running but none dedicated to savings. A simple 10% save rule on every payment received can make a huge difference over time.",
      actionLabel: "Create a savings rule",
      actionPrompt: "Create a rule to save 10% of every payment I receive",
      accent: "from-orange-500/10 border-orange-500/15 text-orange-400",
    });
  }

  cards.push({
    id: "tip", icon: Sparkles,
    title: "Weekly tip",
    body: "Consider setting a monthly spending buffer rule — if your balance drops below a threshold, AutoPilot can alert you and pause non-essential outflows.",
    actionLabel: "Set up a buffer rule",
    actionPrompt: "Help me set up a balance buffer rule to protect my spending floor",
    accent: "from-purple-500/10 border-purple-500/15 text-purple-400",
  });

  return cards;
}

// ── Coach Card ────────────────────────────────────────────────────────────────
function CoachCard({ card, onAction }: { card: InsightCard; onAction: (prompt: string) => void }) {
  const Icon = card.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className={`bg-gradient-to-b ${card.accent} border rounded-2xl p-5`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{card.title}</p>
          <p className="text-xs text-white/45 mt-1 leading-relaxed">{card.body}</p>
        </div>
      </div>
      {card.actionLabel && card.actionPrompt && (
        <button
          onClick={() => onAction(card.actionPrompt!)}
          className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white/80 transition-colors mt-1"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          {card.actionLabel}
        </button>
      )}
    </motion.div>
  );
}

// ── Edit Panel ────────────────────────────────────────────────────────────────
function EditPanel({
  rule,
  onSave,
  onCancel,
}: {
  rule: ParsedRule;
  onSave: (updated: ParsedRule) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(rule.amount));
  const [isPercentage, setIsPercentage] = useState(rule.isPercentage);

  const handleSave = () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    onSave({ ...rule, amount: parsed, isPercentage });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mx-4 mb-4 p-4 rounded-xl bg-white/[0.04] border border-blue-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Edit Amount</p>
          <button onClick={onCancel} className="text-white/25 hover:text-white/60 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2">
          {[
            { label: "Percentage (%)", value: true },
            { label: "Fixed (XLM)", value: false },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setIsPercentage(opt.value)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isPercentage === opt.value
                  ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                  : "bg-white/[0.04] border-white/[0.06] text-white/35 hover:text-white/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div className="relative">
          <input
            type="number"
            min="0.01"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/40 transition-colors pr-12"
            placeholder="Enter amount"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
            {isPercentage ? "%" : "XLM"}
          </span>
        </div>

        {/* Quick presets */}
        <div className="flex gap-1.5 flex-wrap">
          {(isPercentage ? [5, 10, 15, 20, 25] : [1, 5, 10, 20, 50]).map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                parseFloat(amount) === v
                  ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                  : "bg-white/[0.04] border-white/[0.05] text-white/35 hover:text-white/60"
              }`}
            >
              {v}{isPercentage ? "%" : " XLM"}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Update Rule
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white/50 hover:text-white/80 text-xs font-medium border border-white/[0.07] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Rule Field ────────────────────────────────────────────────────────────────
function RuleField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-white/25 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold text-white/30 tracking-widest uppercase leading-none mb-1">{label}</p>
        <p className="text-sm text-white/80">{value}</p>
      </div>
    </div>
  );
}

// ── Rule Card ─────────────────────────────────────────────────────────────────
function RuleCard({
  rule, onActivate, onUpdate, activating, activated,
}: {
  rule: ParsedRule;
  onActivate: () => void;
  onUpdate: (updated: ParsedRule) => void;
  activating: boolean;
  activated: boolean;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [currentRule, setCurrentRule] = useState(rule);

  const handleSaveEdit = (updated: ParsedRule) => {
    setCurrentRule(updated);
    setShowEdit(false);
    onUpdate(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-3 border border-blue-500/25 rounded-2xl overflow-hidden bg-gradient-to-b from-blue-500/[0.07] to-transparent"
    >
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
          <Zap className="w-3 h-3 text-blue-400" />
        </div>
        <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Rule Preview</span>
      </div>

      <div className="px-4 py-4 space-y-3">
        <RuleField icon={<Clock className="w-3.5 h-3.5" />} label="TRIGGER" value={currentRule.trigger} />
        <RuleField icon={<Zap className="w-3.5 h-3.5" />} label="ACTION" value={currentRule.action} />
        <RuleField
          icon={<DollarSign className="w-3.5 h-3.5" />}
          label="AMOUNT"
          value={currentRule.isPercentage ? `${currentRule.amount}% of each payment` : `${currentRule.amount} XLM`}
        />
        {currentRule.limits?.maxPerMonth && (
          <RuleField
            icon={<AlertCircle className="w-3.5 h-3.5" />}
            label="LIMIT"
            value={`Max ${currentRule.limits.maxPerMonth} XLM / month`}
          />
        )}
      </div>
      <div className="px-4 pb-3">
        <p className="text-xs text-white/40 italic">{currentRule.description}</p>
      </div>

      {/* Edit panel */}
      <AnimatePresence>
        {showEdit && (
          <EditPanel
            rule={currentRule}
            onSave={handleSaveEdit}
            onCancel={() => setShowEdit(false)}
          />
        )}
      </AnimatePresence>

      {!activated && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={onActivate}
            disabled={activating}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-60"
          >
            {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {activating ? "Activating…" : "Activate Rule"}
          </button>
          <button
            onClick={() => setShowEdit(prev => !prev)}
            disabled={activating}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${
              showEdit
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                : "bg-white/[0.06] hover:bg-white/[0.10] text-white/60 hover:text-white border-white/[0.08]"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      )}

      {activated && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Rule activated — AutoPilot is watching
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Chat Bubble ───────────────────────────────────────────────────────────────
function ChatBubble({
  msg, onActivate,
}: {
  msg: Message;
  onActivate?: (rule: ParsedRule) => void;
}) {
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [currentRule, setCurrentRule] = useState<ParsedRule | undefined>(msg.rule);
  const isUser = msg.role === "user";

  const handleActivate = async () => {
    if (!currentRule || !onActivate) return;
    setActivating(true);
    await onActivate(currentRule);
    setActivating(false);
    setActivated(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
        isUser ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-white/[0.07] border border-white/[0.10]"
      }`}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white/60" />}
      </div>

      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600/80 text-white rounded-tr-sm"
            : msg.isError
            ? "bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm"
            : msg.isConfirmation
            ? "bg-green-500/10 border border-green-500/20 text-green-300 rounded-tl-sm"
            : "bg-white/[0.05] border border-white/[0.08] text-white/80 rounded-tl-sm"
        }`}>
          {msg.content}
        </div>

        {currentRule && onActivate && (
          <RuleCard
            rule={currentRule}
            onActivate={handleActivate}
            onUpdate={(updated) => setCurrentRule(updated)}
            activating={activating}
            activated={activated}
          />
        )}
      </div>
    </motion.div>
  );
}

// ── Coach View ────────────────────────────────────────────────────────────────
function CoachView({ rules, onAsk }: { rules: Rule[]; onAsk: (prompt: string) => void }) {
  const insights = buildInsights(rules);
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Weekly Insights</p>
        </div>
        <p className="text-sm text-white/30">
          AutoPilot has analysed your {rules.length} rule{rules.length !== 1 ? "s" : ""}. Here's what it found:
        </p>
      </motion.div>
      <div className="space-y-4">
        {insights.map((card, i) => (
          <motion.div key={card.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <CoachCard card={card} onAction={onAsk} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ChatClient({ initialRules }: { initialRules: Rule[] }) {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mode, setMode] = useState<"coach" | "chat">(
    initialRules.length > 0 ? "coach" : "chat"
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (mode === "coach") setMode("chat");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.rule) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(), role: "assistant",
          content: data.error ?? data.message ?? "Sorry, I couldn't parse that. Try rephrasing.",
          isError: !data.message,
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(), role: "assistant",
          content: "Here's the automation rule I've created for you:",
          rule: data.rule,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: "assistant",
        content: "Network error. Please check your connection.",
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (rule: ParsedRule) => {
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(rule),
    });
    if (res.ok) {
      const data = await res.json();
      setRules(prev => [data.rule, ...prev]);
      setToast("Rule activated — AutoPilot is watching 👁");
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: "assistant",
        content: "✅ Rule activated! AutoPilot will now monitor your wallet. Want to create another?",
        isConfirmation: true,
      }]);
    } else {
      setToast("Failed to activate rule. Please try again.");
    }
  };

  const hasRules = rules.length > 0;
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black border border-white/15 text-white text-sm px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 md:py-5 border-b border-white/[0.06] bg-black/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">AutoPilot AI</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                <span className="text-[11px] text-white/35">
                  {mode === "coach" && hasRules ? "Coach mode — weekly insights" : "Rule builder"}
                </span>
              </div>
            </div>
          </div>

          {hasRules && (
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setMode("coach")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === "coach" ? "bg-white/[0.08] text-white" : "text-white/35 hover:text-white/60"
                }`}
              >
                <Sparkles className="w-3 h-3" /> Coach
              </button>
              <button
                onClick={() => setMode("chat")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === "chat" ? "bg-white/[0.08] text-white" : "text-white/35 hover:text-white/60"
                }`}
              >
                <MessageCircle className="w-3 h-3" /> Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {mode === "coach" && hasRules ? (
          <motion.div
            key="coach"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <CoachView rules={rules} onAsk={(prompt) => { setMode("chat"); sendMessage(prompt); }} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-5"
          >
            {isEmpty ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">What should AutoPilot do?</h2>
                <p className="text-sm text-white/35 max-w-xs mb-8">
                  Describe your financial goal in plain English. I'll turn it into an automation rule.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.label)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14] text-sm text-white/60 hover:text-white/90 transition-all text-left"
                    >
                      <span className="text-lg leading-none">{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map(msg => (
                  <ChatBubble key={msg.id} msg={msg} onActivate={handleActivate} />
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.10] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white/60" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.05] border border-white/[0.08]">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-white/40"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 border-t border-white/[0.06] bg-black/50 backdrop-blur-md pb-[max(1rem,env(safe-area-inset-bottom))]">
        {mode === "coach" && hasRules && (
          <p className="text-xs text-white/25 mb-2 text-center flex items-center justify-center gap-1">
            <MessageCircle className="w-3 h-3" />
            Ask the coach anything
          </p>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <textarea
              id="chat-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
              }}
              placeholder={mode === "coach" ? "Ask the coach a question…" : "Describe your automation goal…"}
              rows={1}
              disabled={loading}
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-2xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none overflow-hidden focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.07] transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            id="chat-send-btn"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </form>
        <p className="text-[11px] text-white/20 mt-2 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
