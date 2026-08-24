"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06 } }),
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function StepCard({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-3">
      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <div className="text-sm font-semibold text-white mb-1">{title}</div>
        <div className="text-sm text-white/50 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

export default function UsagePage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
        <Link href="/docs" className="hover:text-white/60 transition-colors">Docs</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/60">Usage Guide</span>
      </nav>

      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium">Product</p>
            <h1 className="text-2xl font-bold text-white">Usage Guide</h1>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed mb-10">
          A step-by-step walkthrough of every major flow in AutoPilot — from connecting your wallet
          to tracking your first automated savings goal.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
        <Section title="1. Connect Your Wallet">
          <StepCard n={1} title="Install Freighter" desc="Install the Freighter extension from freighter.app in your Chrome or Firefox browser." />
          <StepCard n={2} title="Switch to Testnet" desc='In Freighter settings, switch the network from Mainnet to "Stellar Testnet". AutoPilot currently runs on Testnet.' />
          <StepCard n={3} title="Visit the App" desc="Navigate to autopilot-stellar-mauve.vercel.app and click 'Get Started Free'. The onboarding page will ask you to connect Freighter." />
          <StepCard n={4} title="Sign the Auth Message" desc="Freighter will prompt you to sign a challenge message. This proves wallet ownership without sharing your private key — no transaction is sent." />
          <div className="mt-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-sm text-blue-300">
            💡 <strong>No seed phrase required.</strong> AutoPilot never sees your private key. Authentication uses a cryptographic signature, not your wallet credentials.
          </div>
        </Section>

        <Section title="2. Create Your Vaults">
          <StepCard n={1} title="Go to Vault Tab" desc="After logging in, click on the 'Vault' icon in the sidebar navigation." />
          <StepCard n={2} title="Create Savings Vault" desc="Click 'Create Savings Vault'. AutoPilot generates a fresh Stellar keypair and funds it with the minimum XLM required." />
          <StepCard n={3} title="Create Investment Vault" desc="Optionally create an Investment Vault for a separate pool of funds for longer-term holdings." />
          <StepCard n={4} title="Fund Your Vault Manually" desc="You can manually deposit XLM or USDC into your vault using the 'Deposit' button at any time." />
          <div className="mt-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-sm text-emerald-300">
            🔒 Each vault is a real Stellar account. Funds sit on-chain — AutoPilot cannot access them without your wallet signature.
          </div>
        </Section>

        <Section title="3. Create an Automation Rule">
          <StepCard n={1} title="Open AutoPilot Chat" desc="Click the 'AutoPilot' (chat bubble) icon in the sidebar." />
          <StepCard n={2} title="Describe Your Rule in Plain English" desc='Type something like: "Save 10% of every XLM payment I receive" or "Transfer 5 XLM to my savings vault on every payment".' />
          <StepCard n={3} title="Review the Generated Rule" desc="AutoPilot AI will parse your intent and show you the exact rule it will create: trigger, action, amount, and vault." />
          <StepCard n={4} title="Activate the Rule" desc='Click "Activate Rule" to save it to the database. AutoPilot starts monitoring your wallet immediately.' />
          <StepCard n={5} title="Edit if Needed" desc='Switch to "Coach Mode" to see all active rules. Click the edit icon on any rule to adjust the amount or percentage.' />
        </Section>

        <Section title="4. Set a Financial Goal">
          <StepCard n={1} title="Go to Goals" desc="Click the 'Goals' icon in the sidebar." />
          <StepCard n={2} title="Create a New Goal" desc='Click "New Goal". Give it a name (e.g. "Emergency Fund"), set a target amount in XLM, and pick a target date.' />
          <StepCard n={3} title="Link to a Rule" desc="Link your goal to one of your automation rules. Every time that rule executes a sweep, the goal's progress bar advances automatically." />
          <StepCard n={4} title="Track Progress" desc="Return to the Goals page to watch your progress over time. Once 100% is reached, the goal is marked complete." />
        </Section>

        <Section title="5. Monitor Transactions">
          <StepCard n={1} title="Dashboard Overview" desc="The Dashboard tab shows your main wallet balance, vault balances, and recent automated transactions." />
          <StepCard n={2} title="Transaction History" desc="Every automated sweep is recorded in the 'Transactions' section with the amount, vault destination, rule that triggered it, and Stellar transaction hash." />
          <StepCard n={3} title="On-Chain Verification" desc="Click any transaction hash to view it on Stellar Expert, the Stellar blockchain explorer." />
        </Section>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
        <div className="mt-4 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <p className="text-sm text-white/50 mb-4">Learn how the AI processes your rules under the hood.</p>
          <Link
            href="/docs/automation"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Explore AI Automation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
