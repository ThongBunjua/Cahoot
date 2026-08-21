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
  totalPlayers: number;
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
    bgClass: "bg-[#FFA602] border-b-[#CC8400]",
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
  totalPlayers,
  onSkip,
}: HostQuestionProps) {
  // Start background question tension music
  useEffect(() => {
    sounds.startQuestionMusic();
    return () => {
      sounds.stopQuestionMusic();
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />
      {/* ========================================================================= */}
      {/* 1. TOP ZONE: SUPER-SIZED SOLID QUESTION BOX (Widescreen max-w-[96vw]) */}
      {/* ========================================================================= */}
      <motion.header
        layoutId="host-question-banner"
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="w-full max-w-[96vw] mx-auto bg-white text-slate-900 rounded-3xl py-5 md:py-7 px-6 md:px-12 shadow-xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 flex items-center justify-between gap-6 z-20 min-h-[110px] md:min-h-[130px]"
      >
        {/* Left: Question Counter Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm md:text-base font-black uppercase tracking-wider bg-[#33106B] text-white px-4 py-2 rounded-2xl border-2 border-[#240B4D]">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Center: Giant Question Text */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-snug tracking-tight text-center flex-1 px-4 break-words">
          {question.question_text}
        </h1>

        {/* Right: Audio Control & Skip Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <AudioControl />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSkip()}
            className="px-6 py-3 bg-[#33106B] hover:bg-[#240B4D] text-white font-black text-xs md:text-sm rounded-2xl shadow-md flex items-center gap-2 transition-all cursor-pointer border-2 border-[#240B4D] border-b-4 border-black active:border-b-2 active:translate-y-0.5"
          >
            <span>Skip</span>
            <FastForward className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.header>

      {/* ========================================================================= */}
      {/* 2. MIDDLE ZONE: ENLARGED 3-PART SOLID CENTER STAGE */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[96vw] mx-auto flex-1 flex items-center justify-between my-3 md:my-5 px-2 md:px-4 z-10">
        {/* Left: Giant Circular Countdown Timer */}
        <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[10px] border-[#26890C] bg-[#33106B] flex items-center justify-center shadow-2xl flex-shrink-0">
          <span
            className={`text-6xl md:text-8xl font-black tabular-nums ${
              timeRemaining <= 5 ? "text-red-400 animate-bounce" : "text-white"
            }`}
          >
            {timeRemaining}
          </span>
        </div>

        {/* Center: Giant Media Display Canvas */}
        <div className="flex-1 max-w-4xl h-60 md:h-80 lg:h-96 bg-[#33106B] rounded-3xl border-4 border-[#240B4D] overflow-hidden shadow-xl flex items-center justify-center mx-4 md:mx-8 relative">
          {question.media_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.media_url}
              alt="Question visual"
              className="w-full h-full object-cover"
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
        <div className="w-36 h-36 md:w-48 md:h-48 bg-[#33106B] rounded-3xl border-2 border-[#240B4D] border-b-[8px] border-b-[#1D083E] flex flex-col items-center justify-center shadow-xl flex-shrink-0">
          <span className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-none tabular-nums">
            {totalAnswersReceived}
          </span>
          <span className="text-xs md:text-base font-black uppercase tracking-widest text-slate-300 mt-2">
            Answers
          </span>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ZONE: GIANT 2X2 SOLID ANSWER GRID (Widescreen max-w-[96vw]) */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-[96vw] mx-auto grid grid-cols-2 gap-4 md:gap-6 pb-2 md:pb-4 z-20">
        {question.choices.map((choice, idx) => {
          const config = CHOICE_CONFIGS[idx] || CHOICE_CONFIGS[0];
          return (
            <div
              key={idx}
              className={`min-h-[85px] md:min-h-[110px] lg:min-h-[125px] rounded-2xl md:rounded-3xl flex items-center px-6 md:px-10 border-b-[8px] text-white shadow-2xl py-3 ${config.bgClass}`}
            >
              {/* Geometric Shape Icon (▲, ◆, ●, ■) */}
              <span className="text-4xl md:text-5xl lg:text-6xl mr-5 md:mr-7 flex-shrink-0 select-none">
                {config.shapeSymbol}
              </span>

              {/* Answer Text */}
              <span className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-snug line-clamp-2 break-words">
                {choice.text}
              </span>
            </div>
          );
        })}
      </footer>
    </div>
  );
}
