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
} from "lucide-react";
import Link from "next/link";

interface HostPodiumProps {
  quiz: Quiz;
  players: Player[];
  onPlayAgain: () => void;
}

export function HostPodium({ quiz, players, onPlayAgain }: HostPodiumProps) {
  // Cinema Stages:
  // 1: "reveal_3rd" (0.5s - 4.5s)
  // 2: "reveal_2nd" (4.5s - 9.0s)
  // 3: "spotlight_1st" (9.0s - 11.0s)
  // 4: "celebrate_all" (11.0s+)
  const [stage, setStage] = useState<
    "intro" | "reveal_3rd" | "reveal_2nd" | "spotlight_1st" | "celebrate_all"
  >("intro");

  const [showFullScoreboard, setShowFullScoreboard] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  const first = players[0];
  const second = players[1];
  const third = players[2];

  // Automatic Cinema-Grade Sequence Engine
  useEffect(() => {
    // 0.8s: Reveal 3rd Place (Image 2)
    const t3rd = setTimeout(() => {
      setStage("reveal_3rd");
      sounds.playClick();
    }, 800);

    // 4.8s: Reveal 2nd Place (Image 3 - 3rd place moves back)
    const t2nd = setTimeout(() => {
      setStage("reveal_2nd");
      sounds.playClick();
    }, 4800);

    // 9.0s: Cinematic Blackout & Circular Spotlight Suspense (Image 4)
    const tSpotlight = setTimeout(() => {
      setStage("spotlight_1st");
    }, 9000);

    // 11.2s: Grand 1st Place Champion Victory & Confetti Explosion
    const tFinale = setTimeout(() => {
      setStage("celebrate_all");
      setTriggerConfetti(true);
      sounds.playPodiumFanfare();
    }, 11200);

    return () => {
      clearTimeout(t3rd);
      clearTimeout(t2nd);
      clearTimeout(tSpotlight);
      clearTimeout(tFinale);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* Confetti Cascade on Champion Finale */}
      <ConfettiEffect trigger={triggerConfetti} duration={12000} />

      {/* ========================================================================= */}
      {/* CINEMATIC SPOTLIGHT OVERLAY (Stage: spotlight_1st) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {stage === "spotlight_1st" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center bg-black/85"
          >
            {/* Circular Spotlight Beam on Center Podium */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full bg-white/20 shadow-[0_0_120px_rgba(255,255,255,0.6)] border-4 border-white/40 flex flex-col items-center justify-start pt-8"
            >
              <span className="text-xl sm:text-2xl font-black text-yellow-300 uppercase tracking-widest animate-pulse">
                🏆 Champion 🏆
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: 100% Solid 3D */}
      {/* ========================================================================= */}
      <header className="relative z-40 flex items-center justify-between bg-[#33106B] px-6 py-4 rounded-3xl border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] shadow-xl max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#FFA602] border-b-2 border-[#CC8400] rounded-xl text-slate-950 shadow-sm">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-yellow-400 block leading-none">
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
            className="px-4 py-2.5 bg-[#240B4D] hover:bg-[#1D083E] text-white rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 border-2 border-[#1D083E] border-b-4 border-black cursor-pointer active:border-b-2 active:translate-y-0.5"
          >
            <ListOrdered className="w-4 h-4" />
            <span>{showFullScoreboard ? "Show Podium" : "Full Scoreboard"}</span>
          </button>

          <Link
            href="/quizzes"
            className="px-5 py-2.5 bg-[#26890C] hover:bg-[#22790A] text-white rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 shadow-md border-b-4 border-[#1B6108] active:border-b-0 active:translate-y-1"
          >
            <Home className="w-4 h-4" />
            <span>Library</span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN 3D STEPPED CINEMATIC PODIUM (Images 2, 3, 4 Sequencing) */}
      {/* ========================================================================= */}
      <main className="relative z-35 flex-1 my-4 flex flex-col items-center justify-end pb-4 max-w-5xl mx-auto w-full">
        {!showFullScoreboard ? (
          <div className="relative flex items-end justify-center gap-6 sm:gap-10 max-w-4xl mx-auto w-full h-[480px]">
            {/* ========================================================================= */}
            {/* 2ND PLACE (SILVER) - REVEALED IN STAGE 2 (Image 3) */}
            {/* ========================================================================= */}
            <motion.div
              animate={{
                scale: stage === "reveal_2nd" ? 1.05 : 1,
                zIndex: stage === "reveal_2nd" ? 30 : 20,
              }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col items-center max-w-[220px]"
            >
              {stage !== "intro" && stage !== "reveal_3rd" && second ? (
                <motion.div
                  initial={{ opacity: 0, y: 60, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="flex flex-col items-center mb-3 text-center"
                >
                  <span className="text-6xl sm:text-7xl mb-1 filter drop-shadow-sm select-none">
                    {second.avatar}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-white truncate max-w-[170px]">
                    {second.nickname}
                  </p>
                  <div className="bg-[#E2E8F0] text-[#0F172A] font-black text-xs sm:text-sm px-3 py-1 rounded-xl mt-1 shadow-sm border border-slate-300">
                    {second.score.toLocaleString()} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-28 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-white/40 font-black text-2xl">
                    ?
                  </div>
                </div>
              )}

              {/* 2nd Solid Pillar with Silver Pentagon Shield */}
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height:
                    stage !== "intro" && stage !== "reveal_3rd" ? "240px" : "40px",
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`w-full rounded-t-3xl shadow-xl flex flex-col items-center justify-start pt-4 border-t-4 transition-all ${
                  stage !== "intro" && stage !== "reveal_3rd"
                    ? "bg-[#94A3B8] border-t-white border-b-[8px] border-b-[#64748B]"
                    : "bg-[#240B4D] border-t-[#1D083E] opacity-50"
                }`}
              >
                {/* Pentagon Shield Badge 2 */}
                <div className="w-12 h-14 bg-[#64748B] border-2 border-white rounded-b-xl flex items-center justify-center font-black text-3xl text-white shadow-md">
                  2
                </div>
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider mt-2">
                  2nd Place
                </span>
              </motion.div>
            </motion.div>

            {/* ========================================================================= */}
            {/* 1ST PLACE (GOLD CHAMPION) - REVEALED IN STAGE 3 & 4 (Image 4) */}
            {/* ========================================================================= */}
            <motion.div
              animate={{
                scale: stage === "spotlight_1st" || stage === "celebrate_all" ? 1.08 : 1,
                zIndex: stage === "spotlight_1st" || stage === "celebrate_all" ? 40 : 20,
              }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col items-center max-w-[260px]"
            >
              {(stage === "spotlight_1st" || stage === "celebrate_all") && first ? (
                <motion.div
                  initial={{ opacity: 0, y: 70, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 15 }}
                  className="flex flex-col items-center mb-3 text-center relative"
                >
                  {/* Floating Gold Crown */}
                  <motion.div
                    animate={{ y: [-5, 5, -5], rotate: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute -top-10 text-[#FFA602]"
                  >
                    <Crown className="w-13 h-13 fill-[#FFA602] stroke-amber-200" />
                  </motion.div>

                  <span className="text-7xl sm:text-8xl mb-1 mt-3 filter drop-shadow-sm select-none">
                    {first.avatar}
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-yellow-300 truncate max-w-[210px]">
                    {first.nickname}
                  </p>
                  <div className="bg-[#FFA602] text-slate-950 font-black text-sm sm:text-base px-4 py-1 rounded-xl mt-1 shadow-md border-b-2 border-[#CC8400]">
                    🏆 {first.score.toLocaleString()} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-yellow-400 font-black text-3xl animate-pulse">
                    👑 ?
                  </div>
                </div>
              )}

              {/* 1st Solid Pillar (Tallest) with Gold Pentagon Shield */}
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height:
                    stage === "spotlight_1st" || stage === "celebrate_all"
                      ? "320px"
                      : "50px",
                }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className={`w-full rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 transition-all ${
                  stage === "spotlight_1st" || stage === "celebrate_all"
                    ? "bg-[#FFA602] border-t-white border-b-[8px] border-b-[#CC8400]"
                    : "bg-[#240B4D] border-t-[#1D083E] opacity-50"
                }`}
              >
                {/* Gold Pentagon Shield Badge 1 */}
                <div className="w-14 h-16 bg-[#CC8400] border-2 border-white rounded-b-xl flex items-center justify-center font-black text-4xl text-slate-950 shadow-md">
                  1
                </div>
                <span className="text-sm font-black uppercase text-slate-950 tracking-widest mt-2">
                  Champion
                </span>
              </motion.div>
            </motion.div>

            {/* ========================================================================= */}
            {/* 3RD PLACE (BRONZE) - REVEALED IN STAGE 1 (Image 2) */}
            {/* ========================================================================= */}
            <motion.div
              animate={{
                scale: stage === "reveal_3rd" ? 1.05 : stage === "reveal_2nd" ? 0.9 : 1,
                x: stage === "reveal_2nd" ? 15 : 0,
                opacity: stage === "reveal_2nd" ? 0.8 : 1,
                zIndex: stage === "reveal_3rd" ? 30 : 10,
              }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col items-center max-w-[220px]"
            >
              {stage !== "intro" && third ? (
                <motion.div
                  initial={{ opacity: 0, y: 60, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="flex flex-col items-center mb-3 text-center"
                >
                  <span className="text-6xl sm:text-7xl mb-1 filter drop-shadow-sm select-none">
                    {third.avatar}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-white truncate max-w-[170px]">
                    {third.nickname}
                  </p>
                  <div className="bg-[#D97706] text-white font-black text-xs sm:text-sm px-3 py-1 rounded-xl mt-1 shadow-sm border-b-2 border-[#92400E]">
                    {third.score.toLocaleString()} pts
                  </div>
                </motion.div>
              ) : (
                <div className="h-28 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-white/40 font-black text-2xl">
                    ?
                  </div>
                </div>
              )}

              {/* 3rd Solid Pillar with Bronze Pentagon Shield */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: stage !== "intro" ? "180px" : "30px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`w-full rounded-t-3xl shadow-xl flex flex-col items-center justify-start pt-4 border-t-4 transition-all ${
                  stage !== "intro"
                    ? "bg-[#D97706] border-t-amber-300 border-b-[8px] border-b-[#92400E]"
                    : "bg-[#240B4D] border-t-[#1D083E] opacity-50"
                }`}
              >
                {/* Pentagon Shield Badge 3 */}
                <div className="w-12 h-14 bg-[#92400E] border-2 border-amber-200 rounded-b-xl flex items-center justify-center font-black text-3xl text-white shadow-md">
                  3
                </div>
                <span className="text-xs font-black uppercase text-amber-200 tracking-wider mt-2">
                  3rd Place
                </span>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          /* Solid Complete Results Table View */
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[460px] overflow-y-auto border-2 border-slate-200 border-b-[8px] border-b-slate-300">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200 mb-4">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#FFA602]" />
                <span>Complete Standings ({players.length} Players)</span>
              </h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 border-b-[4px] border-b-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                        idx === 0
                          ? "bg-[#FFA602] border-b-2 border-[#CC8400] text-slate-950"
                          : idx === 1
                          ? "bg-[#94A3B8] border-b-2 border-[#64748B] text-white"
                          : idx === 2
                          ? "bg-[#D97706] border-b-2 border-[#92400E] text-white"
                          : "bg-[#33106B] text-white"
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

      {/* ========================================================================= */}
      {/* 3. BOTTOM FINALE CONTROLS (Appears after automatic sequence completes) */}
      {/* ========================================================================= */}
      <footer className="relative z-40 flex items-center justify-center gap-4 pb-2">
        {stage === "celebrate_all" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onPlayAgain}
              className="px-8 py-4 bg-[#26890C] hover:bg-[#22790A] text-white font-black text-lg rounded-2xl shadow-xl flex items-center gap-2.5 transition-all cursor-pointer border-b-[6px] border-[#1B6108] active:border-b-[2px] active:translate-y-1"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </motion.button>
          </motion.div>
        )}
      </footer>
    </div>
  );
}
