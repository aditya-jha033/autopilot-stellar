"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isConnected, requestAccess } from "@stellar/freighter-api";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleFreighterConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check if Freighter is installed
      const connectedRes = await isConnected();
      if (!connectedRes.isConnected) {
        throw new Error("Freighter is not installed. Please install the extension first.");
      }

      // 2. Request access (this will prompt the user if not already allowed)
      const accessRes = await requestAccess();
      if (accessRes.error || !accessRes.address) {
        throw new Error(accessRes.error || "Could not retrieve public key. Please approve the connection in Freighter.");
      }
      const publicKey = accessRes.address;

      // 2. Call backend to authenticate
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Sanitize raw server errors — never show "Internal Server Error" to user
        const rawError = data.error || "";
        const friendlyError = rawError.toLowerCase().includes("internal server")
          ? "Backend is temporarily unavailable. Please try again in a moment."
          : rawError || "Authentication failed.";
        throw new Error(friendlyError);
      }

      // 3. On success, redirect to dashboard
      router.push("/");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      // Sanitize network-level errors too
      setError(
        msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")
          ? "Could not reach the server. Is the backend running?"
          : msg || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleComingSoon = (walletName: string) => {
    setToastMessage(`${walletName} integration is coming soon!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 lg:py-24 relative z-10 flex flex-col lg:flex-row items-center gap-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm whitespace-nowrap shadow-xl z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Landing Copy (Left Column) */}
      <div className="flex-1 text-center lg:text-left space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          AutoPilot Beta Live on Stellar Testnet
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
          Financial automation <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">in plain English.</span>
        </h1>
        
        <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
          Connect your Stellar wallet and tell our AI Coach how you want to save, invest, and manage your funds. We handle the smart contracts and transactions.
        </p>

        <div className="grid grid-cols-2 gap-6 pt-4 max-w-lg mx-auto lg:mx-0 text-left">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Savings Vaults</h3>
            <p className="text-xs text-white/50">Auto-sweep unused XLM/USDC into dedicated vaults.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"/> Goal Tracking</h3>
            <p className="text-xs text-white/50">Set goals and watch your funds grow with real-time graphs.</p>
          </div>
        </div>
      </div>

      {/* Wallet Connect Panel (Right Column) */}
      <div className="w-full max-w-md p-8 glass-panel rounded-3xl shrink-0">
        <div className="mb-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Image
              src="/logo.png"
              alt="AutoPilot Logo"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-sm text-gray-400">Join the waitlist by connecting.</p>
        </div>

      <div className="w-full space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Freighter Button */}
        <button
          onClick={handleFreighterConnect}
          disabled={isLoading}
          className="w-full group relative flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center p-2 border border-white/5">
               <Wallet className="text-blue-400 w-5 h-5" />
            </div>
            <span className="font-medium text-white/90 group-hover:text-white transition-colors">
              {isLoading ? "Connecting..." : "Connect Freighter"}
            </span>
          </div>
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-blue-500/50 group-hover:bg-blue-400 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all" />
          )}
        </button>

        {/* Lobstr Button */}
        <button
          onClick={() => handleComingSoon("Lobstr")}
          disabled={isLoading}
          className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center p-2 border border-white/5">
              <span className="text-cyan-400 font-bold text-lg leading-none">L</span>
            </div>
            <span className="font-medium text-white/90 group-hover:text-white transition-colors">
              Connect Lobstr
            </span>
          </div>
          <div className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/5">
            Soon
          </div>
        </button>

        {/* Albedo Button (Mock Integration — demo only, no real API call) */}
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            // Albedo is a demo button — simulates a 1.5s connect delay then shows success toast
            setTimeout(() => {
              setIsLoading(false);
              setToastMessage("Albedo wallet connected (Demo Mode)");
            }, 1500);
          }}
          disabled={isLoading}
          className="w-full group relative flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center p-2 border border-white/5">
              <span className="text-purple-400 font-bold text-lg leading-none">A</span>
            </div>
            <span className="font-medium text-white/90 group-hover:text-white transition-colors">
              {isLoading ? "Connecting..." : "Connect Albedo"}
            </span>
          </div>
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-purple-500/50 group-hover:bg-purple-400 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-all" />
          )}
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Running on Stellar testnet
        </p>
      </div>
    </div>
    </div>
  );
}
