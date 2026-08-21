"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Flame, Award, Clock, Sparkles } from "lucide-react";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";

interface PlayerFeedbackProps {
  isCorrect: boolean | null;
  pointsEarned?: number;
  currentScore?: number;
  streak?: number;
  currentRank?: number;
  totalPlayers?: number;
}

export function PlayerFeedback({
  isCorrect,
  pointsEarned = 0,
  currentScore = 0,
  streak = 0,
  currentRank = 1,
  totalPlayers = 1,
}: PlayerFeedbackProps) {
  const isWinner = isCorrect === true;
  const isTimeUp = isCorrect === null;
  const safePoints = typeof pointsEarned === "number" ? pointsEarned : 0;
  const safeScore = typeof currentScore === "number" ? currentScore : 0;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-between p-6 text-white text-center select-none overflow-hidden transition-colors ${
        isWinner
          ? "bg-gradient-to-b from-[#1db954] via-[#15803d] to-[#0e5c29]"
          : isTimeUp
          ? "bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#92400e]"
          : "bg-gradient-to-b from-[#e11d48] via-[#be123c] to-[#881337]"
      }`}
    >
      {isWinner && <ConfettiEffect trigger={true} duration={2500} />}

      {/* Top Banner */}
      <div className="pt-4">
        <span className="text-xs font-black uppercase tracking-widest bg-black/25 text-white/90 px-4 py-1.5 rounded-full border border-white/20">
          Round Finished
        </span>
      </div>

      {/* Center Stage: Huge Icon + Status Title + Points */}
      <div className="my-auto flex flex-col items-center">
        {/* Animated Badge Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 16 }}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-4 border-white ring-8 ring-white/20"
        >
          {isWinner ? (
            <Check className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[4]" />
          ) : isTimeUp ? (
            <Clock className="w-14 h-14 sm:w-16 sm:h-16 text-white stroke-[3]" />
          ) : (
            <X className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[4]" />
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black tracking-tight mb-2 drop-shadow-lg"
        >
          {isWinner ? "Correct!" : isTimeUp ? "Time's Up!" : "Incorrect"}
        </motion.h1>

        {/* Points Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="text-2xl sm:text-3xl font-black text-white mb-4 bg-black/30 px-6 py-2 rounded-full border border-white/25 backdrop-blur-sm shadow-xl flex items-center gap-1.5"
        >
          <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          <span>{isWinner ? `+${safePoints.toLocaleString()} pts` : "+0 pts"}</span>
        </motion.div>

        {/* Streak Badge */}
        {streak > 1 && isWinner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 px-5 py-2 rounded-2xl font-black text-base shadow-2xl border-2 border-white/60"
          >
            <Flame className="w-5 h-5 fill-red-600 text-red-600 animate-bounce" />
            <span>Answer Streak: {streak}! 🔥</span>
          </motion.div>
        )}
      </div>

      {/* Bottom Floating Stats Pill */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-xs bg-black/35 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/20 flex items-center justify-around shadow-2xl pb-4 mb-2"
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-0.5">
            <Award className="w-3.5 h-3.5 text-yellow-300" />
            <span>Rank</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black">
            #{currentRank}{" "}
            <span className="text-xs font-bold text-slate-300">/ {totalPlayers}</span>
          </span>
        </div>

        <div className="w-[1px] h-10 bg-white/20" />

        <div className="flex flex-col items-center">
          <span className="text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-0.5">
            Total Score
          </span>
          <span className="text-2xl sm:text-3xl font-black">{safeScore.toLocaleString()}</span>
        </div>
      </motion.div>
    </div>
  );
}
