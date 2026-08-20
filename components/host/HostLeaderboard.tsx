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
  Target,
  Zap,
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

  // Spotlight: 6th place chasing 5th place
  const rank5Player = finalSorted[4];
  const chaserPlayer = finalSorted[5];
  const chaserGap = rank5Player && chaserPlayer ? Math.max(0, rank5Player.score - chaserPlayer.score) : 0;

  // Spotlight: Rising star with highest streak outside top 5
  const nonTop5Players = finalSorted.slice(5);
  const risingStar =
    nonTop5Players.find((p) => p.streak >= 2) ||
    nonTop5Players.sort((a, b) => (b.lastPoints || 0) - (a.lastPoints || 0))[0];

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
    <div className="h-screen w-screen bg-[#381272] bg-gradient-to-b from-[#46178f] via-[#381272] to-[#250a52] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans relative">
      {/* Top Clean Header */}
      <header className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full pt-1">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/15 shadow-md">
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

      {/* Main Center Area: Minimal Glassmorphic Leaderboard */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full my-auto px-4 py-2">
        <motion.div layout className="w-full flex flex-col gap-2.5 sm:gap-3">
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
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                    isRank1
                      ? "bg-white/20 border-yellow-400/80 shadow-[0_8px_30px_rgba(250,204,21,0.25)] ring-2 ring-yellow-400/50 scale-[1.01]"
                      : isRank2
                      ? "bg-white/15 border-slate-300/50 shadow-md"
                      : isRank3
                      ? "bg-white/12 border-amber-600/50 shadow-md"
                      : "bg-white/10 border-white/15 hover:bg-white/15"
                  }`}
                >
                  {/* Left: Rank Badge + Avatar + Nickname */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base shadow-sm flex-shrink-0 ${
                        isRank1
                          ? "bg-yellow-400 text-slate-950 ring-2 ring-yellow-200"
                          : isRank2
                          ? "bg-slate-200 text-slate-950"
                          : isRank3
                          ? "bg-amber-600 text-white"
                          : "bg-black/25 text-slate-200 border border-white/10"
                      }`}
                    >
                      {isOvertakeAnimated ? finalRank : currentIdx + 1}
                    </div>

                    <div className="text-2xl sm:text-3xl filter drop-shadow-sm flex-shrink-0">
                      {player.avatar}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-2 truncate">
                        <span className="truncate max-w-[130px] sm:max-w-xs">{player.nickname}</span>

                        {/* Streak Badge */}
                        {player.streak > 1 && (
                          <span className="flex items-center gap-1 text-[10px] font-black bg-amber-500/30 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full flex-shrink-0">
                            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{player.streak} Streak</span>
                          </span>
                        )}

                        {/* Rank Jump Badge */}
                        {isOvertakeAnimated && rankDelta > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-0.5 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm"
                          >
                            <ArrowUp className="w-3 h-3 stroke-[3]" />
                            <span>+{rankDelta}</span>
                          </motion.span>
                        )}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Gained Points Badge + Running Score */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {pointsGained > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 font-black text-xs px-2 py-0.5 rounded-full"
                      >
                        +{pointsGained.toLocaleString()}
                      </motion.div>
                    )}

                    <div className="text-right min-w-[70px]">
                      <span className="text-lg sm:text-2xl font-black text-white tabular-nums tracking-tight">
                        {currentScoreVal.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider leading-none">
                        pts
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Minimal Bottom Spotlight Banner (Chaser & Rising Star) */}
        {(chaserPlayer || risingStar) && (
          <div className="w-full mt-3.5 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-3xl">
            {chaserPlayer && (
              <div className="flex-1 w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 text-xs backdrop-blur-md">
                <div className="flex items-center gap-2 min-w-0">
                  <Target className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-300 font-bold">Chasing Top 5:</span>
                  <span className="font-black text-white truncate">
                    {chaserPlayer.avatar} {chaserPlayer.nickname} (#6)
                  </span>
                </div>
                <span className="font-black text-amber-300 flex-shrink-0">
                  -{chaserGap.toLocaleString()} pts behind #5
                </span>
              </div>
            )}

            {risingStar && (
              <div className="flex-1 w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 text-xs backdrop-blur-md">
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
                  <span className="text-slate-300 font-bold">Rising Star:</span>
                  <span className="font-black text-white truncate">
                    {risingStar.avatar} {risingStar.nickname}
                  </span>
                </div>
                <span className="font-black text-yellow-300 flex-shrink-0">
                  {risingStar.streak >= 2
                    ? `🔥 ${risingStar.streak} in a row!`
                    : `+${risingStar.lastPoints.toLocaleString()} pts`}
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Player Count Pill */}
      <footer className="text-center text-xs font-bold text-slate-300 pb-1">
        {players.length > 5 && (
          <span className="bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-flex items-center gap-1.5 shadow-sm">
            <Users className="w-3.5 h-3.5 text-yellow-300" />
            <span>+ {players.length - 5} more players competing below</span>
          </span>
        )}
      </footer>
    </div>
  );
}
