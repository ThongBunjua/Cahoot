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

  // Active display list: starts as initialSorted, then smoothly transitions to finalSorted
  const displayList = isOvertakeAnimated ? finalSorted : initialSorted;
  const top5 = displayList.slice(0, 5);

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

    // Step 1: Score count-up over 1.3 seconds
    const countTimer = setTimeout(() => {
      const duration = 1300;
      const steps = 30;
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
          // Step 2: Trigger Position Swap / Overtake Layout Animation right after score finishes counting!
          setTimeout(() => {
            setIsOvertakeAnimated(true);
            sounds.playClick();
          }, 300);
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

      {/* 2. Main Center Area: Large 3D Solid Cards with Smooth Physical Layout Overtake Animation */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-auto py-6 z-10">
        <motion.div layout className="w-full flex flex-col gap-4">
          {top5.map((player, currentIdx) => {
            const finalRank = finalSorted.findIndex((p) => p.id === player.id) + 1;
            const prevRank =
              typeof player.previousRank === "number"
                ? player.previousRank
                : initialSorted.findIndex((p) => p.id === player.id) + 1;
            const rankDelta = prevRank - finalRank; // Positive = Climbed up!

            const activeRank = isOvertakeAnimated ? finalRank : prevRank;
            const currentScoreVal = displayScores[player.id] ?? player.score;
            const pointsGained = player.lastPoints || 0;

            return (
              <motion.div
                layout
                layoutId={player.id}
                key={player.id}
                transition={{
                  layout: { type: "spring", stiffness: 220, damping: 20 },
                  duration: 0.8,
                }}
                className={`bg-white rounded-2xl py-5 px-8 border border-slate-200 border-b-[6px] border-b-slate-200 shadow-lg flex items-center justify-between transition-all ${
                  isOvertakeAnimated && rankDelta > 0 ? "ring-4 ring-emerald-400 shadow-emerald-400/30" : ""
                }`}
              >
                {/* Left Section: 56px Rank Badge + 4xl Avatar + 2xl Nickname + Indicators */}
                <div className="flex items-center gap-5 sm:gap-6 min-w-0">
                  {/* Rank Badge: w-14 h-14 text-2xl font-black rounded-2xl */}
                  <motion.div
                    layout
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0 transition-colors duration-300 ${
                      activeRank === 1
                        ? "bg-amber-400 border-b-4 border-amber-600 text-white"
                        : activeRank === 2
                        ? "bg-slate-400 border-b-4 border-slate-600 text-white"
                        : activeRank === 3
                        ? "bg-amber-700 border-b-4 border-amber-900 text-white"
                        : "bg-indigo-900 border-b-4 border-indigo-950 text-white"
                    }`}
                  >
                    {activeRank}
                  </motion.div>

                  {/* Avatar: text-4xl */}
                  <div className="text-4xl filter drop-shadow-sm flex-shrink-0 select-none">
                    {player.avatar}
                  </div>

                  {/* Nickname & Status Badges */}
                  <div className="min-w-0 flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-black text-slate-900 truncate max-w-[160px] sm:max-w-xs md:max-w-sm tracking-tight">
                      {player.nickname}
                    </h3>

                    {/* Streak Badge */}
                    {player.streak > 1 && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full flex-shrink-0">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{player.streak} Streak</span>
                      </span>
                    )}

                    {/* Rank Jump Badge: bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full text-sm */}
                    {isOvertakeAnimated && rankDelta > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full text-sm shadow-sm flex-shrink-0"
                      >
                        <ArrowUp className="w-4 h-4 stroke-[3] text-emerald-700" />
                        <span>+{rankDelta}</span>
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Right Section: Light Blue Points Gained Pill + Large Slate-900 Score */}
                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                  {/* Points Gained: bg-blue-50 text-blue-600 border border-blue-200 font-extrabold px-3 py-1.5 rounded-xl text-base */}
                  {pointsGained > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-blue-50 text-blue-600 border border-blue-200 font-extrabold px-3 py-1.5 rounded-xl text-base shadow-sm"
                    >
                      +{pointsGained.toLocaleString()}
                    </motion.div>
                  )}

                  {/* Total Score: text-3xl md:text-4xl font-black text-slate-900 */}
                  <div className="text-right min-w-[90px] sm:min-w-[110px]">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 tabular-nums tracking-tight block leading-none">
                      {currentScoreVal.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mt-1.5">
                      pts
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
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
