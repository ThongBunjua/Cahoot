"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerGetReadyProps {
  questionIndex: number;
  totalQuestions: number;
}

export function PlayerGetReady({ questionIndex, totalQuestions }: PlayerGetReadyProps) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 1;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 select-none font-sans w-full max-w-sm mx-auto overflow-hidden">
      {/* Top Question Tag */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-400 bg-[#33106B] px-5 py-2 rounded-full border-2 border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-md">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
      </motion.div>

      {/* Main Center Stage: Clean Minimalist Countdown Number (5 -> 4 -> 3 -> 2 -> 1) */}
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center mb-8">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`count-${count}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.25, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-yellow-400 text-slate-950 flex items-center justify-center text-6xl sm:text-7xl font-black shadow-2xl border-4 border-yellow-200 border-b-[8px] border-b-yellow-500"
          >
            <span>{count}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Clean Minimal Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
        Get ready
      </h2>
    </div>
  );
}
