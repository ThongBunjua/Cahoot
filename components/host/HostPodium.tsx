"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Quiz } from "@/lib/realtime/types";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
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
  // Cinema Stages with Delayed Pillar -> Avatar/Name Reveal for Maximum Suspense:
  // 1: 3rd Pillar Rises -> 3rd Avatar/Name Pops (0.5s - 4.5s)
  // 2: 2nd Pillar Rises -> 2nd Avatar/Name Pops (4.8s - 9.0s)
  // 3: 1st Blackout & Spotlight -> 1st Pillar Rises -> 1st Champion Pops (9.0s - 12.5s)
  // 4: Grand Finale Celebration (12.5s+)

  const [p3Pillar, setP3Pillar] = useState(false);
  const [p3Details, setP3Details] = useState(false);

  const [p2Pillar, setP2Pillar] = useState(false);
  const [p2Details, setP2Details] = useState(false);

  const [spotlight, setSpotlight] = useState(false);
  const [p1Pillar, setP1Pillar] = useState(false);
  const [p1Details, setP1Details] = useState(false);

  const [celebrateAll, setCelebrateAll] = useState(false);
  const [showFullScoreboard, setShowFullScoreboard] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  const first = players[0];
  const second = players[1];
  const third = players[2];

  // Automatic Cinema-Grade Choreography Engine
  useEffect(() => {
    // ----------------------------------------------------
    // STEP 1: 3RD PLACE (Bronze)
    // ----------------------------------------------------
    const t3Pillar = setTimeout(() => {
      setP3Pillar(true);
      sounds.playClick();
    }, 600);

    const t3Details = setTimeout(() => {
      setP3Details(true);
      sounds.playTick(1.2);
    }, 2000); // 1.4s suspense delay after pillar rises!

    // ----------------------------------------------------
    // STEP 2: 2ND PLACE (Silver)
    // ----------------------------------------------------
    const t2Pillar = setTimeout(() => {
      setP2Pillar(true);
      sounds.playClick();
    }, 5000);

    const t2Details = setTimeout(() => {
      setP2Details(true);
      sounds.playTick(1.4);
    }, 6600); // 1.6s suspense delay after pillar rises!

    // ----------------------------------------------------
    // STEP 3: 1ST PLACE CHAMPION (Gold Suspense)
    // ----------------------------------------------------
    const tSpot = setTimeout(() => {
      setSpotlight(true);
    }, 9400);

    const t1Pillar = setTimeout(() => {
      setP1Pillar(true);
    }, 10200);

    const t1Details = setTimeout(() => {
      setP1Details(true);
      setSpotlight(false);
      setCelebrateAll(true);
      setTriggerConfetti(true);
      sounds.playPodiumFanfare();
    }, 12400); // Grand suspense reveal!

    return () => {
      clearTimeout(t3Pillar);
      clearTimeout(t3Details);
      clearTimeout(t2Pillar);
      clearTimeout(t2Details);
      clearTimeout(tSpot);
      clearTimeout(t1Pillar);
      clearTimeout(t1Details);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* Confetti Cascade on Champion Finale */}
      <ConfettiEffect trigger={triggerConfetti} duration={14000} />

      {/* ========================================================================= */}
      {/* CINEMATIC SPOTLIGHT OVERLAY (Suspense Stage) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {spotlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center bg-black/90"
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full bg-white/20 shadow-[0_0_150px_rgba(255,255,255,0.7)] border-4 border-white/40 flex flex-col items-center justify-start pt-10"
            >
              <span className="text-2xl sm:text-3xl font-black text-yellow-300 uppercase tracking-widest animate-pulse">
                👑 Grand Champion 👑
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: 100% Solid 3D */}
      {/* ========================================================================= */}
      <header className="relative z-40 flex items-center justify-between bg-[#33106B] px-6 py-4 rounded-3xl border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] shadow-xl max-w-7xl mx-auto w-full">
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
      {/* 2. MAIN 3D STEPPED CINEMATIC PODIUM (Pillar First -> Avatar & Name Suspense) */}
      {/* ========================================================================= */}
      <main className="relative z-35 flex-1 my-4 flex flex-col items-center justify-end pb-4 max-w-7xl mx-auto w-full">
        {!showFullScoreboard ? (
          <div className="relative flex items-end justify-center w-full h-[520px]">
            {/* ========================================================================= */}
            {/* 3RD PLACE (BRONZE) - Pillar Rises First -> Then Details Reveal */}
            {/* ========================================================================= */}
            {p3Pillar && third && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 100 }}
                animate={{
                  opacity: p2Pillar ? 0.85 : 1,
                  scale: p2Pillar ? 0.95 : 1.25,
                  x: p2Pillar ? 280 : 0, // Starts center, shifts to right when 2nd place appears
                  zIndex: p2Pillar ? 15 : 35,
                }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="absolute flex flex-col items-center w-[230px]"
              >
                {/* Suspense: Avatar + Nickname + Score pop up after pillar rises */}
                {p3Details ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="flex flex-col items-center mb-3 text-center"
                  >
                    <span className="text-7xl sm:text-8xl mb-1 filter drop-shadow-sm select-none">
                      {third.avatar}
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-white truncate max-w-[200px]">
                      {third.nickname}
                    </p>
                    <div className="bg-[#D97706] text-white font-black text-sm sm:text-base px-4 py-1 rounded-xl mt-1 shadow-md border-b-2 border-[#92400E]">
                      {third.score.toLocaleString()} pts
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-amber-300 font-black text-3xl animate-pulse">
                      ?
                    </div>
                  </div>
                )}

                {/* 3rd Solid Pillar with Bronze Pentagon Shield */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "200px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full rounded-t-3xl shadow-xl flex flex-col items-center justify-start pt-4 border-t-4 bg-[#D97706] border-t-amber-300 border-b-[8px] border-b-[#92400E]"
                >
                  <div className="w-14 h-16 bg-[#92400E] border-2 border-amber-200 rounded-b-2xl flex items-center justify-center font-black text-4xl text-white shadow-md">
                    3
                  </div>
                  <span className="text-sm font-black uppercase text-amber-200 tracking-wider mt-2">
                    3rd Place
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* 2ND PLACE (SILVER) - Pillar Rises First -> Then Details Reveal */}
            {/* ========================================================================= */}
            {p2Pillar && second && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 100 }}
                animate={{
                  opacity: p1Pillar ? 0.85 : 1,
                  scale: p1Pillar ? 0.95 : 1.25,
                  x: p1Pillar ? -280 : 0, // Starts center, shifts to left when 1st place appears
                  zIndex: p1Pillar ? 15 : 35,
                }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="absolute flex flex-col items-center w-[230px]"
              >
                {/* Suspense: Avatar + Nickname + Score pop up after pillar rises */}
                {p2Details ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="flex flex-col items-center mb-3 text-center"
                  >
                    <span className="text-7xl sm:text-8xl mb-1 filter drop-shadow-sm select-none">
                      {second.avatar}
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-white truncate max-w-[200px]">
                      {second.nickname}
                    </p>
                    <div className="bg-[#E2E8F0] text-[#0F172A] font-black text-sm sm:text-base px-4 py-1 rounded-xl mt-1 shadow-md border border-slate-300">
                      {second.score.toLocaleString()} pts
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-slate-300 font-black text-3xl animate-pulse">
                      ?
                    </div>
                  </div>
                )}

                {/* 2nd Solid Pillar with Silver Pentagon Shield */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "260px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full rounded-t-3xl shadow-xl flex flex-col items-center justify-start pt-4 border-t-4 bg-[#94A3B8] border-t-white border-b-[8px] border-b-[#64748B]"
                >
                  <div className="w-14 h-16 bg-[#64748B] border-2 border-white rounded-b-2xl flex items-center justify-center font-black text-4xl text-white shadow-md">
                    2
                  </div>
                  <span className="text-sm font-black uppercase text-slate-900 tracking-wider mt-2">
                    2nd Place
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* 1ST PLACE (GOLD CHAMPION) - Pillar in Spotlight -> Champion Crown Explosion */}
            {/* ========================================================================= */}
            {p1Pillar && first && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 120 }}
                animate={{
                  opacity: 1,
                  scale: 1.35,
                  x: 0,
                  zIndex: 40,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="absolute flex flex-col items-center w-[270px]"
              >
                {/* Suspense: Champion Avatar + Floating Gold Crown */}
                {p1Details ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 15 }}
                    className="flex flex-col items-center mb-3 text-center relative"
                  >
                    <motion.div
                      animate={{ y: [-6, 6, -6], rotate: [-4, 4, -4] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="absolute -top-12 text-[#FFA602]"
                    >
                      <Crown className="w-14 h-14 fill-[#FFA602] stroke-amber-200" />
                    </motion.div>

                    <span className="text-8xl sm:text-9xl mb-1 mt-4 filter drop-shadow-sm select-none">
                      {first.avatar}
                    </span>
                    <p className="text-3xl sm:text-4xl font-black text-yellow-300 truncate max-w-[240px]">
                      {first.nickname}
                    </p>
                    <div className="bg-[#FFA602] text-slate-950 font-black text-base sm:text-lg px-5 py-1.5 rounded-2xl mt-1 shadow-lg border-b-2 border-[#CC8400]">
                      🏆 {first.score.toLocaleString()} pts
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-36 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-yellow-400 font-black text-4xl animate-pulse">
                      👑 ?
                    </div>
                  </div>
                )}

                {/* 1st Solid Pillar (Tallest) with Gold Pentagon Shield */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "330px" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="w-full rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 bg-[#FFA602] border-t-white border-b-[8px] border-b-[#CC8400]"
                >
                  <div className="w-16 h-18 bg-[#CC8400] border-2 border-white rounded-b-2xl flex items-center justify-center font-black text-5xl text-slate-950 shadow-md">
                    1
                  </div>
                  <span className="text-base font-black uppercase text-slate-950 tracking-widest mt-2">
                    Champion
                  </span>
                </motion.div>
              </motion.div>
            )}
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
      {/* 3. BOTTOM FINALE CONTROLS */}
      {/* ========================================================================= */}
      <footer className="relative z-40 flex items-center justify-center gap-4 pb-2">
        {celebrateAll && (
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
