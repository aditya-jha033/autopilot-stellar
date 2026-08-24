/* eslint-disable */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, ChevronRight, ArrowRight, Server, Database, Globe, Cpu } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07 } }),
};

const STACK = [
  {
    layer: "Frontend",
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    items: [
      { name: "Next.js 14 (App Router)", desc: "React server components + client islands" },
      { name: "TypeScript", desc: "Full end-to-end type safety" },
      { name: "Tailwind CSS", desc: "Utility-first styling with dark/light modes" },
      { name: "Framer Motion", desc: "Fluid animations and page transitions" },
      { name: "Freighter API", desc: "Stellar wallet connection & signing" },
      { name: "Vercel", desc: "Edge deployment with automatic CI/CD" },
    ],
  },
  {
    layer: "Backend",
    icon: Server,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    items: [
      { name: "Fastify", desc: "High-performance Node.js HTTP server" },
      { name: "TypeScript", desc: "Shared type definitions with frontend" },
      { name: "Stellar SDK", desc: "Transaction building and signing" },
      { name: "Groq SDK", desc: "Ultra-fast LLM API for AI rule parsing" },
      { name: "BullMQ", desc: "Redis-backed job queue for payment retries" },
      { name: "Render", desc: "Always-on backend with Docker container" },
    ],
  },
  {
    layer: "Data & Infrastructure",
    icon: Database,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    items: [
      { name: "PostgreSQL (Neon)", desc: "Primary database — users, rules, vaults, goals" },
      { name: "Redis (Upstash)", desc: "Horizon cursors, spending limits, job queue" },
      { name: "Stellar Horizon", desc: "Real-time payment SSE stream + REST API" },
      { name: "GitHub Actions", desc: "CI/CD for frontend, backend, contracts, security" },
    ],
  },
  {
    layer: "Blockchain",
    icon: Cpu,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    items: [
      { name: "Stellar Testnet", desc: "XLM transfers — vaults are real Stellar accounts" },
      { name: "Soroban SDK", desc: "Smart contract framework for Stellar" },
      { name: "Rust / WebAssembly", desc: "Smart contract compiled to .wasm" },
      { name: "Freighter", desc: "Non-custodial browser wallet" },
    ],
  },
];

const DB_TABLES = [
  { name: "User", cols: ["id", "publicKey", "email?", "dailyLimit", "weeklyLimit", "createdAt"] },
  { name: "Vault", cols: ["id", "userId", "type (savings|investment)", "publicKey", "secretKey (encrypted)", "createdAt"] },
  { name: "Rule", cols: ["id", "userId", "trigger", "action", "amount", "isPercentage", "memo", "createdAt"] },
  { name: "AutomatedTransaction", cols: ["id", "userId", "ruleId", "amount", "type", "memo", "txHash", "paymentId", "createdAt"] },
  { name: "Goal", cols: ["id", "userId", "linkedRuleId?", "name", "targetAmount", "currentAmount", "deadline", "createdAt"] },
];

export default function ArchitecturePage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
        <Link href="/docs" className="hover:text-white/60 transition-colors">Docs</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/60">Architecture</span>
      </nav>

      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
            <Layers className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium">Technical</p>
            <h1 className="text-2xl font-bold text-white">Architecture</h1>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed mb-10">
          AutoPilot is a full-stack DeFi application spanning a Next.js frontend, Fastify API backend,
          PostgreSQL + Redis data layer, Stellar Horizon real-time streaming, and Soroban smart contracts.
        </p>
      </motion.div>

      {/* Architecture diagram as text-art */}
      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-10">
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0d0d14] overflow-x-auto">
          <pre className="text-xs text-white/50 font-mono leading-loose">{`
  [Browser / Freighter Wallet]
         │  wallet signature
         ▼
  ┌─────────────────────────────┐
  │   Next.js 14 (Vercel Edge)  │  ← /onboarding, /dashboard, /chat
  │   Frontend + API Routes     │  ← /api/chat proxies to backend
  └──────────────┬──────────────┘
                 │ HTTP / JWT
                 ▼
  ┌─────────────────────────────┐
  │   Fastify Backend (Render)  │
  │   - Auth    - Vaults        │
  │   - Rules   - Goals         │
  │   - Chat → Groq AI          │
  └──┬───────────┬──────────────┘
     │           │
     ▼           ▼
  [PostgreSQL]  [Upstash Redis]
  (Neon DB)     (BullMQ + cursors)
     
  ┌─────────────────────────────┐
  │   Horizon SSE Engine        │
  │   Polls wallets every 60s   │
  │   On payment → runs rules   │
  │   Sends XLM to vault        │
  └──────────────┬──────────────┘
                 │ Stellar SDK
                 ▼
  ┌─────────────────────────────┐
  │   Stellar Testnet Network   │
  │   User Wallet               │
  │   Savings Vault Account     │
  │   Investment Vault Account  │
  │   Engine Account (AutoPilot)│
  └─────────────────────────────┘
`}</pre>
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-orange-500 inline-block" />
          Technology Stack
        </h2>
        <div className="space-y-4">
          {STACK.map(({ layer, icon: Icon, color, bg, items }) => (
            <div key={layer} className={`p-5 rounded-2xl border ${bg}`}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-semibold text-white">{layer}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {items.map(({ name, desc }) => (
                  <div key={name} className="flex gap-2">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-current ${color} shrink-0`} />
                    <div>
                      <span className="text-sm text-white/70 font-medium">{name}</span>
                      <span className="text-sm text-white/35"> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* DB Schema */}
      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
          Database Schema
        </h2>
        <div className="space-y-3">
          {DB_TABLES.map(({ name, cols }) => (
            <div key={name} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <div className="text-sm font-semibold text-white/80 mb-2 font-mono">{name}</div>
              <div className="flex flex-wrap gap-1.5">
                {cols.map((col) => (
                  <span key={col} className="text-[11px] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white/50 font-mono">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <p className="text-sm text-white/50 mb-4">Learn about the Soroban smart contract layer.</p>
          <Link
            href="/docs/contracts"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Smart Contracts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
