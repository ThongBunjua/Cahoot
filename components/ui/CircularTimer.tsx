"use client";

import React from "react";
import { motion } from "framer-motion";

interface CircularTimerProps {
  timeRemaining: number;
  totalTime: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularTimer({
  timeRemaining,
  totalTime,
  size = 84,
  strokeWidth = 8,
}: CircularTimerProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(timeRemaining / totalTime, 1));
  const strokeDashoffset = circumference - ratio * circumference;

  // Dynamic color transition based on time ratio
  let strokeColor = "#26890C"; // Green
  if (ratio <= 0.25) {
    strokeColor = "#E21B3C"; // Red
  } else if (ratio <= 0.5) {
    strokeColor = "#D89E00"; // Yellow
  }

  const isLowTime = timeRemaining <= 5 && timeRemaining > 0;

  return (
    <div
      className="relative flex items-center justify-center font-black"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={strokeWidth}
          fill="rgba(18, 16, 36, 0.7)"
        />
        {/* Animated Countdown Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </svg>
      {/* Time Text */}
      <span
        className={`absolute font-black tracking-tighter text-white select-none ${
          size >= 90 ? "text-3xl" : "text-2xl"
        } ${isLowTime ? "animate-pulse-fast text-red-400 scale-110" : ""}`}
      >
        {timeRemaining}
      </span>
    </div>
  );
}
