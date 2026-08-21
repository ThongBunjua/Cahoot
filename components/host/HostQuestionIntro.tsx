"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  // Stage 1: "phone_center" (1.6s) -> Stage 2: "question_preview" (3.4s) = 5.0s Total!
  const [stage, setStage] = useState<"phone_center" | "question_preview">("phone_center");
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    sounds.playGetReadyPulse(3);

    // 1.6s: Morph phone from Center Stage to Top Anchor above Question Box
    const tPreview = setTimeout(() => {
      setStage("question_preview");
      sounds.playClick();
    }, 1600);

    return () => {
      clearTimeout(tPreview);
    };
  }, []);

  // 3.4-second smooth reading progress bar (1.6s + 3.4s = 5.0s Total Intro)
  useEffect(() => {
    if (stage !== "question_preview") return;

    const totalDurationMs = 3400;
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

      {/* 2. Main Stage with Phone Mockup Morph */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-6xl mx-auto my-auto">
        {stage === "phone_center" ? (
          /* ========================================================================= */
          /* STAGE 1: Phone Mockup in Center Stage with 2x2 Mini Choices & Logo */
          /* ========================================================================= */
          <motion.div
            layoutId="host-intro-phone-mockup"
            initial={{ scale: 0.3, y: 80, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="w-44 h-64 sm:w-52 sm:h-76 bg-slate-950 rounded-[36px] p-3 border-4 border-slate-700 border-b-[8px] border-b-slate-800 shadow-[0_30px_70px_rgba(0,0,0,0.7)] flex flex-col justify-between relative overflow-hidden"
          >
            {/* Phone Speaker Notch */}
            <div className="w-14 h-3 bg-slate-800 rounded-full mx-auto mb-2 flex-shrink-0" />

            {/* Phone Screen Display */}
            <div className="flex-1 bg-[#240B4D] rounded-2xl p-2.5 flex flex-col justify-between border border-purple-900/60 overflow-hidden">
              {/* Top: Cahoot! Mini Header */}
              <div className="text-center py-1">
                <span className="text-sm sm:text-base font-black tracking-tighter text-white">
                  Cahoot<span className="text-yellow-400">!</span>
                </span>
              </div>

              {/* Center: 4 Mini Colored Geometric Buttons */}
              <div className="grid grid-cols-2 grid-rows-2 gap-1.5 flex-1 my-1.5">
                <div className="bg-[#E21B3C] rounded-lg flex items-center justify-center p-1 shadow">
                  <KahootShape shape="triangle" size={16} className="text-white drop-shadow" />
                </div>
                <div className="bg-[#1368CE] rounded-lg flex items-center justify-center p-1 shadow">
                  <KahootShape shape="diamond" size={16} className="text-white drop-shadow" />
                </div>
                <div className="bg-[#FFA602] rounded-lg flex items-center justify-center p-1 shadow">
                  <KahootShape shape="circle" size={16} className="text-white drop-shadow" />
                </div>
                <div className="bg-[#26890C] rounded-lg flex items-center justify-center p-1 shadow">
                  <KahootShape shape="square" size={16} className="text-white drop-shadow" />
                </div>
              </div>

              {/* Bottom Home Indicator Line */}
              <div className="w-12 h-1 bg-white/40 rounded-full mx-auto" />
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* STAGE 2: Phone Mockup Morphed and Resting Centered Above the Question Box */
          /* ========================================================================= */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center w-full max-w-5xl relative"
          >
            {/* Morphed Mini Phone Resting Seamlessly on Top-Center */}
            <motion.div
              layoutId="host-intro-phone-mockup"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-20 h-28 sm:w-24 sm:h-32 bg-slate-950 rounded-[20px] p-1.5 border-2 border-slate-700 border-b-[4px] border-b-slate-800 shadow-2xl flex flex-col justify-between mb-[-18px] relative z-20"
            >
              {/* Mini Speaker Notch */}
              <div className="w-6 h-1.5 bg-slate-800 rounded-full mx-auto mb-1 flex-shrink-0" />

              {/* Mini Phone Screen */}
              <div className="flex-1 bg-[#240B4D] rounded-xl p-1 flex flex-col justify-between border border-purple-900/60 overflow-hidden">
                <span className="text-[9px] font-black text-white leading-none text-center">
                  Cahoot<span className="text-yellow-400">!</span>
                </span>
                <div className="grid grid-cols-2 grid-rows-2 gap-0.5 flex-1 my-0.5">
                  <div className="bg-[#E21B3C] rounded-xs flex items-center justify-center">
                    <KahootShape shape="triangle" size={8} />
                  </div>
                  <div className="bg-[#1368CE] rounded-xs flex items-center justify-center">
                    <KahootShape shape="diamond" size={8} />
                  </div>
                  <div className="bg-[#FFA602] rounded-xs flex items-center justify-center">
                    <KahootShape shape="circle" size={8} />
                  </div>
                  <div className="bg-[#26890C] rounded-xs flex items-center justify-center">
                    <KahootShape shape="square" size={8} />
                  </div>
                </div>
                <div className="w-5 h-0.5 bg-white/40 rounded-full mx-auto" />
              </div>
            </motion.div>

            {/* Giant Question Preview Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="w-full bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 mb-8 min-h-[140px] flex items-center justify-center relative z-10"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-snug tracking-tight">
                {question.question_text}
              </h1>
            </motion.div>

            {/* Smooth 3.4s Reading Progress Track */}
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
        )}
      </main>

      {/* 3. Empty bottom footer for balanced layout */}
      <footer className="h-8 z-10" />
    </div>
  );
}
