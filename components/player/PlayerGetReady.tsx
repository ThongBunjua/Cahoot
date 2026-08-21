"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerGetReadyProps {
  questionIndex: number;
  totalQuestions?: number;
}

export function PlayerGetReady({ questionIndex }: PlayerGetReadyProps) {
  // Phase 1: "intro_exclamation" (2.7s during Host 3-2-1 Shapes) -> Phase 2: "clock_countdown" (4.5s: 5->4->3->2->1)
  const [phase, setPhase] = useState<"intro_exclamation" | "clock_countdown">("intro_exclamation");
  const [count, setCount] = useState(5);

  useEffect(() => {
    // 2.7s: Switch from "!" to the Pie Clock Countdown (when Host begins Phone Mockup & Question preview)
    const tClockStart = setTimeout(() => {
      setPhase("clock_countdown");
      setCount(5);
    }, 2700);

    // 3.6s: Count 4
    const t4 = setTimeout(() => setCount(4), 3600);
    // 4.5s: Count 3
    const t3 = setTimeout(() => setCount(3), 4500);
    // 5.4s: Count 2
    const t2 = setTimeout(() => setCount(2), 5400);
    // 6.3s: Count 1
    const t1 = setTimeout(() => setCount(1), 6300);

    return () => {
      clearTimeout(tClockStart);
      clearTimeout(t4);
      clearTimeout(t3);
      clearTimeout(t2);
      clearTimeout(t1);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center text-center p-6 select-none font-sans overflow-hidden z-20">
      {/* 1. Top Title: Question Number (Exact styling like authentic Kahoot) */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] mb-10">
        Question {questionIndex + 1}
      </h1>

      {/* 2. Center Stage: Solid Yellow Circle '!' in Phase 1 OR Rotating Pie Clock in Phase 2 */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center mb-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
        <AnimatePresence mode="popLayout">
          {phase === "intro_exclamation" ? (
            /* Phase 1: Solid Yellow Circle with Exclamation Mark '!' */
            <motion.div
              key="intro-exclamation-circle"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.25, opacity: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center text-7xl sm:text-8xl font-black shadow-2xl border-4 border-yellow-200 border-b-[8px] border-b-yellow-500"
            >
              <span>!</span>
            </motion.div>
          ) : (
            /* Phase 2: Rotating Pie Clock Countdown Disk (5 -> 4 -> 3 -> 2 -> 1) */
            <div key="clock-countdown-wrapper" className="relative w-full h-full flex items-center justify-center">
              {/* Animated Pie Disk that rotates synchronously on each countdown tick */}
              <motion.div
                key={`pie-rotation-${count}`}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-full overflow-hidden shadow-2xl"
                style={{
                  background: "conic-gradient(#FFFFFF 0% 50%, #9084BE 50% 100%)",
                }}
              />

              {/* Center Number: Dark Charcoal/Black (Exact match to image) */}
              <div className="relative z-10 flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`kahoot-count-${count}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.25, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 24 }}
                    className="text-6xl sm:text-7xl font-black text-[#1E1B2E] select-none tabular-nums"
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Subtitle: Get Ready! in Phase 1 OR Ready... in Phase 2 */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase === "intro_exclamation" ? "Get Ready!" : "Ready..."}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        >
          {phase === "intro_exclamation" ? "Get Ready!" : "Ready..."}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
