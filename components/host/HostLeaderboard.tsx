"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // 1. Initial list sorted by previous score
  const initialSorted = [...players].sort((a, b) => {
    const scoreA = typeof a.previousScore === "number" ? a.previousScore : a.score - (a.lastPoints || 0);
    const scoreB = typeof b.previousScore === "number" ? b.previousScore : b.score - (b.lastPoints || 0);
    return scoreB - scoreA;
  });

  // 2. Final list sorted by current score
  const finalSorted = [...players].sort((a, b) => b.score - a.score);

  // Active display list (animates and flips to finalSorted after score count-up)
  const activeList = isOvertakeAnimated ? finalSorted : initialSorted;
  const top5 = activeList.slice(0, 5);

  useEffect(() => {
    sounds.playLeaderboard();

    // Initialize running display scores
    const initialScoresMap: { [id: string]: number } = {};
    players.forEach((p) => {
      initialScoresMap[p.id] =
        typeof p.previousScore === "number"
          ? p.previousScore
          : Math.max(0, p.score - (p.lastPoints || 0));
    });
    setDisplayScores(initialScoresMap);

    // Score count-up timer
    const countTimer = setTimeout(() => {
      const duration = 1100;
      const steps = 28;
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
          // Trigger position overtake layout animation
          setTimeout(() => {
            setIsOvertakeAnimated(true);
            sounds.playClick();
          }, 250);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, 300);

    return () => {
      clearTimeout(countTimer);
    };
  }, [players]);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans relative">
      {/* Top Header */}
      <header className="flex items-center justify-between gap-4 max-w-4xl mx-auto w-full pt-1">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-md">
          <div className="p-2 bg-yellow-400 rounded-xl text-slate-950 shadow-sm">
            <Trophy className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-300 block leading-none">
              Standings
            </span>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">
              Leaderboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <AudioControl />

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNext}
            className="px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next Question"}</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* Main Center Area: Minimal Solid White Cards (Authentic Kahoot Style) */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full my-auto px-2 py-4">
        <motion.div layout className="w-full flex flex-col gap-3 sm:gap-3.5">
          <AnimatePresence mode="popLayout">
            {top5.map((player, currentIdx) => {
              const finalRank = finalSorted.findIndex((p) => p.id === player.id) + 1;
              const prevRank = player.previousRank || currentIdx + 1;
              const rankDelta = prevRank - finalRank; // Positive = Climbed up!

              const isRank1 = isOvertakeAnimated ? finalRank === 1 : currentIdx === 0;
              const isRank2 = isOvertakeAnimated ? finalRank === 2 : currentIdx === 1;
              const isRank3 = isOvertakeAnimated ? finalRank === 3 : currentIdx === 2;
              const currentScoreVal = displayScores[player.id] ?? player.score;
              const pointsGained = player.lastPoints || 0;

              return (
                <motion.div
                  layout
                  key={player.id}
                  transition={{
                    layout: { type: "spring", stiffness: 320, damping: 24 },
                    duration: 0.5,
                  }}
                  className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-slate-200 border-b-[5px] border-b-slate-300 shadow-[0_8px_20px_rgba(0,0,0,0.18)] flex items-center justify-between transition-all"
                >
                  {/* Left Section: Solid Badge + Avatar + Nickname + Indicators */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Solid Rank Badge with 3D button styling */}
                    <div
                      className={`w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-lg shadow-sm flex-shrink-0 ${
                        isRank1
                          ? "bg-[#FFA602] border-b-4 border-[#CC8400] text-slate-950"
                          : isRank2
                          ? "bg-[#E2E8F0] border-b-4 border-[#94A3B8] text-slate-900"
                          : isRank3
                          ? "bg-[#D97706] border-b-4 border-[#92400E] text-white"
                          : "bg-[#F1F5F9] border-b-4 border-[#CBD5E1] text-slate-700"
                      }`}
                    >
                      {isOvertakeAnimated ? finalRank : currentIdx + 1}
                    </div>

                    {/* Avatar */}
                    <div className="text-2xl sm:text-3xl filter drop-shadow-sm flex-shrink-0">
                      {player.avatar}
                    </div>

                    {/* Nickname and Status Badges */}
                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-xl font-black text-slate-900 truncate max-w-[140px] sm:max-w-xs">
                        {player.nickname}
                      </h3>

                      {/* Streak Pill */}
                      {player.streak > 1 && (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex-shrink-0">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{player.streak} Streak</span>
                        </span>
                      )}

                      {/* Rank Jump Badge */}
                      {isOvertakeAnimated && rankDelta > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full shadow-sm flex-shrink-0"
                        >
                          <ArrowUp className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                          <span>+{rankDelta}</span>
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Solid Points Gained Pill + Final Score */}
                  <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
                    {pointsGained > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 border border-emerald-300 text-emerald-700 font-black text-xs sm:text-sm px-2.5 sm:px-3 py-1 rounded-xl shadow-sm"
                      >
                        +{pointsGained.toLocaleString()}
                      </motion.div>
                    )}

                    <div className="text-right min-w-[75px] sm:min-w-[90px]">
                      <span className="text-xl sm:text-3xl font-black text-[#46178F] tabular-nums tracking-tight block leading-none">
                        {currentScoreVal.toLocaleString()}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 block uppercase tracking-wider mt-1">
                        pts
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer Player Count Pill */}
      <footer className="text-center text-xs font-bold text-slate-200 pb-1">
        {players.length > 5 && (
          <span className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5 shadow-sm">
            <Users className="w-3.5 h-3.5 text-yellow-300" />
            <span>+ {players.length - 5} more players competing below</span>
          </span>
        )}
      </footer>
    </div>
  );
}
