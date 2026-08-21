"use client";

import React, { useState, useEffect } from "react";
import { Lock, ArrowRight, ArrowLeft, ShieldAlert } from "lucide-react";
import { sounds } from "@/lib/audio/soundManager";
import Link from "next/link";

interface HostGuardProps {
  children: React.ReactNode;
}

const DEFAULT_PASSCODE = process.env.NEXT_PUBLIC_HOST_PASSCODE || "5555";
const AUTH_STORAGE_KEY = "cahoot_host_authenticated";

export function HostGuard({ children }: HostGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
      setIsAuthenticated(isAuth);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    if (cleanPass === DEFAULT_PASSCODE) {
      sounds.playClick();
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      sounds.playWrong();
      setError(true);
      setPasscode("");
    }
  };

  // While checking session state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#141026] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise show the Host Passcode Gate
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#120422] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Soft Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        <div className="bg-[#1c1833] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 text-center flex flex-col gap-4 backdrop-blur-xl">
          {/* Lock Icon */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Host Access Required</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Enter your Host Passcode to access quiz management and creator tools.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="flex flex-col gap-3">
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              placeholder="Enter Host Passcode"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(false);
              }}
              className="w-full text-center text-xl font-black tracking-widest py-3 px-4 bg-slate-900/80 border-2 border-white/15 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-slate-500 placeholder:text-sm text-white"
            />

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-red-400 text-xs font-bold animate-shake bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Incorrect passcode. Please try again.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-purple-600 hover:bg-purple-500 text-white text-sm font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1"
            >
              <span>Unlock Host Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-white/10">
            <Link
              href="/"
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Game PIN entry</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
