import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Using the `geist` npm package instead of next/font/google
// — fonts are served locally, no network fetch needed at build time

export const metadata: Metadata = {
  title: "AutoPilot — Stellar Financial Automation",
  description:
    "Automate your Stellar wallet with AI-powered rules. Save, invest, and manage funds on autopilot.",
  keywords: ["Stellar", "USDC", "automation", "savings", "DeFi", "wallet"],
  openGraph: {
    title: "AutoPilot — Stellar Financial Automation",
    description: "AI-powered automation for your Stellar wallet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-gray-900 tracking-tight">
        <div className="fixed top-4 right-4 z-50">
          <button className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-colors flex items-center justify-center h-10 w-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
          </button>
        </div>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
