"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Flame, Award, Clock } from "lucide-react";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";

interface PlayerFeedbackProps {
  isCorrect: boolean | null;
  pointsEarned: number;
  currentScore: number;
  streak: number;
  currentRank: number;
  totalPlayers: number;
}

export function PlayerFeedback({
  isCorrect,
  pointsEarned,
  currentScore,
  streak,
  currentRank,
  totalPlayers,
}: PlayerFeedbackProps) {
  const isWinner = isCorrect === true;
  const isTimeUp = isCorrect === null;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center p-6 text-white text-center transition-colors ${
        isWinner
          ? "bg-kahoot-green"
          : isTimeUp
          ? "bg-amber-600"
          : "bg-kahoot-red"
      }`}
    >
      {isWinner && <ConfettiEffect trigger={true} duration={2000} />}

      {/* Main Result Icon Banner */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-2xl border-4 border-white"
      >
        {isWinner ? (
          <Check className="w-16 h-16 text-white stroke-[4]" />
        ) : isTimeUp ? (
          <Clock className="w-16 h-16 text-white stroke-[3]" />
        ) : (
          <X className="w-16 h-16 text-white stroke-[4]" />
        )}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-5xl font-black tracking-tight mb-2 uppercase drop-shadow-md"
      >
        {isWinner ? "Correct!" : isTimeUp ? "Time's Up!" : "Incorrect"}
      </motion.h1>

      {/* Points Earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="text-2xl sm:text-3xl font-black text-white/90 mb-6 bg-black/20 px-6 py-2 rounded-full border border-white/20 backdrop-blur-sm"
      >
        {isWinner ? `+${pointsEarned.toLocaleString()} pts` : "+0 pts"}
      </motion.div>

      {/* Streak Fire Banner */}
      {streak > 1 && isWinner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-2 bg-amber-400 text-slate-900 px-5 py-2.5 rounded-2xl font-black text-lg mb-6 shadow-xl"
        >
          <Flame className="w-6 h-6 fill-slate-900" />
          <span>Answer Streak: {streak}! 🔥</span>
        </motion.div>
      )}

      {/* Score & Rank Stats Pill */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-xs bg-black/30 backdrop-blur-md rounded-3xl p-5 border border-white/20 flex items-center justify-around shadow-2xl"
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Rank</span>
          </div>
          <span className="text-2xl font-black">
            #{currentRank}{" "}
            <span className="text-sm font-normal text-slate-300">/ {totalPlayers}</span>
          </span>
        </div>

        <div className="w-[1px] h-10 bg-white/20" />

        <div className="flex flex-col items-center">
          <span className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
            Total Score
          </span>
          <span className="text-2xl font-black">{currentScore.toLocaleString()}</span>
        </div>
      </motion.div>

      <p className="mt-8 text-xs font-bold text-white/70 animate-pulse">
        Waiting for host to continue...
      </p>
    </div>
  );
}
