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
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Target,
} from "lucide-react";

interface HostLeaderboardProps {
  players: Player[];
  isLastQuestion: boolean;
  onNext: () => void;
}

export function HostLeaderboard({ players, isLastQuestion, onNext }: HostLeaderboardProps) {
  // Sort players initially by previous score, then trigger overtake animation
  const [isOvertakeAnimated, setIsOvertakeAnimated] = useState(false);
  const [displayScores, setDisplayScores] = useState<{ [id: string]: number }>({});

  // 1. Initial sorted list by previous score
  const initialSorted = [...players].sort((a, b) => {
    const scoreA = typeof a.previousScore === "number" ? a.previousScore : a.score - (a.lastPoints || 0);
    const scoreB = typeof b.previousScore === "number" ? b.previousScore : b.score - (b.lastPoints || 0);
    return scoreB - scoreA;
  });

  // 2. Final sorted list by current score
  const finalSorted = [...players].sort((a, b) => b.score - a.score);

  // Determine active display list (flips to finalSorted after count-up)
  const activeList = isOvertakeAnimated ? finalSorted : initialSorted;
  const top5 = activeList.slice(0, 5);

  // Chaser spotlight (Rank 6 player chasing Rank 5)
  const rank5Player = finalSorted[4];
  const chaserPlayer = finalSorted[5]; // 6th place
  const chaserGap = rank5Player && chaserPlayer ? Math.max(0, rank5Player.score - chaserPlayer.score) : 0;

  // Rising star / Highest streak outside top 5
  const nonTop5Players = finalSorted.slice(5);
  const risingStar = nonTop5Players.find((p) => p.streak >= 2) ||
    nonTop5Players.sort((a, b) => (b.lastPoints || 0) - (a.lastPoints || 0))[0];

  useEffect(() => {
    sounds.playLeaderboard();

    // Step 1: Initialize running display scores to previous scores
    const initialScoresMap: { [id: string]: number } = {};
    players.forEach((p) => {
      initialScoresMap[p.id] = typeof p.previousScore === "number" ? p.previousScore : Math.max(0, p.score - (p.lastPoints || 0));
    });
    setDisplayScores(initialScoresMap);

    // Step 2: Animate score count-up after 300ms
    const countTimer = setTimeout(() => {
      const duration = 1200;
      const steps = 30;
      const stepDuration = duration / steps;
      let stepCount = 0;

      const interval = setInterval(() => {
        stepCount++;
        setDisplayScores((prev) => {
          const updated = { ...prev };
          players.forEach((p) => {
            const start = typeof p.previousScore === "number" ? p.previousScore : Math.max(0, p.score - (p.lastPoints || 0));
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
          // Step 3: Trigger Position Overtake Animation after score finishes counting!
          setTimeout(() => {
            setIsOvertakeAnimated(true);
            sounds.playClick();
          }, 300);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, 300);

    return () => {
      clearTimeout(countTimer);
    };
  }, [players]);

  return (
    <div className="h-screen w-screen bg-[#46178f] text-white flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden font-sans relative">
      {/* Top Header */}
      <header className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full pt-1">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-lg">
          <div className="p-2 bg-yellow-400 rounded-xl text-slate-950 shadow-md">
            <Trophy className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-300">
              Live Standings
            </p>
            <h1 className="text-base sm:text-xl font-black text-white">Leaderboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <AudioControl />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base sm:text-lg rounded-2xl shadow-[0_8px_25px_rgba(16,185,129,0.4)] flex items-center gap-2.5 transition-all cursor-pointer border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next Question"}</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* Main Center Area: Animated Top 5 Rows with Overtake Layout Physics */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full my-auto px-4 py-2">
        <motion.div layout className="w-full flex flex-col gap-2.5 sm:gap-3.5">
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
                    layout: { type: "spring", stiffness: 300, damping: 22 },
                    duration: 0.6,
                  }}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all ${
                    isRank1
                      ? "bg-gradient-to-r from-yellow-500/35 via-amber-500/20 to-transparent border-yellow-400/70 shadow-[0_8px_30px_rgba(245,158,11,0.3)] ring-2 ring-yellow-400/50 scale-[1.02]"
                      : isRank2
                      ? "bg-gradient-to-r from-slate-200/20 via-slate-300/10 to-transparent border-slate-300/40 shadow-lg"
                      : isRank3
                      ? "bg-gradient-to-r from-amber-700/25 via-amber-800/10 to-transparent border-amber-600/40 shadow-lg"
                      : "bg-white/10 border-white/15 hover:bg-white/15"
                  }`}
                >
                  {/* Left: Rank Badge + Avatar + Nickname + Overtake indicator */}
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-md flex-shrink-0 ${
                        isRank1
                          ? "bg-yellow-400 text-slate-950 ring-2 ring-yellow-200 shadow-yellow-400/40"
                          : isRank2
                          ? "bg-slate-300 text-slate-950"
                          : isRank3
                          ? "bg-amber-700 text-white"
                          : "bg-white/15 text-slate-200"
                      }`}
                    >
                      {isOvertakeAnimated ? finalRank : currentIdx + 1}
                    </div>

                    {/* Avatar */}
                    <div className="text-2xl sm:text-3xl filter drop-shadow-md flex-shrink-0">
                      {player.avatar}
                    </div>

                    {/* Nickname & Badges */}
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2 truncate">
                        <span className="truncate max-w-[120px] sm:max-w-xs">{player.nickname}</span>

                        {/* Streak Fire */}
                        {player.streak > 1 && (
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs font-black bg-gradient-to-r from-amber-500 to-red-500 text-white px-2 py-0.5 rounded-full shadow-md flex-shrink-0">
                            <Flame className="w-3 h-3 fill-white" />
                            <span>{player.streak} Streak</span>
                          </span>
                        )}

                        {/* Overtake Badge (Shows when position climbs) */}
                        {isOvertakeAnimated && rankDelta > 0 && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-0.5 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-md animate-pulse"
                          >
                            <ArrowUp className="w-3 h-3 stroke-[3]" />
                            <span>+{rankDelta}</span>
                          </motion.span>
                        )}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Gained Points Badge + Animated Running Score */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {pointsGained > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full shadow-md"
                      >
                        +{pointsGained.toLocaleString()}
                      </motion.div>
                    )}

                    <div className="text-right">
                      <span className="text-xl sm:text-3xl font-black text-white tabular-nums tracking-tight drop-shadow">
                        {currentScoreVal.toLocaleString()}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 block uppercase tracking-wider">
                        pts
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Drama & Suspense Spotlights: Chaser & Rising Star */}
        <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-3xl">
          {/* Spotlight 1: Chaser in 6th place */}
          {chaserPlayer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="flex-1 w-full bg-black/25 border border-white/15 rounded-2xl px-4 py-2 flex items-center justify-between gap-2 text-xs backdrop-blur-md shadow-md"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Target className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-slate-300 font-bold">Chasing Top 5:</span>
                <span className="font-black text-white truncate">
                  {chaserPlayer.avatar} {chaserPlayer.nickname} (#6)
                </span>
              </div>
              <span className="font-black text-amber-300 flex-shrink-0">
                -{chaserGap.toLocaleString()} pts behind #5
              </span>
            </motion.div>
          )}

          {/* Spotlight 2: Rising Star with hot streak */}
          {risingStar && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
              className="flex-1 w-full bg-black/25 border border-white/15 rounded-2xl px-4 py-2 flex items-center justify-between gap-2 text-xs backdrop-blur-md shadow-md"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                <span className="text-slate-300 font-bold">Rising Star:</span>
                <span className="font-black text-white truncate">
                  {risingStar.avatar} {risingStar.nickname}
                </span>
              </div>
              {risingStar.streak >= 2 ? (
                <span className="font-black text-yellow-300 flex-shrink-0">
                  🔥 {risingStar.streak} in a row!
                </span>
              ) : (
                <span className="font-black text-emerald-300 flex-shrink-0">
                  +{risingStar.lastPoints.toLocaleString()} pts this round
                </span>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer Player Count */}
      <footer className="text-center text-xs font-bold text-slate-300 py-1">
        {players.length > 5 && (
          <span className="bg-white/10 px-4 py-1.5 rounded-full border border-white/15">
            + {players.length - 5} more players competing below
          </span>
        )}
      </footer>
    </div>
  );
}
