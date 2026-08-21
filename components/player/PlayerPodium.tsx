"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, Tv, Sparkles } from "lucide-react";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";

interface PlayerPodiumProps {
  score?: number;
  nickname?: string;
  avatar?: string;
  onPlayAgain: () => void;
}

export function PlayerPodium({ score = 0, nickname, avatar, onPlayAgain }: PlayerPodiumProps) {
  const safeScore = typeof score === "number" ? score : 0;

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-sm w-full p-4 sm:p-6 text-white font-sans select-none">
      <ConfettiEffect trigger={true} duration={3500} />

      {/* Refined Minimalist Trophy Spotlight Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#FFA602] to-[#FFD000] text-slate-950 flex items-center justify-center shadow-2xl mb-4 relative border-4 border-yellow-200"
      >
        <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-slate-950 stroke-[2.5]" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-black tracking-tight mb-2"
      >
        Game Finished
      </motion.h1>

      {/* Clean Callout: Watch Main Screen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white/10 text-yellow-300 font-bold px-4 py-2 rounded-2xl border border-yellow-400/30 flex items-center gap-2 mb-6 shadow-md"
      >
        <Tv className="w-4 h-4 text-yellow-400 flex-shrink-0 animate-pulse" />
        <span className="text-xs sm:text-sm font-black tracking-wide">
          Final standings are on the main host screen
        </span>
      </motion.div>

      {/* Minimalist Player Stat Card */}
      <div className="w-full bg-[#33106B] rounded-3xl p-5 sm:p-6 border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] mb-6 shadow-2xl flex flex-col gap-4">
        {/* Avatar & Nickname */}
        <div className="flex items-center justify-center gap-3 pb-3 border-b border-white/10">
          <span className="text-3xl sm:text-4xl filter drop-shadow-sm select-none">{avatar || "🦊"}</span>
          <span className="text-xl sm:text-2xl font-black text-white truncate max-w-[200px] tracking-tight">
            {nickname || "Player"}
          </span>
        </div>

        {/* Total Points */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-black text-slate-300 uppercase tracking-wider">
            Total Points
          </span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-400 tabular-nums">
            {safeScore.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Play Another Game Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onPlayAgain}
        className="w-full py-3.5 sm:py-4 px-6 bg-[#26890C] hover:bg-[#22790A] text-white text-base font-black rounded-2xl border-b-[6px] border-[#165406] active:border-b-[2px] active:translate-y-1 shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4 stroke-[3]" />
        <span>Play Another Game</span>
      </motion.button>
    </div>
  );
}
