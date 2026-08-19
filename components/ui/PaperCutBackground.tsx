"use client";

import React from "react";

export function PaperCutBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none bg-[#130526]">
      {/* 1. Deep Atmospheric Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a084e] via-[#16032d] to-[#0d011c]" />

      {/* 2. Soft Ambient Aurora / Glow Blobs for Natural Depth */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#681dbf]/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-[#43108c]/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#892be2]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* 3. Smooth Natural Flowing Waves (Layer 1: Deep Background Waves) */}
      <svg
        className="absolute w-full h-full object-cover opacity-80 paper-shadow-3"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 -50 C 250 120, 500 -20, 750 140 C 1000 300, 1250 150, 1540 220 L 1540 -100 L -100 -100 Z"
          fill="url(#naturalWaveGrad1)"
        />
        <path
          d="M-100 950 C 300 780, 600 920, 900 760 C 1200 600, 1350 720, 1540 680 L 1540 1000 L -100 1000 Z"
          fill="url(#naturalWaveGrad2)"
        />

        <defs>
          <linearGradient id="naturalWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#431282" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1e063d" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="naturalWaveGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5316a3" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#17032f" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      {/* 4. Natural Midground Organic Curves (Layer 2: Soft Flowing Wave) */}
      <svg
        className="absolute w-full h-full object-cover opacity-75 paper-shadow-2"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-80 320 C 180 440, 320 220, 580 340 C 840 460, 1100 280, 1520 400 L 1520 -50 L -80 -50 Z"
          fill="url(#midWaveGrad)"
        />

        <defs>
          <linearGradient id="midWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#621ebf" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#401085" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#1f0642" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* 5. Natural Vignette to enhance center elevation */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#100321]/30 to-[#090114]/80 pointer-events-none" />
    </div>
  );
}
