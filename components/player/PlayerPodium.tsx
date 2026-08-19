"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Sparkles, RotateCcw } from "lucide-react";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";

interface PlayerPodiumProps {
  rank: number;
  score: number;
  onPlayAgain: () => void;
}

export function PlayerPodium({ rank, score, onPlayAgain }: PlayerPodiumProps) {
  const isTop3 = rank <= 3;
  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🎖️";

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-sm w-full p-6 text-white">
      {isTop3 && <ConfettiEffect trigger={true} duration={4000} />}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="w-32 h-32 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 text-slate-950 flex items-center justify-center text-6xl shadow-2xl mb-6 relative"
      >
        <span>{rankEmoji}</span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 rounded-full border-2 border-dashed border-white/50"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-black tracking-tight mb-2"
      >
        {rank === 1
          ? "Victory! 1st Place! 👑"
          : rank <= 3
          ? `Podium Finish! ${rank} Place!`
          : `Well Played! Rank #${rank}`}
      </motion.h1>

      <p className="text-slate-300 text-sm font-bold mb-6">
        Game complete! Thank you for playing.
      </p>

      <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 mb-8 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-sm font-bold text-slate-300">Final Rank</span>
          <span className="text-2xl font-black text-yellow-300">#{rank}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-300">Total Points</span>
          <span className="text-2xl font-black text-white">{score.toLocaleString()}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onPlayAgain}
        className="w-full py-4 px-6 bg-kahoot-purple hover:bg-kahoot-purple-light text-white text-lg font-black rounded-2xl shadow-3d-purple transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        <span>Join Another Game</span>
      </motion.button>
    </div>
  );
}
