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
  const maxBarHeightPx = 380; // Extra tall 380px bar chart stage

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Solid White Question Box */}
      {/* ========================================================================= */}
      <header className="flex items-center justify-between gap-6 max-w-[98vw] mx-auto w-full pt-1 z-20 flex-shrink-0">
        <div className="flex-1 min-w-0 bg-white text-slate-900 px-6 sm:px-10 py-3.5 sm:py-4.5 rounded-3xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 shadow-xl flex items-center">
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
            className="px-8 py-3.5 sm:py-4 bg-[#26890C] hover:bg-[#22790A] text-white font-black text-lg md:text-2xl rounded-2xl shadow-xl flex items-center gap-2.5 transition-all cursor-pointer border-2 border-[#1D6B09] border-b-[6px] border-[#124206] active:border-b-[2px] active:translate-y-1"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next"}</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CENTER: SUPER-TALL 3D BAR CHART (Correct Answer Shines Brightest!) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-end max-w-[98vw] mx-auto w-full my-2 md:my-3 z-10 px-2 sm:px-6 min-h-0">
        <div className="flex items-end justify-center gap-6 sm:gap-12 md:gap-16 lg:gap-20 w-full max-w-6xl h-full max-h-[420px] pb-2">
          {question.choices.map((choice, idx) => {
            const count = answerCounts[idx] || 0;
            const isCorrect = idx === question.correct_index;
            const theme = CHOICES_SOLID_THEME[idx];

            // Dynamic steep height calculation (High vote towers high, 0 vote stays at floor)
            const barHeight =
              count === 0
                ? 12
                : Math.round(40 + (count / maxVote) * (maxBarHeightPx - 40));

            return (
              <div
                key={idx}
                className={`flex-1 max-w-[150px] sm:max-w-[200px] md:max-w-[240px] flex flex-col items-center transition-all duration-500 ${
                  isCorrect
                    ? "opacity-100 scale-[1.03] z-20"
                    : "opacity-25 grayscale-[60%] z-10"
                }`}
              >
                {/* Indicator Checkmark & Large Count Number */}
                <div className="flex flex-col items-center gap-1.5 mb-2.5 h-20 justify-end flex-shrink-0">
                  {isCorrect ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-11 h-11 sm:w-13 sm:h-13 bg-[#26890C] border-3 border-white text-white rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(38,137,12,0.9)] animate-bounce"
                    >
                      <Check className="w-7 h-7 stroke-[4]" />
                    </motion.div>
                  ) : (
                    <div className="h-11" />
                  )}
                  <span className="text-4xl sm:text-6xl md:text-7xl font-black text-white tabular-nums tracking-tight drop-shadow-md">
                    {count}
                  </span>
                </div>

                {/* Unified Full-Column Container with seamless border for correct answer */}
                <div
                  className={`w-full flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all ${
                    isCorrect
                      ? "border-4 border-white shadow-[0_0_40px_rgba(255,255,255,0.75)]"
                      : "border-2 border-white/10"
                  }`}
                >
                  {/* The Rising Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}px` }}
                    transition={{ duration: 0.85, ease: "easeOut" }}
                    className={`w-full ${theme.bgClass}`}
                  />

                  {/* Base Shape Solid Floor Tile */}
                  <div
                    className={`w-full h-16 sm:h-20 ${theme.bgClass} flex items-center justify-center border-t-2 border-black/20 ${theme.borderBottomClass} flex-shrink-0`}
                  >
                    <span className="text-3xl sm:text-5xl text-white select-none drop-shadow">
                      {theme.shapeSymbol}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ZONE: MASSIVE SOLID 2X2 ANSWER GRID */}
      {/* ========================================================================= */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 max-w-[98vw] mx-auto w-full pb-2 z-20 flex-shrink-0">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correct_index;
          const theme = CHOICES_SOLID_THEME[idx];

          return (
            <div
              key={idx}
              className={`min-h-[85px] sm:min-h-[105px] md:min-h-[120px] rounded-2xl md:rounded-3xl flex items-center px-6 sm:px-8 border-b-[8px] sm:border-b-[10px] py-3 transition-all ${
                theme.borderBottomClass
              } ${theme.bgClass} ${
                isCorrect
                  ? "border-4 border-white shadow-[0_0_40px_rgba(38,137,12,0.9)] scale-[1.02] opacity-100 ring-4 ring-emerald-400"
                  : "opacity-20 grayscale-[60%]"
              }`}
            >
              <span className="text-3xl sm:text-5xl md:text-6xl mr-4 sm:mr-6 text-white select-none drop-shadow-md">
                {theme.shapeSymbol}
              </span>

              <span className="flex-1 truncate font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white tracking-tight">
                {choice.text}
              </span>

              {isCorrect && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-[#26890C] rounded-full flex items-center justify-center shadow-2xl flex-shrink-0 ml-3 animate-pulse">
                  <Check className="w-7 h-7 stroke-[4]" />
                </div>
              )}
            </div>
          );
        })}
      </footer>
    </div>
  );
}
