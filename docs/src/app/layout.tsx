import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoPilot Docs â€” AI-Powered Financial Automation on Stellar",
  description:
    "Complete documentation for AutoPilot: setup guide, features, usage, architecture, smart contracts, security, and API reference.",
  openGraph: {
    title: "AutoPilot Documentation",
    description: "Everything you need to understand and use AutoPilot.",
    url: "https://autopilot-stellar-docs.vercel.app",
    siteName: "AutoPilot Docs",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
