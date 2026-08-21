"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerGetReadyProps {
  questionIndex: number;
  totalQuestions: number;
}

export function PlayerGetReady({ questionIndex, totalQuestions }: PlayerGetReadyProps) {
  const totalDurationMs = 5000;
  const [remainingMs, setRemainingMs] = useState(totalDurationMs);
  const [count, setCount] = useState(5);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + totalDurationMs;

    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, endTime - now);
      setRemainingMs(left);
      setCount(Math.max(1, Math.ceil(left / 1000)));

      if (left <= 0) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // SVG Radial Clock Progress (Circumference for r=54 is ~339.3)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = remainingMs / totalDurationMs;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center text-center p-6 select-none font-sans overflow-hidden z-20">
      {/* Top Question Tag */}
      <div className="mb-10">
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-400 bg-[#33106B] px-5 py-2 rounded-full border-2 border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-md">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Main Center Stage: SVG Countdown Clock / Radial Loading Timer */}
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center mb-8">
        {/* SVG Circular Loading Track & Clock Sweep */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
          {/* Background Track Circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="8"
            fill="transparent"
          />

          {/* Animated Clock Sweep Stroke */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#FACC15"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-75"
          />
        </svg>

        {/* Center Circular Badge with Bold Number */}
        <div className="absolute inset-4 rounded-full bg-[#33106B] border-2 border-[#240B4D] flex items-center justify-center shadow-2xl">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={`clock-num-${count}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.25, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="text-6xl sm:text-7xl font-black text-yellow-400 tabular-nums"
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Clean Minimal Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
        Get ready
      </h2>
    </div>
  );
}
