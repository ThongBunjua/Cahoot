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
  ArrowDown,
  Users,
} from "lucide-react";

interface HostLeaderboardProps {
  players: Player[];
  isLastQuestion: boolean;
  onNext: () => void;
}

const CARD_HEIGHT_PX = 104; // Slot spacing: Card height (88px) + Gap (16px)

export function HostLeaderboard({ players, isLastQuestion, onNext }: HostLeaderboardProps) {
  // 1. Sort all players by score BEFORE this question
  const initialSorted = [...players].sort((a, b) => {
    const scoreA =
      typeof a.previousScore === "number" ? a.previousScore : Math.max(0, a.score - (a.lastPoints || 0));
    const scoreB =
      typeof b.previousScore === "number" ? b.previousScore : Math.max(0, b.score - (b.lastPoints || 0));
    return scoreB - scoreA;
  });

  // 2. Sort all players by score AFTER this question
  const finalSorted = [...players].sort((a, b) => b.score - a.score);

  // The actual TOP 5 players for this round
  const top5 = finalSorted.slice(0, 5);

  // Progress of score count-up (0.0 to 1.0)
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [isOvertakeTriggered, setIsOvertakeTriggered] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    sounds.playLeaderboard();

    // 1. Smooth 3.2s score counting ramp (Running at 30fps to avoid React thread throttling)
    const durationMs = 3200;
    const intervalMs = 33;
    const totalSteps = durationMs / intervalMs;
    let currentStep = 0;

    const countInterval = setInterval(() => {
      currentStep++;
      const p = Math.min(1, currentStep / totalSteps);
      // Natural smooth ease-out deceleration
      const eased = 1 - Math.pow(1 - p, 2.5);
      setAnimProgress(eased);

      if (currentStep % 5 === 0) {
        sounds.playTick(1.0 + p * 0.3);
      }

      // Halfway through score counting (at 1.2s), trigger the smooth physical overtake glide!
      if (currentStep >= Math.round(totalSteps * 0.38) && !isOvertakeTriggered) {
        setIsOvertakeTriggered(true);
        sounds.playClick();
      }

      if (currentStep >= totalSteps) {
        clearInterval(countInterval);
        setIsFinished(true);
        sounds.playClick();
      }
    }, intervalMs);

    return () => {
      clearInterval(countInterval);
    };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* ========================================================================= */}
      {/* 1. HEADER: 100% Solid 3D Flat Minimalism */}
      {/* ========================================================================= */}
      <header className="w-full flex justify-between items-center max-w-6xl mx-auto pt-1 z-20">
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
      {/* 2. MAIN CENTER: 100% MATHEMATICALLY ACCURATE 60FPS GPU OVERTAKE */}
      {/* ========================================================================= */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-auto py-4 z-10">
        <div className="relative w-full h-[530px]">
          {top5.map((player, finalIdx) => {
            const finalRank = finalIdx + 1; // 1, 2, 3, 4, 5 (Guaranteed in Top 5!)

            // Find where this player was BEFORE this question in the whole game
            const initialIndex = initialSorted.findIndex((p) => p.id === player.id);
            const initialRank = initialIndex >= 0 ? initialIndex + 1 : 6;

            // rankDelta: Positive = Climbed up (e.g. 5 -> 2 is +3), Negative = Dropped (e.g. 1 -> 3 is -2)
            const rankDelta = initialRank - finalRank;

            // Start Slot: if was in Top 5, start at that slot (0..4), else enter from slot 5 (bottom)
            const startSlot = Math.min(5, initialRank - 1);
            const finalSlot = finalIdx;

            // Active visual slot position
            const currentSlot = isOvertakeTriggered ? finalSlot : startSlot;
            const slotY = currentSlot * CARD_HEIGHT_PX;

            // Compute counting score for this player
            const startScore =
              typeof player.previousScore === "number"
                ? player.previousScore
                : Math.max(0, player.score - (player.lastPoints || 0));
            const diffScore = player.score - startScore;
            const currentScore = Math.round(startScore + diffScore * animProgress);

            const activeRankNumber = isOvertakeTriggered ? finalRank : Math.min(5, initialRank);
            const pointsGained = player.lastPoints || 0;

            const isClimber = isFinished && rankDelta > 0;
            const isDropper = isFinished && rankDelta < 0;

            return (
              <motion.div
                key={player.id}
                initial={{ y: startSlot * CARD_HEIGHT_PX, opacity: 0 }}
                animate={{
                  y: slotY,
                  opacity: 1,
                  zIndex: liveRankNumberToZIndex(activeRankNumber, isClimber),
                }}
                transition={{
                  y: { type: "spring", stiffness: 70, damping: 14, mass: 1 },
                }}
                className={`absolute left-0 right-0 top-0 h-[88px] bg-white rounded-2xl px-6 md:px-8 border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-md flex items-center justify-between transition-all will-change-transform ${
                  activeRankNumber === 1
                    ? "border-amber-400 border-b-[6px] border-b-amber-500"
                    : isClimber
                    ? "border-emerald-400 border-b-[6px] border-b-emerald-500"
                    : isDropper
                    ? "border-rose-300 border-b-[6px] border-b-rose-400"
                    : ""
                }`}
              >
                {/* Left Section: 54px Solid Rank Badge + Avatar + Nickname */}
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  {/* Solid 3D Rank Badge */}
                  <div
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
                  </div>

                  {/* Avatar */}
                  <div className="text-3xl md:text-4xl filter drop-shadow-sm flex-shrink-0 select-none">
                    {player.avatar}
                  </div>

                  {/* Nickname & Dynamic Indicators */}
                  <div className="min-w-0 flex items-center gap-2.5 md:gap-3 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate max-w-[140px] sm:max-w-xs md:max-w-sm tracking-tight">
                      {player.nickname}
                    </h3>

                    {/* Streak Badge: Solid Amber */}
                    {player.streak > 1 && (
                      <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-black bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-0.5 rounded-full flex-shrink-0">
                        <Flame className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                        <span>{player.streak} Streak</span>
                      </span>
                    )}

                    {/* Rank Climbed Badge (Solid Green ▲ +N) */}
                    {isFinished && rankDelta > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7] font-black px-2.5 py-0.5 rounded-full text-xs shadow-sm flex-shrink-0"
                      >
                        <ArrowUp className="w-3.5 h-3.5 stroke-[3] text-[#059669]" />
                        <span>+{rankDelta}</span>
                      </motion.span>
                    )}

                    {/* Rank Dropped Badge (Solid Red ▼ -N) */}
                    {isFinished && rankDelta < 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] font-black px-2.5 py-0.5 rounded-full text-xs shadow-sm flex-shrink-0"
                      >
                        <ArrowDown className="w-3.5 h-3.5 stroke-[3] text-[#DC2626]" />
                        <span>{rankDelta}</span>
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Right Section: Solid Points Gained Pill + Total Score */}
                <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
                  {/* Points Gained Pill */}
                  {pointsGained > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-black px-3 py-1 rounded-xl text-sm md:text-base shadow-sm"
                    >
                      +{pointsGained.toLocaleString()}
                    </motion.div>
                  )}

                  {/* Total Score: Counts up smoothly */}
                  <div className="text-right min-w-[85px] sm:min-w-[105px]">
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
        </div>
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

function liveRankNumberToZIndex(rank: number, isClimber: boolean): number {
  if (isClimber) return 35;
  if (rank === 1) return 30;
  if (rank === 2) return 25;
  if (rank === 3) return 20;
  return 15;
}
