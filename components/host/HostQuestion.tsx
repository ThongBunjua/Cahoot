"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
import { sounds } from "@/lib/audio/soundManager";
import { FastForward } from "lucide-react";

interface HostQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  totalAnswersReceived: number;
  totalPlayers?: number;
  onSkip: () => void;
}

const CHOICE_CONFIGS = [
  {
    bgClass: "bg-[#E21B3C] border-b-[#B0142D]",
    shapeSymbol: "▲",
  },
  {
    bgClass: "bg-[#1368CE] border-b-[#0E4C96]",
    shapeSymbol: "◆",
  },
  {
    bgClass: "bg-[#D89E00] border-b-[#9E7300]",
    shapeSymbol: "●",
  },
  {
    bgClass: "bg-[#26890C] border-b-[#1B6108]",
    shapeSymbol: "■",
  },
];

export function HostQuestion({
  question,
  questionIndex,
  totalQuestions,
  timeRemaining,
  totalAnswersReceived,
  onSkip,
}: HostQuestionProps) {
  useEffect(() => {
    sounds.startQuestionMusic();
    return () => {
      sounds.stopQuestionMusic();
    };
  }, []);

  const totalTime = question.time_limit || 20;
  const timeProgressPercent = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-3 sm:p-4 md:p-5 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP ZONE: COMPACT & SHARP QUESTION BANNER */}
      {/* ========================================================================= */}
      <motion.header
        layoutId="host-question-banner"
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[98vw] mx-auto bg-white text-slate-900 rounded-2xl sm:rounded-3xl py-2.5 sm:py-3.5 px-4 sm:px-8 shadow-xl border-2 border-slate-200 border-b-[6px] border-b-slate-300 flex items-center justify-between gap-4 z-20 flex-shrink-0"
      >
        {/* Left: Question Counter Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider bg-[#33106B] text-white px-3.5 py-1.5 rounded-xl border-2 border-[#240B4D]">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Center: Giant Question Text */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-snug tracking-tight text-center flex-1 px-3 break-words">
          {question.question_text}
        </h1>

        {/* Right: Audio Control & Skip Button */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <AudioControl />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSkip()}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#33106B] hover:bg-[#240B4D] text-white font-black text-xs md:text-sm rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border-2 border-[#240B4D] border-b-4 border-black active:border-b-2 active:translate-y-0.5"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.header>

      {/* ========================================================================= */}
      {/* 2. MIDDLE ZONE: CENTER MEDIA DISPLAY CANVAS + TIMERS */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[98vw] mx-auto flex-1 flex items-center justify-between my-2 px-1 sm:px-4 z-10 min-h-0">
        {/* Left: Giant Circular Countdown Timer */}
        <div className="w-22 h-22 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-[8px] sm:border-[10px] border-[#26890C] bg-[#33106B] flex items-center justify-center shadow-2xl flex-shrink-0">
          <span
            className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tabular-nums ${
              timeRemaining <= 5 ? "text-red-400 animate-bounce" : "text-white"
            }`}
          >
            {timeRemaining}
          </span>
        </div>

        {/* Center: Full-Canvas Media Display */}
        <div className="flex-1 h-full max-h-[46vh] lg:max-h-[50vh] bg-[#33106B]/90 rounded-3xl border-4 border-[#240B4D] overflow-hidden shadow-2xl flex items-center justify-center mx-3 sm:mx-6 md:mx-8 relative">
          {question.media_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.media_url}
              alt="Question visual"
              className="w-full h-full object-contain bg-black/40"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-[#240B4D] border-2 border-[#1D083E] flex items-center justify-center text-4xl md:text-6xl shadow-md mb-2 animate-pulse">
                💡
              </div>
              <p className="text-base md:text-xl font-black uppercase tracking-widest text-[#FFA602]">
                Look closely at the question!
              </p>
            </div>
          )}
        </div>

        {/* Right: Giant Live Answers Counter Box */}
        <div className="w-22 h-22 sm:w-28 sm:h-28 md:w-36 md:h-36 bg-[#33106B] rounded-3xl border-2 border-[#240B4D] border-b-[8px] border-b-[#1D083E] flex flex-col items-center justify-center shadow-xl flex-shrink-0">
          <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tabular-nums">
            {totalAnswersReceived}
          </span>
          <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-slate-300 mt-1">
            Answers
          </span>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ZONE: MASSIVE & HIGH-IMPACT 2X2 ANSWER GRID (Super-Sized!) */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-[98vw] mx-auto grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 pb-2.5 sm:pb-3.5 z-20 flex-shrink-0">
        {question.choices.map((choice, idx) => {
          const config = CHOICE_CONFIGS[idx] || CHOICE_CONFIGS[0];
          return (
            <div
              key={idx}
              className={`min-h-[100px] sm:min-h-[125px] md:min-h-[145px] lg:min-h-[160px] rounded-2xl md:rounded-3xl flex items-center px-5 sm:px-7 md:px-9 border-b-[8px] sm:border-b-[10px] text-white shadow-2xl py-3 sm:py-4 transition-transform ${config.bgClass}`}
            >
              {/* Giant Geometric Shape Icon (▲, ◆, ●, ■) */}
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mr-4 sm:mr-6 md:mr-8 flex-shrink-0 select-none drop-shadow-md">
                {config.shapeSymbol}
              </span>

              {/* Massive Answer Text */}
              <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-snug line-clamp-2 break-words drop-shadow-sm flex-1">
                {choice.text}
              </span>
            </div>
          );
        })}
      </footer>

      {/* ========================================================================= */}
      {/* 4. REALTIME SYNCED TIME PROGRESS BAR AT THE VERY BOTTOM OF SCREEN */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 h-2 sm:h-2.5 bg-black/40 z-30 overflow-hidden">
        <motion.div
          className={`h-full transition-all duration-300 ease-linear ${
            timeRemaining <= 5
              ? "bg-gradient-to-r from-red-500 via-rose-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse"
              : "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
          }`}
          style={{
            width: `${timeProgressPercent}%`,
          }}
        />
      </div>
    </div>
  );
}
