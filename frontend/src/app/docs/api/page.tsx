/* eslint-disable */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, ChevronRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06 } }),
};

function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08]">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border-b border-white/[0.06]">
        <span className="text-[11px] text-white/30 font-mono">{lang}</span>
      </div>
      <pre className="px-4 py-3.5 overflow-x-auto bg-[#0d0d14]">
        <code className="text-sm text-emerald-300 font-mono leading-relaxed whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}

function Method({ method, path, desc, auth = false }: { method: string; path: string; desc: string; auth?: boolean }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-2">
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${colors[method] ?? ""}`}>
        {method}
      </span>
      <code className="text-sm text-white/70 font-mono flex-1 min-w-0 truncate">{path}</code>
      {auth && <span className="text-[10px] text-yellow-400 border border-yellow-500/20 bg-yellow-500/10 px-1.5 py-0.5 rounded shrink-0">🔒 Auth</span>}
      <span className="text-xs text-white/35 hidden sm:block shrink-0">{desc}</span>
    </div>
  );
}

const ROUTES = [
  {
    group: "Authentication",
    color: "from-blue-500/5 to-cyan-500/5 border-blue-500/15",
    routes: [
      { method: "POST", path: "/api/auth/challenge", desc: "Get signing challenge", auth: false },
      { method: "POST", path: "/api/auth/verify", desc: "Verify signature → JWT", auth: false },
      { method: "GET", path: "/api/auth/me", desc: "Get current user", auth: true },
      { method: "POST", path: "/api/auth/logout", desc: "Clear session", auth: true },
    ],
  },
  {
    group: "Vaults",
    color: "from-emerald-500/5 to-teal-500/5 border-emerald-500/15",
    routes: [
      { method: "GET", path: "/api/vault", desc: "List user vaults", auth: true },
      { method: "POST", path: "/api/vault/create", desc: "Create new vault", auth: true },
      { method: "POST", path: "/api/vault/deposit", desc: "Deposit to vault", auth: true },
      { method: "POST", path: "/api/vault/withdraw", desc: "Withdraw from vault", auth: true },
    ],
  },
  {
    group: "Rules",
    color: "from-indigo-500/5 to-purple-500/5 border-indigo-500/15",
    routes: [
      { method: "GET", path: "/api/rules", desc: "List user rules", auth: true },
      { method: "POST", path: "/api/rules", desc: "Create new rule", auth: true },
      { method: "PUT", path: "/api/rules/:id", desc: "Update rule amount", auth: true },
      { method: "DELETE", path: "/api/rules/:id", desc: "Delete a rule", auth: true },
    ],
  },
  {
    group: "Goals",
    color: "from-violet-500/5 to-pink-500/5 border-violet-500/15",
    routes: [
      { method: "GET", path: "/api/goals", desc: "List user goals", auth: true },
      { method: "POST", path: "/api/goals", desc: "Create a goal", auth: true },
      { method: "PUT", path: "/api/goals/:id", desc: "Update goal", auth: true },
      { method: "DELETE", path: "/api/goals/:id", desc: "Delete a goal", auth: true },
    ],
  },
  {
    group: "AI Chat",
    color: "from-orange-500/5 to-yellow-500/5 border-orange-500/15",
    routes: [
      { method: "POST", path: "/api/chat", desc: "Send message → AI rule creation", auth: true },
    ],
  },
  {
    group: "Transactions",
    color: "from-sky-500/5 to-blue-500/5 border-sky-500/15",
    routes: [
      { method: "GET", path: "/api/transactions", desc: "List automated transactions", auth: true },
    ],
  },
  {
    group: "Account",
    color: "from-slate-500/5 to-gray-500/5 border-slate-500/15",
    routes: [
      { method: "GET", path: "/api/account", desc: "Get account settings", auth: true },
      { method: "PUT", path: "/api/account", desc: "Update limits/settings", auth: true },
    ],
  },
];

export default function ApiPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
        <Link href="/docs" className="hover:text-white/60 transition-colors">Docs</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/60">API Reference</span>
      </nav>

      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium">Technical</p>
            <h1 className="text-2xl font-bold text-white">API Reference</h1>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed mb-4">
          AutoPilot's Fastify backend exposes a REST API consumed by the Next.js frontend.
          All authenticated routes require a JWT token set in the <code className="text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded text-xs">autopilot_token</code> cookie.
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { label: "Base URL (Prod)", val: "https://autopilot-backend.onrender.com" },
            { label: "Base URL (Local)", val: "http://localhost:3001" },
            { label: "Auth", val: "JWT (httpOnly Cookie)" },
          ].map(({ label, val }) => (
            <div key={label} className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
              <span className="text-[10px] text-white/30">{label}: </span>
              <code className="text-xs text-white/60">{val}</code>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
          Authentication Flow
        </h2>
        <CodeBlock lang="typescript">{`// 1. Get a challenge
const { challenge } = await fetch("/api/auth/challenge", {
  method: "POST",
  body: JSON.stringify({ publicKey: "G..." }),
}).then(r => r.json());

// 2. Sign with Freighter
const { signedXDR } = await signTransaction(challenge, { network: "TESTNET" });

// 3. Verify signature → sets JWT cookie automatically
const { user } = await fetch("/api/auth/verify", {
  method: "POST",
  body: JSON.stringify({ publicKey: "G...", signedXDR }),
  credentials: "include",
}).then(r => r.json());`}</CodeBlock>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-sky-500 inline-block" />
          Endpoints
        </h2>
        <div className="space-y-5">
          {ROUTES.map(({ group, color, routes }) => (
            <div key={group} className={`p-4 rounded-2xl border bg-gradient-to-br ${color}`}>
              <h3 className="text-sm font-semibold text-white/70 mb-3">{group}</h3>
              {routes.map((r) => (
                <Method key={r.path} {...r} />
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-violet-500 inline-block" />
          Example: Create a Rule
        </h2>
        <CodeBlock lang="typescript">{`const response = await fetch("/api/rules", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    trigger: "on every payment received",
    action: "save",
    amount: 10,
    isPercentage: true,
    memo: "Save 10% of payment",
  }),
});
// Returns: { id, userId, trigger, action, amount, isPercentage, memo, createdAt }`}</CodeBlock>
      </motion.div>
    </div>
  );
}
