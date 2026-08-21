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
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center text-center p-6 select-none font-sans overflow-hidden z-20">
      {/* Top Question Tag */}
      <div className="mb-10">
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-400 bg-[#33106B] px-5 py-2 rounded-full border-2 border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-md">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Main Center Stage: Pure Minimalist Circular Countdown (No harsh squares, zero background flicker) */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`count-circle-${count}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.25, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="w-36 h-36 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center text-7xl font-black shadow-2xl border-4 border-yellow-200"
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
