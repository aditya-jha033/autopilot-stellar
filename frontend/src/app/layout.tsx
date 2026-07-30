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
        {/* TODO: Make minor UI layout adjustments based on Ronit Pal's feedback. */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 min-h-screen">
        {/* TODO: Add Day/Night theme toggle here per user feedback */}
        {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
