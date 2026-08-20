"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Quiz } from "@/lib/realtime/types";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";
import { AudioControl } from "@/components/ui/AudioControl";
import { sounds } from "@/lib/audio/soundManager";
import {
  Trophy,
  Crown,
  RotateCcw,
  ListOrdered,
  Sparkles,
  Home,
  ArrowRight,
  Medal,
} from "lucide-react";
import Link from "next/link";

interface HostPodiumProps {
  quiz: Quiz;
  players: Player[];
  onPlayAgain: () => void;
}

export function HostPodium({ quiz, players, onPlayAgain }: HostPodiumProps) {
  // Step 0: None revealed -> Step 1: 3rd Place -> Step 2: 2nd Place -> Step 3: 1st Place Champion
  const [revealStep, setRevealStep] = useState<number>(0);
  const [showFullScoreboard, setShowFullScoreboard] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  const first = players[0];
  const second = players[1];
  const third = players[2];

  const handleNextReveal = () => {
    if (revealStep === 0) {
      // Reveal 3rd place
      setRevealStep(1);
      sounds.playClick();
    } else if (revealStep === 1) {
      // Reveal 2nd place
      setRevealStep(2);
      sounds.playClick();
    } else if (revealStep === 2) {
      // Reveal 1st place Champion!
      setRevealStep(3);
      setTriggerConfetti(true);
      sounds.playPodiumFanfare();
    }
  };

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* Confetti Explosion on Grand Finale */}
      <ConfettiEffect trigger={triggerConfetti} duration={9000} />

      {/* 1. Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-xl max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400 rounded-xl text-slate-950 shadow-md">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-yellow-300 block leading-none">
              Grand Finale • {quiz.title}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight mt-0.5">
              Final Podium
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AudioControl />

          <button
            onClick={() => setShowFullScoreboard(!showFullScoreboard)}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
            <span>{showFullScoreboard ? "Show Podium" : "Full Scoreboard"}</span>
          </button>

          <Link
            href="/quizzes"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
          >
            <Home className="w-4 h-4" />
            <span>Library</span>
          </Link>
        </div>
      </header>

      {/* 2. Main 3D Stepped Podium Stage */}
      <main className="relative z-10 flex-1 my-4 flex flex-col items-center justify-end pb-4 max-w-5xl mx-auto w-full">
        {!showFullScoreboard ? (
          <div className="flex items-end justify-center gap-4 sm:gap-8 max-w-4xl mx-auto w-full h-[480px]">
            {/* ========================================================================= */}
            {/* 2ND PLACE (SILVER) - REVEALED ON STEP 2 */}
            {/* ========================================================================= */}
            <div className="flex-1 flex flex-col items-center max-w-[220px]">
              {revealStep >= 2 && second ? (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="flex flex-col items-center mb-3 text-center"
                >
                  <span className="text-6xl sm:text-7xl mb-1 filter drop-shadow-lg select-none">
                    {second.avatar}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-white truncate max-w-[170px] drop-shadow">
                    {second.nickname}
                  </p>
                  <div className="bg-slate-200 text-slate-900 font-black text-xs sm:text-sm px-3 py-0.5 rounded-full mt-1 shadow">
                    {second.score.toLocaleString()} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-28 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 font-black text-2xl">
                    ?
                  </div>
                </div>
              )}

              {/* 2nd Pillar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: revealStep >= 2 ? "230px" : "40px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`w-full rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 transition-all ${
                  revealStep >= 2
                    ? "bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 border-white ring-2 ring-slate-300/40"
                    : "bg-white/10 border-white/20 opacity-40"
                }`}
              >
                <span className="text-5xl font-black text-slate-950 drop-shadow">2</span>
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider mt-1">
                  2nd Place
                </span>
              </motion.div>
            </div>

            {/* ========================================================================= */}
            {/* 1ST PLACE (GOLD CHAMPION) - REVEALED ON STEP 3 */}
            {/* ========================================================================= */}
            <div className="flex-1 flex flex-col items-center max-w-[260px]">
              {revealStep >= 3 && first ? (
                <motion.div
                  initial={{ opacity: 0, y: 60, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="flex flex-col items-center mb-3 text-center relative"
                >
                  {/* Floating Gold Crown */}
                  <motion.div
                    animate={{ y: [-4, 4, -4], rotate: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute -top-10 text-amber-300 drop-shadow-[0_10px_20px_rgba(245,158,11,0.8)]"
                  >
                    <Crown className="w-12 h-12 fill-amber-400 stroke-amber-200" />
                  </motion.div>

                  <span className="text-7xl sm:text-8xl mb-1 mt-3 filter drop-shadow-2xl select-none">
                    {first.avatar}
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-yellow-300 truncate max-w-[210px] drop-shadow-lg">
                    {first.nickname}
                  </p>
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-sm sm:text-base px-4 py-1 rounded-full mt-1 shadow-lg ring-2 ring-yellow-200">
                    🏆 {first.score.toLocaleString()} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-yellow-400/40 flex items-center justify-center text-yellow-300/40 font-black text-3xl animate-pulse">
                    👑 ?
                  </div>
                </div>
              )}

              {/* 1st Pillar (Tallest in Center) */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: revealStep >= 3 ? "310px" : "50px" }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className={`w-full rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 transition-all ${
                  revealStep >= 3
                    ? "bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 border-white ring-4 ring-yellow-300/60 shadow-[0_0_50px_rgba(250,204,21,0.4)]"
                    : "bg-white/10 border-white/20 opacity-40"
                }`}
              >
                <span className="text-6xl font-black text-slate-950 drop-shadow">1</span>
                <span className="text-sm font-black uppercase text-slate-950 tracking-widest mt-1">
                  Champion
                </span>
              </motion.div>
            </div>

            {/* ========================================================================= */}
            {/* 3RD PLACE (BRONZE) - REVEALED ON STEP 1 */}
            {/* ========================================================================= */}
            <div className="flex-1 flex flex-col items-center max-w-[220px]">
              {revealStep >= 1 && third ? (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="flex flex-col items-center mb-3 text-center"
                >
                  <span className="text-6xl sm:text-7xl mb-1 filter drop-shadow-lg select-none">
                    {third.avatar}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-white truncate max-w-[170px] drop-shadow">
                    {third.nickname}
                  </p>
                  <div className="bg-amber-800 text-amber-200 font-black text-xs sm:text-sm px-3 py-0.5 rounded-full mt-1 shadow border border-amber-600">
                    {third.score.toLocaleString()} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-28 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 font-black text-2xl">
                    ?
                  </div>
                </div>
              )}

              {/* 3rd Pillar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: revealStep >= 1 ? "180px" : "30px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`w-full rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 transition-all ${
                  revealStep >= 1
                    ? "bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-amber-400 ring-2 ring-amber-500/40"
                    : "bg-white/10 border-white/20 opacity-40"
                }`}
              >
                <span className="text-5xl font-black text-amber-200 drop-shadow">3</span>
                <span className="text-xs font-black uppercase text-amber-200 tracking-wider mt-1">
                  3rd Place
                </span>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Complete Results Table View */
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[460px] overflow-y-auto border-2 border-slate-200 border-b-[8px] border-b-slate-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>Complete Standings ({players.length} Players)</span>
              </h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                        idx === 0
                          ? "bg-amber-400 text-slate-950"
                          : idx === 1
                          ? "bg-slate-300 text-slate-950"
                          : idx === 2
                          ? "bg-amber-700 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="font-black text-slate-900 text-base">{p.nickname}</span>
                  </div>

                  <span className="font-black text-[#46178F] text-lg tabular-nums">
                    {p.score.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Action Controls (HOST STEP-BY-STEP REVEAL BUTTON) */}
      <footer className="relative z-20 flex items-center justify-center gap-4 pb-2">
        {revealStep < 3 ? (
          /* Host Step-by-Step Reveal Action Button */
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleNextReveal}
            className="px-10 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-black text-lg md:text-xl rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.5)] flex items-center gap-3 transition-all cursor-pointer border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 animate-pulse"
          >
            {revealStep === 0 && (
              <>
                <Medal className="w-6 h-6 text-amber-900 stroke-[2.5]" />
                <span>Reveal 3rd Place (🥉)</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </>
            )}
            {revealStep === 1 && (
              <>
                <Medal className="w-6 h-6 text-slate-800 stroke-[2.5]" />
                <span>Reveal 2nd Place (🥈)</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </>
            )}
            {revealStep === 2 && (
              <>
                <Crown className="w-7 h-7 text-slate-950 fill-slate-950" />
                <span>👑 Reveal 1st Place Champion! 🏆</span>
                <Sparkles className="w-6 h-6" />
              </>
            )}
          </motion.button>
        ) : (
          /* Grand Finale Replay Actions */
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-lg rounded-2xl shadow-xl flex items-center gap-2.5 transition-all cursor-pointer border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </motion.button>
          </div>
        )}
      </footer>
    </div>
  );
}
