"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { sounds } from "@/lib/audio/soundManager";
import { AudioControl } from "@/components/ui/AudioControl";

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

  useEffect(() => {
    // 1. Stage 3 (Countdown 3 - Red Triangle)
    sounds.playGetReadyPulse(3);

    // 2. Stage 2 (Countdown 2 - Blue Diamond) at 1.0s
    const t2 = setTimeout(() => {
      setStage("countdown_2");
      sounds.playGetReadyPulse(2);
    }, 1000);

    // 3. Stage 1 (Countdown 1 - Yellow Circle) at 2.0s
    const t1 = setTimeout(() => {
      setStage("countdown_1");
      sounds.playGetReadyPulse(1);
    }, 2000);

    // 4. Stage Phone Pop-up at 3.0s
    const tPop = setTimeout(() => {
      setStage("phone_popup");
      sounds.playClick();
    }, 3000);

    // 5. Stage Question Preview & 5s Reading Bar at 3.9s
    const tPreview = setTimeout(() => {
      setStage("question_preview");
    }, 3900);

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tPop);
      clearTimeout(tPreview);
    };
  }, []);

  // 5-second progress bar animation during question_preview
  useEffect(() => {
    if (stage !== "question_preview") return;

    const totalDurationMs = 5000;
    const intervalMs = 50;
    const increment = (intervalMs / totalDurationMs) * 100;

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onIntroComplete();
          }, 150);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [stage, onIntroComplete]);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans relative">
      {/* Top Header */}
      <header className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full pt-1 z-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-md"
        >
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-300">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </motion.div>

        <div className="flex items-center gap-3">
          <AudioControl />
        </div>
      </header>

      {/* Center Stage Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full my-auto px-4 z-10 relative">
        {/* ========================================================================= */}
        {/* STEP 1: COUNTDOWN 3-2-1 WITH MORPHING GEOMETRIC SHAPES */}
        {/* ========================================================================= */}
        <AnimatePresence mode="wait">
          {stage === "countdown_3" && (
            <motion.div
              key="step-3"
              initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="flex flex-col items-center justify-center"
            >
              {/* Red Triangle Shape */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center drop-shadow-[0_20px_35px_rgba(226,27,60,0.6)]">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-[#E21B3C] fill-current filter drop-shadow-lg"
                >
                  <polygon points="50,10 95,90 5,90" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center pt-5 text-6xl sm:text-8xl font-black text-white drop-shadow-md">
                  3
                </span>
              </div>
            </motion.div>
          )}

          {stage === "countdown_2" && (
            <motion.div
              key="step-2"
              initial={{ scale: 0.2, opacity: 0, rotate: 20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="flex flex-col items-center justify-center"
            >
              {/* Blue Diamond Shape */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center drop-shadow-[0_20px_35px_rgba(19,104,206,0.6)]">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-[#1368CE] fill-current filter drop-shadow-lg"
                >
                  <polygon points="50,5 95,50 50,95 5,50" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-6xl sm:text-8xl font-black text-white drop-shadow-md">
                  2
                </span>
              </div>
            </motion.div>
          )}

          {stage === "countdown_1" && (
            <motion.div
              key="step-1"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="flex flex-col items-center justify-center"
            >
              {/* Yellow Circle Shape */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center rounded-full bg-[#FFA602] border-4 border-amber-300 shadow-[0_20px_35px_rgba(255,166,2,0.6)]">
                <span className="text-6xl sm:text-8xl font-black text-slate-950 drop-shadow-md">
                  1
                </span>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PHONE POP-UP GRAPHIC WITH 4 COLORED BUTTONS + CAHOOT! LOGO */}
          {/* ========================================================================= */}
          {stage === "phone_popup" && (
            <motion.div
              key="step-phone"
              initial={{ scale: 0.3, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="flex flex-col items-center justify-center gap-3"
            >
              {/* Smartphone Mockup */}
              <div className="w-52 sm:w-60 h-72 sm:h-84 bg-slate-950 rounded-[36px] p-3 border-4 border-slate-700 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden">
                {/* Speaker Notch */}
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-1 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80 mr-2" />
                  <div className="w-8 h-1 rounded-full bg-slate-700" />
                </div>

                {/* Inner Screen Area */}
                <div className="flex-1 bg-gradient-to-b from-[#381272] to-[#250a52] rounded-[24px] p-2.5 flex flex-col justify-between border border-white/10 shadow-inner">
                  {/* Phone Header */}
                  <div className="flex items-center justify-between px-1 py-0.5">
                    <span className="text-[9px] font-black text-yellow-300 uppercase tracking-wider">
                      Cahoot!
                    </span>
                    <div className="w-4 h-4 rounded-full bg-yellow-400 text-[8px] font-black text-slate-950 flex items-center justify-center">
                      🦊
                    </div>
                  </div>

                  {/* 4 Colored Answer Buttons Grid */}
                  <div className="grid grid-cols-2 gap-2 my-auto">
                    {/* Red Triangle */}
                    <div className="h-14 rounded-xl bg-[#E21B3C] border-b-4 border-[#A31027] flex items-center justify-center shadow-md">
                      <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[16px] border-b-white" />
                    </div>

                    {/* Blue Diamond */}
                    <div className="h-14 rounded-xl bg-[#1368CE] border-b-4 border-[#0C4A96] flex items-center justify-center shadow-md">
                      <div className="w-4 h-4 bg-white rotate-45" />
                    </div>

                    {/* Yellow Circle */}
                    <div className="h-14 rounded-xl bg-[#FFA602] border-b-4 border-[#CC8400] flex items-center justify-center shadow-md">
                      <div className="w-4 h-4 rounded-full bg-white" />
                    </div>

                    {/* Green Square */}
                    <div className="h-14 rounded-xl bg-[#26890C] border-b-4 border-[#1A6107] flex items-center justify-center shadow-md">
                      <div className="w-4 h-4 rounded-sm bg-white" />
                    </div>
                  </div>
                </div>

                {/* Phone Bottom Home Bar */}
                <div className="w-20 h-1 bg-slate-600 rounded-full mx-auto mt-1" />
              </div>

              {/* Bold Cahoot! Text Under Phone */}
              <motion.h2
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] flex items-center justify-center"
              >
                Cahoot<span className="text-yellow-400">!</span>
              </motion.h2>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: QUESTION TEXT PREVIEW + 5-SECOND READING PROGRESS BAR */}
          {/* ========================================================================= */}
          {stage === "question_preview" && (
            <motion.div
              key="step-preview"
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Question Text Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-3xl mb-6">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {question.question_text}
                </h1>
              </div>

              {/* Optional Question Media Image */}
              {question.media_url && (
                <div className="relative h-44 sm:h-64 w-full max-w-xl rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={question.media_url}
                    alt="Question visual"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-yellow-300 animate-pulse">
                Get Ready! Question starts in a moment...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* BOTTOM 5-SECOND PROGRESS BAR (Runs Left -> Right during question_preview) */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-4xl mx-auto pb-4 px-4 z-20">
        {stage === "question_preview" ? (
          <div className="w-full flex flex-col gap-1.5">
            <div className="w-full h-4 sm:h-5 bg-black/40 rounded-full p-0.5 border border-white/20 shadow-inner overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)]"
                style={{ width: `${readingProgress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-300 px-1">
              <span>Read Question</span>
              <span>{(5 - (readingProgress / 100) * 5).toFixed(1)}s</span>
            </div>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </footer>
    </div>
  );
}
