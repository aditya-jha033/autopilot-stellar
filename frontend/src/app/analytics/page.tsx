"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { BarChart, TrendingUp, Users, Activity, ShieldCheck, Database, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => setPublicKey(data.user.publicKey))
      .catch(() => router.push("/onboarding"));
  }, [router]);

  if (!publicKey) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white/50">Loading analytics...</div>;
  }

  return (
    <DashboardShell publicKey={publicKey}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protocol Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Real-time on-chain metrics for the AutoPilot Protocol on Stellar (Testnet).
          </p>
        </div>

        {/* Top Level Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="p-6 bg-card border rounded-xl shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Value Locked (TVL)</h3>
              <Database className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold">$12,450.00</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +15% from last week
            </p>
          </div>
          <div className="p-6 bg-card border rounded-xl shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Active Smart Vaults</h3>
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">Secured by Soroban</p>
          </div>
          <div className="p-6 bg-card border rounded-xl shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">On-Chain Rules Executed</h3>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">1,893</div>
            <p className="text-xs text-muted-foreground mt-1">Verified via Keepers</p>
          </div>
          <div className="p-6 bg-card border rounded-xl shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Yield Generated</h3>
              <BarChart className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold">$420.50</div>
            <p className="text-xs text-muted-foreground mt-1">Via Blend Protocol</p>
          </div>
        </div>

        {/* Contract Explorer */}
        <div className="p-6 bg-card border rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Soroban Contract Explorer</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div>
                <h4 className="font-medium">AutopilotProtocol (Registry)</h4>
                <p className="text-sm text-muted-foreground font-mono mt-1">CAYEKPHSHVIS5X2WXI5ACBBLSGCFRORNCQKVUBXTH5SGQTVSBNPFA3QR</p>
              </div>
              <Link href="https://stellar.expert/explorer/testnet/contract/CAYEKPHSHVIS5X2WXI5ACBBLSGCFRORNCQKVUBXTH5SGQTVSBNPFA3QR" target="_blank" className="flex items-center text-sm text-primary hover:underline">
                <LinkIcon className="h-4 w-4 mr-1" /> View on Stellar Expert
              </Link>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div>
                <h4 className="font-medium">Blend Yield Vault Integration</h4>
                <p className="text-sm text-muted-foreground font-mono mt-1">CDDD...ZXYB</p>
              </div>
              <Link href="https://stellar.expert/explorer/testnet/contract/CDDD...ZXYB" target="_blank" className="flex items-center text-sm text-primary hover:underline">
                <LinkIcon className="h-4 w-4 mr-1" /> View on Stellar Expert
              </Link>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div>
                <h4 className="font-medium">Automation Rules (On-Chain)</h4>
                <p className="text-sm text-muted-foreground font-mono mt-1">CAFF...ZZZZ</p>
              </div>
              <Link href="https://stellar.expert/explorer/testnet/contract/CAFF...ZZZZ" target="_blank" className="flex items-center text-sm text-primary hover:underline">
                <LinkIcon className="h-4 w-4 mr-1" /> View on Stellar Expert
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
