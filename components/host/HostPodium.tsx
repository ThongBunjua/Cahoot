"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quiz, Player } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";
import { sounds } from "@/lib/audio/soundManager";
import { Trophy, Crown, RotateCcw, LogOut, Sparkles, ListOrdered } from "lucide-react";
import Link from "next/link";

interface HostPodiumProps {
  quiz: Quiz;
  players?: Player[];
  finalPlayers?: Player[];
  onPlayAgain?: () => void;
  onEndGame?: () => void;
}

export function HostPodium({
  quiz,
  players,
  finalPlayers,
  onPlayAgain,
  onEndGame,
}: HostPodiumProps) {
  const allPlayers = finalPlayers || players || [];
  // Sort players by score descending
  const sorted = [...allPlayers].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  const [p3Pillar, setP3Pillar] = useState(false);
  const [p3Details, setP3Details] = useState(false);

  const [p2Pillar, setP2Pillar] = useState(false);
  const [p2Details, setP2Details] = useState(false);

  const [p1Pillar, setP1Pillar] = useState(false);
  const [p1Details, setP1Details] = useState(false);

  const [spotlight, setSpotlight] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [showFullScoreboard, setShowFullScoreboard] = useState(false);

  useEffect(() => {
    // 1. Initial fanfare on mount
    sounds.playPodiumFanfare();

    // Tightened, Snappy Suspense Delays (Reduced down for smooth, non-boring reveal)
    // 2. 3rd Place Reveal (Starts at 0.5s)
    const t1 = setTimeout(() => {
      setP3Pillar(true);
      sounds.playPillarRiser();
    }, 500);

    const t2 = setTimeout(() => {
      setP3Details(true);
      sounds.playClick();
    }, 1100);

    // 3. 2nd Place Reveal (Starts at 1.9s)
    const t3 = setTimeout(() => {
      setP2Pillar(true);
      sounds.playPillarRiser();
    }, 1900);

    const t4 = setTimeout(() => {
      setP2Details(true);
      sounds.playClick();
    }, 2500);

    // 4. 1st Place Suspense (Drumroll starts at 3.3s)
    const t5 = setTimeout(() => {
      setP1Pillar(true);
      setSpotlight(true);
      sounds.playDrumroll(2.2);
    }, 3300);

    // 5. 1st Place Champion Reveal (At 5.5s)
    const t6 = setTimeout(() => {
      setP1Details(true);
      setTriggerConfetti(true);
      sounds.playChampionReveal();
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      sounds.stopQuestionMusic();
    };
  }, []);

  const totalQ = quiz.questions?.length || 0;

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* Confetti Cascade on Champion Finale */}
      <ConfettiEffect trigger={triggerConfetti} duration={16000} />

      {/* ========================================================================= */}
      {/* CINEMATIC SPOTLIGHT LIGHTING: 2 ICONIC SIDE BEAMS + STAGE FLOOR DISK */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {spotlight && (
          <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
            {/* 1. Left Golden Spotlight Cone */}
            <motion.div
              initial={{ opacity: 0, rotate: -30, scaleY: 0.4 }}
              animate={{ opacity: [0, 0.75, 0.55], rotate: -16, scaleY: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -top-24 left-1/4 w-[320px] sm:w-[480px] h-[130vh] bg-gradient-to-b from-[#FFA602]/40 via-amber-500/15 to-transparent blur-3xl origin-top"
              style={{ clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)" }}
            />

            {/* 2. Right Violet-Gold Spotlight Cone */}
            <motion.div
              initial={{ opacity: 0, rotate: 30, scaleY: 0.4 }}
              animate={{ opacity: [0, 0.75, 0.55], rotate: 16, scaleY: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -top-24 right-1/4 w-[320px] sm:w-[480px] h-[130vh] bg-gradient-to-b from-yellow-300/40 via-purple-500/15 to-transparent blur-3xl origin-top"
              style={{ clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)" }}
            />

            {/* 3. Glowing Circular Stage Floor Spotlight (วงกลมแสงไฟส่องพื้นเวทีอันดับ 1) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: [0.7, 1, 0.85],
                scale: [0.96, 1.04, 0.98],
              }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[520px] sm:w-[620px] h-[160px] sm:h-[200px] rounded-[100%] bg-amber-400/25 border-2 border-yellow-300/50 blur-xl shadow-[0_0_80px_rgba(251,191,36,0.6)]"
            />
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH CONTROLS */}
      {/* ========================================================================= */}
      <header className="relative z-50 flex items-center justify-between bg-[#33106B] px-5 sm:px-7 py-3 rounded-2xl border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-2xl w-full max-w-[96vw] mx-auto mb-1 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FFA602] border-b-4 border-[#CC8400] rounded-xl text-slate-950 shadow-sm flex-shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-yellow-400 block leading-none">
              Grand Finale • {quiz.title}
            </span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight mt-0.5">
              Final Podium
            </h1>
          </div>
        </div>

        {/* Action Controls: Audio, Full Scoreboard, Play Again, End Game */}
        <div className="flex items-center gap-2.5">
          <AudioControl />

          <button
            onClick={() => setShowFullScoreboard(!showFullScoreboard)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#240B4D] hover:bg-[#1D083E] text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 border-2 border-[#1D083E] border-b-4 border-black cursor-pointer active:border-b-2 active:translate-y-0.5"
          >
            <ListOrdered className="w-4 h-4" />
            <span>{showFullScoreboard ? "Podium" : "Scoreboard"}</span>
          </button>

          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#26890C] hover:bg-[#22790A] text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 border-2 border-[#1D6B09] border-b-4 border-[#124206] cursor-pointer shadow-lg active:border-b-2 active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          )}

          {onEndGame ? (
            <button
              onClick={onEndGame}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 border-2 border-red-700 border-b-4 border-red-950 cursor-pointer shadow-lg active:border-b-2 active:translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
              <span>End Game</span>
            </button>
          ) : (
            <Link
              href="/quizzes"
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 border-2 border-red-700 border-b-4 border-red-950 shadow-lg active:border-b-2 active:translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit</span>
            </Link>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN STAGE: 3D PODIUM OR FULL SCOREBOARD */}
      {/* ========================================================================= */}
      {showFullScoreboard ? (
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center py-4 z-30">
          <div className="bg-[#33106B] rounded-3xl p-6 border-2 border-[#240B4D] border-b-[8px] border-b-[#1D083E] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            <h2 className="text-xl font-black text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>All Players Final Scoreboard ({sorted.length})</span>
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2.5">
              {sorted.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                    idx === 0
                      ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-yellow-400/60"
                      : idx === 1
                      ? "bg-slate-500/20 border-slate-300/40"
                      : idx === 2
                      ? "bg-amber-700/20 border-amber-500/40"
                      : "bg-[#240B4D] border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        idx === 0
                          ? "bg-yellow-400 text-slate-950 shadow"
                          : idx === 1
                          ? "bg-slate-300 text-slate-950"
                          : idx === 2
                          ? "bg-amber-600 text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="font-black text-base text-white">{player.nickname}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-yellow-400 tabular-nums">
                      {player.score.toLocaleString()} pts
                    </span>
                    <span className="text-xs text-slate-300 block font-bold">
                      {player.correctCount ?? 0}/{totalQ} correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-end items-center relative z-20 pb-4 overflow-visible">
          {/* Central 3-Pillar Olympic Stage */}
          <div className="relative w-full max-w-5xl flex-1 flex items-end justify-center pb-2 z-10">
            {/* ========================================================================= */}
            {/* 3RD PLACE (BRONZE) - Pillar (230px) */}
            {/* ========================================================================= */}
            {p3Pillar && third && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 100 }}
                animate={{
                  opacity: p1Pillar ? 0.92 : 1,
                  scale: p1Pillar ? 0.95 : 1.05,
                  x: p1Pillar ? 280 : 0,
                  y: 0,
                  zIndex: p1Pillar ? 10 : 30,
                }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                className="absolute flex flex-col items-center w-[260px] sm:w-[280px] bottom-0"
              >
                {/* Floating White Name Box + Avatar */}
                <div className="h-40 flex flex-col items-center justify-end mb-2">
                  {p3Details ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 25 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-6xl sm:text-7xl mb-1.5 filter drop-shadow-md select-none">
                        {third.avatar}
                      </span>
                      {/* Solid White Name Plaque */}
                      <div className="bg-white text-slate-950 font-black text-xl sm:text-2xl px-6 py-2 rounded-2xl shadow-xl border-2 border-slate-200 border-b-[5px] border-b-amber-700 truncate max-w-[240px] text-center">
                        {third.nickname}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#240B4D] border-2 border-[#1D083E] flex items-center justify-center text-3xl font-black text-yellow-300 animate-pulse shadow-lg">
                      ?
                    </div>
                  )}
                </div>

                {/* 3rd Pillar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "230px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full bg-[#1D083E] rounded-t-2xl shadow-2xl flex flex-col items-center justify-start pt-5 pb-5 border-2 border-[#240B4D] border-b-[6px] border-b-[#130526] relative"
                >
                  {/* Bronze Shield */}
                  <div className="relative mb-2 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-16 h-18 fill-[#CD7F32] filter drop-shadow-lg">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#FDE68A" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-3xl text-white">
                      3
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p3Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center mt-1 flex-shrink-0"
                    >
                      <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight block">
                        {third.score.toLocaleString()}
                      </span>
                      <span className="text-xs font-black uppercase text-amber-200 tracking-wider mt-1 block bg-[#240B4D] px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        {third.correctCount ?? 0} out of {totalQ}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* 2ND PLACE (SILVER) - Pillar (310px) */}
            {/* ========================================================================= */}
            {p2Pillar && second && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 100 }}
                animate={{
                  opacity: p1Pillar ? 0.92 : 1,
                  scale: p1Pillar ? 0.95 : 1.08,
                  x: p1Pillar ? -280 : 0,
                  y: 0,
                  zIndex: p1Pillar ? 15 : 35,
                }}
                transition={{ type: "spring", stiffness: 190, damping: 22 }}
                className="absolute flex flex-col items-center w-[260px] sm:w-[280px] bottom-0"
              >
                {/* Floating White Name Box + Avatar */}
                <div className="h-40 flex flex-col items-center justify-end mb-2">
                  {p2Details ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 25 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-6xl sm:text-7xl mb-1.5 filter drop-shadow-md select-none">
                        {second.avatar}
                      </span>
                      {/* Solid White Name Plaque */}
                      <div className="bg-white text-slate-950 font-black text-xl sm:text-2xl px-6 py-2 rounded-2xl shadow-xl border-2 border-slate-200 border-b-[5px] border-b-slate-400 truncate max-w-[240px] text-center">
                        {second.nickname}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#240B4D] border-2 border-[#1D083E] flex items-center justify-center text-3xl font-black text-yellow-300 animate-pulse shadow-lg">
                      ?
                    </div>
                  )}
                </div>

                {/* 2nd Pillar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "310px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full bg-[#1D083E] rounded-t-2xl shadow-2xl flex flex-col items-center justify-start pt-5 pb-5 border-2 border-[#240B4D] border-b-[6px] border-b-[#130526] relative"
                >
                  {/* Silver Shield */}
                  <div className="relative mb-2 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-16 h-18 fill-[#94A3B8] filter drop-shadow-lg">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#CBD5E1" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-3xl text-white">
                      2
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p2Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center mt-1 flex-shrink-0"
                    >
                      <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight block">
                        {second.score.toLocaleString()}
                      </span>
                      <span className="text-xs font-black uppercase text-slate-300 tracking-wider mt-1 block bg-[#240B4D] px-2.5 py-0.5 rounded-full border border-slate-500/30">
                        {second.correctCount ?? 0} out of {totalQ}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* 1ST PLACE (GOLD CHAMPION) - Center Tallest Pillar (390px) */}
            {/* ========================================================================= */}
            {p1Pillar && first && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 100 }}
                animate={{
                  opacity: 1,
                  scale: 1.04,
                  x: 0,
                  y: 0,
                  zIndex: 40,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute flex flex-col items-center w-[290px] sm:w-[320px] bottom-0"
              >
                {/* Floating White Name Box + Champion Avatar & Crown */}
                <div className="h-52 flex flex-col items-center justify-end mb-4 relative z-30">
                  {/* FOCUSED CIRCULAR SPOTLIGHT RING (ไฟวงกลมส่องเน้นเฉพาะ Grand Champion ตรงกลาง) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{
                      opacity: [0.85, 1, 0.85],
                      scale: [0.98, 1.06, 0.98],
                    }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full bg-gradient-to-b from-yellow-300/40 via-amber-400/25 to-yellow-500/10 blur-2xl border-4 border-yellow-300/40 shadow-[0_0_100px_rgba(250,204,21,0.75)] pointer-events-none -z-10"
                  />

                  {p1Details ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 15 }}
                      className="flex flex-col items-center relative pb-2"
                    >
                      {/* Grand Champion Glowing Gold Banner */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="mb-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 px-5 py-1 rounded-full border-2 border-yellow-200 shadow-[0_6px_20px_rgba(251,191,36,0.6)] flex-shrink-0"
                      >
                        <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] block leading-none">
                          Grand Champion
                        </span>
                      </motion.div>

                      {/* Floating Gold Crown */}
                      <motion.div
                        animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        className="text-[#FFA602] mb-1"
                      >
                        <Crown className="w-12 h-12 fill-[#FFA602] stroke-amber-200 drop-shadow-xl" />
                      </motion.div>

                      <span className="text-7xl sm:text-8xl mb-2 filter drop-shadow-lg select-none leading-none">
                        {first.avatar}
                      </span>

                      {/* Giant Solid White Name Plaque */}
                      <div className="bg-white text-slate-950 font-black text-2xl sm:text-3xl px-8 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-300 border-b-[6px] border-b-amber-400 truncate max-w-[280px] text-center">
                        {first.nickname}
                      </div>
                    </motion.div>
                  ) : (
                    /* Clean Glowing Suspense with Royal Centered Crown + '?' + Badge (With generous headroom) */
                    <div className="h-50 flex flex-col items-center justify-center relative pb-3">
                      {/* Floating Golden Crown on Top */}
                      <motion.div
                        animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        className="text-[#FFA602] mb-1.5 drop-shadow-[0_8px_20px_rgba(255,166,2,0.85)]"
                      >
                        <Crown className="w-14 h-14 sm:w-16 sm:h-16 fill-[#FFA602] stroke-yellow-200" />
                      </motion.div>

                      {/* Giant Centered Gold Question Mark */}
                      <span className="text-7xl sm:text-8xl font-black text-yellow-300 animate-pulse drop-shadow-[0_0_30px_rgba(250,204,21,0.95)] leading-none my-1">
                        ?
                      </span>

                      {/* Golden Subtitle Badge (Elevated with clear space above the pillar) */}
                      <div className="bg-[#33106B]/90 backdrop-blur-md border-2 border-yellow-400/60 px-4 py-1 rounded-full shadow-lg mt-2">
                        <span className="text-[11px] sm:text-xs uppercase tracking-widest font-black text-yellow-300 block leading-none">
                          1st Place • Grand Champion
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1st Center Pillar (390px) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "390px" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="w-full bg-[#240B4D] rounded-t-2xl shadow-2xl flex flex-col items-center justify-start pt-5 pb-5 border-2 border-[#33106B] border-b-[6px] border-b-[#1D083E] relative"
                >
                  {/* Gold Shield */}
                  <div className="relative mb-2 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-18 h-20 fill-[#FFA602] filter drop-shadow-xl">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#FDE68A" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-4xl text-slate-950">
                      1
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p1Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center mt-1 flex-shrink-0"
                    >
                      <span className="text-3xl sm:text-4xl font-black text-[#FFA602] tabular-nums tracking-tight block drop-shadow-md">
                        {first.score.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-sm font-black uppercase text-yellow-300 tracking-wider mt-1 block bg-[#1D083E] px-3 py-1 rounded-full border border-yellow-500/40 shadow-inner">
                        {first.correctCount ?? 0} out of {totalQ}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
