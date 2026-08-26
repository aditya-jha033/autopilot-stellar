"use client";

import DocsLayout from "@/components/DocsLayout";

import Link from "next/link";
import { motion } from "framer-motion";
import { Settings, ChevronRight, CheckCircle2, Terminal, ArrowRight, AlertCircle, Info } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07 } }),
};

function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/[0.08]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06]">
        <Terminal className="w-3.5 h-3.5 text-white/30" />
        <span className="text-[11px] text-white/30 font-mono">{lang}</span>
      </div>
      <pre className="px-4 py-4 overflow-x-auto bg-[#0d0d14]">
        <code className="text-sm text-emerald-300 font-mono leading-relaxed whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400 mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <div className="text-white/55 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Callout({ type = "info", children }: { type?: "info" | "warning"; children: React.ReactNode }) {
  const styles = type === "warning"
    ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
    : "bg-indigo-500/10 border-indigo-500/25 text-indigo-300";
  const Icon = type === "warning" ? AlertCircle : Info;
  return (
    <div className={`flex gap-3 p-4 rounded-xl border my-4 ${styles}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export default function SetupPage() {
  const prereqs = [
    "Node.js 18+ and npm/pnpm",
    "A Freighter browser wallet extension",
    "Git installed",
    "PostgreSQL database (Neon recommended)",
    "Redis instance (Upstash recommended)",
    "Groq API key (free tier available)",
  ];

  return (
    <DocsLayout>
    <div className="max-w-3xl mx-auto px-5 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
        <Link href="/" className="hover:text-white/60 transition-colors">Docs</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/60">Quick Setup</span>
      </nav>

      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium">Getting Started</p>
            <h1 className="text-2xl font-bold text-white">Quick Setup</h1>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed mb-10">
          Get AutoPilot running locally in under 5 minutes. This guide covers cloning the repository,
          setting up environment variables, and launching both the frontend and backend.
        </p>
      </motion.div>

      {/* Prerequisites */}
      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-4">Prerequisites</h2>
        <div className="grid sm:grid-cols-2 gap-2 mb-10">
          {prereqs.map((p) => (
            <div key={p} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm text-white/60">{p}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Steps */}
      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-6">Installation Steps</h2>

        <Step n={1} title="Clone the Repository">
          Clone the AutoPilot repository from GitHub and navigate into the project directory.
          <CodeBlock>{`git clone https://github.com/aditya-jha033/autopilot-stellar.git
cd autopilot-stellar`}</CodeBlock>
        </Step>

        <Step n={2} title="Install Frontend Dependencies">
          Navigate to the frontend directory and install all dependencies.
          <CodeBlock>{`cd frontend
npm install`}</CodeBlock>
        </Step>

        <Step n={3} title="Configure Frontend Environment">
          Copy the example environment file and fill in your values.
          <CodeBlock>{`cp .env.example .env.local`}</CodeBlock>
          Edit <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">.env.local</code>:
          <CodeBlock lang="env">{`NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
DATABASE_URL=postgresql://...       # Neon PostgreSQL URL
NEXTAUTH_SECRET=your-random-secret  # Generate with: openssl rand -hex 32`}</CodeBlock>
        </Step>

        <Step n={4} title="Install Backend Dependencies">
          <CodeBlock>{`cd ../backend
npm install`}</CodeBlock>
        </Step>

        <Step n={5} title="Configure Backend Environment">
          <CodeBlock>{`cp .env.example .env`}</CodeBlock>
          Edit <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">.env</code>:
          <CodeBlock lang="env">{`DATABASE_URL=postgresql://...       # Same Neon URL
GROQ_API_KEY=gsk_...                # From console.groq.com
UPSTASH_REDIS_REST_URL=https://...  # From upstash.com
UPSTASH_REDIS_REST_TOKEN=...
AUTOPILOT_SECRET_KEY=S...           # Stellar keypair secret
AUTOPILOT_PUBLIC_KEY=G...           # Stellar keypair public
JWT_SECRET=your-jwt-secret`}</CodeBlock>
          <Callout>
            To generate a new Stellar keypair for the engine account, run:{" "}
            <code className="text-indigo-300 font-mono text-xs">npx tsx src/scripts/genKeypair.ts</code> in the backend directory.
          </Callout>
        </Step>

        <Step n={6} title="Generate a Stellar Keypair">
          The AutoPilot engine needs a Stellar keypair to fund automated vault transactions on Testnet.
          <CodeBlock>{`# Run from backend/ directory
npx tsx src/scripts/genKeypair.ts

# Fund the engine account with Testnet XLM via Friendbot
npx tsx src/scripts/friendbot.ts YOUR_PUBLIC_KEY`}</CodeBlock>
        </Step>

        <Step n={7} title="Start the Backend">
          <CodeBlock>{`# From backend/ directory
npm run dev`}</CodeBlock>
          The backend starts on <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">http://localhost:3001</code>
        </Step>

        <Step n={8} title="Start the Frontend">
          Open a new terminal tab:
          <CodeBlock>{`# From frontend/ directory
npm run dev`}</CodeBlock>
          Open <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">http://localhost:3000</code> in your browser.
          <Callout>
            Make sure you have the <strong>Freighter wallet extension</strong> installed and set to <strong>Testnet</strong> network
            before connecting your wallet on the onboarding page.
          </Callout>
        </Step>
      </motion.div>

      {/* Next steps */}
      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
        <div className="mt-10 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <h3 className="text-base font-semibold text-white mb-3">✅ You're all set!</h3>
          <p className="text-sm text-white/50 mb-4">
            Once running, connect your Freighter wallet on the onboarding page, create your first vault,
            and let the AI set up your first automated savings rule.
          </p>
          <Link
            href="/usage"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Continue to Usage Guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
    </DocsLayout>
  );
}
