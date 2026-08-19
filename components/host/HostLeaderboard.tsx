"use client";

import React from "react";
import { motion } from "framer-motion";
import { Player } from "@/lib/realtime/types";
import { Trophy, Flame, ArrowRight, Sparkles, Medal } from "lucide-react";

interface HostLeaderboardProps {
  players: Player[];
  isLastQuestion: boolean;
  onNext: () => void;
}

export function HostLeaderboard({ players, isLastQuestion, onNext }: HostLeaderboardProps) {
  const topPlayers = players.slice(0, 5);

  return (
    <div className="h-screen max-h-screen bg-gradient-to-b from-[#18092e] via-[#100321] to-[#0a0117] text-white flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden relative">
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between bg-white/10 backdrop-blur-xl px-5 sm:px-8 py-3.5 rounded-3xl border border-white/15 shadow-2xl max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400">
              Live Standings
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-white">Leaderboard</h1>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-[0_8px_25px_rgba(16,185,129,0.4)] flex items-center gap-2.5 transition-all cursor-pointer border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
        >
          <span>{isLastQuestion ? "Show Final Podium 🏆" : "Next Question"}</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </motion.button>
      </header>

      {/* Middle Top 5 Leaderboard Cards */}
      <main className="relative z-10 flex-1 my-4 max-w-3xl mx-auto w-full flex flex-col justify-center gap-3">
        {topPlayers.map((player, idx) => {
          const isRank1 = idx === 0;
          const isRank2 = idx === 1;
          const isRank3 = idx === 2;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5, type: "spring" }}
              className={`flex items-center justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${
                isRank1
                  ? "bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-transparent border-amber-400/60 shadow-[0_10px_35px_rgba(245,158,11,0.3)] scale-[1.03] ring-2 ring-yellow-400/40"
                  : isRank2
                  ? "bg-gradient-to-r from-slate-300/20 via-slate-400/10 to-transparent border-slate-300/40 shadow-xl"
                  : isRank3
                  ? "bg-gradient-to-r from-amber-700/20 via-amber-800/10 to-transparent border-amber-600/40 shadow-xl"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {/* Rank Badge + Avatar + Nickname */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-lg ${
                    isRank1
                      ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-950 ring-2 ring-yellow-200"
                      : isRank2
                      ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950"
                      : isRank3
                      ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                      : "bg-white/10 text-slate-300 border border-white/15"
                  }`}
                >
                  {idx + 1}
                </div>

                <div className="text-2xl sm:text-3xl filter drop-shadow-md">
                  {player.avatar}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span className="truncate max-w-[160px] sm:max-w-xs">{player.nickname}</span>
                    {player.streak > 1 && (
                      <span className="flex items-center gap-1 text-[10px] sm:text-xs font-black bg-gradient-to-r from-amber-500 to-red-500 text-white px-2 py-0.5 rounded-full shadow-md">
                        <Flame className="w-3 h-3 fill-white" />
                        <span>{player.streak} Streak</span>
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              {/* Score Counter */}
              <div className="text-right flex-shrink-0">
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight drop-shadow">
                  {player.score.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  pts
                </span>
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* Footer Player Count */}
      <footer className="relative z-10 text-center text-xs font-bold text-slate-400 py-2">
        {players.length > 5 && (
          <span className="bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
            + {players.length - 5} more players competing below
          </span>
        )}
      </footer>
    </div>
  );
}
