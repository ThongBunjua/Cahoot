"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, RotateCcw, Tv } from "lucide-react";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";

interface PlayerPodiumProps {
  score: number;
  nickname?: string;
  avatar?: string;
  onPlayAgain: () => void;
}

export function PlayerPodium({ score, nickname, avatar, onPlayAgain }: PlayerPodiumProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-sm w-full p-4 sm:p-6 text-white font-sans select-none">
      <ConfettiEffect trigger={true} duration={4000} />

      {/* Floating Trophy & Suspense Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#FFA602] to-[#FFD000] text-slate-950 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl mb-4 relative border-4 border-yellow-200"
      >
        <span>🏆</span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 rounded-3xl border-2 border-dashed border-white/60"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-black tracking-tight mb-2"
      >
        Game Finished! 🎉
      </motion.h1>

      {/* Suspense Callout: Look at the Big Screen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[#FFA602] text-slate-950 font-black px-4 py-2 rounded-2xl shadow-lg border-2 border-yellow-300 flex items-center gap-2 mb-6"
      >
        <Tv className="w-5 h-5 fill-current animate-bounce" />
        <span className="text-xs sm:text-sm uppercase tracking-wide">
          Look at the Host Screen for Podium!
        </span>
      </motion.div>

      {/* Player Score & Summary Card (NO RANK REVEALED) */}
      <div className="w-full bg-[#33106B] rounded-3xl p-5 sm:p-6 border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] mb-6 shadow-2xl flex flex-col gap-3.5">
        {/* Avatar & Nickname */}
        {(nickname || avatar) && (
          <div className="flex items-center justify-center gap-3 pb-3 border-b border-white/10">
            <span className="text-3xl filter drop-shadow-sm">{avatar || "🦊"}</span>
            <span className="text-xl sm:text-2xl font-black text-white truncate max-w-[200px]">
              {nickname}
            </span>
          </div>
        )}

        {/* Total Points */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
            Total Points
          </span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-400 tabular-nums">
            {score.toLocaleString()} pts
          </span>
        </div>

        {/* Podium Standings Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
            Final Standings
          </span>
          <span className="text-sm font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/40">
            👀 Revealing on Screen...
          </span>
        </div>
      </div>

      {/* Join Another Game Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onPlayAgain}
        className="w-full py-4 px-6 bg-[#26890C] hover:bg-[#22790A] text-white text-base sm:text-lg font-black rounded-2xl border-b-[6px] border-[#165406] active:border-b-[2px] active:translate-y-1 shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw className="w-5 h-5 stroke-[3]" />
        <span>Play Another Game</span>
      </motion.button>
    </div>
  );
}
