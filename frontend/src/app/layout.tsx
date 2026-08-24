/* eslint-disable */
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
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
      <body className="min-h-full flex flex-col text-gray-900 tracking-tight bg-black">
        {children}
        <Toaster theme="dark" position="bottom-right" />
        <Analytics />
      </body>
    </html>
  );
}
