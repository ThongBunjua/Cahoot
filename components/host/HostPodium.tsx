"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Quiz } from "@/lib/realtime/types";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
import { sounds } from "@/lib/audio/soundManager";
import {
  Trophy,
  Crown,
  Medal,
  Home,
  ListOrdered,
} from "lucide-react";
import Link from "next/link";

interface HostPodiumProps {
  quiz: Quiz;
  players: Player[];
  onPlayAgain?: () => void;
}

export function HostPodium({ quiz, players, onPlayAgain }: HostPodiumProps) {
  // Sort players by final total score with deterministic tie-breaker
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  const first = sorted[0] || null;
  const second = sorted[1] || null;
  const third = sorted[2] || null;

  // Staggered reveal animation states with extended suspense
  const [p3Pillar, setP3Pillar] = useState(false);
  const [p3Details, setP3Details] = useState(false);

  const [p2Pillar, setP2Pillar] = useState(false);
  const [p2Details, setP2Details] = useState(false);

  const [p1Pillar, setP1Pillar] = useState(false);
  const [p1Details, setP1Details] = useState(false);

  const [spotlight, setSpotlight] = useState(false);
  const [celebrateAll, setCelebrateAll] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [showFullScoreboard, setShowFullScoreboard] = useState(false);

  useEffect(() => {
    // =========================================================================
    // EXTENDED SUSPENSEFUL TIMELINE WITH DRUMROLLS, CHEERS, AND FANFARES
    // =========================================================================

    // STEP 1: 3RD PLACE SUSPENSE & REVEAL (1.2s -> 4.2s)
    const t3Pillar = setTimeout(() => {
      setP3Pillar(true);
      sounds.playDrumroll(2.8); // 2.8s tension drumroll
    }, 1200);

    const t3Details = setTimeout(() => {
      setP3Details(true);
      sounds.playCorrect();
      sounds.playCrowdCheer(2.8);
    }, 4200);

    // STEP 2: 2ND PLACE SUSPENSE & REVEAL (5.8s -> 9.0s)
    const t2Pillar = setTimeout(() => {
      setP2Pillar(true);
      sounds.playDrumroll(3.0); // 3.0s tension drumroll
    }, 5800);

    const t2Details = setTimeout(() => {
      setP2Details(true);
      sounds.playCorrect();
      sounds.playCrowdCheer(3.0);
    }, 9000);

    // STEP 3: 1ST PLACE ULTIMATE CHAMPION SUSPENSE & GRAND FINALE (11.0s -> 16.0s)
    const tSpot = setTimeout(() => {
      setSpotlight(true);
      sounds.playDrumroll(4.8); // Intense 4.8-second grand finale drumroll building maximum tension!
    }, 11000);

    const t1Pillar = setTimeout(() => {
      setP1Pillar(true);
    }, 12500);

    const t1Details = setTimeout(() => {
      setP1Details(true);
      setSpotlight(false);
      setCelebrateAll(true);
      setTriggerConfetti(true);
      sounds.playChampionReveal(); // Fanfare + Multi-Fireworks Booms + Roaring Stadium Cheers & Applause!
    }, 16000);

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

  const totalQ = quiz.questions?.length ?? 1;

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* Confetti Cascade on Champion Finale */}
      <ConfettiEffect trigger={triggerConfetti} duration={15000} />

      {/* ========================================================================= */}
      {/* HYBRID CINEMATIC STAGE LIGHTING: CIRCULAR SPOTLIGHT + PURPLE & GOLD BEAMS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {spotlight && (
          <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
            {/* 1. Ambient Stage Dimming */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
            />

            {/* 2. Left Purple-Gold Spotlight Cone */}
            <motion.div
              initial={{ opacity: 0, rotate: -30, scaleY: 0.4 }}
              animate={{ opacity: [0, 0.8, 0.6], rotate: -18, scaleY: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -top-24 left-1/5 w-[320px] sm:w-[480px] h-[130vh] bg-gradient-to-b from-[#FFA602]/40 via-purple-600/25 to-transparent blur-3xl origin-top"
              style={{ clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)" }}
            />

            {/* 3. Right Violet-Gold Spotlight Cone */}
            <motion.div
              initial={{ opacity: 0, rotate: 30, scaleY: 0.4 }}
              animate={{ opacity: [0, 0.8, 0.6], rotate: 18, scaleY: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -top-24 right-1/5 w-[320px] sm:w-[480px] h-[130vh] bg-gradient-to-b from-yellow-300/40 via-purple-500/25 to-transparent blur-3xl origin-top"
              style={{ clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)" }}
            />

            {/* 4. Large Luminous Circular Stage Spotlight Disc on Center */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full bg-gradient-to-b from-white/20 via-yellow-300/10 to-purple-600/10 shadow-[0_0_150px_rgba(255,255,255,0.65)] border-4 border-yellow-300/30 flex flex-col items-center justify-start pt-10"
            />

            {/* 5. Grand Champion Floating Banner */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="absolute top-24 sm:top-28 left-1/2 -translate-x-1/2 flex flex-col items-center text-center z-40"
            >
              <span className="text-xs sm:text-base font-black uppercase tracking-[0.3em] text-yellow-400 bg-black/70 px-8 py-2.5 rounded-full border-2 border-yellow-400/50 shadow-2xl backdrop-blur-md">
                Grand Champion
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER */}
      {/* ========================================================================= */}
      <header className="relative z-40 flex items-center justify-between bg-[#33106B] px-6 sm:px-8 py-4 rounded-3xl border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] shadow-2xl w-full max-w-[96vw] mx-auto">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#FFA602] border-b-4 border-[#CC8400] rounded-2xl text-slate-950 shadow-sm">
            <Trophy className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400 block leading-none">
              Grand Finale • {quiz.title}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mt-1">
              Final Podium
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AudioControl />

          <button
            onClick={() => setShowFullScoreboard(!showFullScoreboard)}
            className="px-5 py-3 bg-[#240B4D] hover:bg-[#1D083E] text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 border-2 border-[#1D083E] border-b-4 border-black cursor-pointer active:border-b-2 active:translate-y-0.5"
          >
            <ListOrdered className="w-4 h-4" />
            <span>{showFullScoreboard ? "Show Podium" : "Full Scoreboard"}</span>
          </button>

          <Link
            href="/quizzes"
            className="px-6 py-3 bg-[#26890C] hover:bg-[#22790A] text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-md border-b-4 border-[#1B6108] active:border-b-0 active:translate-y-1"
          >
            <Home className="w-4 h-4" />
            <span>Library</span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN STAGE: THE 3 PODIUM PILLARS WITH SPRING SUSPENSE PHYSICS */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-end relative z-20 pb-4">
        {!showFullScoreboard ? (
          <div className="relative w-full max-w-6xl h-[620px] flex items-end justify-center">
            {/* ========================================================================= */}
            {/* 3RD PLACE (BRONZE) - Super-Sized Pillar (320px) */}
            {/* ========================================================================= */}
            {p3Pillar && third && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 120 }}
                animate={{
                  opacity: p2Pillar ? 0.85 : 1,
                  scale: p2Pillar ? 0.9 : 1.15,
                  x: p1Pillar ? 310 : p2Pillar ? 270 : 0,
                  y: 0,
                  zIndex: p1Pillar ? 10 : p2Pillar ? 10 : 30,
                }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                className="absolute flex flex-col items-center w-[290px] sm:w-[320px] bottom-0"
              >
                {/* Floating White Name Box + Avatar */}
                <div className="h-44 flex flex-col items-center justify-end mb-3">
                  {p3Details ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-7xl sm:text-8xl md:text-9xl mb-2 filter drop-shadow-md select-none">
                        {third.avatar}
                      </span>
                      {/* Super-Sized Solid White Name Plaque */}
                      <div className="bg-white text-slate-950 font-black text-2xl sm:text-3xl px-8 py-3 rounded-2xl shadow-2xl border-2 border-slate-200 border-b-[6px] border-b-slate-300 truncate max-w-[280px] text-center">
                        {third.nickname}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-32 flex items-center justify-center">
                      <div className="w-18 h-18 rounded-3xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-amber-300 font-black text-4xl animate-bounce shadow-2xl">
                        ?
                      </div>
                    </div>
                  )}
                </div>

                {/* 3rd Giant Dark Navy Solid Pillar (320px) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "320px" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="w-full bg-[#1D083E] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-6 border-2 border-[#240B4D] border-b-[8px] border-b-[#130526] relative"
                >
                  {/* Bronze Giant Shield */}
                  <div className="relative mb-3 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-20 h-22 fill-[#D97706] filter drop-shadow-lg">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#FDE68A" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-4xl text-white">
                      3
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p3Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center mt-2 flex-shrink-0"
                    >
                      <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight block">
                        {third.score.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-sm font-black uppercase text-amber-200 tracking-wider mt-1.5 block bg-[#240B4D] px-3 py-1 rounded-full border border-amber-500/30">
                        {third.correctCount ?? 0} out of {totalQ}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* 2ND PLACE (SILVER) - Super-Sized Pillar (390px) */}
            {/* ========================================================================= */}
            {p2Pillar && second && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 120 }}
                animate={{
                  opacity: p1Pillar ? 0.9 : 1,
                  scale: p1Pillar ? 0.95 : 1.15,
                  x: p1Pillar ? -310 : 0,
                  y: 0,
                  zIndex: p1Pillar ? 15 : 35,
                }}
                transition={{ type: "spring", stiffness: 190, damping: 22 }}
                className="absolute flex flex-col items-center w-[290px] sm:w-[320px] bottom-0"
              >
                {/* Floating White Name Box + Avatar */}
                <div className="h-44 flex flex-col items-center justify-end mb-3">
                  {p2Details ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-7xl sm:text-8xl md:text-9xl mb-2 filter drop-shadow-md select-none">
                        {second.avatar}
                      </span>
                      {/* Super-Sized Solid White Name Plaque */}
                      <div className="bg-white text-slate-950 font-black text-2xl sm:text-3xl px-8 py-3 rounded-2xl shadow-2xl border-2 border-slate-200 border-b-[6px] border-b-slate-300 truncate max-w-[280px] text-center">
                        {second.nickname}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-32 flex items-center justify-center">
                      <div className="w-18 h-18 rounded-3xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-slate-300 font-black text-4xl animate-bounce shadow-2xl">
                        ?
                      </div>
                    </div>
                  )}
                </div>

                {/* 2nd Giant Dark Navy Solid Pillar (390px) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "390px" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="w-full bg-[#1D083E] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-6 border-2 border-[#240B4D] border-b-[8px] border-b-[#130526] relative"
                >
                  {/* Silver Giant Shield */}
                  <div className="relative mb-3 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-20 h-22 fill-[#94A3B8] filter drop-shadow-lg">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#CBD5E1" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-4xl text-white">
                      2
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p2Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center mt-2 flex-shrink-0"
                    >
                      <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight block">
                        {second.score.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-sm font-black uppercase text-slate-300 tracking-wider mt-1.5 block bg-[#240B4D] px-3 py-1 rounded-full border border-slate-500/30">
                        {second.correctCount ?? 0} out of {totalQ}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* 1ST PLACE (GOLD CHAMPION) - Tallest Center Pillar (470px) */}
            {/* ========================================================================= */}
            {p1Pillar && first && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 120 }}
                animate={{
                  opacity: 1,
                  scale: 1.3,
                  x: 0,
                  y: 0,
                  zIndex: 40,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute flex flex-col items-center w-[330px] sm:w-[360px] bottom-0"
              >
                {/* Floating White Name Box + Champion Avatar & Crown */}
                <div className="h-52 flex flex-col items-center justify-end mb-3 relative">
                  {p1Details ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 15 }}
                      className="flex flex-col items-center relative"
                    >
                      {/* Floating Gold Crown */}
                      <motion.div
                        animate={{ y: [-6, 6, -6], rotate: [-4, 4, -4] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        className="absolute -top-16 text-[#FFA602]"
                      >
                        <Crown className="w-20 h-20 fill-[#FFA602] stroke-amber-200 drop-shadow-2xl" />
                      </motion.div>

                      <span className="text-8xl sm:text-9xl md:text-[105px] mb-2 mt-4 filter drop-shadow-lg select-none">
                        {first.avatar}
                      </span>

                      {/* Giant Solid White Name Plaque */}
                      <div className="bg-white text-slate-950 font-black text-3xl sm:text-4xl px-10 py-3.5 rounded-3xl shadow-2xl border-2 border-amber-300 border-b-[8px] border-b-amber-400 truncate max-w-[320px] text-center">
                        {first.nickname}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-36 flex items-center justify-center">
                      <div className="w-22 h-22 rounded-3xl bg-[#33106B] border-4 border-yellow-400 flex items-center justify-center text-yellow-300 font-black text-5xl animate-bounce shadow-2xl">
                        ?
                      </div>
                    </div>
                  )}
                </div>

                {/* 1st Giant Dark Navy Solid Pillar (470px) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "470px" }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                  className="w-full bg-[#240B4D] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-6 border-2 border-[#33106B] border-b-[8px] border-b-[#1D083E] relative"
                >
                  {/* Gold Giant Shield */}
                  <div className="relative mb-3 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-22 h-24 fill-[#FFA602] filter drop-shadow-xl">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#FDE68A" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-5xl text-slate-950">
                      1
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p1Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center mt-2 flex-shrink-0"
                    >
                      <span className="text-4xl sm:text-5xl font-black text-yellow-300 tabular-nums tracking-tight block">
                        {first.score.toLocaleString()}
                      </span>
                      <span className="text-sm sm:text-base font-black uppercase text-yellow-400/90 tracking-wider mt-1.5 block bg-[#33106B] px-4 py-1 rounded-full border border-yellow-500/30">
                        {first.correctCount ?? 0} out of {totalQ}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Solid Complete Results Table View */
          <div className="w-full max-w-5xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[460px] overflow-y-auto border-2 border-slate-200 border-b-[8px] border-b-slate-300">
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
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
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
                    <span className="font-black text-lg text-slate-900">{p.nickname}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500">
                      {p.correctCount ?? 0}/{totalQ} correct
                    </span>
                    <span className="font-mono font-black text-xl text-slate-950">
                      {p.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. Empty bottom footer */}
      <footer className="h-6 z-10" />
    </div>
  );
}
