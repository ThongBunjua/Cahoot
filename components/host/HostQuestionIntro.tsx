"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  // Stages: "countdown_3" -> "countdown_2" -> "countdown_1" -> "phone_popup" -> "question_preview"
  const [stage, setStage] = useState<
    "countdown_3" | "countdown_2" | "countdown_1" | "phone_popup" | "question_preview"
  >("countdown_3");

  const [readingProgress, setReadingProgress] = useState(0);

  // Exact-beat sequence timer
  useEffect(() => {
    // 0.0s: Stage 3 (Countdown 3 - Red Triangle)
    sounds.playGetReadyPulse(3);

    // 1.0s: Stage 2 (Countdown 2 - Blue Diamond)
    const t2 = setTimeout(() => {
      setStage("countdown_2");
      sounds.playGetReadyPulse(2);
    }, 1000);

    // 2.0s: Stage 1 (Countdown 1 - Yellow Circle)
    const t1 = setTimeout(() => {
      setStage("countdown_1");
      sounds.playGetReadyPulse(1);
    }, 2000);

    // 3.0s: Stage Phone Pop-up (1.6s duration)
    const tPop = setTimeout(() => {
      setStage("phone_popup");
      sounds.playClick();
    }, 3000);

    // 4.6s: Stage Question Preview with morphing Cahoot! Logo above
    const tPreview = setTimeout(() => {
      setStage("question_preview");
    }, 4600);

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tPop);
      clearTimeout(tPreview);
    };
  }, []);

  // 4-second smooth reading progress bar
  useEffect(() => {
    if (stage !== "question_preview") return;

    const totalDurationMs = 4000;
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

        <div className="flex items-center gap-3">
          <AudioControl />
        </div>
      </header>

      {/* 2. Center Stage Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full my-auto px-4 z-10 relative">
        {/* ========================================================================= */}
        {/* STEP 1: COUNTDOWN 3-2-1 WITH SOLID GEOMETRIC SHAPES */}
        {/* ========================================================================= */}
        {stage === "countdown_3" && (
          <motion.div
            key="count-3"
            initial={{ scale: 0.1, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#E21B3C] fill-current">
                <polygon points="50,6 96,94 4,94" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center pt-8 sm:pt-12 text-8xl sm:text-[140px] md:text-[170px] font-black text-white">
                3
              </span>
            </div>
          </motion.div>
        )}

        {stage === "countdown_2" && (
          <motion.div
            key="count-2"
            initial={{ scale: 0.1, opacity: 0, rotate: 25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#1368CE] fill-current">
                <polygon points="50,4 96,50 50,96 4,50" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-8xl sm:text-[140px] md:text-[170px] font-black text-white">
                2
              </span>
            </div>
          </motion.div>
        )}

        {stage === "countdown_1" && (
          <motion.div
            key="count-1"
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center rounded-full bg-[#FFA602] border-[10px] md:border-[14px] border-amber-300 shadow-xl">
              <span className="text-8xl sm:text-[140px] md:text-[170px] font-black text-slate-950">
                1
              </span>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PHONE POP-UP GRAPHIC (Clean Phone Mockup) */}
        {/* ========================================================================= */}
        {stage === "phone_popup" && (
          <motion.div
            key="phone-popup"
            initial={{ scale: 0.2, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="flex flex-col items-center justify-center"
          >
            {/* Clean Smartphone Mockup */}
            <div className="w-72 sm:w-80 md:w-96 h-[420px] sm:h-[460px] md:h-[490px] bg-slate-950 rounded-[48px] p-4 sm:p-5 border-4 border-slate-700 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
                <div className="w-10 h-1 rounded-full bg-slate-700" />
              </div>

              {/* Inner Screen Area with Cahoot! Logo & 4 Buttons */}
              <div className="flex-1 bg-[#33106B] rounded-[32px] p-4 flex flex-col justify-between border-2 border-[#240B4D]">
                <div className="flex items-center justify-between px-2 py-1">
                  <motion.span
                    layoutId="morph-cahoot-logo"
                    className="text-lg font-black text-[#FFA602] uppercase tracking-wider"
                  >
                    Cahoot!
                  </motion.span>
                  <div className="w-8 h-8 rounded-full bg-[#FFA602] text-sm font-black text-slate-950 flex items-center justify-center shadow">
                    🦊
                  </div>
                </div>

                {/* 4 Colored Buttons Grid */}
                <div className="grid grid-cols-2 gap-3 my-auto">
                  <div className="h-20 sm:h-24 rounded-2xl bg-[#E21B3C] border-b-4 border-[#B0142D] flex items-center justify-center shadow-md">
                    <span className="text-3xl sm:text-4xl text-white select-none">▲</span>
                  </div>
                  <div className="h-20 sm:h-24 rounded-2xl bg-[#1368CE] border-b-4 border-[#0E4C96] flex items-center justify-center shadow-md">
                    <span className="text-3xl sm:text-4xl text-white select-none">◆</span>
                  </div>
                  <div className="h-20 sm:h-24 rounded-2xl bg-[#FFA602] border-b-4 border-[#CC8400] flex items-center justify-center shadow-md">
                    <span className="text-3xl sm:text-4xl text-white select-none">●</span>
                  </div>
                  <div className="h-20 sm:h-24 rounded-2xl bg-[#26890C] border-b-4 border-[#1B6108] flex items-center justify-center shadow-md">
                    <span className="text-3xl sm:text-4xl text-white select-none">■</span>
                  </div>
                </div>
              </div>

              <div className="w-28 h-1.5 bg-slate-600 rounded-full mx-auto mt-2" />
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: QUESTION PREVIEW (Smooth Morph of Logo & Shared Question Card) */}
        {/* ========================================================================= */}
        {stage === "question_preview" && (
          <div className="w-full flex flex-col items-center text-center">
            {/* Cahoot! Logo Morphs and Slides Smoothly Above Question Box */}
            <motion.div
              layoutId="morph-cahoot-logo"
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="mb-4 flex items-center justify-center"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                Cahoot<span className="text-[#FFA602]">!</span>
              </h2>
            </motion.div>

            {/* Super-Sized White Solid Question Box */}
            <motion.div
              layoutId="host-question-banner"
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="bg-white rounded-3xl py-8 sm:py-12 px-8 sm:px-14 border-2 border-slate-200 border-b-[8px] border-b-slate-300 shadow-2xl w-full max-w-5xl mb-6"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                {question.question_text}
              </h1>
            </motion.div>

            {/* Optional Question Media Image */}
            {question.media_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-48 sm:h-64 md:h-72 w-full max-w-2xl rounded-3xl overflow-hidden border-4 border-slate-300 shadow-xl mb-4 bg-slate-950"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.media_url}
                  alt="Question visual"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM 4-SECOND READING BAR */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-5xl mx-auto pb-6 px-4 z-20">
        {stage === "question_preview" ? (
          <div className="w-full h-5 sm:h-6 bg-[#33106B] rounded-full p-1 border-2 border-[#240B4D] shadow-inner overflow-hidden">
            <motion.div
              className="h-full bg-[#FFA602] rounded-full"
              style={{ width: `${readingProgress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        ) : (
          <div className="h-6" />
        )}
      </footer>
    </div>
  );
}
