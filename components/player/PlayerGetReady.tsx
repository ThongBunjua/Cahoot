"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerGetReadyProps {
  questionIndex: number;
  totalQuestions: number;
}

const SUSPENSE_MESSAGES = [
  "Get ready",
  "Think fast",
  "Focus",
  "Answers incoming",
];

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

  const currentMessage = SUSPENSE_MESSAGES[Math.min(5 - count, SUSPENSE_MESSAGES.length - 1)] || "Get ready";

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

      {/* Giant Minimalist Countdown Number */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-8">
        {/* Subtle pulsating outer ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-yellow-400/20 blur-md"
        />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={count}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="w-32 h-32 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center text-6xl font-black shadow-2xl border-4 border-yellow-200"
          >
            {count}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Minimal Suspense Message Underneath */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={currentMessage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase"
        >
          {currentMessage}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}
