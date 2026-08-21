"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex flex-col items-center justify-center text-center p-6 select-none font-sans w-full max-w-sm mx-auto">
      {/* Top Question Tag */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <span className="text-xs font-black uppercase tracking-widest text-yellow-400 bg-[#33106B] px-4 py-1.5 rounded-full border border-white/20">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
      </motion.div>

      {/* Main Center Stage: Animated Get Ready or Giant 3-2-1 */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        {/* Pulsating Glow Ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-yellow-400/20 blur-lg"
        />

        <AnimatePresence mode="popLayout">
          {mode === "intro" ? (
            <motion.div
              key="intro-badge"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="w-32 h-32 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-yellow-200"
            >
              !
            </motion.div>
          ) : (
            <motion.div
              key={`count-${countdownNum}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="w-32 h-32 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center text-6xl font-black shadow-2xl border-4 border-yellow-200"
            >
              {countdownNum}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Minimal Suspense Subtitle */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={mode === "intro" ? "Get ready" : "Answers incoming"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase"
        >
          {mode === "intro" ? "Get ready" : "Answers incoming"}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}
