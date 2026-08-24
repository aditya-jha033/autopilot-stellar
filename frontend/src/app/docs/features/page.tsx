/* eslint-disable */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, ChevronRight, Bot, Vault, Target, TrendingUp,
  Shield, Bell, ArrowRight, Sparkles,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07 } }),
};

const FEATURES = [
  {
    icon: Bot,
    color: "from-indigo-500/15 to-purple-500/15",
    border: "border-indigo-500/20",
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-400",
    badge: "Core Feature",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    title: "AI-Powered Automation Rules",
    desc: "Describe your financial goal in plain English and AutoPilot's Groq-powered AI converts it to a precise on-chain automation rule. No coding required.",
    points: [
      "Natural language rule creation",
      "Percentage or fixed-amount sweeps",
      "Trigger: on every XLM payment received",
      "Edit rules anytime through the Coach UI",
    ],
  },
  {
    icon: Vault,
    color: "from-emerald-500/15 to-teal-500/15",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    badge: "Vaults",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    title: "Savings & Investment Vaults",
    desc: "Every user gets dedicated Stellar keypair vaults for savings and investments — completely separate from their main wallet.",
    points: [
      "Separate Savings Vault and Investment Vault",
      "Real Stellar accounts with their own keys",
      "Manual deposits and withdrawals supported",
      "Live balance tracking with Horizon API",
    ],
  },
  {
    icon: Target,
    color: "from-violet-500/15 to-pink-500/15",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    badge: "Goals",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    title: "Financial Goals Tracking",
    desc: "Set a savings target, link it to an automation rule, and watch the progress bar fill as each payment sweep contributes toward your goal.",
    points: [
      "Link goals to specific automation rules",
      "Visual progress tracking",
      "Target amount with deadline",
      "Automatic increment on each sweep",
    ],
  },
  {
    icon: TrendingUp,
    color: "from-blue-500/15 to-cyan-500/15",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    badge: "Real-Time",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    title: "Live Transaction Feed",
    desc: "AutoPilot subscribes to Stellar Horizon's Server-Sent Events for real-time payment detection. Every incoming XLM payment is processed within seconds.",
    points: [
      "Stellar Horizon SSE streaming",
      "Automatic rule trigger on payment arrival",
      "Deduplication prevents double-processing",
      "Full transaction history with on-chain links",
    ],
  },
  {
    icon: Shield,
    color: "from-orange-500/15 to-red-500/15",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
    badge: "Safety",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    title: "300 XLM Safety Buffer",
    desc: "An automatic emergency buffer rule protects users from running out of XLM. When your balance drops below 300 XLM, AutoPilot sweeps excess funds to the Savings Vault.",
    points: [
      "Configurable threshold (default 300 XLM)",
      "Automatic sweep to savings when balance low",
      "Acts as an emergency reserve fund",
      "Prevents Stellar minimum balance violations",
    ],
  },
  {
    icon: Sparkles,
    color: "from-yellow-500/15 to-orange-500/15",
    border: "border-yellow-500/20",
    iconBg: "bg-yellow-500/15",
    iconColor: "text-yellow-400",
    badge: "AI Chat",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    title: "AutoPilot AI Financial Coach",
    desc: "Chat with your AI coach to refine rules, get financial tips, and understand your savings patterns — all powered by the Groq LLM.",
    points: [
      "Rule creation via natural language chat",
      "Coach mode shows all active rules",
      "Edit rule amounts inline in the UI",
      "Context-aware financial advice",
    ],
  },
  {
    icon: Bell,
    color: "from-pink-500/15 to-rose-500/15",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-400",
    badge: "Spending",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    title: "Daily & Weekly Spending Limits",
    desc: "Protect yourself with configurable daily and weekly XLM spending caps. AutoPilot will block rule execution that would exceed your limits.",
    points: [
      "Daily XLM limit configuration",
      "Weekly XLM limit configuration",
      "Redis-tracked rolling window",
      "Instant block with clear reason shown",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
        <Link href="/docs" className="hover:text-white/60 transition-colors">Docs</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/60">Features</span>
      </nav>

      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium">Product</p>
            <h1 className="text-2xl font-bold text-white">Features</h1>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed mb-10">
          AutoPilot combines AI-powered rule creation, real-time Stellar payment monitoring, and
          non-custodial vault management to automate your personal finances on-chain.
        </p>
      </motion.div>

      <div className="space-y-6">
        {FEATURES.map(({ icon: Icon, color, border, iconBg, iconColor, badge, badgeColor, title, desc, points }, i) => (
          <motion.div
            key={title}
            initial="hidden"
            animate="visible"
            custom={i + 1}
            variants={fadeUp}
            className={`p-6 rounded-2xl border bg-gradient-to-br ${color} ${border}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-base font-semibold text-white">{title}</h2>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {badge}
                  </span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-4">{desc}</p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-sm text-white/55">
                      <span className={`w-1.5 h-1.5 rounded-full ${iconColor} bg-current shrink-0`} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" custom={9} variants={fadeUp}>
        <div className="mt-10 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <p className="text-sm text-white/50 mb-4">
            Ready to see how these features work together in practice?
          </p>
          <Link
            href="/docs/usage"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Read the Usage Guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
