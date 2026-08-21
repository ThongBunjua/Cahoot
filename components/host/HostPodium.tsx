"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quiz, Player } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";
import { sounds } from "@/lib/audio/soundManager";
import { Trophy, Crown, RotateCcw, LogOut, Sparkles, ListOrdered, ChevronRight, Award } from "lucide-react";
import Link from "next/link";

interface HostPodiumProps {
  quiz: Quiz;
  players?: Player[];
  finalPlayers?: Player[];
  onPlayAgain?: () => void;
  onEndGame?: () => void;
}

// Particle Sparkles Generator for Podium Ranks
function RankParticles({
  color,
  count = 20,
  spread = 150,
}: {
  color: "gold" | "silver" | "bronze";
  count?: number;
  spread?: number;
}) {
  const colorMap = {
    gold: ["bg-yellow-300", "bg-amber-400", "bg-amber-200", "bg-white", "bg-yellow-200"],
    silver: ["bg-slate-200", "bg-cyan-200", "bg-slate-300", "bg-white", "bg-sky-300"],
    bronze: ["bg-amber-500", "bg-orange-400", "bg-amber-300", "bg-amber-600", "bg-yellow-400"],
  };
  const colors = colorMap[color];

  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI;
    const distance = 45 + (i % 3) * (spread / 3) + Math.sin(i * 1.5) * 25;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const size = 6 + (i % 4) * 3;
    const duration = 1.3 + (i % 3) * 0.4;
    const delay = (i % 5) * 0.15;
    const col = colors[i % colors.length];

    return (
      <motion.div
        key={i}
        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
        animate={{
          x: [0, x, x * 1.15],
          y: [0, y, y - 30],
          scale: [0, 1.4, 0],
          opacity: [1, 1, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatDelay: 0.2 + (i % 4) * 0.2,
          ease: "easeOut",
        }}
        className={`absolute rounded-full pointer-events-none ${col} shadow-[0_0_15px_rgba(255,255,255,0.9)]`}
        style={{
          width: size,
          height: size,
          left: "50%",
          top: "50%",
        }}
      />
    );
  });

  return <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">{particles}</div>;
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

  // Manual Reveal Stages:
  // 0 = Initial Screen (All pillars ready at baseline)
  // 1 = 3rd Place rises in Center -> Reveals details
  // 2 = 3rd Place moves to Right, 2nd Place rises in Center -> Reveals details
  // 3 = 2nd Place moves to Left, 1st Place rises in Center with Dome Light -> Reveals Champion
  const [revealStep, setRevealStep] = useState<number>(0);
  const [p3Details, setP3Details] = useState(false);
  const [p2Details, setP2Details] = useState(false);
  const [p1Details, setP1Details] = useState(false);

  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [showFullScoreboard, setShowFullScoreboard] = useState(false);

  useEffect(() => {
    // Initial Opening Fanfare on mount
    sounds.playPodiumFanfare();
    return () => {
      sounds.stopQuestionMusic();
    };
  }, []);

  // Host Manual Next Reveal Step Controller (Slow Suspenseful Rise + Details Delayed)
  const handleNextReveal = () => {
    if (revealStep === 0) {
      if (third) {
        // Step 1: Reveal 3rd Place in Center
        setRevealStep(1);
        sounds.playPillarRiser();
        setTimeout(() => {
          setP3Details(true);
          sounds.playPodiumBronzeReveal();
        }, 1800);
      } else if (second) {
        // Only 2 players -> Go directly to 2nd place
        setRevealStep(2);
        sounds.playPillarRiser();
        setTimeout(() => {
          setP2Details(true);
          sounds.playPodiumSilverReveal();
        }, 1800);
      } else if (first) {
        // Only 1 player -> Go directly to 1st place
        setRevealStep(3);
        sounds.playDrumroll(2.4);
        setTimeout(() => {
          setP1Details(true);
          setTriggerConfetti(true);
          sounds.playChampionReveal();
        }, 2200);
      }
    } else if (revealStep === 1) {
      if (second) {
        // Step 2: 3rd moves right, 2nd rises in Center
        setRevealStep(2);
        sounds.playPillarRiser();
        setTimeout(() => {
          setP2Details(true);
          sounds.playPodiumSilverReveal();
        }, 1800);
      } else if (first) {
        setRevealStep(3);
        sounds.playDrumroll(2.4);
        setTimeout(() => {
          setP1Details(true);
          setTriggerConfetti(true);
          sounds.playChampionReveal();
        }, 2200);
      }
    } else if (revealStep === 2 && first) {
      // Step 3: 2nd moves left, 1st rises in Center with Grand Spotlight Dome & Drumroll
      setRevealStep(3);
      sounds.playDrumroll(2.4);
      // Wait for 1st pillar to rise (2.2s) before Grand Champion Explodes into view!
      setTimeout(() => {
        setP1Details(true);
        setTriggerConfetti(true);
        sounds.playChampionReveal();
      }, 2200);
    }
  };

  const totalQ = quiz.questions?.length || 0;

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-2 sm:p-4 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* Confetti Cascade on Champion Finale */}
      <ConfettiEffect trigger={triggerConfetti} duration={16000} />

      {/* ========================================================================= */}
      {/* GRAND KAHOOT CIRCULAR SPOTLIGHT DOME (Dead Center via margin, no transform conflicts!) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {revealStep >= 3 && (
          <>
            {/* 1. DEEP DARK STAGE DIMMING VIGNETTE (Solid, Sharp, 0% Blur, Smooth 2.0s Fade) */}
            <motion.div
              key="podium-dark-vignette"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.0, ease: "easeInOut" }}
              className="fixed inset-0 z-30 pointer-events-none"
              style={{
                backgroundColor: "rgba(5, 1, 16, 0.94)",
              }}
            />

            {/* 2. Compact Kahoot Circular Spotlight Dome (Delayed: Blooms into dark stage at 1.2s) */}
            {/* Using left:50% + negative margin instead of translateX to avoid Framer Motion transform override */}
            <motion.div
              key="podium-spotlight-dome"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                opacity: { duration: 1.2, delay: 1.2, ease: "easeOut" },
                scale: { duration: 1.2, delay: 1.2, ease: "easeOut" },
              }}
              className="fixed z-35 rounded-full border-4 border-yellow-200/70 pointer-events-none"
              style={{
                width: 460,
                height: 460,
                top: "18%",
                left: "50%",
                marginLeft: -230,
                boxShadow: "0 0 120px 45px rgba(255, 255, 255, 0.45), inset 0 0 80px rgba(255, 255, 255, 0.35)",
                background:
                  "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(254, 240, 138, 0.32) 45%, rgba(147, 51, 234, 0.12) 75%, transparent 100%)",
              }}
            >
              {/* Inner Soft Shimmering Core */}
              <motion.div
                animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.0, delay: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="w-3/4 h-3/4 rounded-full bg-white/20 blur-xl mx-auto mt-[12.5%]"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH CONTROLS & MANUAL REVEAL BUTTON */}
      {/* ========================================================================= */}
      <header className="relative z-50 flex items-center justify-between bg-[#33106B] px-4 sm:px-8 py-2.5 rounded-2xl border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-2xl w-full max-w-[98vw] mx-auto mb-1 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FFA602] border-b-4 border-[#CC8400] rounded-xl text-slate-950 shadow-sm flex-shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-yellow-400 block leading-none">
              Grand Finale • {quiz.title}
            </span>
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight mt-0.5">
              Final Podium
            </h1>
          </div>
        </div>

        {/* Action Controls: Audio, Scoreboard, MANUAL REVEAL BUTTON */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <AudioControl />

          <button
            onClick={() => setShowFullScoreboard(!showFullScoreboard)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#240B4D] hover:bg-[#1D083E] text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 border-2 border-[#1D083E] border-b-4 border-black cursor-pointer active:border-b-2 active:translate-y-0.5"
          >
            <ListOrdered className="w-4 h-4" />
            <span>{showFullScoreboard ? "Podium" : "Scoreboard"}</span>
          </button>

          {/* PRIMARY HOST MANUAL REVEAL BUTTON */}
          {revealStep < 3 ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleNextReveal}
              className="px-5 py-2 sm:px-7 sm:py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 rounded-xl text-sm sm:text-base font-black transition-all flex items-center gap-2 border-2 border-yellow-200 border-b-4 border-amber-700 shadow-[0_0_20px_rgba(251,191,36,0.6)] cursor-pointer active:border-b-2 active:translate-y-0.5 animate-pulse"
            >
              <Award className="w-5 h-5 text-slate-950" />
              <span>
                {revealStep === 0 && "Reveal 3rd Place 🥉"}
                {revealStep === 1 && "Reveal 2nd Place 🥈"}
                {revealStep === 2 && "Reveal 1st Place Champion 🏆"}
              </span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </motion.button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN STAGE: EXTRA-TALL 3-COLUMN GLIDING OLYMPIC PODIUM (Anchored Center!) */}
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
        <div className="flex-1 flex flex-col justify-end items-center relative z-10 pb-0 overflow-visible w-full">
          {/* Central Olympic Podium Anchor Container (Pinned Horizontally to 50% Center!) */}
          <div className="relative w-full max-w-7xl mx-auto flex-1 flex items-end justify-center pb-0 z-10 h-full">
            {/* ========================================================================= */}
            {/* 3RD PLACE (BRONZE) - Anchored at Left-1/2: Starts Center (x:0), Glides Right (x:370) */}
            {/* ========================================================================= */}
            {third && revealStep >= 1 && (
              <motion.div
                initial={{ x: "-50%", opacity: 0 }}
                animate={{
                  x: revealStep === 1 ? "-50%" : "calc(-50% + 370px)",
                  opacity: 1,
                  zIndex: revealStep === 1 ? 30 : 15,
                }}
                transition={{
                  x: { type: "spring", stiffness: 140, damping: 20, duration: 1.0 },
                  opacity: { duration: 0.3 },
                }}
                className="absolute bottom-0 left-1/2 w-[280px] sm:w-[340px] md:w-[390px] flex flex-col items-center"
              >
                {/* Floating White Name Box + Avatar + Bronze Particles */}
                <div className="h-52 sm:h-56 flex flex-col items-center justify-end mb-3.5 relative">
                  {p3Details ? (
                    <>
                      {/* Bronze Sparkling Particles */}
                      <RankParticles color="bronze" count={20} spread={150} />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.3, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 16 }}
                        className="flex flex-col items-center relative"
                      >
                        <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[105px] mb-2 filter drop-shadow-[0_10px_20px_rgba(217,119,6,0.7)] select-none leading-none">
                          {third.avatar}
                        </span>
                        {/* Solid White Name Plaque */}
                        <div className="bg-white text-slate-950 font-black text-2xl sm:text-3xl md:text-4xl px-8 sm:px-12 py-3.5 sm:py-4.5 rounded-3xl shadow-2xl border-2 border-slate-200 border-b-[8px] border-b-amber-700 truncate max-w-[300px] sm:max-w-[380px] text-center">
                          {third.nickname}
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    /* Suspense Question Mark while Pillar rises */
                    <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-[#240B4D] border-4 border-[#1D083E] flex items-center justify-center text-5xl font-black text-yellow-300 animate-pulse shadow-2xl">
                      ?
                    </div>
                  )}
                </div>

                {/* 3rd Pillar (Taller 370px - Suspenseful Rising Ease 1.8s) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "370px" }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full bg-[#1D083E] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-8 pb-6 border-2 border-[#240B4D] border-b-[8px] border-b-[#130526] relative overflow-hidden"
                >
                  {/* Bronze Shield */}
                  <div className="relative mb-4 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-22 h-24 sm:w-26 sm:h-28 fill-[#CD7F32] filter drop-shadow-xl">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#FDE68A" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-5xl text-white">
                      3
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p3Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="flex flex-col items-center text-center mt-1 flex-shrink-0"
                    >
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight block">
                        {third.score.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-base font-black uppercase text-amber-200 tracking-wider mt-1.5 block bg-[#240B4D] px-4 py-1 rounded-full border border-amber-500/30">
                        {third.correctCount ?? 0} out of {totalQ}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* 2ND PLACE (SILVER) - Anchored at Left-1/2: Starts Center (x:0), Glides Left (x:-370) */}
            {/* ========================================================================= */}
            {second && revealStep >= 2 && (
              <motion.div
                initial={{ x: "-50%", opacity: 0 }}
                animate={{
                  x: revealStep === 2 ? "-50%" : "calc(-50% - 370px)",
                  opacity: 1,
                  zIndex: revealStep === 2 ? 35 : 20,
                }}
                transition={{
                  x: { type: "spring", stiffness: 140, damping: 20, duration: 1.0 },
                  opacity: { duration: 0.3 },
                }}
                className="absolute bottom-0 left-1/2 w-[280px] sm:w-[340px] md:w-[390px] flex flex-col items-center"
              >
                {/* Floating White Name Box + Avatar + Silver Particles */}
                <div className="h-52 sm:h-56 flex flex-col items-center justify-end mb-3.5 relative">
                  {p2Details ? (
                    <>
                      {/* Silver Sparkling Diamond Particles */}
                      <RankParticles color="silver" count={26} spread={150} />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.3, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 16 }}
                        className="flex flex-col items-center relative"
                      >
                        <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[105px] mb-2 filter drop-shadow-[0_10px_20px_rgba(203,213,225,0.7)] select-none leading-none">
                          {second.avatar}
                        </span>
                        {/* Solid White Name Plaque */}
                        <div className="bg-white text-slate-950 font-black text-2xl sm:text-3xl md:text-4xl px-8 sm:px-12 py-3.5 sm:py-4.5 rounded-3xl shadow-2xl border-2 border-slate-200 border-b-[8px] border-b-slate-400 truncate max-w-[300px] sm:max-w-[380px] text-center">
                          {second.nickname}
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    /* Suspense Question Mark while Pillar rises */
                    <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-[#240B4D] border-4 border-[#1D083E] flex items-center justify-center text-5xl font-black text-yellow-300 animate-pulse shadow-2xl">
                      ?
                    </div>
                  )}
                </div>

                {/* 2nd Pillar (Taller 460px - Suspenseful Rising Ease 1.8s) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "460px" }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full bg-[#1D083E] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-8 pb-6 border-2 border-[#240B4D] border-b-[8px] border-b-[#130526] relative overflow-hidden"
                >
                  {/* Silver Shield */}
                  <div className="relative mb-4 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-22 h-24 sm:w-26 sm:h-28 fill-[#94A3B8] filter drop-shadow-xl">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#CBD5E1" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-5xl text-white">
                      2
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p2Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="flex flex-col items-center text-center mt-1 flex-shrink-0"
                    >
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight block">
                        {second.score.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-base font-black uppercase text-slate-300 tracking-wider mt-1.5 block bg-[#240B4D] px-4 py-1 rounded-full border border-slate-500/30">
                        {second.correctCount ?? 0} out of {totalQ}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* 1ST PLACE (GOLD CHAMPION) - Anchored at Left-1/2: Dead Center (x: -50%) */}
            {/* ========================================================================= */}
            {first && revealStep >= 3 && (
              <motion.div
                initial={{ x: "-50%", opacity: 0 }}
                animate={{ x: "-50%", opacity: 1, zIndex: 40 }}
                className="absolute bottom-0 left-1/2 w-[330px] sm:w-[390px] md:w-[460px] flex flex-col items-center"
              >
                {/* Floating White Name Box + Champion Avatar & Crown + 50 Gold Stars */}
                <div className="h-64 sm:h-72 flex flex-col items-center justify-end mb-4 relative">
                  {p1Details ? (
                    <>
                      {/* Shower of 50 Golden Star Particles Bursting around the Champion */}
                      <RankParticles color="gold" count={50} spread={200} />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.3, y: 35 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 240, damping: 15 }}
                        className="flex flex-col items-center relative pb-2"
                      >
                        {/* Grand Champion Glowing Gold Banner */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.4 }}
                          className="mb-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 px-8 py-1.5 rounded-full border-2 border-yellow-200 shadow-[0_8px_25px_rgba(251,191,36,0.9)] flex-shrink-0"
                        >
                          <span className="text-xs sm:text-base font-black uppercase tracking-[0.25em] block leading-none">
                            Grand Champion
                          </span>
                        </motion.div>

                        {/* Floating Gold Crown */}
                        <motion.div
                          animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                          className="text-[#FFA602] mb-1"
                        >
                          <Crown className="w-18 h-18 sm:w-22 sm:h-22 fill-[#FFA602] stroke-amber-200 drop-shadow-[0_0_30px_rgba(251,191,36,0.95)]" />
                        </motion.div>

                        <span className="text-8xl sm:text-9xl md:text-[120px] lg:text-[130px] mb-2 filter drop-shadow-[0_15px_30px_rgba(250,204,21,0.9)] select-none leading-none">
                          {first.avatar}
                        </span>

                        {/* Giant Solid White Name Plaque with Golden Glow */}
                        <div className="bg-white text-slate-950 font-black text-2xl sm:text-4xl md:text-5xl px-10 sm:px-14 py-4 sm:py-5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-4 border-amber-300 border-b-[8px] border-b-amber-400 truncate max-w-[360px] sm:max-w-[440px] text-center">
                          {first.nickname}
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    /* Clean Glowing Suspense with Royal Centered Crown + '?' + Badge */
                    <div className="h-60 flex flex-col items-center justify-center relative pb-3">
                      {/* Floating Golden Crown on Top */}
                      <motion.div
                        animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        className="text-[#FFA602] mb-2 drop-shadow-[0_8px_25px_rgba(255,166,2,0.9)]"
                      >
                        <Crown className="w-20 h-20 sm:w-24 sm:h-24 fill-[#FFA602] stroke-yellow-200" />
                      </motion.div>

                      {/* Giant Centered Gold Question Mark */}
                      <span className="text-8xl sm:text-9xl md:text-[115px] font-black text-yellow-300 animate-pulse drop-shadow-[0_0_40px_rgba(250,204,21,0.95)] leading-none my-1">
                        ?
                      </span>

                      {/* Golden Subtitle Badge */}
                      <div className="bg-[#33106B]/90 backdrop-blur-md border-2 border-yellow-400/60 px-6 py-2 rounded-full shadow-lg mt-2">
                        <span className="text-xs sm:text-base uppercase tracking-widest font-black text-yellow-300 block leading-none">
                          1st Place • Grand Champion
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1st Center Pillar (SUPER-TALL 580px - Heavy Dramatic Rising Ease 2.2s) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "580px" }}
                  transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full bg-[#240B4D] rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-8 pb-7 border-2 border-[#33106B] border-b-[10px] border-b-[#1D083E] relative overflow-hidden shadow-[0_0_70px_rgba(251,191,36,0.6)] border-yellow-400"
                >
                  {/* Gold Shield */}
                  <div className="relative mb-4 flex-shrink-0">
                    <svg viewBox="0 0 100 110" className="w-24 h-26 sm:w-28 sm:h-30 fill-[#FFA602] filter drop-shadow-2xl">
                      <polygon points="50,5 95,35 78,105 22,105 5,35" stroke="#FDE68A" strokeWidth="4" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-5xl sm:text-6xl text-white drop-shadow-md">
                      1
                    </span>
                  </div>

                  {/* Score & Correct Count */}
                  {p1Details && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="flex flex-col items-center text-center mt-1 flex-shrink-0"
                    >
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black text-[#FFA602] tabular-nums tracking-tight block drop-shadow-md">
                        {first.score.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-base font-black uppercase text-yellow-300 tracking-wider mt-2 block bg-[#1D083E] px-4 py-1 rounded-full border border-yellow-500/40 shadow-inner">
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
