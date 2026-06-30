"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  ListChecks,
  Target,
  Vault,
  User,
  LogOut,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/",        icon: LayoutDashboard, label: "Home" },
  { href: "/chat",    icon: Bot,             label: "AutoPilot" },
  { href: "/rules",   icon: ListChecks,      label: "Rules" },
  { href: "/goals",   icon: Target,          label: "Goals" },
  { href: "/vault",   icon: Vault,           label: "Vault" },
  { href: "/account", icon: User,            label: "Account" },
];

export default function Sidebar({ publicKey }: { publicKey: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const truncated = `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    await fetch("/api/account/disconnect", { method: "POST" });
    router.push("/onboarding");
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#050505] border-r border-white/[0.06] flex-col z-30 hidden md:flex">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 shrink-0">
              <Image
                src="/logo.png"
                alt="AutoPilot"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-white text-[15px] tracking-tight">
              AutoPilot
            </span>
            <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              TESTNET
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-500 rounded-full"
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : ""}`} />
                  <span>{item.label}</span>
                  {item.label === "AutoPilot" && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Wallet + Disconnect */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
              {publicKey.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/30 leading-none mb-0.5">Wallet</p>
              <p className="text-xs font-mono text-white/60 truncate">{truncated}</p>
            </div>
            <button
              onClick={handleCopy}
              className="text-white/25 hover:text-white/60 transition-colors shrink-0"
              title="Copy address"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Copy className="w-3.5 h-3.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-150 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {disconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/[0.06] flex md:hidden z-30">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${
                  isActive ? "text-blue-400" : "text-white/30"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
