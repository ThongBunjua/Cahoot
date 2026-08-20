"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

    // 3.0s: Stage Phone Pop-up (Extended to 2 full seconds)
    const tPop = setTimeout(() => {
      setStage("phone_popup");
      sounds.playClick();
    }, 3000);

    // 5.0s: Stage Question Preview & 4-second Reading Bar
    const tPreview = setTimeout(() => {
      setStage("question_preview");
    }, 5000);

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tPop);
      clearTimeout(tPreview);
    };
  }, []);

  // 4-second smooth reading progress bar (Runs from 0% to 100% in 4s)
  useEffect(() => {
    if (stage !== "question_preview") return;

    const totalDurationMs = 4000; // Reduced to 4 seconds
    const intervalMs = 25;
    const increment = (intervalMs / totalDurationMs) * 100;

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onIntroComplete();
          }, 100);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [stage, onIntroComplete]);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* Top Header */}
      <header className="flex items-center justify-between gap-4 max-w-6xl mx-auto w-full pt-1 z-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-md"
        >
          <span className="text-sm md:text-base font-black uppercase tracking-wider text-yellow-300">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </motion.div>

        <div className="flex items-center gap-3">
          <AudioControl />
        </div>
      </header>

      {/* Center Stage Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full my-auto px-4 z-10 relative">
        {/* ========================================================================= */}
        {/* 1. COUNTDOWN 3-2-1 WITH GIANT MORPHING GEOMETRIC SHAPES */}
        {/* ========================================================================= */}
        {stage === "countdown_3" && (
          <motion.div
            key="count-3"
            initial={{ scale: 0.1, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="flex flex-col items-center justify-center"
          >
            {/* Giant Red Triangle Shape */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center drop-shadow-[0_25px_50px_rgba(226,27,60,0.7)]">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-[#E21B3C] fill-current filter drop-shadow-2xl"
              >
                <polygon points="50,6 96,94 4,94" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center pt-8 sm:pt-12 text-8xl sm:text-[140px] md:text-[170px] font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
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
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="flex flex-col items-center justify-center"
          >
            {/* Giant Blue Diamond Shape */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center drop-shadow-[0_25px_50px_rgba(19,104,206,0.7)]">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-[#1368CE] fill-current filter drop-shadow-2xl"
              >
                <polygon points="50,4 96,50 50,96 4,50" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-8xl sm:text-[140px] md:text-[170px] font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
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
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="flex flex-col items-center justify-center"
          >
            {/* Giant Yellow Circle Shape */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center rounded-full bg-[#FFA602] border-[10px] md:border-[14px] border-amber-300 shadow-[0_25px_50px_rgba(255,166,2,0.7)]">
              <span className="text-8xl sm:text-[140px] md:text-[170px] font-black text-slate-950 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                1
              </span>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 2. SMARTPHONE POP-UP GRAPHIC (2.0s duration & Clear Large Scale) */}
        {/* ========================================================================= */}
        {stage === "phone_popup" && (
          <motion.div
            key="phone-popup"
            initial={{ scale: 0.2, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            {/* Large Smartphone Mockup */}
            <div className="w-64 sm:w-76 md:w-80 h-88 sm:h-96 md:h-[400px] bg-slate-950 rounded-[44px] p-4 border-4 border-slate-700 shadow-[0_35px_80px_rgba(0,0,0,0.7)] flex flex-col justify-between relative overflow-hidden">
              {/* Speaker Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-1 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
                <div className="w-10 h-1 rounded-full bg-slate-700" />
              </div>

              {/* Inner Screen Area */}
              <div className="flex-1 bg-gradient-to-b from-[#381272] to-[#250a52] rounded-[28px] p-3 flex flex-col justify-between border border-white/10 shadow-inner">
                {/* Phone Header */}
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">
                    Cahoot!
                  </span>
                  <div className="w-6 h-6 rounded-full bg-yellow-400 text-xs font-black text-slate-950 flex items-center justify-center shadow">
                    🦊
                  </div>
                </div>

                {/* 4 Colored Answer Buttons Grid */}
                <div className="grid grid-cols-2 gap-2.5 my-auto">
                  {/* Red Triangle */}
                  <div className="h-16 rounded-xl bg-[#E21B3C] border-b-4 border-[#A31027] flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white select-none">▲</span>
                  </div>

                  {/* Blue Diamond */}
                  <div className="h-16 rounded-xl bg-[#1368CE] border-b-4 border-[#0C4A96] flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white select-none">◆</span>
                  </div>

                  {/* Yellow Circle */}
                  <div className="h-16 rounded-xl bg-[#FFA602] border-b-4 border-[#CC8400] flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white select-none">●</span>
                  </div>

                  {/* Green Square */}
                  <div className="h-16 rounded-xl bg-[#26890C] border-b-4 border-[#1A6107] flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white select-none">■</span>
                  </div>
                </div>
              </div>

              {/* Phone Bottom Home Bar */}
              <div className="w-24 h-1.5 bg-slate-600 rounded-full mx-auto mt-2" />
            </div>

            {/* Bold Cahoot! Text Under Phone */}
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center justify-center"
            >
              Cahoot<span className="text-yellow-400">!</span>
            </motion.h2>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 3. QUESTION PREVIEW (Large Center Card) */}
        {/* ========================================================================= */}
        {stage === "question_preview" && (
          <motion.div
            key="question-card"
            initial={{ scale: 0.85, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="w-full flex flex-col items-center text-center"
          >
            {/* Super-Sized White Question Box */}
            <div className="bg-white rounded-3xl py-8 sm:py-12 px-8 sm:px-14 border-2 border-slate-200 border-b-[8px] border-b-slate-300 shadow-[0_25px_60px_rgba(0,0,0,0.4)] w-full max-w-4xl mb-6">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                {question.question_text}
              </h1>
            </div>

            {/* Optional Question Media Image */}
            {question.media_url && (
              <div className="relative h-48 sm:h-64 md:h-72 w-full max-w-2xl rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl mb-4 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.media_url}
                  alt="Question visual"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM 4-SECOND READING PROGRESS BAR (Clean Bar Only) */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-5xl mx-auto pb-6 px-4 z-20">
        {stage === "question_preview" ? (
          <div className="w-full h-5 sm:h-6 bg-black/40 rounded-full p-1 border-2 border-white/20 shadow-inner overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.9)]"
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
