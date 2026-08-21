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
  // Stages: "countdown_3" -> "countdown_2" -> "countdown_1" -> "phone_center" -> "question_preview" -> "morph_to_top"
  const [stage, setStage] = useState<
    "countdown_3" | "countdown_2" | "countdown_1" | "phone_center" | "question_preview" | "morph_to_top"
  >("countdown_3");
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    // 0.0s: Stage 3 (Countdown 3 - Giant Red Pentagon)
    sounds.playGetReadyPulse(3);

    // 0.9s: Stage 2 (Countdown 2 - Giant Blue Square)
    const t2 = setTimeout(() => {
      setStage("countdown_2");
      sounds.playGetReadyPulse(2);
    }, 900);

    // 1.8s: Stage 1 (Countdown 1 - Giant Yellow Triangle with White Number 1)
    const t1 = setTimeout(() => {
      setStage("countdown_1");
      sounds.playGetReadyPulse(1);
    }, 1800);

    // 2.7s: Stage Phone Pop-up in Center Stage
    const tPhone = setTimeout(() => {
      setStage("phone_center");
      sounds.playClick();
    }, 2700);

    // 3.6s: Stage Question Preview in Center
    const tPreview = setTimeout(() => {
      setStage("question_preview");
    }, 3600);

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tPhone);
      clearTimeout(tPreview);
    };
  }, []);

  // 3.4-second reading progress bar -> Long, Luxurious, Continuous Morph upwards to Top Header
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
          // Trigger continuous morph upwards animation
          setStage("morph_to_top");
          // Smooth 700ms transition to let the card slide all the way to the top before switching
          setTimeout(() => {
            onIntroComplete();
          }, 700);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [stage, onIntroComplete]);

  const isShapeCountdown =
    stage === "countdown_3" || stage === "countdown_2" || stage === "countdown_1";

  const isMorphing = stage === "morph_to_top";

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-3 sm:p-4 md:p-5 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* 1. Top Header */}
      <header className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full pt-1 z-20">
        <div className="bg-[#33106B] px-6 py-2 rounded-2xl border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-md">
          <span className="text-sm md:text-base font-black uppercase tracking-wider text-[#FFA602]">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <AudioControl />
      </header>

      {/* 2. Main Center Stage: 3-2-1 Shapes -> Phone -> Seamless Full-Width Question Morph */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-[98vw] mx-auto my-auto">
        {/* ========================================================================= */}
        {/* PART A: 3-2-1 GEOMETRIC SHAPES */}
        {/* ========================================================================= */}
        <AnimatePresence mode="popLayout">
          {isShapeCountdown && (
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              {/* COUNT 3 = Giant Red Pentagon */}
              {stage === "countdown_3" && (
                <motion.div
                  key="shape-pentagon-3"
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.2, 1.25, 1], opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className="w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center relative"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E21B3C] filter drop-shadow-[0_25px_60px_rgba(226,27,60,0.65)]">
                    <polygon points="50,6 95,39 78,92 22,92 5,39" stroke="#FCA5A5" strokeWidth="3" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-9xl sm:text-[140px] font-black text-white drop-shadow-2xl select-none pt-2">
                    3
                  </span>
                </motion.div>
              )}

              {/* COUNT 2 = Giant Blue Square */}
              {stage === "countdown_2" && (
                <motion.div
                  key="shape-square-2"
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.2, 1.25, 1], opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className="w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center relative"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-[#1368CE] filter drop-shadow-[0_25px_60px_rgba(19,104,206,0.65)]">
                    <rect x="8" y="8" width="84" height="84" rx="18" stroke="#93C5FD" strokeWidth="3" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-9xl sm:text-[140px] font-black text-white drop-shadow-2xl select-none">
                    2
                  </span>
                </motion.div>
              )}

              {/* COUNT 1 = Giant Yellow Triangle (WHITE NUMBER 1) */}
              {stage === "countdown_1" && (
                <motion.div
                  key="shape-triangle-1"
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.2, 1.25, 1], opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  className="w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center relative"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-[#FFA602] filter drop-shadow-[0_25px_60px_rgba(255,166,2,0.65)]">
                    <polygon points="50,8 95,88 5,88" stroke="#FEF08A" strokeWidth="3" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-9xl sm:text-[140px] font-black text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] select-none pt-6">
                    1
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* PART B: PERSISTENT PHONE MOCKUP */}
        {/* ========================================================================= */}
        {!isShapeCountdown && (
          <motion.div
            initial={{ y: 80, scale: 0.5, opacity: 0 }}
            animate={
              isMorphing
                ? { y: -380, scale: 0.1, opacity: 0 }
                : stage === "phone_center"
                ? { y: 0, scale: 1, opacity: 1 }
                : { y: -220, scale: 0.38, opacity: 1 }
            }
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-80 h-[500px] sm:w-96 sm:h-[580px] bg-slate-950 rounded-[52px] p-5 border-4 border-slate-700 border-b-[12px] border-b-slate-800 shadow-[0_40px_100px_rgba(0,0,0,0.85)] flex flex-col justify-between absolute z-30 origin-center pointer-events-none"
          >
            {/* Phone Speaker Notch & Camera */}
            <div className="flex items-center justify-center gap-2 mb-3 flex-shrink-0">
              <div className="w-24 h-4 bg-slate-800 rounded-full" />
              <div className="w-4 h-4 bg-slate-800 rounded-full" />
            </div>

            {/* Phone Screen Display */}
            <div className="flex-1 bg-[#240B4D] rounded-[36px] p-5 flex flex-col justify-between border border-purple-900/60 overflow-hidden shadow-inner">
              <div className="text-center py-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
                  Cahoot<span className="text-yellow-400">!</span>
                </span>
              </div>

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

              <div className="w-24 h-2 bg-white/40 rounded-full mx-auto" />
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* PART C: QUESTION CARD WITH SEAMLESS FULL-WIDTH MORPH UPWARDS (ภาพ 1 -> ภาพ 2) */}
        {/* ========================================================================= */}
        {!isShapeCountdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 120 }}
            animate={
              isMorphing
                ? {
                    y: -360,
                    scale: 1,
                    opacity: 1,
                    maxWidth: "98vw",
                  }
                : stage === "phone_center"
                ? { opacity: 0, scale: 0.85, y: 120, pointerEvents: "none" }
                : { opacity: 1, scale: 1, y: 65, maxWidth: "1150px", pointerEvents: "auto" }
            }
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center text-center relative z-20"
          >
            {/* Question Box Morphing to exact header dimensions */}
            <motion.div
              animate={
                isMorphing
                  ? {
                      paddingTop: "14px",
                      paddingBottom: "14px",
                      paddingLeft: "32px",
                      paddingRight: "32px",
                      borderRadius: "24px",
                      minHeight: "65px",
                    }
                  : {
                      paddingTop: "36px",
                      paddingBottom: "36px",
                      paddingLeft: "48px",
                      paddingRight: "48px",
                      borderRadius: "32px",
                      minHeight: "140px",
                    }
              }
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full bg-white text-slate-900 shadow-2xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 flex items-center justify-center mb-6"
            >
              <motion.h1
                animate={
                  isMorphing
                    ? { fontSize: "28px", lineHeight: "34px" }
                    : { fontSize: "40px", lineHeight: "48px" }
                }
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="font-black text-slate-900 tracking-tight"
              >
                {question.question_text}
              </motion.h1>
            </motion.div>

            {/* Reading Progress Track (Smoothly fades out during morph) */}
            <motion.div
              animate={{ opacity: isMorphing ? 0 : 1, y: isMorphing ? 40 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              <div className="w-full h-4 bg-[#33106B] rounded-full overflow-hidden border-2 border-[#240B4D] p-0.5 shadow-inner">
                <motion.div
                  style={{ width: `${readingProgress}%` }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-[#FFA602] rounded-full"
                />
              </div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-300 mt-2.5">
                Answers incoming...
              </span>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* 3. Empty bottom footer */}
      <footer className="h-4 z-10" />
    </div>
  );
}
