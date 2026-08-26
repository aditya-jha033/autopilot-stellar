"use client";

import DocsLayout from "@/components/DocsLayout";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ChevronRight, ArrowRight, CheckCircle2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07 } }),
};

const PRINCIPLES = [
  {
    title: "Non-Custodial by Design",
    desc: "AutoPilot never holds your private keys. Your main wallet is controlled entirely by Freighter. AutoPilot only stores vault keys (which are system-generated accounts for holding swept funds) — not your primary wallet key.",
    color: "border-emerald-500/20 bg-emerald-500/5",
    icon: "🔐",
  },
  {
    title: "Signature-Based Authentication",
    desc: "Login requires signing a one-time challenge message with your Freighter wallet. This proves ownership without sharing your private key. No password is ever stored. JWT tokens are short-lived (24h) and signed server-side.",
    color: "border-blue-500/20 bg-blue-500/5",
    icon: "✍️",
  },
  {
    title: "Spending Limits",
    desc: "Users can configure daily and weekly XLM spending caps in their account settings. The AutoPilot engine checks Redis-tracked rolling windows before executing any rule. Rules that would exceed your limits are blocked automatically.",
    color: "border-orange-500/20 bg-orange-500/5",
    icon: "🛡️",
  },
  {
    title: "Deduplication Guard",
    desc: "Every incoming Stellar payment has a unique Horizon ID. The processor checks this ID against the AutomatedTransaction table before firing any rule. Duplicate payment events (which can occur with SSE reconnects) are silently skipped.",
    color: "border-violet-500/20 bg-violet-500/5",
    icon: "🔄",
  },
  {
    title: "Redis Failure Tolerance",
    desc: "If the Upstash Redis instance is unavailable or over its rate limit, AutoPilot degrades gracefully. Spending limit checks default to 'allowed', cursor tracking is skipped, and all rule execution continues via direct PostgreSQL queries.",
    color: "border-yellow-500/20 bg-yellow-500/5",
    icon: "⚡",
  },
  {
    title: "Server-Side Rule Validation",
    desc: "Rules cannot be injected by the client. The AI output is validated server-side before any rule is saved — action must be one of 'save', 'invest', or 'buffer'. Only XLM is supported on testnet. Amount must be a positive number.",
    color: "border-red-500/20 bg-red-500/5",
    icon: "🔒",
  },
];

const AUDITS = [
  { workflow: "Frontend CI", desc: "ESLint + TypeScript type checks on every push", status: "Passing" },
  { workflow: "Backend CI", desc: "TypeScript compile check + tsup bundle", status: "Passing" },
  { workflow: "Contract CI", desc: "Soroban contract Rust build with wasm32 target", status: "Passing" },
  { workflow: "Security Audit", desc: "npm audit on both frontend and backend", status: "Passing" },
];

export default function SecurityPage() {
  return (
    <DocsLayout>
    <div className="max-w-3xl mx-auto px-5 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
        <Link href="/" className="hover:text-white/60 transition-colors">Docs</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/60">Security</span>
      </nav>

      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium">Technical</p>
            <h1 className="text-2xl font-bold text-white">Security</h1>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed mb-10">
          Security is fundamental to AutoPilot. Here is a comprehensive overview of the security
          model, protections in place, and the principles that keep user funds safe.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-red-500 inline-block" />
          Security Principles
        </h2>
        <div className="space-y-3">
          {PRINCIPLES.map(({ title, desc, color, icon }) => (
            <div key={title} className={`p-5 rounded-2xl border ${color}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white mb-1.5">{title}</div>
                  <div className="text-sm text-white/50 leading-relaxed">{desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
          Automated Security Checks
        </h2>
        <div className="space-y-2">
          {AUDITS.map(({ workflow, desc, status }) => (
            <div key={workflow} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white/80">{workflow}</div>
                <div className="text-xs text-white/40 mt-0.5">{desc}</div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                {status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-yellow-500 inline-block" />
          Testnet Notice
        </h2>
        <div className="p-5 rounded-2xl border border-amber-500/25 bg-amber-500/10">
          <p className="text-sm text-amber-200/80 leading-relaxed mb-2">
            ⚠️ <strong>AutoPilot currently runs on Stellar Testnet only.</strong>
          </p>
          <p className="text-sm text-amber-200/60 leading-relaxed">
            All XLM used in AutoPilot is Testnet XLM with no real monetary value. The platform is
            in beta and has not undergone a formal third-party security audit. Do not connect a Mainnet
            wallet or attempt to use real funds with this application.
          </p>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <p className="text-sm text-white/50 mb-4">Explore the complete REST API documentation.</p>
          <Link
            href="/api"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            API Reference <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
    </DocsLayout>
  );
}
