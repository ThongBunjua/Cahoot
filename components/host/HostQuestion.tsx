"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { GameBackground } from "@/components/ui/GameBackground";
import { HostTopBar } from "@/components/host/HostTopBar";
import { sounds } from "@/lib/audio/soundManager";
import { FastForward } from "lucide-react";

interface HostQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  totalAnswersReceived: number;
  totalPlayers?: number;
  pin?: string;
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
  totalPlayers = 0,
  pin = "",
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
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP BAR: FULL WIDTH KAHOOT HEADER (PIN, Logo, Players, Controls, Skip) */}
      {/* ========================================================================= */}
      <HostTopBar
        pin={pin}
        totalPlayers={totalPlayers}
        actionButton={
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSkip}
            className="px-4 py-1.5 sm:px-5 sm:py-2 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 border-b-3 border-slate-400 active:border-b active:translate-y-0.5"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </motion.button>
        }
      />

      {/* ========================================================================= */}
      {/* 2. QUESTION ZONE: SPACIOUS & LOWERED DOWN (Optimized for Thai Typography) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[96vw] mx-auto px-2 sm:px-4 z-20 flex-shrink-0 mt-3 sm:mt-5 mb-1 sm:mb-2">
        <motion.header
          layoutId="host-question-banner"
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-white text-slate-900 rounded-2xl sm:rounded-3xl min-h-[90px] sm:min-h-[110px] py-4 sm:py-5 px-6 sm:px-12 shadow-2xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 flex items-center justify-between gap-4 relative overflow-visible"
        >
          {/* Left: Question Counter Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider bg-[#33106B] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-[#240B4D] shadow-sm">
              {questionIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Center: Large Thai-Friendly Question Text (Generous line-height so tone marks never clip) */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-normal sm:leading-relaxed tracking-tight text-center flex-1 px-3 py-1 break-words">
            {question.question_text}
          </h1>

          {/* Right: Balance placeholder matching left badge width */}
          <div className="w-16 sm:w-24 flex-shrink-0" />
        </motion.header>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ZONE: CENTER MEDIA DISPLAY CANVAS + TIMERS */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[96vw] mx-auto flex-1 flex items-center justify-between my-1 sm:my-2 px-2 sm:px-4 z-10 min-h-0">
        {/* Left: Giant Circular Countdown Timer */}
        <div className="w-20 h-20 sm:w-26 sm:h-26 md:w-32 md:h-32 rounded-full border-[8px] sm:border-[10px] border-[#26890C] bg-[#33106B] flex items-center justify-center shadow-2xl flex-shrink-0">
          <span
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tabular-nums ${
              timeRemaining <= 5 ? "text-red-400 animate-bounce" : "text-white"
            }`}
          >
            {timeRemaining}
          </span>
        </div>

        {/* Center: Full-Canvas Media Display (Only rendered when question has an image, otherwise completely open) */}
        {question.media_url ? (
          <div className="flex-1 h-full max-h-[42vh] lg:max-h-[46vh] bg-[#33106B]/90 rounded-3xl border-4 border-[#240B4D] overflow-hidden shadow-2xl flex items-center justify-center mx-3 sm:mx-6 md:mx-8 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.media_url}
              alt="Question visual"
              className="w-full h-full object-contain bg-black/40"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right: Giant Live Answers Counter Box */}
        <div className="w-20 h-20 sm:w-26 sm:h-26 md:w-32 md:h-32 bg-[#33106B] rounded-3xl border-2 border-[#240B4D] border-b-[8px] border-b-[#1D083E] flex flex-col items-center justify-center shadow-xl flex-shrink-0">
          <span className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-none tabular-nums">
            {totalAnswersReceived}
          </span>
          <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-300 mt-1">
            Answers
          </span>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ZONE: MASSIVE & HIGH-IMPACT 2X2 ANSWER GRID (Thai Safe) */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-[96vw] mx-auto grid grid-cols-2 gap-3 sm:gap-4 pb-3 sm:pb-4 px-2 sm:px-4 z-20 flex-shrink-0">
        {question.choices.map((choice, idx) => {
          const config = CHOICE_CONFIGS[idx] || CHOICE_CONFIGS[0];
          return (
            <div
              key={idx}
              className={`min-h-[90px] sm:min-h-[110px] md:min-h-[130px] rounded-2xl md:rounded-3xl flex items-center px-4 sm:px-7 md:px-8 border-b-[8px] sm:border-b-[10px] text-white shadow-2xl py-3.5 sm:py-4.5 transition-transform overflow-visible ${config.bgClass}`}
            >
              {/* Giant Geometric Shape Icon (▲, ◆, ●, ■) */}
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mr-3 sm:mr-5 md:mr-6 flex-shrink-0 select-none drop-shadow-md">
                {config.shapeSymbol}
              </span>

              {/* Massive Thai-Friendly Answer Text (generous line height) */}
              <span className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-normal sm:leading-relaxed line-clamp-2 break-words drop-shadow-sm flex-1 py-1">
                {choice.text}
              </span>
            </div>
          );
        })}
      </footer>

      {/* ========================================================================= */}
      {/* 5. REALTIME SYNCED TIME PROGRESS BAR AT THE VERY BOTTOM OF SCREEN */}
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

