"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Player } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { sounds } from "@/lib/audio/soundManager";
import {
  Trophy,
  Flame,
  ArrowRight,
  ArrowUp,
  Users,
} from "lucide-react";

interface HostLeaderboardProps {
  players: Player[];
  isLastQuestion: boolean;
  onNext: () => void;
}

export function HostLeaderboard({ players, isLastQuestion, onNext }: HostLeaderboardProps) {
  // 1. Initial sorted list by score BEFORE this question
  const initialSorted = [...players].sort((a, b) => {
    const scoreA =
      typeof a.previousScore === "number" ? a.previousScore : Math.max(0, a.score - (a.lastPoints || 0));
    const scoreB =
      typeof b.previousScore === "number" ? b.previousScore : Math.max(0, b.score - (b.lastPoints || 0));
    return scoreB - scoreA;
  });

  // 2. Final sorted list by score AFTER this question
  const finalSorted = [...players].sort((a, b) => b.score - a.score);

  // The actual 5 players in the final Top 5
  const top5 = finalSorted.slice(0, 5);

  // Top 5 players sorted in their INITIAL order
  const initialTop5 = [...top5].sort((a, b) => {
    const scoreA =
      typeof a.previousScore === "number" ? a.previousScore : Math.max(0, a.score - (a.lastPoints || 0));
    const scoreB =
      typeof b.previousScore === "number" ? b.previousScore : Math.max(0, b.score - (b.lastPoints || 0));
    return scoreB - scoreA;
  });

  const [isSwapped, setIsSwapped] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  // The list currently displayed: starts as initialTop5, then switches to top5 for simple layout swap
  const displayList = isSwapped ? top5 : initialTop5;

  useEffect(() => {
    sounds.playLeaderboard();

    // Smooth 1.4s score counting ramp
    const durationMs = 1400;
    const intervalMs = 35;
    const totalSteps = durationMs / intervalMs;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const p = Math.min(1, step / totalSteps);
      setAnimProgress(p);

      if (step % 4 === 0) {
        sounds.playTick(1.0 + p * 0.3);
      }

      if (step >= totalSteps) {
        clearInterval(interval);
        // Trigger layout position swap right after score count-up
        setTimeout(() => {
          setIsSwapped(true);
          sounds.playClick();
        }, 250);
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: 100% Solid 3D (Standings & Next Question) */}
      {/* ========================================================================= */}
      <header className="w-full flex justify-between items-center max-w-7xl mx-auto pt-1 z-20">
        <div className="flex items-center gap-3.5 bg-[#33106B] px-6 py-3 rounded-2xl border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-md">
          <div className="p-2.5 bg-[#FFA602] border-b-2 border-[#CC8400] rounded-xl text-slate-950 shadow-sm">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FFA602] block leading-none">
              Standings
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight mt-0.5">
              Leaderboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <AudioControl />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="px-8 py-3.5 bg-[#26890C] hover:bg-[#22790A] text-white font-black text-base md:text-lg rounded-2xl shadow-lg flex items-center gap-2.5 transition-all cursor-pointer border-b-[6px] border-[#1A6107] active:border-b-[2px] active:translate-y-1"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next Question"}</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CENTER: FULL-SCREEN WIDE RESPONSIVE 3D CARDS (Max-w-6xl) */}
      {/* ========================================================================= */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center my-auto py-2 z-10">
        <motion.div layout className="w-full flex flex-col gap-3.5 md:gap-4">
          {displayList.map((player) => {
            const finalRank = finalSorted.findIndex((p) => p.id === player.id) + 1;
            const initialRank = initialSorted.findIndex((p) => p.id === player.id) + 1;
            const initialSlotRank = initialTop5.findIndex((p) => p.id === player.id) + 1;

            const activeRankNumber = isSwapped ? finalRank : initialSlotRank;
            const rankDelta = initialRank - finalRank; // Positive = Climbed up!

            const startScore =
              typeof player.previousScore === "number"
                ? player.previousScore
                : Math.max(0, player.score - (player.lastPoints || 0));
            const currentScore = Math.round(startScore + (player.score - startScore) * animProgress);
            const pointsGained = player.lastPoints || 0;

            const isClimber = isSwapped && rankDelta > 0;

            return (
              <motion.div
                layout
                key={player.id}
                transition={{
                  layout: { type: "spring", stiffness: 120, damping: 18 },
                }}
                className={`w-full h-[90px] md:h-[96px] bg-white rounded-2xl px-6 md:px-8 border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-md flex items-center justify-between transition-all ${
                  activeRankNumber === 1
                    ? "border-amber-400 border-b-[6px] border-b-amber-500"
                    : isClimber
                    ? "border-emerald-400 border-b-[6px] border-b-emerald-500"
                    : ""
                }`}
              >
                {/* Left Section: 56px Rank Badge + 4xl Avatar + 2xl Nickname */}
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  {/* Solid 3D Rank Badge */}
                  <motion.div
                    layout
                    className={`w-13 h-13 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0 transition-colors duration-300 ${
                      activeRankNumber === 1
                        ? "bg-[#FFA602] border-b-4 border-[#CC8400] text-slate-950"
                        : activeRankNumber === 2
                        ? "bg-[#94A3B8] border-b-4 border-[#64748B] text-white"
                        : activeRankNumber === 3
                        ? "bg-[#D97706] border-b-4 border-[#92400E] text-white"
                        : "bg-[#33106B] border-b-4 border-[#240B4D] text-white"
                    }`}
                  >
                    {activeRankNumber}
                  </motion.div>

                  {/* Avatar */}
                  <div className="text-3xl md:text-4xl filter drop-shadow-sm flex-shrink-0 select-none">
                    {player.avatar}
                  </div>

                  {/* Nickname & Dynamic Indicators */}
                  <div className="min-w-0 flex items-center gap-2.5 md:gap-3 flex-wrap">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 truncate max-w-[160px] sm:max-w-xs md:max-w-md tracking-tight">
                      {player.nickname}
                    </h3>

                    {/* Streak Badge: Solid Amber */}
                    {player.streak > 1 && (
                      <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-black bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-0.5 rounded-full flex-shrink-0">
                        <Flame className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                        <span>{player.streak} Streak</span>
                      </span>
                    )}

                    {/* Minimalist Rank Climbed Up-Arrow Only (No Number, No Down Arrow) */}
                    {isSwapped && rankDelta > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-7 h-7 bg-[#D1FAE5] text-[#065F46] border-2 border-[#6EE7B7] rounded-full shadow-sm flex-shrink-0"
                        title={`Climbed up ${rankDelta} spots`}
                      >
                        <ArrowUp className="w-4 h-4 stroke-[3.5] text-[#059669]" />
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Right Section: Points Gained Pill + Total Score */}
                <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                  {/* Points Gained Pill */}
                  {pointsGained > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-black px-3.5 py-1 rounded-xl text-sm md:text-base shadow-sm"
                    >
                      +{pointsGained.toLocaleString()}
                    </motion.div>
                  )}

                  {/* Total Score */}
                  <div className="text-right min-w-[90px] sm:min-w-[120px]">
                    <span className="text-2xl md:text-4xl font-black text-slate-900 tabular-nums tracking-tight block leading-none">
                      {currentScore.toLocaleString()}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 block uppercase tracking-wider mt-1">
                      pts
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      {/* ========================================================================= */}
      {/* 3. FOOTER: Solid Player Count Indicator */}
      {/* ========================================================================= */}
      <footer className="w-full text-center text-xs font-bold text-slate-200 pb-2 z-20">
        {players.length > 5 && (
          <span className="bg-[#33106B] px-5 py-2 rounded-full border border-[#240B4D] inline-flex items-center gap-2 shadow-sm text-sm">
            <Users className="w-4 h-4 text-[#FFA602]" />
            <span>+ {players.length - 5} more players competing below</span>
          </span>
        )}
      </footer>
    </div>
  );
}
