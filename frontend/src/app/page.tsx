/* eslint-disable */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Zap,
  Shield,
  TrendingUp,
  Bot,
  Wallet,
  ChevronRight,
  Menu,
  X,
  Target,
  Vault,
  ArrowRight,
  CheckCircle2,
  Star,
  ExternalLink,
  MessageCircle,
  Globe,
} from "lucide-react";

// ── Fade-in helper ──────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Features",    href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Use cases",   href: "#usecases" },
    { label: "Docs",        href: "https://autopilot-docs.vercel.app" },
    { label: "Contact",     href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/logo.png" alt="AutoPilot" fill sizes="28px" className="object-contain" />
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">AutoPilot</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            BETA
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/onboarding" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            href="/onboarding"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0a0a0a] border-b border-white/[0.06] px-5 py-4 space-y-3"
        >
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-white/60 hover:text-white py-1">
              {l.label}
            </a>
          ))}
          <Link
            href="/onboarding"
            className="block text-sm font-semibold bg-blue-600 text-white px-4 py-2.5 rounded-xl text-center mt-2"
            onClick={() => setOpen(false)}
          >
            Get Started Free
          </Link>
        </motion.div>
      )}
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 text-center">
        {/* Badge */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          Live on Stellar Testnet · Open Beta
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible"
          className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
        >
          Financial automation<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500">
            in plain English.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="visible"
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Connect your Stellar wallet and describe your savings rules in natural language.
          AutoPilot&apos;s AI engine handles smart contract automation, vaults, and real-time execution — no code needed.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_rgba(59,130,246,0.40)] text-base"
          >
            Connect Wallet <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how"
            className="flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-2xl transition-all text-base"
          >
            How it works
          </a>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {[
            { value: "XLM + USDC", label: "Supported assets" },
            { value: "AI-powered", label: "Rule creation" },
            { value: "Non-custodial", label: "Your keys, your funds" },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Features ────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Bot,
    color: "blue",
    title: "AI-Powered Rule Creation",
    desc: "Just tell AutoPilot what you want in plain English — &lsquo;Save 10% of every payment I receive.&rsquo; Our AI parses your intent and deploys the automation rule instantly.",
  },
  {
    icon: Vault,
    color: "emerald",
    title: "Dedicated Savings Vaults",
    desc: "Funds are swept into isolated Stellar accounts for savings and investments. Completely separate from your main wallet — your goals stay safe.",
  },
  {
    icon: Zap,
    color: "amber",
    title: "Real-Time Execution",
    desc: "AutoPilot watches your Stellar wallet 24/7 via the Horizon stream. Rules execute within seconds of a trigger — no cron jobs, no delays.",
  },
  {
    icon: Shield,
    color: "purple",
    title: "Smart Spending Limits",
    desc: "Set daily and weekly caps on how much the engine can move. Built-in guardrails to keep automations under your total control.",
  },
  {
    icon: TrendingUp,
    color: "teal",
    title: "Goal Tracking",
    desc: "Define financial goals with timelines. The dashboard shows real-time progress graphs and savings forecasts based on your rules.",
  },
  {
    icon: Target,
    color: "rose",
    title: "USDC & XLM Native",
    desc: "Full support for both XLM and USDC assets. Automation rules, vaults, and the AI coach understand both currencies natively.",
  },
];

const colorMap: Record<string, string> = {
  blue:    "bg-blue-500/10 border-blue-500/20 text-blue-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  amber:   "bg-amber-500/10 border-amber-500/20 text-amber-400",
  purple:  "bg-purple-500/10 border-purple-500/20 text-purple-400",
  teal:    "bg-teal-500/10 border-teal-500/20 text-teal-400",
  rose:    "bg-rose-500/10 border-rose-500/20 text-rose-400",
};

function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Everything you need,<br />nothing you don&apos;t.</h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto text-lg">
            A complete automation layer for your Stellar wallet — built for real users, not just developers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────
