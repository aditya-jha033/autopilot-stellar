/* eslint-disable */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Code2, ChevronRight, ArrowRight, Terminal } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07 } }),
};

function CodeBlock({ children, lang = "rust" }: { children: string; lang?: string }) {
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

export default function ContractsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
        <Link href="/docs" className="hover:text-white/60 transition-colors">Docs</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white/60">Smart Contracts</span>
      </nav>

      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium">Technical</p>
            <h1 className="text-2xl font-bold text-white">Smart Contracts</h1>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed mb-10">
          AutoPilot includes a Soroban smart contract written in Rust for the Stellar blockchain.
          The contract provides on-chain vault management capabilities that complement the off-chain automation engine.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-yellow-500 inline-block" />
          Contract Overview
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            { label: "Contract Name", value: "autopilot-vault" },
            { label: "Language", value: "Rust" },
            { label: "SDK Version", value: "soroban-sdk v22.0.0" },
            { label: "Target", value: "wasm32-unknown-unknown" },
            { label: "Network", value: "Stellar Testnet" },
            { label: "CI Status", value: "✅ Passing (GitHub Actions)" },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-xs text-white/30 mb-1">{label}</div>
              <div className="text-sm font-semibold text-white/80 font-mono">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-orange-500 inline-block" />
          Contract Source (lib.rs)
        </h2>
        <p className="text-sm text-white/50 mb-3">
          The contract exposes a simple <code className="text-yellow-300 bg-yellow-500/10 px-1.5 py-0.5 rounded text-xs">deposit</code> function
          that records vault deposits on-chain with an event log:
        </p>
        <CodeBlock lang="rust">{`#![no_std]
use soroban_sdk::{contract, contractimpl, log, symbol_short, Env, Symbol};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Record a vault deposit on-chain
    pub fn deposit(env: Env, amount: i128, vault_type: Symbol) -> i128 {
        log!(&env, "Vault deposit: {} to {:?}", amount, vault_type);
        
        // Emit an event for indexers and off-chain listeners
        env.events().publish(
            (symbol_short!("deposit"), vault_type.clone()),
            amount,
        );

        amount
    }
}`}</CodeBlock>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-red-500 inline-block" />
          Cargo.toml Configuration
        </h2>
        <CodeBlock lang="toml">{`[package]
name = "autopilot-vault"
version = "0.0.0"
edition = "2021"

[lib]
crate-type = ["lib", "cdylib"]
doctest = false

[dependencies]
soroban-sdk = "22.0.0"

[dev-dependencies]
soroban-sdk = { version = "22.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
panic = "abort"
lto = true`}</CodeBlock>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
          Building the Contract
        </h2>
        <CodeBlock lang="bash">{`# Install Rust and the wasm32 target
rustup target add wasm32-unknown-unknown

# Build the contract
cargo build \\
  --manifest-path contracts/Cargo.toml \\
  --target wasm32-unknown-unknown \\
  --release

# Output: target/wasm32-unknown-unknown/release/autopilot_vault.wasm`}</CodeBlock>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
          CI/CD Workflow
        </h2>
        <p className="text-sm text-white/50 mb-3">
          GitHub Actions automatically builds the Soroban contract on every push to <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs">contracts/**</code>:
        </p>
        <CodeBlock lang="yaml">{`name: Soroban Smart Contract CI
on:
  push:
    paths:
      - 'contracts/**'
      - '.github/workflows/contract.yml'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown
      - name: Build Contract
        run: cargo build \\
          --manifest-path contracts/Cargo.toml \\
          --target wasm32-unknown-unknown \\
          --release`}</CodeBlock>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp}>
        <div className="mt-6 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <p className="text-sm text-white/50 mb-4">Learn about the security model protecting user funds.</p>
          <Link
            href="/docs/security"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Security Overview <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
