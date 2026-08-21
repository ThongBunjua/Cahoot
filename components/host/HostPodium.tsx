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
    // 1. Initial fanfare on mount (0.0s)
    sounds.playPodiumFanfare();

    // 2. 3rd Place Reveal (Starts at 1.2s)
    const t1 = setTimeout(() => {
      setP3Pillar(true);
      sounds.playPillarRiser();
    }, 1200);

    const t2 = setTimeout(() => {
      setP3Details(true);
      sounds.playWinCheer();
    }, 2200);

    // 3. 2nd Place Reveal (Starts at 3.8s)
    const t3 = setTimeout(() => {
      setP2Pillar(true);
      sounds.playPillarRiser();
    }, 3800);

    const t4 = setTimeout(() => {
      setP2Details(true);
      sounds.playWinCheer();
    }, 4800);

    // 4. 1st Place Suspense (Drumroll starts at 6.4s)
    const t5 = setTimeout(() => {
      setP1Pillar(true);
      setSpotlight(true);
      sounds.playDrumroll(2.6);
    }, 6400);

    // 5. 1st Place Champion Reveal (At 9.0s)
    const t6 = setTimeout(() => {
      setP1Details(true);
      setTriggerConfetti(true);
      sounds.playChampionReveal();
    }, 9000);

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

      {/* Full-Stage Ambient Dimming when Spotlight is active */}
      <AnimatePresence>
        {spotlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-20 pointer-events-none bg-[#0e041d]/70 backdrop-blur-[1.5px]"
          />
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
      {/* 2. MAIN STAGE: 3-COLUMN OLYMPIC PODIUM WITH ANCHORED SPOTLIGHT */}
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
        <div className="flex-1 flex flex-col justify-end items-center relative z-20 pb-1 overflow-visible">
          {/* 3-Column Olympic Podium Layout: Column 1 = 2nd (Silver), Column 2 = 1st (Gold), Column 3 = 3rd (Bronze) */}
          <div className="w-full max-w-6xl mx-auto flex-1 flex items-end justify-center gap-3 sm:gap-6 md:gap-8 pb-1 relative z-10">
            {/* ========================================================================= */}
            {/* COLUMN 1: 2ND PLACE (SILVER) - Left Slot */}
            {/* ========================================================================= */}
            <div className="w-[240px] sm:w-[280px] md:w-[320px] flex flex-col items-center justify-end z-20">
              {second && p2Pillar ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Floating White Name Box + Avatar */}
                  <div className="h-44 flex flex-col items-center justify-end mb-2.5">
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
                        <div className="bg-white text-slate-950 font-black text-xl sm:text-2xl px-6 py-2.5 rounded-2xl shadow-xl border-2 border-slate-200 border-b-[5px] border-b-slate-400 truncate max-w-[240px] text-center">
                          {second.nickname}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#240B4D] border-2 border-[#1D083E] flex items-center justify-center text-3xl font-black text-yellow-300 animate-pulse shadow-lg">
                        ?
                      </div>
                    )}
                  </div>

                  {/* 2nd Pillar (350px) */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "350px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full bg-[#1D083E] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-5 border-2 border-[#240B4D] border-b-[8px] border-b-[#130526] relative"
                  >
                    {/* Silver Shield */}
                    <div className="relative mb-3 flex-shrink-0">
                      <svg viewBox="0 0 100 110" className="w-18 h-20 fill-[#94A3B8] filter drop-shadow-lg">
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
                        <span className="text-xs font-black uppercase text-slate-300 tracking-wider mt-1 block bg-[#240B4D] px-3 py-0.5 rounded-full border border-slate-500/30">
                          {second.correctCount ?? 0} out of {totalQ}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <div className="w-full h-0" />
              )}
            </div>

            {/* ========================================================================= */}
            {/* COLUMN 2: 1ST PLACE (GOLD CHAMPION) - Center Slot (Anchored Spotlight!) */}
            {/* ========================================================================= */}
            <div className="w-[280px] sm:w-[340px] md:w-[390px] flex flex-col items-center justify-end z-30 relative">
              {/* SPOTLIGHT ANCHORED DIRECTLY TO 1ST PLACE CENTER COLUMN (100% Guaranteed Alignment) */}
              <AnimatePresence>
                {spotlight && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    {/* Direct Overhead Spotlight Cone */}
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0.3 }}
                      animate={{ opacity: 0.85, scaleY: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                      className="absolute -top-[55vh] left-1/2 -translate-x-1/2 w-[520px] sm:w-[680px] h-[130vh] origin-top pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(254, 240, 138, 0.35) 40%, rgba(250, 204, 21, 0.12) 75%, transparent 100%)",
                        clipPath: "polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)",
                      }}
                    />

                    {/* Glowing Circular Spotlight Disk Anchored directly over 1st Place Avatar / Plaque */}
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="absolute top-[-30px] sm:top-[-45px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] sm:w-[560px] md:w-[640px] h-[460px] sm:h-[560px] md:h-[640px] rounded-full border-4 border-yellow-200/70 shadow-[0_0_100px_35px_rgba(255,255,255,0.4),_inset_0_0_70px_rgba(255,255,255,0.35)] flex items-center justify-center pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255, 255, 255, 0.42) 0%, rgba(254, 240, 138, 0.3) 45%, rgba(250, 204, 21, 0.12) 75%, transparent 100%)",
                      }}
                    >
                      <motion.div
                        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                        className="w-3/4 h-3/4 rounded-full bg-white/20 blur-xl"
                      />
                    </motion.div>

                    {/* Floor Spotlight Disk at base of 1st place pillar */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{
                        opacity: [0.7, 1, 0.85],
                        scale: [0.96, 1.04, 0.98],
                      }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] sm:w-[580px] h-[140px] sm:h-[180px] rounded-[100%] bg-amber-400/30 border-2 border-yellow-300/60 blur-xl shadow-[0_0_90px_rgba(251,191,36,0.7)]"
                    />
                  </div>
                )}
              </AnimatePresence>

              {first && p1Pillar ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 60 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Floating White Name Box + Champion Avatar & Crown */}
                  <div className="h-56 flex flex-col items-center justify-end mb-3.5 relative">
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
                          className="mb-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 px-6 py-1 rounded-full border-2 border-yellow-200 shadow-[0_6px_20px_rgba(251,191,36,0.6)] flex-shrink-0"
                        >
                          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] block leading-none">
                            Grand Champion
                          </span>
                        </motion.div>

                        {/* Floating Gold Crown */}
                        <motion.div
                          animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                          className="text-[#FFA602] mb-1"
                        >
                          <Crown className="w-14 h-14 fill-[#FFA602] stroke-amber-200 drop-shadow-xl" />
                        </motion.div>

                        <span className="text-7xl sm:text-8xl mb-2 filter drop-shadow-lg select-none leading-none">
                          {first.avatar}
                        </span>

                        {/* Giant Solid White Name Plaque */}
                        <div className="bg-white text-slate-950 font-black text-2xl sm:text-3xl px-8 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 border-b-[6px] border-b-amber-400 truncate max-w-[290px] text-center">
                          {first.nickname}
                        </div>
                      </motion.div>
                    ) : (
                      /* Clean Glowing Suspense with Royal Centered Crown + '?' + Badge */
                      <div className="h-52 flex flex-col items-center justify-center relative pb-3">
                        {/* Floating Golden Crown on Top */}
                        <motion.div
                          animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                          className="text-[#FFA602] mb-2 drop-shadow-[0_8px_20px_rgba(255,166,2,0.85)]"
                        >
                          <Crown className="w-16 h-16 fill-[#FFA602] stroke-yellow-200" />
                        </motion.div>

                        {/* Giant Centered Gold Question Mark */}
                        <span className="text-8xl sm:text-9xl font-black text-yellow-300 animate-pulse drop-shadow-[0_0_35px_rgba(250,204,21,0.95)] leading-none my-1">
                          ?
                        </span>

                        {/* Golden Subtitle Badge */}
                        <div className="bg-[#33106B]/90 backdrop-blur-md border-2 border-yellow-400/60 px-5 py-1.5 rounded-full shadow-lg mt-2">
                          <span className="text-xs sm:text-sm uppercase tracking-widest font-black text-yellow-300 block leading-none">
                            1st Place • Grand Champion
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1st Center Pillar (Taller 470px) */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "470px" }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="w-full bg-[#240B4D] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-6 border-2 border-[#33106B] border-b-[8px] border-b-[#1D083E] relative"
                  >
                    {/* Gold Shield */}
                    <div className="relative mb-3 flex-shrink-0">
                      <svg viewBox="0 0 100 110" className="w-20 h-22 fill-[#FFA602] filter drop-shadow-xl">
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
                        <span className="text-xs sm:text-sm font-black uppercase text-yellow-300 tracking-wider mt-1.5 block bg-[#1D083E] px-3.5 py-1 rounded-full border border-yellow-500/40 shadow-inner">
                          {first.correctCount ?? 0} out of {totalQ}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <div className="w-full h-0" />
              )}
            </div>

            {/* ========================================================================= */}
            {/* COLUMN 3: 3RD PLACE (BRONZE) - Right Slot */}
            {/* ========================================================================= */}
            <div className="w-[240px] sm:w-[280px] md:w-[320px] flex flex-col items-center justify-end z-20">
              {third && p3Pillar ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Floating White Name Box + Avatar */}
                  <div className="h-44 flex flex-col items-center justify-end mb-2.5">
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
                        <div className="bg-white text-slate-950 font-black text-xl sm:text-2xl px-6 py-2.5 rounded-2xl shadow-xl border-2 border-slate-200 border-b-[5px] border-b-amber-700 truncate max-w-[240px] text-center">
                          {third.nickname}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#240B4D] border-2 border-[#1D083E] flex items-center justify-center text-3xl font-black text-yellow-300 animate-pulse shadow-lg">
                        ?
                      </div>
                    )}
                  </div>

                  {/* 3rd Pillar (270px) */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "270px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full bg-[#1D083E] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 pb-5 border-2 border-[#240B4D] border-b-[8px] border-b-[#130526] relative"
                  >
                    {/* Bronze Shield */}
                    <div className="relative mb-3 flex-shrink-0">
                      <svg viewBox="0 0 100 110" className="w-18 h-20 fill-[#CD7F32] filter drop-shadow-lg">
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
                        <span className="text-xs font-black uppercase text-amber-200 tracking-wider mt-1 block bg-[#240B4D] px-3 py-0.5 rounded-full border border-amber-500/30">
                          {third.correctCount ?? 0} out of {totalQ}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <div className="w-full h-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
