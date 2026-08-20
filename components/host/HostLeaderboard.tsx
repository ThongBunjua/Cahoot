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

const CARD_HEIGHT_PX = 102; // Card height (86px) + Gap (16px)

export function HostLeaderboard({ players, isLastQuestion, onNext }: HostLeaderboardProps) {
  const [isOvertakeAnimated, setIsOvertakeAnimated] = useState(false);
  const [displayScores, setDisplayScores] = useState<{ [id: string]: number }>({});

  // 1. Initial list sorted by previous score BEFORE this question
  const initialSorted = [...players].sort((a, b) => {
    const scoreA =
      typeof a.previousScore === "number" ? a.previousScore : Math.max(0, a.score - (a.lastPoints || 0));
    const scoreB =
      typeof b.previousScore === "number" ? b.previousScore : Math.max(0, b.score - (b.lastPoints || 0));
    return scoreB - scoreA;
  });

  // 2. Final list sorted by current score AFTER this question
  const finalSorted = [...players].sort((a, b) => b.score - a.score);

  // Take the combined Top 5 players (ensures stable unique player set)
  const topPlayerIds = Array.from(
    new Set([
      ...initialSorted.slice(0, 5).map((p) => p.id),
      ...finalSorted.slice(0, 5).map((p) => p.id),
    ])
  ).slice(0, 5);

  const topPlayers = topPlayerIds
    .map((id) => finalSorted.find((p) => p.id === id) || initialSorted.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  useEffect(() => {
    sounds.playLeaderboard();

    // Initialize running display scores to starting score
    const initialScoresMap: { [id: string]: number } = {};
    players.forEach((p) => {
      initialScoresMap[p.id] =
        typeof p.previousScore === "number"
          ? p.previousScore
          : Math.max(0, p.score - (p.lastPoints || 0));
    });
    setDisplayScores(initialScoresMap);

    // Step 1: Score count-up over 1.2 seconds
    const countTimer = setTimeout(() => {
      const duration = 1200;
      const steps = 24; // 24 smooth steps
      const stepDuration = duration / steps;
      let stepCount = 0;

      const interval = setInterval(() => {
        stepCount++;
        setDisplayScores((prev) => {
          const updated = { ...prev };
          players.forEach((p) => {
            const start =
              typeof p.previousScore === "number"
                ? p.previousScore
                : Math.max(0, p.score - (p.lastPoints || 0));
            const target = p.score;
            const diff = target - start;
            if (stepCount >= steps) {
              updated[p.id] = target;
            } else {
              updated[p.id] = Math.round(start + (diff * stepCount) / steps);
            }
          });
          return updated;
        });

        if (stepCount % 4 === 0) {
          sounds.playTick(1.0 + (stepCount / steps) * 0.4);
        }

        if (stepCount >= steps) {
          clearInterval(interval);
          // Step 2: 0.5s pause so everyone looks at their scores, THEN perform the dramatic 1.6s physical slide swap!
          setTimeout(() => {
            setIsOvertakeAnimated(true);
            sounds.playClick();
          }, 500);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, 400);

    return () => {
      clearTimeout(countTimer);
    };
  }, [players]);

  return (
    <div className="min-h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* 1. Header: Wide Max-w-6xl for Full Desktop Balance */}
      <header className="w-full flex justify-between items-center max-w-6xl mx-auto pt-1 z-20">
        <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-md">
          <div className="p-2.5 bg-amber-400 rounded-xl text-slate-950 shadow-sm">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-yellow-300 block leading-none">
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
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNext}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base md:text-lg rounded-2xl shadow-xl flex items-center gap-2.5 transition-all cursor-pointer border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next Question"}</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* 2. Main Center Area: GPU-Accelerated Absolute Physical Slot Translation (Zero-Lag 60FPS Overtake) */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-auto py-4 z-10">
        <div className="relative w-full h-[520px]">
          {topPlayers.map((player) => {
            const initialRank = initialSorted.findIndex((p) => p.id === player.id) + 1;
            const finalRank = finalSorted.findIndex((p) => p.id === player.id) + 1;
            const prevRank = typeof player.previousRank === "number" ? player.previousRank : initialRank;
            const rankDelta = prevRank - finalRank; // Positive = Climbed up, Negative = Dropped down!

            // Initial slot vs Final slot (0-indexed)
            const startSlot = Math.max(0, (initialRank > 0 ? initialRank : 5) - 1);
            const endSlot = Math.max(0, (finalRank > 0 ? finalRank : 5) - 1);
            const currentSlot = isOvertakeAnimated ? endSlot : startSlot;

            const slotY = currentSlot * CARD_HEIGHT_PX;
            const activeRankNumber = isOvertakeAnimated ? finalRank : prevRank;
            const currentScoreVal = displayScores[player.id] ?? player.score;
            const pointsGained = player.lastPoints || 0;

            const isClimber = isOvertakeAnimated && rankDelta > 0;
            const isDropper = isOvertakeAnimated && rankDelta < 0;

            return (
              <motion.div
                key={player.id}
                initial={{ y: startSlot * CARD_HEIGHT_PX, opacity: 0 }}
                animate={{
                  y: slotY,
                  opacity: 1,
                  scale: isClimber ? 1.025 : 1,
                  zIndex: isClimber ? 30 : isDropper ? 10 : 20,
                }}
                transition={{
                  y: { type: "spring", stiffness: 75, damping: 14, mass: 1 },
                  scale: { duration: 0.4 },
                }}
                className={`absolute left-0 right-0 top-0 h-[88px] bg-white rounded-2xl px-6 md:px-8 border border-slate-200 border-b-[6px] border-b-slate-200 shadow-xl flex items-center justify-between transition-shadow duration-500 will-change-transform ${
                  isClimber
                    ? "ring-4 ring-emerald-400 shadow-[0_15px_35px_rgba(16,185,129,0.35)]"
                    : isDropper
                    ? "ring-4 ring-red-400 shadow-[0_10px_25px_rgba(239,68,68,0.25)]"
                    : ""
                }`}
              >
                {/* Left Section: 54px Rank Badge + 4xl Avatar + 2xl Nickname + Indicators */}
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  {/* Rank Badge: w-13 h-13 text-2xl font-black rounded-2xl */}
                  <div
                    className={`w-13 h-13 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0 transition-colors duration-500 ${
                      activeRankNumber === 1
                        ? "bg-amber-400 border-b-4 border-amber-600 text-white"
                        : activeRankNumber === 2
                        ? "bg-slate-400 border-b-4 border-slate-600 text-white"
                        : activeRankNumber === 3
                        ? "bg-amber-700 border-b-4 border-amber-900 text-white"
                        : "bg-indigo-900 border-b-4 border-indigo-950 text-white"
                    }`}
                  >
                    {activeRankNumber}
                  </div>

                  {/* Avatar: text-4xl */}
                  <div className="text-3xl md:text-4xl filter drop-shadow-sm flex-shrink-0 select-none">
                    {player.avatar}
                  </div>

                  {/* Nickname & Status Badges */}
                  <div className="min-w-0 flex items-center gap-2.5 md:gap-3 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate max-w-[140px] sm:max-w-xs md:max-w-sm tracking-tight">
                      {player.nickname}
                    </h3>

                    {/* Streak Badge */}
                    {player.streak > 1 && (
                      <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex-shrink-0">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{player.streak} Streak</span>
                      </span>
                    )}

                    {/* Rank Climbed Badge (Green ▲) */}
                    {isOvertakeAnimated && rankDelta > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 350 }}
                        className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black px-2.5 py-0.5 rounded-full text-xs shadow-sm flex-shrink-0 animate-pulse"
                      >
                        <ArrowUp className="w-3.5 h-3.5 stroke-[3] text-emerald-700" />
                        <span>+{rankDelta}</span>
                      </motion.span>
                    )}

                    {/* Rank Dropped Badge (Red ▼) */}
                    {isOvertakeAnimated && rankDelta < 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 350 }}
                        className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-300 font-black px-2.5 py-0.5 rounded-full text-xs shadow-sm flex-shrink-0"
                      >
                        <ArrowDown className="w-3.5 h-3.5 stroke-[3] text-red-700" />
                        <span>{rankDelta}</span>
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Right Section: Light Blue Points Gained Pill + Large Slate-900 Score */}
                <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
                  {/* Points Gained Pill */}
                  {pointsGained > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-blue-50 text-blue-600 border border-blue-200 font-extrabold px-3 py-1 rounded-xl text-sm md:text-base shadow-sm"
                    >
                      +{pointsGained.toLocaleString()}
                    </motion.div>
                  )}

                  {/* Total Score */}
                  <div className="text-right min-w-[85px] sm:min-w-[105px]">
                    <span className="text-2xl md:text-4xl font-black text-slate-900 tabular-nums tracking-tight block leading-none">
                      {currentScoreVal.toLocaleString()}
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

      {/* 3. Footer: Clean Player Count Indicator */}
      <footer className="w-full text-center text-xs font-bold text-slate-200 pb-2 z-20">
        {players.length > 5 && (
          <span className="bg-white/10 px-5 py-2 rounded-full border border-white/20 inline-flex items-center gap-2 shadow-sm text-sm">
            <Users className="w-4 h-4 text-yellow-300" />
            <span>+ {players.length - 5} more players competing below</span>
          </span>
        )}
      </footer>
    </div>
  );
}
