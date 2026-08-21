"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { sounds } from "@/lib/audio/soundManager";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";

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
  // Stages: "phone_popup" (1.5s) -> "question_preview" (3.5s) = 5.0s Total!
  const [stage, setStage] = useState<"phone_popup" | "question_preview">("phone_popup");
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    sounds.playGetReadyPulse(3);

    // 1.5s: Transition from Phone Popup to Question Preview
    const tPreview = setTimeout(() => {
      setStage("question_preview");
      sounds.playClick();
    }, 1500);

    return () => {
      clearTimeout(tPreview);
    };
  }, []);

  // 3.5-second smooth reading progress bar (1.5s + 3.5s = exactly 5.0s total intro!)
  useEffect(() => {
    if (stage !== "question_preview") return;

    const totalDurationMs = 3500;
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

      {/* 1. Header: 100% Solid Dark Surface */}
      <header className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full pt-1 z-20">
        <div className="bg-[#33106B] px-6 py-3 rounded-2xl border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-md">
          <span className="text-sm md:text-base font-black uppercase tracking-wider text-[#FFA602]">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <AudioControl />
      </header>

      {/* 2. Main Stage: Phone Popup or Question Preview */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-6xl mx-auto">
        {stage === "phone_popup" ? (
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-[#33106B] border-4 border-[#240B4D] border-b-[8px] border-b-[#1D083E] flex items-center justify-center text-6xl sm:text-7xl shadow-2xl mb-4 animate-bounce">
              📱
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Get Ready!
            </h2>
            <p className="text-sm sm:text-base font-bold text-yellow-300 mt-2 tracking-wide">
              Eyes on the screen
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center w-full max-w-5xl"
          >
            {/* Giant Question Preview Box */}
            <div className="w-full bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 mb-8 min-h-[140px] flex items-center justify-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-snug tracking-tight">
                {question.question_text}
              </h1>
            </div>

            {/* Smooth 3.5s Reading Progress Track */}
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

      {/* 3. Empty bottom footer for balanced spacing */}
      <footer className="h-10 z-10" />
    </div>
  );
}
