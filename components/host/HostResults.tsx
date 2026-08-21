"use client";

import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { GameBackground } from "@/components/ui/GameBackground";
import { HostTopBar } from "@/components/host/HostTopBar";
import { Check, ArrowRight } from "lucide-react";

interface HostResultsProps {
  question: Question;
  answerCounts: [number, number, number, number];
  isLastQuestion?: boolean;
  pin?: string;
  totalPlayers?: number;
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

export function HostResults({
  question,
  answerCounts,
  isLastQuestion = false,
  pin = "",
  totalPlayers = 0,
  onNext,
}: HostResultsProps) {
  const maxVote = Math.max(...answerCounts, 1);
  const maxBarHeightPx = 360; // Extra tall 360px bar chart stage

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP BAR: FULL WIDTH KAHOOT HEADER (PIN, Logo, Players, Controls, Next) */}
      {/* ========================================================================= */}
      <HostTopBar
        pin={pin}
        totalPlayers={totalPlayers}
        actionButton={
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNext}
            className="px-5 py-1.5 sm:px-6 sm:py-2 bg-[#26890C] hover:bg-[#20750A] text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-[#1D6B09] border-b-3 border-[#124206] active:border-b active:translate-y-0.5"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next"}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </motion.button>
        }
      />

      {/* ========================================================================= */}
      {/* 2. QUESTION ZONE: SPACIOUS & LOWERED DOWN (Thai Safe Typography) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[98vw] mx-auto px-2 sm:px-4 z-20 flex-shrink-0 mt-3 sm:mt-5 mb-1 sm:mb-2">
        <div className="w-full bg-white text-slate-900 min-h-[110px] sm:min-h-[135px] md:min-h-[145px] px-8 sm:px-14 py-5 sm:py-7 rounded-2xl sm:rounded-3xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 shadow-2xl flex items-center justify-center overflow-visible">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 text-center tracking-tight leading-normal sm:leading-relaxed break-words w-full py-1">
            {question.question_text}
          </h2>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CENTER: SUPER-TALL 3D BAR CHART (Correct Answer Shines Brightest!) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-end max-w-[96vw] mx-auto w-full my-1 sm:my-2 z-10 px-2 sm:px-6 min-h-0">
        <div className="flex items-end justify-center gap-6 sm:gap-12 md:gap-16 lg:gap-20 w-full max-w-6xl h-full max-h-[390px] pb-2">
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
                className={`flex-1 max-w-[140px] sm:max-w-[180px] md:max-w-[220px] flex flex-col items-center transition-all duration-500 ${
                  isCorrect
                    ? "opacity-100 scale-[1.03] z-20"
                    : "opacity-25 grayscale-[60%] z-10"
                }`}
              >
                {/* Indicator Checkmark & Large Count Number */}
                <div className="flex flex-col items-center gap-1.5 mb-2 h-18 justify-end flex-shrink-0">
                  {isCorrect ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-[#26890C] border-3 border-white text-white rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(38,137,12,0.9)] animate-bounce"
                    >
                      <Check className="w-6 h-6 stroke-[4]" />
                    </motion.div>
                  ) : (
                    <div className="h-10" />
                  )}
                  <span className="text-3xl sm:text-5xl md:text-6xl font-black text-white tabular-nums tracking-tight drop-shadow-md">
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
                    className={`w-full h-14 sm:h-18 ${theme.bgClass} flex items-center justify-center border-t-2 border-black/20 ${theme.borderBottomClass} flex-shrink-0`}
                  >
                    <span className="text-2xl sm:text-4xl text-white select-none drop-shadow">
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
      {/* 4. BOTTOM ZONE: MASSIVE SOLID 2X2 ANSWER GRID (Thai Safe) */}
      {/* ========================================================================= */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-[96vw] mx-auto w-full pb-3 sm:pb-4 px-2 sm:px-4 z-20 flex-shrink-0">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correct_index;
          const theme = CHOICES_SOLID_THEME[idx];

          return (
            <div
              key={idx}
              className={`min-h-[80px] sm:min-h-[95px] md:min-h-[110px] rounded-2xl md:rounded-3xl flex items-center px-5 sm:px-8 border-b-[8px] sm:border-b-[10px] py-3 transition-all overflow-visible ${
                theme.borderBottomClass
              } ${theme.bgClass} ${
                isCorrect
                  ? "border-4 border-white shadow-[0_0_40px_rgba(38,137,12,0.9)] scale-[1.02] opacity-100 ring-4 ring-emerald-400"
                  : "opacity-20 grayscale-[60%]"
              }`}
            >
              <span className="text-2xl sm:text-4xl md:text-5xl mr-3 sm:mr-5 text-white select-none drop-shadow-md flex-shrink-0">
                {theme.shapeSymbol}
              </span>

              <span className="flex-1 truncate font-black text-base sm:text-xl md:text-2xl lg:text-3xl text-white tracking-tight leading-normal sm:leading-relaxed py-1">
                {choice.text}
              </span>

              {isCorrect && (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-[#26890C] rounded-full flex items-center justify-center shadow-2xl flex-shrink-0 ml-3 animate-pulse">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[4]" />
                </div>
              )}
            </div>
          );
        })}
      </footer>
    </div>
  );
}

