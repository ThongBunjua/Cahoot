"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Player } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
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

  const initialTop5 = initialSorted.slice(0, 5);
  const finalTop5 = finalSorted.slice(0, 5);

  // Union of candidates
  const candidateMap = new Map<string, Player>();
  initialTop5.forEach((p) => candidateMap.set(p.id, p));
  finalTop5.forEach((p) => candidateMap.set(p.id, p));
  const candidatePlayers = Array.from(candidateMap.values());

  const [scoreProgress, setScoreProgress] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const prevRanksRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    sounds.playLeaderboard();

    // 1. Score Counting Phase (0 - 1.2s)
    const scoreDurationMs = 1200;
    const intervalMs = 30;
    const scoreSteps = scoreDurationMs / intervalMs;
    let sStep = 0;

    const scoreInterval = setInterval(() => {
      sStep++;
      const p = Math.min(1, sStep / scoreSteps);
      setScoreProgress(p);

      if (sStep % 5 === 0) {
        sounds.playTick(1.0 + p * 0.3);
      }

      if (sStep >= scoreSteps) {
        clearInterval(scoreInterval);
        setScoreProgress(1);

        // 2. Physical Slot Crossing Slide Phase (1.4s - 3.2s)
        setTimeout(() => {
          setIsSliding(true);
          sounds.playClick();

          const slideDurationMs = 1800;
          const slideSteps = slideDurationMs / intervalMs;
          let slStep = 0;

          const slideInterval = setInterval(() => {
            slStep++;
            const sp = Math.min(1, slStep / slideSteps);
            setSlideProgress(sp);

            if (slStep >= slideSteps) {
              clearInterval(slideInterval);
              setSlideProgress(1);
              setIsComplete(true);
            }
          }, intervalMs);
        }, 200);
      }
    }, intervalMs);

    return () => {
      clearInterval(scoreInterval);
    };
  }, []);

  const CARD_HEIGHT_PX = 96;
  const GAP_PX = 16;
  const SLOT_STEP = CARD_HEIGHT_PX + GAP_PX; // 112px per slot
  const OFF_SCREEN_Y = 5 * SLOT_STEP + 80;

  // Smooth easing function for realistic physical motion
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const smoothSlideP = easeInOutCubic(slideProgress);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: 100% Solid 3D Widescreen */}
      {/* ========================================================================= */}
      <header className="w-full flex justify-between items-center max-w-[96vw] mx-auto pt-1 z-20">
        <div className="flex items-center gap-4 bg-[#33106B] px-8 py-4 rounded-3xl border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] shadow-xl">
          <div className="p-3 bg-[#FFA602] border-b-4 border-[#CC8400] rounded-2xl text-slate-950 shadow-sm">
            <Trophy className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFA602] block leading-none">
              Standings
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-1">
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
            className="px-10 py-4 bg-[#26890C] hover:bg-[#22790A] text-white font-black text-lg md:text-xl rounded-2xl shadow-xl flex items-center gap-3 transition-all cursor-pointer border-b-[6px] border-[#1A6107] active:border-b-[2px] active:translate-y-1"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next Question"}</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CENTER: REAL-TIME PHYSICAL SLOT CROSSING RANK RUNNER */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[96vw] mx-auto flex-1 flex flex-col justify-center my-auto py-2 z-10">
        <div
          className="relative w-full"
          style={{ height: `${5 * SLOT_STEP}px` }}
        >
          {candidatePlayers.map((player) => {
            const initialRank = initialSorted.findIndex((p) => p.id === player.id) + 1;
            const finalRank = finalSorted.findIndex((p) => p.id === player.id) + 1;

            const initialInTop5 = initialRank <= 5;
            const finalInTop5 = finalRank <= 5;
            const rankDelta = initialRank - finalRank; // Positive = Climbed up, Negative = Dropped down

            const startY = initialInTop5 ? (initialRank - 1) * SLOT_STEP : OFF_SCREEN_Y;
            const endY = finalInTop5 ? (finalRank - 1) * SLOT_STEP : OFF_SCREEN_Y;

            // Continuous physical coordinate calculation during sliding
            const currentY = isSliding
              ? startY + (endY - startY) * smoothSlideP
              : startY;

            // Continuous opacity: droppers fade away as they slide below slot 5
            const currentOpacity = isSliding
              ? (finalInTop5 ? 1 : Math.max(0, 1 - smoothSlideP * 1.5))
              : (initialInTop5 ? 1 : 0);

            // =====================================================================
            // PHYSICAL THRESHOLD RANK TICKING:
            // As the card glides past each slot boundary, the number ticks dynamically!
            // e.g. From Slot 4 (Rank 5) to Slot 0 (Rank 1):
            // Passes Slot 3 -> #4, Passes Slot 2 -> #3, Passes Slot 1 -> #2, Reaches Slot 0 -> #1!
            // =====================================================================
            let dynamicRank = initialRank;
            if (isComplete) {
              dynamicRank = finalRank;
            } else if (isSliding && finalInTop5) {
              const currentSlotIndex = currentY / SLOT_STEP;
              dynamicRank = Math.min(5, Math.max(1, Math.round(currentSlotIndex + 1)));
            } else if (!finalInTop5) {
              dynamicRank = initialRank; // Droppers keep their original rank number while fading out
            }

            // Play a tick chime when passing each rank boundary
            if (prevRanksRef.current[player.id] !== undefined && prevRanksRef.current[player.id] !== dynamicRank) {
              sounds.playTick(1.1 + (6 - dynamicRank) * 0.1);
            }
            prevRanksRef.current[player.id] = dynamicRank;

            const startScore =
              typeof player.previousScore === "number"
                ? player.previousScore
                : Math.max(0, player.score - (player.lastPoints || 0));
            const currentScore = Math.round(startScore + (player.score - startScore) * scoreProgress);
            const pointsGained = player.lastPoints || 0;

            const isClimber = isComplete && rankDelta > 0 && finalInTop5;
            const isCrossing = isSliding && !isComplete && initialRank !== finalRank && finalInTop5;

            return (
              <motion.div
                key={player.id}
                style={{
                  transform: `translateY(${currentY}px)`,
                  opacity: currentOpacity,
                  height: `${CARD_HEIGHT_PX}px`,
                }}
                className={`absolute left-0 right-0 w-full bg-white rounded-3xl px-8 md:px-10 border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-md flex items-center justify-between transition-colors duration-200 ${
                  dynamicRank === 1 && (isComplete || isSliding) && finalInTop5
                    ? "border-amber-400 border-b-[6px] border-b-amber-500 z-25 shadow-xl"
                    : isClimber
                    ? "border-emerald-400 border-b-[6px] border-b-emerald-500 z-20"
                    : isCrossing
                    ? "z-20 shadow-lg border-purple-400"
                    : "z-10"
                }`}
              >
                {/* Left Section: Energetic Bouncy 3D Rank Badge + Avatar + Nickname */}
                <div className="flex items-center gap-6 md:gap-8 min-w-0">
                  {/* Dynamic 3D Rank Badge that pulses as it crosses each rank */}
                  <motion.div
                    animate={
                      isCrossing
                        ? { scale: [1, 1.22, 1], rotate: [-4, 4, 0] }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{
                      repeat: isCrossing ? Infinity : 0,
                      duration: 0.25,
                      ease: "easeInOut",
                    }}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl shadow-sm flex-shrink-0 transition-all duration-200 tabular-nums ${
                      dynamicRank === 1
                        ? "bg-[#FFA602] border-b-4 border-[#CC8400] text-slate-950 scale-105"
                        : dynamicRank === 2
                        ? "bg-[#94A3B8] border-b-4 border-[#64748B] text-white"
                        : dynamicRank === 3
                        ? "bg-[#D97706] border-b-4 border-[#92400E] text-white"
                        : "bg-[#33106B] border-b-4 border-[#240B4D] text-white"
                    }`}
                  >
                    {dynamicRank}
                  </motion.div>

                  {/* Avatar */}
                  <div className="text-4xl md:text-5xl filter drop-shadow-sm flex-shrink-0 select-none">
                    {player.avatar}
                  </div>

                  {/* Nickname & Dynamic Indicators */}
                  <div className="min-w-0 flex items-center gap-3 md:gap-4 flex-wrap">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 truncate max-w-[200px] sm:max-w-md md:max-w-xl tracking-tight">
                      {player.nickname}
                    </h3>

                    {/* Streak Badge */}
                    {player.streak > 1 && (
                      <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-black bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-3 py-1 rounded-full flex-shrink-0">
                        <Flame className="w-4 h-4 fill-[#D97706] text-[#D97706]" />
                        <span>{player.streak} Streak</span>
                      </span>
                    )}

                    {/* Minimalist Rank Climbed Up-Arrow Only */}
                    {isComplete && rankDelta > 0 && finalInTop5 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                        className="inline-flex items-center justify-center w-8 h-8 bg-[#D1FAE5] text-[#065F46] border-2 border-[#6EE7B7] rounded-full shadow-sm flex-shrink-0"
                        title={`Climbed up ${rankDelta} spots`}
                      >
                        <ArrowUp className="w-5 h-5 stroke-[3.5] text-[#059669]" />
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Right Section: Points Gained Pill + Total Score */}
                <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
                  {/* Points Gained Pill */}
                  {pointsGained > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-black px-4 py-1.5 rounded-2xl text-base md:text-lg shadow-sm"
                    >
                      +{pointsGained.toLocaleString()}
                    </motion.div>
                  )}

                  {/* Total Score */}
                  <div className="text-right min-w-[100px] sm:min-w-[140px]">
                    <span className="text-3xl md:text-5xl font-black text-slate-900 tabular-nums tracking-tight block leading-none">
                      {currentScore.toLocaleString()}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-slate-400 block uppercase tracking-wider mt-1">
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
      <footer className="w-full text-center text-sm font-bold text-slate-200 pb-2 z-20">
        {players.length > 5 && (
          <span className="bg-[#33106B] px-6 py-2.5 rounded-full border border-[#240B4D] inline-flex items-center gap-2.5 shadow-sm text-base">
            <Users className="w-5 h-5 text-[#FFA602]" />
            <span>+ {players.length - 5} more players competing below</span>
          </span>
        )}
      </footer>
    </div>
  );
}
