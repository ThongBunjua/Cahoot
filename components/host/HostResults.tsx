"use client";

import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
import { Check, ArrowRight } from "lucide-react";

interface HostResultsProps {
  question: Question;
  answerCounts: [number, number, number, number];
  isLastQuestion?: boolean;
  onNext: () => void;
}

const CHOICES_SOLID_THEME = [
  {
    bgClass: "bg-[#E21B3C]",
    borderBottomClass: "border-b-[#B0142D]",
    shapeSymbol: "▲",
  },
  {
    bgClass: "bg-[#1368CE]",
    borderBottomClass: "border-b-[#0E4C96]",
    shapeSymbol: "◆",
  },
  {
    bgClass: "bg-[#D89E00]",
    borderBottomClass: "border-b-[#9E7300]",
    shapeSymbol: "●",
  },
  {
    bgClass: "bg-[#26890C]",
    borderBottomClass: "border-b-[#1B6108]",
    shapeSymbol: "■",
  },
];

export function HostResults({ question, answerCounts, isLastQuestion = false, onNext }: HostResultsProps) {
  const maxVote = Math.max(...answerCounts, 1);
  const maxBarHeightPx = 360; // Extra tall 360px bar chart stage

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Super-Sized Solid White Question Box (Widescreen max-w-[96vw]) */}
      {/* ========================================================================= */}
      <header className="flex items-center justify-between gap-6 max-w-[96vw] mx-auto w-full pt-1 z-20">
        <div className="flex-1 min-w-0 bg-white text-slate-900 px-6 md:px-10 py-5 md:py-6 rounded-3xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 shadow-xl min-h-[110px] md:min-h-[130px] flex items-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 text-center sm:text-left tracking-tight leading-snug break-words w-full">
            {question.question_text}
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <AudioControl />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="px-8 py-4 bg-[#26890C] hover:bg-[#22790A] text-white font-black text-lg md:text-xl rounded-2xl shadow-xl flex items-center gap-2.5 transition-all cursor-pointer border-b-[6px] border-[#1B6108] active:border-b-[2px] active:translate-y-1"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next"}</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CENTER: EXTRA-TALL DYNAMIC 3D SOLID BAR CHART (Widescreen max-w-[96vw]) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-end max-w-[96vw] mx-auto w-full my-2 md:my-4 z-10 px-4">
        <div className="flex items-end justify-center gap-8 sm:gap-14 md:gap-20 w-full max-w-5xl h-[380px] pb-2">
          {question.choices.map((choice, idx) => {
            const count = answerCounts[idx] || 0;
            const isCorrect = idx === question.correct_index;
            const theme = CHOICES_SOLID_THEME[idx];

            // Dynamic steep height calculation (High vote towers high, 0 vote stays at floor)
            const barHeight =
              count === 0
                ? 10
                : Math.round(35 + (count / maxVote) * (maxBarHeightPx - 35));

            return (
              <div key={idx} className="flex-1 max-w-[140px] sm:max-w-[180px] flex flex-col items-center">
                {/* Indicator Checkmark & Large Count Number */}
                <div className="flex flex-col items-center gap-1.5 mb-2 h-18 justify-end">
                  {isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-9 h-9 bg-[#26890C] border-2 border-white text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-5 h-5 stroke-[4]" />
                    </motion.div>
                  )}
                  <span className="text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                    {count}
                  </span>
                </div>

                {/* The Tall Solid Rising Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}px` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`w-full rounded-t-2xl ${theme.bgClass} shadow-xl border-t-2 border-x-2 border-white/50 ${
                    isCorrect ? "border-t-4 border-white" : ""
                  }`}
                />

                {/* Base Shape Solid Floor Tile */}
                <div
                  className={`w-full h-16 sm:h-18 ${theme.bgClass} rounded-b-2xl flex items-center justify-center shadow-lg border-b-[8px] ${theme.borderBottomClass}`}
                >
                  <span className="text-3xl sm:text-4xl text-white select-none">
                    {theme.shapeSymbol}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM SOLID 2X2 ANSWER GRID (Widescreen max-w-[96vw]) */}
      {/* ========================================================================= */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[96vw] mx-auto w-full pb-2 z-20">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correct_index;
          const theme = CHOICES_SOLID_THEME[idx];

          return (
            <div
              key={idx}
              className={`h-20 sm:h-24 rounded-2xl md:rounded-3xl flex items-center px-6 md:px-8 border-b-[8px] ${
                theme.borderBottomClass
              } ${theme.bgClass} ${
                isCorrect
                  ? "border-4 border-white shadow-2xl scale-[1.01]"
                  : "opacity-40"
              }`}
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl mr-5 text-white select-none">
                {theme.shapeSymbol}
              </span>

              <span className="flex-1 truncate font-black text-xl sm:text-2xl lg:text-3xl text-white tracking-tight">
                {choice.text}
              </span>

              {isCorrect && (
                <div className="w-8 h-8 md:w-9 md:h-9 bg-white text-[#26890C] rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                  <Check className="w-5 h-5 md:w-6 md:h-6 stroke-[4]" />
                </div>
              )}
            </div>
          );
        })}
      </footer>
    </div>
  );
}
