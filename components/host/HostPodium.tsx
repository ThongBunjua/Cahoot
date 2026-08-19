"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Player, Quiz } from "@/lib/realtime/types";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";
import { Trophy, Crown, RotateCcw, ListOrdered, Sparkles, Home } from "lucide-react";
import Link from "next/link";

interface HostPodiumProps {
  quiz: Quiz;
  players: Player[];
  onPlayAgain: () => void;
}

export function HostPodium({ quiz, players, onPlayAgain }: HostPodiumProps) {
  const [showFullScoreboard, setShowFullScoreboard] = useState(false);

  const first = players[0];
  const second = players[1];
  const third = players[2];

  return (
    <div className="min-h-screen bg-kahoot-dark text-white flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-hidden">
      <ConfettiEffect trigger={true} duration={8000} />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between bg-kahoot-dark-surface/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500 rounded-2xl text-slate-950 shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Game Complete • {quiz.title}
            </p>
            <h1 className="text-2xl font-black text-white">Final Podium</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFullScoreboard(!showFullScoreboard)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/10"
          >
            <ListOrdered className="w-4 h-4" />
            <span>{showFullScoreboard ? "Hide Table" : "Full Scoreboard"}</span>
          </button>

          <Link
            href="/host"
            className="px-5 py-2.5 bg-kahoot-purple hover:bg-kahoot-purple-light text-white rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-lg"
          >
            <Home className="w-4 h-4" />
            <span>Back to Hub</span>
          </Link>
        </div>
      </header>

      {/* Main 3D Stepped Podium */}
      <main className="relative z-10 flex-1 my-6 flex flex-col items-center justify-end pb-8">
        {!showFullScoreboard ? (
          <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-4xl mx-auto w-full h-[460px]">
            {/* 2nd Place (Silver) */}
            <div className="flex-1 flex flex-col items-center max-w-[200px]">
              {second && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="flex flex-col items-center mb-3 text-center"
                >
                  <span className="text-5xl mb-1 animate-bounce-subtle">{second.avatar}</span>
                  <p className="text-xl font-black text-white truncate max-w-[150px]">
                    {second.nickname}
                  </p>
                  <p className="text-sm font-bold text-slate-300">
                    {second.score.toLocaleString()} pts
                  </p>
                </motion.div>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "210px" }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-full bg-gradient-to-b from-slate-300 to-slate-500 rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-white"
              >
                <span className="text-4xl font-black text-slate-900">2</span>
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  2nd Place
                </span>
              </motion.div>
            </div>

            {/* 1st Place (Gold / Champion) */}
            <div className="flex-1 flex flex-col items-center max-w-[220px]">
              {first && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                  className="flex flex-col items-center mb-3 text-center relative"
                >
                  <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-7 text-yellow-400"
                  >
                    <Crown className="w-9 h-9 fill-yellow-400 drop-shadow-lg" />
                  </motion.div>
                  <span className="text-6xl mb-1 mt-3">{first.avatar}</span>
                  <p className="text-2xl font-black text-yellow-300 truncate max-w-[180px]">
                    {first.nickname}
                  </p>
                  <p className="text-base font-black text-white">
                    {first.score.toLocaleString()} pts
                  </p>
                </motion.div>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "290px" }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="w-full bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-600 rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-white/80"
              >
                <span className="text-5xl font-black text-slate-950">1</span>
                <span className="text-xs font-black uppercase text-slate-950 tracking-wider">
                  Champion
                </span>
              </motion.div>
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="flex-1 flex flex-col items-center max-w-[200px]">
              {third && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex flex-col items-center mb-3 text-center"
                >
                  <span className="text-5xl mb-1">{third.avatar}</span>
                  <p className="text-xl font-black text-white truncate max-w-[150px]">
                    {third.nickname}
                  </p>
                  <p className="text-sm font-bold text-slate-300">
                    {third.score.toLocaleString()} pts
                  </p>
                </motion.div>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "160px" }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-full bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-amber-500"
              >
                <span className="text-4xl font-black text-amber-200">3</span>
                <span className="text-xs font-black uppercase text-amber-200 tracking-wider">
                  3rd Place
                </span>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Full Scoreboard Modal/Table View */
          <div className="w-full max-w-3xl bg-kahoot-dark-surface/90 border border-white/15 rounded-3xl p-6 shadow-2xl max-h-[460px] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-black mb-4">Complete Results</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-slate-400 font-bold">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Player</th>
                  <th className="pb-3 text-right">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {players.map((p, idx) => (
                  <tr key={p.id} className="text-base font-bold">
                    <td className="py-3 font-black text-yellow-400">#{idx + 1}</td>
                    <td className="py-3 flex items-center gap-2">
                      <span className="text-xl">{p.avatar}</span>
                      <span>{p.nickname}</span>
                    </td>
                    <td className="py-3 text-right font-black tabular-nums">
                      {p.score.toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Bottom Actions */}
      <footer className="relative z-10 flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPlayAgain}
          className="px-8 py-4 bg-kahoot-green hover:bg-kahoot-green-dark text-white font-black text-lg rounded-2xl shadow-3d-green flex items-center gap-2.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Again</span>
        </motion.button>
      </footer>
    </div>
  );
}
