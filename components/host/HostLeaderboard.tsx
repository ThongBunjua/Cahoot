"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Player } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { sounds } from "@/lib/audio/soundManager";
import { Trophy, Flame, ArrowRight, Sparkles } from "lucide-react";

interface HostLeaderboardProps {
  players: Player[];
  isLastQuestion: boolean;
  onNext: () => void;
}

function AnimatedScore({
  finalScore,
  pointsGained,
  delay = 0.3,
}: {
  finalScore: number;
  pointsGained: number;
  delay?: number;
}) {
  const startScore = Math.max(0, finalScore - (pointsGained || 0));
  const [displayScore, setDisplayScore] = useState(startScore);

  useEffect(() => {
    // Start count-up animation after delay
    const timer = setTimeout(() => {
      const duration = 1200; // ms
      const steps = 30;
      const stepDuration = duration / steps;
      const increment = (finalScore - startScore) / steps;
      let current = startScore;
      let stepCount = 0;

      const interval = setInterval(() => {
        stepCount++;
        current += increment;

        if (stepCount >= steps) {
          setDisplayScore(finalScore);
          clearInterval(interval);
        } else {
          setDisplayScore(Math.round(current));
          if (stepCount % 4 === 0) {
            sounds.playTick(1.0 + (stepCount / steps) * 0.4);
          }
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [finalScore, startScore, delay]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Animated points gained badge */}
      {pointsGained > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 350 }}
          className="bg-emerald-500/25 border border-emerald-400 text-emerald-300 font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1"
        >
          <span>+{pointsGained.toLocaleString()}</span>
        </motion.div>
      )}

      {/* Main Animated Running Score */}
      <div className="text-right flex-shrink-0">
        <span className="text-xl sm:text-3xl font-black text-white tabular-nums tracking-tight drop-shadow">
          {displayScore.toLocaleString()}
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 block uppercase tracking-wider">
          pts
        </span>
      </div>
    </div>
  );
}

export function HostLeaderboard({ players, isLastQuestion, onNext }: HostLeaderboardProps) {
  const topPlayers = players.slice(0, 5);

  useEffect(() => {
    sounds.playLeaderboard();
  }, []);

  return (
    <div className="h-screen w-screen bg-[#46178f] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Top Header: Standings Banner, Audio Control, Next Button */}
      <header className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full pt-1">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <div className="p-2 bg-yellow-400 rounded-xl text-slate-950 shadow-md">
            <Trophy className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-300">
              Live Standings
            </p>
            <h1 className="text-lg sm:text-xl font-black text-white">Leaderboard</h1>
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

      {/* Main Center Area: Perfectly Centered Top 5 Leaderboard */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full my-auto px-4 py-2">
        <div className="w-full flex flex-col gap-3 sm:gap-4">
          {topPlayers.map((player, idx) => {
            const isRank1 = idx === 0;
            const isRank2 = idx === 1;
            const isRank3 = idx === 2;
            const pointsGained = player.lastPoints || 0;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.12, duration: 0.45, type: "spring" }}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isRank1
                    ? "bg-gradient-to-r from-yellow-500/30 via-amber-500/15 to-transparent border-yellow-400/60 shadow-[0_8px_30px_rgba(245,158,11,0.25)] ring-2 ring-yellow-400/40"
                    : isRank2
                    ? "bg-gradient-to-r from-slate-200/20 via-slate-300/10 to-transparent border-slate-300/40 shadow-lg"
                    : isRank3
                    ? "bg-gradient-to-r from-amber-700/20 via-amber-800/10 to-transparent border-amber-600/40 shadow-lg"
                    : "bg-white/10 border-white/15 hover:bg-white/15"
                }`}
              >
                {/* Rank Badge + Avatar + Nickname */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
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
                    {idx + 1}
                  </div>

                  <div className="text-2xl sm:text-3xl filter drop-shadow-md flex-shrink-0">
                    {player.avatar}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2 truncate">
                      <span className="truncate max-w-[140px] sm:max-w-xs">{player.nickname}</span>
                      {player.streak > 1 && (
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs font-black bg-gradient-to-r from-amber-500 to-red-500 text-white px-2 py-0.5 rounded-full shadow-md flex-shrink-0">
                          <Flame className="w-3 h-3 fill-white" />
                          <span>{player.streak} Streak</span>
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                {/* Animated Count-Up Score */}
                <AnimatedScore
                  finalScore={player.score}
                  pointsGained={pointsGained}
                  delay={0.2 + idx * 0.1}
                />
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer info banner */}
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
