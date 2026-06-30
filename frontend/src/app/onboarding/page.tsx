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
        throw new Error(data.error || "Authentication failed.");
      }

      // 3. On success, redirect to dashboard
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComingSoon = (walletName: string) => {
    setToastMessage(`${walletName} integration is coming soon!`);
  };

  return (
    <div className="w-full max-w-md p-8 glass-panel rounded-3xl relative z-10 flex flex-col items-center">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm whitespace-nowrap shadow-xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 text-center">
        {/* Placeholder for Logo, since the user said they added logo in public/logo.png */}
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
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          AutoPilot
        </h1>
        <p className="text-gray-400 text-sm">
          Your intelligent stellar companion.
        </p>
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
              Connect Freighter
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

        {/* Albedo Button */}
        <button
          onClick={() => handleComingSoon("Albedo")}
          disabled={isLoading}
          className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center p-2 border border-white/5">
              <span className="text-purple-400 font-bold text-lg leading-none">A</span>
            </div>
            <span className="font-medium text-white/90 group-hover:text-white transition-colors">
              Connect Albedo
            </span>
          </div>
          <div className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/5">
            Soon
          </div>
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
  );
}
