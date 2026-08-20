"use client";

import React from "react";
import { motion } from "framer-motion";

interface GameBackgroundProps {
  showFloatingShapes?: boolean;
}

const FLOATING_SHAPES = [
  // Red Triangles
  { type: "triangle", color: "#E21B3C", top: "12%", left: "8%", size: 36, duration: 18, delay: 0 },
  { type: "triangle", color: "#E21B3C", top: "72%", left: "88%", size: 44, duration: 22, delay: 3 },
  // Blue Diamonds
  { type: "diamond", color: "#1368CE", top: "25%", left: "82%", size: 40, duration: 20, delay: 1 },
  { type: "diamond", color: "#1368CE", top: "80%", left: "14%", size: 32, duration: 16, delay: 4 },
  // Yellow Circles
  { type: "circle", color: "#FFA602", top: "65%", left: "6%", size: 38, duration: 19, delay: 2 },
  { type: "circle", color: "#FFA602", top: "15%", left: "65%", size: 48, duration: 24, delay: 5 },
  // Green Squares
  { type: "square", color: "#26890C", top: "45%", left: "92%", size: 34, duration: 17, delay: 1.5 },
  { type: "square", color: "#26890C", top: "85%", left: "55%", size: 42, duration: 21, delay: 3.5 },
];

export function GameBackground({ showFloatingShapes = true }: GameBackgroundProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Deep Atmospheric Purple Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#46178F] via-[#33106B] to-[#240B4D]" />

      {/* 2. Authentic Subtle Geometric Mesh / Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="cahoot-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(25)"
          >
            {/* Subtle Diamond & Triangle Grid */}
            <polygon points="30,5 55,30 30,55 5,30" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="30" cy="30" r="3" fill="#FFA602" />
            <polygon points="0,0 12,24 24,0" fill="#E21B3C" opacity="0.4" />
            <rect x="42" y="42" width="12" height="12" rx="3" fill="#26890C" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cahoot-pattern)" />
      </svg>

      {/* 3. Smooth Deep Flowing Waves (Depth Layers) */}
      <svg
        className="absolute w-full h-full object-cover opacity-35"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 -50 C 300 140, 600 -30, 950 120 C 1250 250, 1400 100, 1540 180 L 1540 -100 L -100 -100 Z"
          fill="#5a1dae"
        />
        <path
          d="M-100 950 C 350 780, 700 940, 1050 800 C 1300 680, 1420 790, 1540 740 L 1540 1000 L -100 1000 Z"
          fill="#1d073b"
        />
      </svg>

      {/* 4. Gentle Animated Floating Geometric Particles (▲, ◆, ●, ■) */}
      {showFloatingShapes && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {FLOATING_SHAPES.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 0, rotate: 0 }}
              animate={{
                y: [0, -35, 0, 30, 0],
                x: [0, 20, 0, -20, 0],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.delay,
              }}
              style={{
                position: "absolute",
                top: item.top,
                left: item.left,
                width: item.size,
                height: item.size,
                opacity: 0.22,
              }}
              className="flex items-center justify-center filter drop-shadow-md"
            >
              {item.type === "triangle" && (
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: item.color }}>
                  <polygon points="50,10 90,90 10,90" />
                </svg>
              )}
              {item.type === "diamond" && (
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: item.color }}>
                  <polygon points="50,5 95,50 50,95 5,50" />
                </svg>
              )}
              {item.type === "circle" && (
                <div
                  className="w-full h-full rounded-full border-4 border-amber-200"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {item.type === "square" && (
                <div
                  className="w-full h-full rounded-xl border-2 border-emerald-300"
                  style={{ backgroundColor: item.color }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 5. Natural Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#100321]/20 to-[#090114]/50 pointer-events-none" />
    </div>
  );
}
