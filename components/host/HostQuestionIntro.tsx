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
  // Stages: "countdown_3" -> "countdown_2" -> "countdown_1" -> "phone_center" -> "question_preview"
  const [stage, setStage] = useState<
    "countdown_3" | "countdown_2" | "countdown_1" | "phone_center" | "question_preview"
  >("countdown_3");
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    // 0.0s: Stage 3 (Countdown 3 - Red Triangle)
    sounds.playGetReadyPulse(3);

    // 0.9s: Stage 2 (Countdown 2 - Blue Diamond)
    const t2 = setTimeout(() => {
      setStage("countdown_2");
      sounds.playGetReadyPulse(2);
    }, 900);

    // 1.8s: Stage 1 (Countdown 1 - Yellow Circle)
    const t1 = setTimeout(() => {
      setStage("countdown_1");
      sounds.playGetReadyPulse(1);
    }, 1800);

    // 2.7s: Stage Phone Pop-up in Center Stage
    const tPhone = setTimeout(() => {
      setStage("phone_center");
      sounds.playClick();
    }, 2700);

    // 4.2s: Stage Morph upwards above Question Box (3.0s reading time)
    const tPreview = setTimeout(() => {
      setStage("question_preview");
    }, 4200);

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tPhone);
      clearTimeout(tPreview);
    };
  }, []);

  // 3.0-second smooth reading progress bar (Total = 2.7s + 1.5s + 3.0s = 7.2s)
  useEffect(() => {
    if (stage !== "question_preview") return;

    const totalDurationMs = 3000;
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

  const isShapeCountdown =
    stage === "countdown_3" || stage === "countdown_2" || stage === "countdown_1";

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

      {/* 2. Main Center Stage: 3-2-1 Geometric Shapes -> Phone Mockup -> Question Banner */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-6xl mx-auto my-auto">
        {/* ========================================================================= */}
        {/* PART A: 3-2-1 GEOMETRIC SHAPE PULSE COUNTDOWN */}
        {/* ========================================================================= */}
        <AnimatePresence mode="popLayout">
          {isShapeCountdown && (
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              {stage === "countdown_3" && (
                <motion.div
                  key="shape-3"
                  initial={{ scale: 0.2, rotate: -45, opacity: 0 }}
                  animate={{ scale: [0.2, 1.2, 1], rotate: [-45, 5, 0], opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-56 h-56 sm:w-72 sm:h-72 bg-[#E21B3C] rounded-3xl flex flex-col items-center justify-center shadow-2xl border-4 border-red-300 relative"
                >
                  <KahootShape shape="triangle" size={140} className="text-white drop-shadow-lg opacity-40 absolute" />
                  <span className="text-8xl sm:text-9xl font-black text-white relative z-10 drop-shadow-xl">
                    3
                  </span>
                </motion.div>
              )}

              {stage === "countdown_2" && (
                <motion.div
                  key="shape-2"
                  initial={{ scale: 0.2, rotate: 45, opacity: 0 }}
                  animate={{ scale: [0.2, 1.2, 1], rotate: [45, -5, 0], opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-56 h-56 sm:w-72 sm:h-72 bg-[#1368CE] rounded-3xl flex flex-col items-center justify-center shadow-2xl border-4 border-blue-300 relative rotate-45"
                >
                  <span className="text-8xl sm:text-9xl font-black text-white relative z-10 drop-shadow-xl -rotate-45">
                    2
                  </span>
                </motion.div>
              )}

              {stage === "countdown_1" && (
                <motion.div
                  key="shape-1"
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.2, 1.2, 1], opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-56 h-56 sm:w-72 sm:h-72 bg-[#FFA602] rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-yellow-200 relative"
                >
                  <span className="text-8xl sm:text-9xl font-black text-slate-950 relative z-10 drop-shadow-xl">
                    1
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* PART B: PERSISTENT PHONE MOCKUP (Center Stage -> Glides up to Top Anchor) */}
        {/* ========================================================================= */}
        {!isShapeCountdown && (
          <motion.div
            initial={{ y: 80, scale: 0.5, opacity: 0 }}
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
        )}

        {/* ========================================================================= */}
        {/* PART C: QUESTION PREVIEW BOX (Spaciously positioned below top phone) */}
        {/* ========================================================================= */}
        {!isShapeCountdown && (
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

            {/* Smooth 3.0s Reading Progress Track */}
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
