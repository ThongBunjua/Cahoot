"use client";

import React from "react";
import { motion } from "framer-motion";
import { Player } from "@/lib/realtime/types";
import { Trophy, Flame, ArrowRight, Sparkles } from "lucide-react";

interface HostLeaderboardProps {
  players: Player[];
  isLastQuestion: boolean;
  onNext: () => void;
}

export function HostLeaderboard({ players, isLastQuestion, onNext }: HostLeaderboardProps) {
  const topPlayers = players.slice(0, 5);

  return (
    <div className="min-h-screen bg-kahoot-dark text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between bg-kahoot-dark-surface/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500 rounded-2xl text-slate-950 shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Live Standings
            </p>
            <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="px-8 py-4 bg-kahoot-green hover:bg-kahoot-green-dark text-white font-black text-lg rounded-2xl shadow-3d-green flex items-center gap-2.5 transition-all cursor-pointer"
        >
          <span>{isLastQuestion ? "Show Final Podium" : "Next Question"}</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </header>

      {/* Middle Top 5 Leaderboard Rows */}
      <main className="flex-1 my-8 max-w-3xl mx-auto w-full flex flex-col justify-center gap-3">
        {topPlayers.map((player, idx) => {
          const isTop1 = idx === 0;
          const isTop3 = idx < 3;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${
                isTop1
                  ? "bg-gradient-to-r from-yellow-500/30 to-amber-500/10 border-yellow-500/50 shadow-2xl scale-[1.02]"
                  : isTop3
                  ? "bg-white/10 border-white/20 shadow-xl"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {/* Rank & Nickname */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                    isTop1
                      ? "bg-yellow-400 text-slate-950 shadow-lg"
                      : idx === 1
                      ? "bg-slate-300 text-slate-950"
                      : idx === 2
                      ? "bg-amber-700 text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {idx + 1}
                </div>

                <div className="text-3xl">{player.avatar}</div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <span>{player.nickname}</span>
                    {player.streak > 1 && (
                      <span className="flex items-center gap-1 text-xs font-black bg-amber-500/30 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{player.streak}</span>
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              {/* Score Counter */}
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                  {player.score.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400 block uppercase">pts</span>
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* Bottom Footer */}
      <footer className="text-center text-xs font-bold text-slate-400 py-2">
        {players.length > 5 && `+ ${players.length - 5} more players competing below`}
      </footer>
    </div>
  );
}
