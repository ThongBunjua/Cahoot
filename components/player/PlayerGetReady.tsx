"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerGetReadyProps {
  questionIndex: number;
  totalQuestions: number;
}

export function PlayerGetReady({ questionIndex }: PlayerGetReadyProps) {
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
      {/* 1. Top Title: Question Number (Exact styling like authentic Kahoot) */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] mb-10">
        Question {questionIndex + 1}
      </h1>

      {/* 2. Center Stage: Authentic Rotating Pie Clock Countdown Disk */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center mb-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
        {/* Continuous 1-Second Rotating Conic-Gradient Pie Wheel (GPU Animated) */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden shadow-2xl animate-spin"
          style={{
            animationDuration: "1000ms",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
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

      {/* 3. Bottom Subtitle: Ready... */}
      <p className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
        Ready...
      </p>
    </div>
  );
}
