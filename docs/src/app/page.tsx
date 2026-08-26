"use client";

import DocsLayout from "@/components/DocsLayout";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, BookOpen, Settings, Terminal, Code2,
  Layers, Shield, Bot, ArrowRight, Star, ChevronRight,
  Clock, Globe, TrendingUp,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const CARDS = [
  {
    icon: Settings,
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    title: "Quick Setup",
    desc: "Get AutoPilot running in under 5 minutes. Step-by-step environment setup, wallet connection, and vault creation.",
    href: "/docs/setup",
    time: "5 min read",
  },
  {
    icon: Zap,
    color: "from-indigo-500/20 to-purple-500/20",
    border: "border-indigo-500/20",
    iconColor: "text-indigo-400",
    title: "Features",
    desc: "Explore AI-powered automation rules, intelligent savings vaults, investment tracking, and the 300 XLM buffer.",
    href: "/docs/features",
    time: "8 min read",
  },
  {
    icon: BookOpen,
    color: "from-violet-500/20 to-pink-500/20",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
    title: "Usage Guide",
    desc: "Learn how to create rules, manage vaults, set goals, and interact with the AutoPilot AI financial coach.",
    href: "/docs/usage",
    time: "10 min read",
  },
  {
    icon: Bot,
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    title: "AI Automation",
    desc: "Deep dive into the Groq-powered AI system that translates plain English financial goals into on-chain automation.",
    href: "/docs/automation",
    time: "6 min read",
  },
  {
    icon: Layers,
    color: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
    title: "Architecture",
    desc: "Full system architecture — Next.js frontend, Fastify backend, PostgreSQL, Redis, Horizon streams, and Soroban.",
    href: "/docs/architecture",
    time: "12 min read",
  },
  {
    icon: Code2,
    color: "from-yellow-500/20 to-orange-500/20",
    border: "border-yellow-500/20",
    iconColor: "text-yellow-400",
    title: "Smart Contracts",
    desc: "Soroban smart contract design for on-chain vault management on the Stellar blockchain.",
    href: "/docs/contracts",
    time: "8 min read",
  },
  {
    icon: Shield,
    color: "from-red-500/20 to-rose-500/20",
    border: "border-red-500/20",
    iconColor: "text-red-400",
    title: "Security",
    desc: "Non-custodial design, key management, spending limits, and the security model protecting user funds.",
    href: "/docs/security",
    time: "7 min read",
  },
  {
    icon: Terminal,
    color: "from-sky-500/20 to-blue-500/20",
    border: "border-sky-500/20",
    iconColor: "text-sky-400",
    title: "API Reference",
    desc: "Complete REST API documentation for all backend endpoints — auth, vaults, rules, goals, chat, and transactions.",
    href: "/docs/api",
    time: "15 min read",
  },
];

const STATS = [
  { value: "XLM", label: "Native Stellar Asset", icon: Globe },
  { value: "AI", label: "Plain-English Rules", icon: Bot },
  { value: "100%", label: "Non-Custodial", icon: Shield },
  { value: "Real-Time", label: "Horizon Streaming", icon: TrendingUp },
];

export default function DocsPage() {
  return (
    <DocsLayout>
    <div className="max-w-5xl mx-auto px-5 py-12">
      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mb-16"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Star className="w-3 h-3" />
            Powered by Stellar & Groq AI
          </span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
          AutoPilot{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Documentation
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-lg text-white/50 leading-relaxed max-w-2xl mb-8">
          AutoPilot is an AI-powered financial automation platform built on the Stellar blockchain.
          Write rules in plain English — AutoPilot executes them on-chain, automatically.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/20"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white/70 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
          >
            Explore Features
          </Link>
          <a
            href="https://youtu.be/OG6kS41sLGg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white/70 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
          >
            ▶ Watch Demo
          </a>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14"
      >
        {STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
            <Icon className="w-4 h-4 text-indigo-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{value}</div>
            <div className="text-[11px] text-white/35 mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Doc Cards Grid */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-white/30 uppercase tracking-widest mb-5">Documentation</h2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid sm:grid-cols-2 gap-4"
        >
          {CARDS.map(({ icon: Icon, color, border, iconColor, title, desc, href, time }) => (
            <motion.div key={href} variants={fadeUp}>
              <Link
                href={href}
                className={`group flex flex-col h-full p-5 rounded-2xl border bg-gradient-to-br ${color} ${border} hover:border-opacity-50 transition-all hover:shadow-xl hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-9 h-9 rounded-xl bg-black/30 flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-white/30">
                    <Clock className="w-3 h-3" />
                    {time}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-white transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed flex-1">{desc}</p>
                <div className={`flex items-center gap-1 mt-4 text-xs font-medium ${iconColor} opacity-70 group-hover:opacity-100 transition-opacity`}>
                  Read more <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* What is AutoPilot callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 md:p-8"
      >
        <h2 className="text-xl font-bold text-white mb-3">What is AutoPilot?</h2>
        <p className="text-white/55 leading-relaxed mb-4">
          AutoPilot is a DeFi automation layer on the Stellar network. Users connect their Freighter wallet,
          describe a financial rule in plain English (e.g. <em className="text-indigo-300">"Save 10% of every XLM payment I receive"</em>),
          and AutoPilot uses Groq AI to parse the intent and create an on-chain automation.
          Every rule execution moves real XLM to a dedicated Savings or Investment Vault on Stellar Testnet.
        </p>
        <p className="text-white/55 leading-relaxed">
          Built for the Stellar Hackathon, AutoPilot demonstrates what is possible when AI meets programmable blockchain
          payments — making personal finance automation accessible to everyone, with no code required.
        </p>
      </motion.div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-white/25">
          AutoPilot Documentation · Built on Stellar · Powered by Groq AI
        </p>
        <div className="flex items-center gap-4">
          <a href="https://github.com/aditya-jha033/autopilot-stellar" target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/60 transition-colors">GitHub</a>
          <Link href="https://autopilot-stellar-mauve.vercel.app/onboarding" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Launch App</Link>
        </div>
      </div>
    </div>
    </DocsLayout>
  );
}
