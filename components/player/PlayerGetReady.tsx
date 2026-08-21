"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface PlayerGetReadyProps {
  questionIndex: number;
  totalQuestions: number;
}

export function PlayerGetReady({ questionIndex, totalQuestions }: PlayerGetReadyProps) {
  // Phase 1: "intro" (2.4s) -> Phase 2: "countdown" (3s: 3 -> 2 -> 1)
  const [mode, setMode] = useState<"intro" | "countdown">("intro");
  const [countdownNum, setCountdownNum] = useState(3);

  useEffect(() => {
    // 2.4s: Switch from "Get Ready!" to countdown "3" (when Host starts 3s question preview)
    const tCountdownStart = setTimeout(() => {
      setMode("countdown");
      setCountdownNum(3);
    }, 2400);

    // 3.4s: Countdown "2"
    const t2 = setTimeout(() => {
      setCountdownNum(2);
    }, 3400);

    // 4.4s: Countdown "1"
    const t1 = setTimeout(() => {
      setCountdownNum(1);
    }, 4400);

    return () => {
      clearTimeout(tCountdownStart);
      clearTimeout(t2);
      clearTimeout(t1);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 select-none font-sans w-full max-w-sm mx-auto overflow-hidden">
      {/* Top Question Tag with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-400 bg-[#33106B] px-5 py-2 rounded-full border-2 border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-xl">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
      </motion.div>

      {/* Main Center Stage: Dynamic Morphing Halo & Energetic 3D Scale */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mb-8">
        {/* Layer 1: Animated Outer Rotating Aura */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 rounded-[40px] border-2 border-dashed border-yellow-400/40"
        />

        {/* Layer 2: Radiant Gradient Pulse Ripple */}
        <motion.div
          animate={{
            scale: [0.95, 1.25, 0.95],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#FFA602]/30 via-yellow-300/40 to-[#FF5500]/30 blur-2xl pointer-events-none"
        />

        {/* Layer 3: Central Energetic Countdown Badge with Spring Pop */}
        <AnimatePresence mode="popLayout">
          {mode === "intro" ? (
            <motion.div
              key="intro-badge"
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.4, rotate: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-[#FFA602] to-[#FFD000] text-slate-950 flex flex-col items-center justify-center shadow-[0_15px_40px_rgba(255,166,2,0.45)] border-4 border-yellow-200 border-b-[8px] border-b-[#CC8400] relative z-10"
            >
              <Sparkles className="w-8 h-8 text-slate-950 mb-1 animate-spin" style={{ animationDuration: "3s" }} />
              <span className="text-4xl sm:text-5xl font-black">!</span>
            </motion.div>
          ) : (
            <motion.div
              key={`count-${countdownNum}`}
              initial={{ scale: 0.2, rotate: -30, opacity: 0 }}
              animate={{
                scale: [0.2, 1.15, 1],
                rotate: [-30, 8, 0],
                opacity: 1,
              }}
              exit={{ scale: 1.6, opacity: 0, filter: "blur(8px)" }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-[#FFA602] via-[#FFC000] to-[#FFE066] text-slate-950 flex items-center justify-center text-7xl sm:text-8xl font-black shadow-[0_20px_50px_rgba(255,166,2,0.55)] border-4 border-yellow-200 border-b-[8px] border-b-[#CC8400] relative z-10"
            >
              <span className="drop-shadow-md">{countdownNum}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Minimal Suspense Subtitle with Fluid Morph */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={mode === "intro" ? "Get ready" : "Answers incoming"}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase drop-shadow-lg"
        >
          {mode === "intro" ? "Get ready" : "Answers incoming"}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}