const steps = [
  {
    step: "01",
    title: "Connect your wallet",
    desc: "Link your Freighter or Albedo Stellar wallet in one click. Non-custodial — we never hold your private keys.",
  },
  {
    step: "02",
    title: "Create a savings vault",
    desc: "Set up dedicated savings or investment vaults. These are separate on-chain accounts that keep your goals isolated.",
  },
  {
    step: "03",
    title: "Describe your rules",
    desc: 'Chat with the AI coach: "Save 15% of every incoming payment." It parses your intent and activates the automation.',
  },
  {
    step: "04",
    title: "AutoPilot handles the rest",
    desc: "The engine monitors your wallet 24/7 and executes rules in real-time the moment a trigger condition is met.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-white/[0.01] border-y border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Up and running in minutes.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07]"
            >
              <p className="text-5xl font-black text-white/[0.06] mb-4 leading-none">{s.step}</p>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-[-14px] -translate-y-1/2 z-10">
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Use Cases ────────────────────────────────────────────────────────────────
const useCases = [
  { emoji: "🎯", title: "Emergency fund", desc: "Auto-save 5% of every incoming transaction to a locked savings vault. Build your buffer passively." },
  { emoji: "📈", title: "DCA investing", desc: "Invest a fixed USDC amount into your investment vault every time your balance crosses a threshold." },
  { emoji: "💼", title: "Freelancer paycheck split", desc: "Split every client payment automatically — 20% savings, 30% taxes, 50% spending money." },
  { emoji: "🛡️", title: "Spending limits", desc: "Set daily XLM limits so AutoPilot blocks automation rules from exceeding your budget." },
];

function UseCases() {
  return (
    <section id="usecases" className="py-24">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3">Use Cases</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Built for real financial goals.</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {useCases.map((u) => (
            <motion.div
              key={u.title}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="flex gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] transition-all"
            >
              <div className="text-3xl shrink-0">{u.emoji}</div>
              <div>
                <h3 className="text-white font-semibold mb-1">{u.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{u.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonial strip */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10 p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 text-center">
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-white text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            &ldquo;AutoPilot is crazy — I was able to understand the app within a minute and my rules just work in the background.&rdquo;
          </p>
          <p className="text-white/40 text-sm mt-3">— Pritam Mondal, Beta Tester</p>
        </motion.div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-5">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-blue-600/20 border border-blue-500/20 p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/20 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10">
            <Wallet className="w-12 h-12 text-blue-400 mx-auto mb-5" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Start automating your finances today.
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Connect your Stellar wallet in seconds. It&apos;s free, non-custodial, and live on testnet right now.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all text-base shadow-[0_0_30px_rgba(59,130,246,0.30)]"
              >
                Connect Wallet <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              {["Free to use", "Non-custodial", "Open source", "Stellar Testnet"].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-white/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" className="py-24 border-t border-white/[0.05] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/[0.02]" />
      <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">24/7 Customer Support</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            As a decentralized financial platform, we believe in complete transparency and dedicated user support.
            Whether you have questions about vault security, AI rules, or limits, our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <a
              href="mailto:support@autopilot.finance"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              Email Support Team
            </a>
            <a
              href="https://github.com/aditya-jha033/autopilot-stellar/issues"
              target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 hover:text-white rounded-xl transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Report an Issue
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/30">
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Available Worldwide</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Secure Comms</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative w-6 h-6 shrink-0">
            <Image src="/logo.png" alt="AutoPilot" fill sizes="24px" className="object-contain" />
          </div>
          <span className="font-semibold text-white/70 text-sm">AutoPilot</span>
        </div>

        <div className="flex items-center gap-6">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how" },
            { label: "GitHub", href: "https://github.com/aditya-jha033/autopilot-stellar" },
          ].map((l) => (
            <a key={l.label} href={l.href} className="text-xs text-white/30 hover:text-white/60 transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <p className="text-xs text-white/20">
          Built on Stellar Testnet · © 2026 AutoPilot
        </p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <CTABanner />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
