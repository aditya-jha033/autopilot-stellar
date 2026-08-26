"use client";

import DocsLayout from "@/components/DocsLayout";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, ChevronRight, ArrowRight, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07 } }),
};

function CodeBlock({ children, lang = "typescript" }: { children: string; lang?: string }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/[0.08]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06]">
        <span className="text-[11px] text-white/30 font-mono">{lang}</span>
      </div>
      <pre className="px-4 py-4 overflow-x-auto bg-[#0d0d14]">
        <code className="text-sm text-emerald-300 font-mono leading-relaxed whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}

const FLOW = [
  {
    step: "User Input",
    color: "bg-blue-500",
    desc: 'User types: "Save 10% of every XLM payment I receive"',
  },
  {
    step: "API Call",
    color: "bg-indigo-500",
    desc: "Frontend posts to /api/chat → backend /api/chat route",
  },
  {
    step: "Groq LLM",
    color: "bg-violet-500",
    desc: "Groq llama-3.3-70b-versatile model parses intent and returns structured JSON",
  },
  {
    step: "Rule Storage",
    color: "bg-purple-500",
    desc: "Rule saved to PostgreSQL: trigger, action, amount, isPercentage, vaultType",
  },
  {
    step: "Horizon Stream",
    color: "bg-pink-500",
    desc: "Backend opens SSE stream for user's wallet. On payment arrival → rule fires",
  },
  {
    step: "Execution",
    color: "bg-rose-500",
    desc: "Engine sends XLM to savings/investment vault. Transaction logged to DB.",
  },
];

export default function AutomationPage() {
  return (
    <DocsLayout>
    <div className="max-w-3xl mx-auto px-5 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
        <Link href="/" className="hover:text-white/60 transition-colors">Docs</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/60">AI Automation</span>
      </nav>

      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium">Product</p>
            <h1 className="text-2xl font-bold text-white">AI Automation</h1>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed mb-10">
          AutoPilot's AI layer translates plain English financial goals into structured, on-chain automation rules
          using Groq's ultra-fast LLM API. This page covers how the AI pipeline works end-to-end.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
          End-to-End Flow
        </h2>
        <div className="relative">
          <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-rose-500 opacity-40" />
          <div className="space-y-4">
            {FLOW.map(({ step, color, desc }, i) => (
              <div key={step} className="flex gap-4 pl-2">
                <div className={`w-5 h-5 rounded-full ${color} shrink-0 mt-1 flex items-center justify-center`}>
                  <span className="text-[9px] font-bold text-white">{i + 1}</span>
                </div>
                <div className="flex-1 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="text-sm font-semibold text-white mb-1">{step}</div>
                  <div className="text-sm text-white/50">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mt-10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" />
          AI System Prompt
        </h2>
        <p className="text-sm text-white/50 mb-4">
          The backend sends Groq a strict system prompt instructing it to output only valid JSON:
        </p>
        <CodeBlock lang="text">{`You are an AutoPilot financial automation assistant for the Stellar blockchain.
Parse the user's financial goal and return ONLY valid JSON with this structure:
{
  "description": "Human-readable rule description",
  "trigger": "on every payment received",
  "action": "save" | "invest" | "buffer",
  "amount": <number>,
  "isPercentage": <boolean>,
  "memo": "<optional short memo>"
}
Rules must only involve XLM. Do not create USDC rules.
If the user's intent is unclear, return null.`}</CodeBlock>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-violet-500 inline-block" />
          Rule Matching (processor.ts)
        </h2>
        <p className="text-sm text-white/50 mb-4">
          When a payment arrives on the Horizon SSE stream, <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">processPaymentDirect()</code> runs these checks:
        </p>
        <CodeBlock lang="typescript">{`function doesPaymentMatchTrigger(trigger: string, asset: string): boolean {
  // Only XLM payments can trigger rules on Testnet
  if (asset !== "XLM") return false;

  const t = trigger.toLowerCase();
  return (
    t.includes("every payment") ||
    t.includes("payment received") ||
    t.includes("incoming payment")
  );
}

// Execution logic
const execAmount = rule.isPercentage
  ? (rule.amount / 100) * paymentAmount
  : rule.amount;

await executeRuleTransaction(vaultPublicKey, execAmountStr, memo);`}</CodeBlock>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp} className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-pink-500 inline-block" />
          Groq Model & Performance
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Model", value: "llama-3.3-70b-versatile" },
            { label: "Avg. Response", value: "~800ms" },
            { label: "Temperature", value: "0.1 (deterministic)" },
            { label: "Max Tokens", value: "256 (JSON only)" },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-xs text-white/30 mb-1">{label}</div>
              <div className="text-sm font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
        <div className="mt-10 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <p className="text-sm text-white/50 mb-4">See the full system architecture including the stream engine.</p>
          <Link
            href="/architecture"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View Architecture <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
    </DocsLayout>
  );
}
