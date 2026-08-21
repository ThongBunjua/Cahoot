"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { sounds } from "@/lib/audio/soundManager";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
import { KahootShape } from "@/components/ui/KahootShapes";

interface HostQuestionIntroProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onIntroComplete: () => void;
}

export function HostQuestionIntro({
  question,
  questionIndex,
  totalQuestions,
  onIntroComplete,
}: HostQuestionIntroProps) {
  // Stage 1: "phone_center" (1.8s) -> Stage 2: "question_preview" (3.2s) = 5.0s Total!
  const [stage, setStage] = useState<"phone_center" | "question_preview">("phone_center");
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    sounds.playGetReadyPulse(3);

    // 1.8s: Morph phone from Center Stage to Top Floating Position Above Question Box
    const tPreview = setTimeout(() => {
      setStage("question_preview");
      sounds.playClick();
    }, 1800);

    return () => {
      clearTimeout(tPreview);
    };
  }, []);

  // 3.2-second smooth reading progress bar (1.8s + 3.2s = 5.0s Total Intro)
  useEffect(() => {
    if (stage !== "question_preview") return;

    const totalDurationMs = 3200;
    const intervalMs = 25;
    const increment = (intervalMs / totalDurationMs) * 100;

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          onIntroComplete();
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [stage, onIntroComplete]);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* 1. Top Header */}
      <header className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full pt-1 z-20">
        <div className="bg-[#33106B] px-6 py-2.5 rounded-2xl border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-md">
          <span className="text-sm md:text-base font-black uppercase tracking-wider text-[#FFA602]">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <AudioControl />
      </header>

      {/* 2. Main Center Stage: Continuous Phone Morph with Spacious Top Separation */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-6xl mx-auto my-auto">
        {/* ========================================================================= */}
        {/* EXTRA-LARGE PHONE MOCKUP (Full-Screen presence in Stage 1, Floats nicely in Stage 2) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ y: 80, scale: 0.6, opacity: 0 }}
          animate={
            stage === "phone_center"
              ? { y: 0, scale: 1, opacity: 1 }
              : { y: -220, scale: 0.38, opacity: 1 }
          }
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="w-80 h-[500px] sm:w-96 sm:h-[580px] bg-slate-950 rounded-[52px] p-5 border-4 border-slate-700 border-b-[12px] border-b-slate-800 shadow-[0_40px_100px_rgba(0,0,0,0.85)] flex flex-col justify-between absolute z-30 origin-center pointer-events-none"
        >
          {/* Phone Speaker Notch & Front Camera */}
          <div className="flex items-center justify-center gap-2 mb-3 flex-shrink-0">
            <div className="w-24 h-4 bg-slate-800 rounded-full" />
            <div className="w-4 h-4 bg-slate-800 rounded-full" />
          </div>

          {/* Phone Screen Display */}
          <div className="flex-1 bg-[#240B4D] rounded-[36px] p-5 flex flex-col justify-between border border-purple-900/60 overflow-hidden shadow-inner">
            {/* Top: Cahoot! Header */}
            <div className="text-center py-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
                Cahoot<span className="text-yellow-400">!</span>
              </span>
            </div>

            {/* Center: 4 Big Colored Geometric Buttons */}
            <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 my-3">
              <div className="bg-[#E21B3C] rounded-2xl flex items-center justify-center p-3 shadow-lg">
                <KahootShape shape="triangle" size={36} className="text-white drop-shadow-md" />
              </div>
              <div className="bg-[#1368CE] rounded-2xl flex items-center justify-center p-3 shadow-lg">
                <KahootShape shape="diamond" size={36} className="text-white drop-shadow-md" />
              </div>
              <div className="bg-[#FFA602] rounded-2xl flex items-center justify-center p-3 shadow-lg">
                <KahootShape shape="circle" size={36} className="text-white drop-shadow-md" />
              </div>
              <div className="bg-[#26890C] rounded-2xl flex items-center justify-center p-3 shadow-lg">
                <KahootShape shape="square" size={36} className="text-white drop-shadow-md" />
              </div>
            </div>

            {/* Bottom Home Indicator Line */}
            <div className="w-24 h-2 bg-white/40 rounded-full mx-auto" />
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* QUESTION PREVIEW BOX (Spaciously positioned with breathing room below phone) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 120 }}
          animate={
            stage === "phone_center"
              ? { opacity: 0, scale: 0.85, y: 120, pointerEvents: "none" }
              : { opacity: 1, scale: 1, y: 65, pointerEvents: "auto" }
          }
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-5xl flex flex-col items-center text-center relative z-20"
        >
          {/* Giant Question Preview Box */}
          <div className="w-full bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 mb-8 min-h-[140px] flex items-center justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-snug tracking-tight">
              {question.question_text}
            </h1>
          </div>

          {/* Smooth 3.2s Reading Progress Track */}
          <div className="w-full max-w-2xl h-4 bg-[#33106B] rounded-full overflow-hidden border-2 border-[#240B4D] p-0.5 shadow-inner">
            <motion.div
              style={{ width: `${readingProgress}%` }}
              className="h-full bg-gradient-to-r from-yellow-400 to-[#FFA602] rounded-full"
            />
          </div>
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-300 mt-3">
            Answers incoming...
          </span>
        </motion.div>
      </main>

      {/* 3. Empty bottom footer for balanced layout */}
      <footer className="h-8 z-10" />
    </div>
  );
}
