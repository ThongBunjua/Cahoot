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
  // Cinema Stages (Center-Shift Focus):
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
  const totalQ = quiz.questions.length;

  useEffect(() => {
    // ----------------------------------------------------
    // STEP 1: 3RD PLACE in CENTER with Drumroll Suspense
    // ----------------------------------------------------
    const t3Pillar = setTimeout(() => {
      setP3Pillar(true);
      sounds.playDrumroll(1.4);
    }, 600);

    const t3Details = setTimeout(() => {
      setP3Details(true);
      sounds.playCorrect();
      sounds.playCrowdCheer(1.8);
    }, 2000);

    // ----------------------------------------------------
    // STEP 2: 3RD moves RIGHT, 2ND in CENTER with Drumroll Suspense
    // ----------------------------------------------------
    const t2Pillar = setTimeout(() => {
      setP2Pillar(true);
      sounds.playDrumroll(1.5);
    }, 4600);

    const t2Details = setTimeout(() => {
      setP2Details(true);
      sounds.playCorrect();
      sounds.playCrowdCheer(2.2);
    }, 6200);

    // ----------------------------------------------------
    // STEP 3: 2ND moves LEFT, 1ST in CENTER with Spotlight & Grand Drumroll
    // ----------------------------------------------------
    const tSpot = setTimeout(() => {
      setSpotlight(true);
      sounds.playDrumroll(3.1); // Intense 3-second drumroll building maximum tension!
    }, 8600);

    const t1Pillar = setTimeout(() => {
      setP1Pillar(true);
    }, 9600);

    const t1Details = setTimeout(() => {
      setP1Details(true);
      setSpotlight(false);
      setCelebrateAll(true);
      setTriggerConfetti(true);
      sounds.playChampionReveal(); // Fanfare + Fireworks Booms + Roaring Stadium Crowd Cheers & Applause!
    }, 11800);

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
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* Confetti Cascade on Champion Finale */}
      <ConfettiEffect trigger={triggerConfetti} duration={14000} />

      {/* ========================================================================= */}
      {/* DYNAMIC SWEEPING SPOTLIGHT BEAM */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {spotlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start bg-black/85 overflow-hidden"
          >
            <motion.div
              initial={{ y: -180, scale: 0.4, opacity: 0 }}
              animate={{ y: 130, scale: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="w-[560px] h-[560px] sm:w-[720px] sm:h-[720px] rounded-full bg-white/20 shadow-[0_0_200px_rgba(255,255,255,0.75)] border-4 border-white/40 flex flex-col items-center justify-start pt-12"
            >
              <span className="text-3xl sm:text-5xl font-black text-yellow-300 uppercase tracking-widest animate-pulse drop-shadow-2xl">
                Grand Champion
              </span>
            </motion.div>
          </motion.div>
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
      {/* 2. MAIN SUPER-SIZED PODIUM STAGE (Commanding Presence for Top 3 Winners) */}
      {/* ========================================================================= */}
      <main className="relative z-35 flex-1 my-1 flex flex-col items-center justify-end pb-6 sm:pb-10 w-full max-w-[96vw] mx-auto overflow-visible">
        {!showFullScoreboard ? (
          <div className="relative flex items-end justify-center w-full h-[640px] sm:h-[680px] max-w-6xl mx-auto overflow-visible">
            {/* ========================================================================= */}
            {/* 3RD PLACE (BRONZE) - Super-Sized & Tall (min-h-[320px]) */}
            {/* ========================================================================= */}
            {p3Pillar && third && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 120 }}
                animate={{
                  opacity: p2Pillar ? 0.9 : 1,
                  scale: p2Pillar ? 0.95 : 1.15,
                  x: p2Pillar ? 310 : 0,
                  y: 0, // Explicit y: 0
                  zIndex: p2Pillar ? 15 : 35,
                }}
                transition={{ type: "spring", stiffness: 190, damping: 22 }}
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
                      <div className="w-16 h-16 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-amber-300 font-black text-3xl animate-pulse">
                        ?
                      </div>
                    </div>
                  )}
                </div>

                {/* 3rd Giant Dark Navy Solid Pillar (Extra Tall 320px) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "320px" }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="w-full bg-[#1D083E] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-6 border-2 border-[#240B4D] border-b-[8px] border-b-[#130526] relative"
                >
                  {/* Bronze Giant Pentagon Shield */}
                  <div className="relative mb-3 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-20 h-22 fill-[#D97706] filter drop-shadow-lg">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#FDE68A" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-4xl text-white">
                      3
                    </span>
                  </div>

                  {/* Score & Correct Count (Fully Elevated, Never Cut Off) */}
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
            {/* 2ND PLACE (SILVER) - Super-Sized & Tall (min-h-[390px]) */}
            {/* ========================================================================= */}
            {p2Pillar && second && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 120 }}
                animate={{
                  opacity: p1Pillar ? 0.9 : 1,
                  scale: p1Pillar ? 0.95 : 1.15,
                  x: p1Pillar ? -310 : 0,
                  y: 0, // Explicit y: 0
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
                      <div className="w-16 h-16 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-slate-300 font-black text-3xl animate-pulse">
                        ?
                      </div>
                    </div>
                  )}
                </div>

                {/* 2nd Giant Dark Navy Solid Pillar (Extra Tall 390px) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "390px" }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="w-full bg-[#1D083E] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-6 border-2 border-[#240B4D] border-b-[8px] border-b-[#130526] relative"
                >
                  {/* Silver Giant Pentagon Shield */}
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
            {/* 1ST PLACE (GOLD CHAMPION) - Super-Sized & Tall (min-h-[470px]) */}
            {/* ========================================================================= */}
            {p1Pillar && first && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 120 }}
                animate={{
                  opacity: 1,
                  scale: 1.3,
                  x: 0,
                  y: 0, // Explicit y: 0
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
                      <div className="w-20 h-20 rounded-2xl bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center text-yellow-400 font-black text-4xl animate-pulse">
                        👑 ?
                      </div>
                    </div>
                  )}
                </div>

                {/* 1st Giant Dark Navy Solid Pillar (Tallest in Center - 470px) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "470px" }}
                  transition={{ duration: 0.95, ease: "easeOut" }}
                  className="w-full bg-[#240B4D] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-6 border-2 border-[#33106B] border-b-[8px] border-b-[#1D083E] relative"
                >
                  {/* Gold Giant Pentagon Shield */}
                  <div className="relative mb-3 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-22 h-24 fill-[#FFA602] filter drop-shadow-xl">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#FDE68A" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-5xl text-slate-950">
                      1
                    </span>
                  </div>

                  {/* Score & Correct Count (Fully Elevated, Never Cut Off) */}
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
      {/* 3. BOTTOM FINALE CONTROLS: Extra-Tall Play Again Button */}
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
              className="px-16 py-6 min-h-[82px] bg-[#26890C] hover:bg-[#22790A] text-white font-black text-2xl sm:text-3xl rounded-3xl shadow-2xl flex items-center gap-4 transition-all cursor-pointer border-b-[8px] border-[#165406] active:border-b-[2px] active:translate-y-1.5"
            >
              <RotateCcw className="w-8 h-8 stroke-[3]" />
              <span>Play Again</span>
            </motion.button>
          </motion.div>
        )}
      </footer>
    </div>
  );
}
