"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { sounds } from "@/lib/audio/soundManager";
import { SyncBridge } from "@/lib/realtime/syncBridge";

interface PinFormProps {
  initialPin?: string;
  onSubmit: (pin: string) => void;
}

export function PinForm({ initialPin = "", onSubmit }: PinFormProps) {
  const [pin, setPin] = useState(initialPin);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecking) return;

    const cleanPin = pin.replace(/\s+/g, "").trim();
    if (!cleanPin || cleanPin.length < 4) {
      setError("Please enter a valid 4-digit Game PIN");
      sounds.playWrong();
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      // Verify whether the game session actually exists on Realtime/Supabase
      const roomCheck = await SyncBridge.verifyRoomExists(cleanPin);

      if (roomCheck.exists) {
        sounds.playClick();
        onSubmit(cleanPin);
      } else {
        setError("We couldn't find a game with that PIN. Please check the PIN and try again.");
        sounds.playWrong();
        setIsChecking(false);
      }
    } catch (err) {
      setError("Unable to connect to game room. Please try again.");
      sounds.playWrong();
      setIsChecking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[340px] sm:max-w-sm px-2 font-sans"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/20 text-center flex flex-col gap-3.5"
      >
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoFocus
            disabled={isChecking}
            placeholder="Game PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError("");
            }}
            className="w-full text-center text-2xl sm:text-3xl font-black tracking-wider py-3.5 sm:py-4 px-4 bg-white border-2 border-slate-300 rounded-2xl focus:border-[#46178F] focus:ring-4 focus:ring-purple-200 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-bold text-slate-950 shadow-inner disabled:opacity-60"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-left bg-red-50 border border-red-200 p-3 rounded-2xl animate-shake"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-xs font-bold leading-tight">{error}</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isChecking}
          whileHover={{ scale: isChecking ? 1 : 1.02 }}
          whileTap={{ scale: isChecking ? 1 : 0.96 }}
          className="w-full py-3.5 sm:py-4 px-6 bg-[#121124] hover:bg-[#201d3b] disabled:bg-slate-700 text-white text-base sm:text-lg font-black tracking-wide rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer border-b-4 border-black disabled:border-slate-900 active:border-b-0 active:translate-y-1"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
              <span>Verifying PIN...</span>
            </>
          ) : (
            <>
              <span>Enter</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
