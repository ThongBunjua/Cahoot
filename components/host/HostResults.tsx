"use client";

import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { Check, ArrowRight } from "lucide-react";

interface HostResultsProps {
  question: Question;
  answerCounts: [number, number, number, number];
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

export function HostResults({ question, answerCounts, onNext }: HostResultsProps) {
  const maxVote = Math.max(...answerCounts, 1);
  const maxBarHeightPx = 240;

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Solid White Question Box + Solid Actions */}
      {/* ========================================================================= */}
      <header className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full pt-1 z-20">
        <div className="flex-1 min-w-0 bg-white text-slate-900 px-6 py-4 rounded-3xl border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-md">
          <h2 className="text-xl md:text-3xl font-black text-slate-900 truncate text-center sm:text-left tracking-tight">
            {question.question_text}
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <AudioControl />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="px-8 py-4 bg-[#26890C] hover:bg-[#22790A] text-white font-black text-lg rounded-2xl shadow-md flex items-center gap-2.5 transition-all cursor-pointer border-b-[6px] border-[#1B6108] active:border-b-[2px] active:translate-y-1"
          >
            <span>Next</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CENTER: 3D SOLID RISING BAR CHART */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-end max-w-4xl mx-auto w-full my-4 z-10">
        <div className="flex items-end justify-center gap-6 sm:gap-10 w-full px-4">
          {question.choices.map((choice, idx) => {
            const count = answerCounts[idx] || 0;
            const isCorrect = idx === question.correct_index;
            const theme = CHOICES_SOLID_THEME[idx];
            const barHeight = count > 0 ? Math.round((count / maxVote) * maxBarHeightPx) : 8;

            return (
              <div key={idx} className="flex-1 max-w-[130px] sm:max-w-[160px] flex flex-col items-center">
                {/* Indicator Checkmark & Count Number */}
                <div className="flex flex-col items-center gap-1.5 mb-2 h-16 justify-end">
                  {isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-8 h-8 bg-[#26890C] border-2 border-white text-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <Check className="w-5 h-5 stroke-[4]" />
                    </motion.div>
                  )}
                  <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                    {count}
                  </span>
                </div>

                {/* The Solid Rising Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}px` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`w-full rounded-t-2xl ${theme.bgClass} shadow-md border-t-2 border-x-2 border-white/40 ${
                    isCorrect ? "border-t-4 border-white" : ""
                  }`}
                />

                {/* Base Shape Solid Floor Tile */}
                <div
                  className={`w-full h-14 sm:h-16 ${theme.bgClass} rounded-b-2xl flex items-center justify-center shadow-md border-b-[6px] ${theme.borderBottomClass}`}
                >
                  <span className="text-2xl sm:text-3xl text-white select-none">
                    {theme.shapeSymbol}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM SOLID 2X2 ANSWER GRID */}
      {/* ========================================================================= */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-7xl mx-auto w-full pb-2 z-20">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correct_index;
          const theme = CHOICES_SOLID_THEME[idx];

          return (
            <div
              key={idx}
              className={`h-20 sm:h-22 rounded-2xl md:rounded-3xl flex items-center px-6 border-b-[6px] ${
                theme.borderBottomClass
              } ${theme.bgClass} ${
                isCorrect
                  ? "border-4 border-white shadow-xl"
                  : "opacity-45"
              }`}
            >
              <span className="text-3xl sm:text-4xl mr-5 text-white select-none">
                {theme.shapeSymbol}
              </span>

              <span className="flex-1 truncate font-black text-xl sm:text-2xl text-white tracking-tight">
                {choice.text}
              </span>

              {isCorrect && (
                <div className="w-8 h-8 bg-white text-[#26890C] rounded-full flex items-center justify-center shadow-md flex-shrink-0 ml-2">
                  <Check className="w-5 h-5 stroke-[4]" />
                </div>
              )}
            </div>
          );
        })}
      </footer>
    </div>
  );
}
