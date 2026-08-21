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

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-3 sm:p-4 md:p-6 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP ZONE: COMPACT & SHARP QUESTION BANNER */}
      {/* ========================================================================= */}
      <motion.header
        layoutId="host-question-banner"
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="w-full max-w-[98vw] mx-auto bg-white text-slate-900 rounded-2xl sm:rounded-3xl py-3 sm:py-4 px-4 sm:px-8 shadow-xl border-2 border-slate-200 border-b-[6px] border-b-slate-300 flex items-center justify-between gap-4 z-20 flex-shrink-0"
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
      {/* 2. MIDDLE ZONE: MASSIVE FULL-HEIGHT CENTER MEDIA DISPLAY CANVAS */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[98vw] mx-auto flex-1 flex items-center justify-between my-2 sm:my-3 px-1 sm:px-4 z-10 min-h-0">
        {/* Left: Giant Circular Countdown Timer */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-[8px] sm:border-[10px] border-[#26890C] bg-[#33106B] flex items-center justify-center shadow-2xl flex-shrink-0">
          <span
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tabular-nums ${
              timeRemaining <= 5 ? "text-red-400 animate-bounce" : "text-white"
            }`}
          >
            {timeRemaining}
          </span>
        </div>

        {/* Center: Extra-Large Full-Canvas Media Display (Fills Maximum Space!) */}
        <div className="flex-1 h-full max-h-[56vh] lg:max-h-[60vh] bg-[#33106B]/90 rounded-3xl border-4 border-[#240B4D] overflow-hidden shadow-2xl flex items-center justify-center mx-3 sm:mx-6 md:mx-8 relative">
          {question.media_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.media_url}
              alt="Question visual"
              className="w-full h-full object-contain bg-black/40"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-[#240B4D] border-2 border-[#1D083E] flex items-center justify-center text-5xl md:text-7xl shadow-md mb-3 animate-pulse">
                💡
              </div>
              <p className="text-base md:text-xl font-black uppercase tracking-widest text-[#FFA602]">
                Look closely at the question!
              </p>
            </div>
          )}
        </div>

        {/* Right: Giant Live Answers Counter Box */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-[#33106B] rounded-3xl border-2 border-[#240B4D] border-b-[8px] border-b-[#1D083E] flex flex-col items-center justify-center shadow-xl flex-shrink-0">
          <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tabular-nums">
            {totalAnswersReceived}
          </span>
          <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-slate-300 mt-1">
            Answers
          </span>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ZONE: SOLID 2X2 ANSWER GRID */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-[98vw] mx-auto grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 pb-1 sm:pb-2 z-20 flex-shrink-0">
        {question.choices.map((choice, idx) => {
          const config = CHOICE_CONFIGS[idx] || CHOICE_CONFIGS[0];
          return (
            <div
              key={idx}
              className={`min-h-[75px] sm:min-h-[85px] md:min-h-[100px] lg:min-h-[110px] rounded-2xl md:rounded-3xl flex items-center px-4 sm:px-6 md:px-8 border-b-[6px] sm:border-b-[8px] text-white shadow-2xl py-2 sm:py-3 ${config.bgClass}`}
            >
              {/* Geometric Shape Icon (▲, ◆, ●, ■) */}
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mr-3 sm:mr-5 md:mr-6 flex-shrink-0 select-none">
                {config.shapeSymbol}
              </span>

              {/* Answer Text */}
              <span className="text-base sm:text-lg md:text-2xl lg:text-3xl font-black tracking-tight leading-snug line-clamp-2 break-words">
                {choice.text}
              </span>
            </div>
          );
        })}
      </footer>
    </div>
  );
}
