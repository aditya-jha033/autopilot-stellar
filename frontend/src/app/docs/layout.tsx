"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Zap,
  Settings,
  Terminal,
  Code2,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Home,
  Layers,
  Shield,
  Bot,
} from "lucide-react";

const NAV = [
  {
    group: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs", icon: Home },
      { label: "Quick Setup", href: "/docs/setup", icon: Settings },
    ],
  },
  {
    group: "Product",
    items: [
      { label: "Features", href: "/docs/features", icon: Zap },
      { label: "Usage Guide", href: "/docs/usage", icon: BookOpen },
      { label: "AI Automation", href: "/docs/automation", icon: Bot },
    ],
  },
  {
    group: "Technical",
    items: [
      { label: "Architecture", href: "/docs/architecture", icon: Layers },
      { label: "Smart Contracts", href: "/docs/contracts", icon: Code2 },
      { label: "Security", href: "/docs/security", icon: Shield },
      { label: "API Reference", href: "/docs/api", icon: Terminal },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 border-b transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0f]/95 backdrop-blur-xl border-white/[0.08]"
            : "bg-[#0a0a0f]/80 backdrop-blur-md border-transparent"
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <button
            className="lg:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-6 h-6">
              <Image src="/logo.png" alt="AutoPilot" fill sizes="24px" className="object-contain" />
            </div>
            <span className="font-semibold text-white/90 text-sm group-hover:text-white transition-colors">AutoPilot</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <span className="text-sm text-white/40 font-medium">Docs</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/aditya-jha033/autopilot-stellar"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            GitHub
          </a>
          <Link
            href="/onboarding"
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition-colors"
          >
            Launch App →
          </Link>
        </div>
      </header>

      <div className="flex pt-14">
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed top-14 left-0 bottom-0 z-40 w-64 overflow-y-auto border-r border-white/[0.06] bg-[#0a0a0f] transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="px-3 py-5 space-y-6">
            {NAV.map((group) => (
              <div key={group.group}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                  {group.group}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                            active
                              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                              : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="pt-2 border-t border-white/[0.06]">
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">Links</p>
              <ul className="space-y-0.5">
                {[
                  { label: "Live Demo", href: "https://autopilot-stellar-mauve.vercel.app/" },
                  { label: "GitHub Repo", href: "https://github.com/aditya-jha033/autopilot-stellar" },
                  { label: "Demo Video", href: "https://youtu.be/OG6kS41sLGg" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        <main className="flex-1 lg:ml-64 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
