"use client";

import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Check, ArrowRight } from "lucide-react";

interface HostResultsProps {
  question: Question;
  answerCounts: [number, number, number, number];
  onNext: () => void;
}

const CHOICES_THEME = [
  {
    bgClass: "bg-[#e21b3c]",
    borderClass: "border-[#b8142f]",
    shape: "triangle" as const,
  },
  {
    bgClass: "bg-[#1368ce]",
    borderClass: "border-[#0e4e9e]",
    shape: "diamond" as const,
  },
  {
    bgClass: "bg-[#d89e00]",
    borderClass: "border-[#b28200]",
    shape: "circle" as const,
  },
  {
    bgClass: "bg-[#26890c]",
    borderClass: "border-[#1d6b09]",
    shape: "square" as const,
  },
];

export function HostResults({ question, answerCounts, onNext }: HostResultsProps) {
  const maxVote = Math.max(...answerCounts, 1);
  const maxBarHeightPx = 240; // Max bar chart height in px

  return (
    <div className="h-screen w-screen bg-[#46178f] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Top Header: Question & Next Button */}
      <header className="flex items-center justify-between gap-4 max-w-6xl mx-auto w-full pt-1">
        <div className="flex-1 min-w-0 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white truncate text-center sm:text-left">
            {question.question_text}
          </h2>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="px-6 sm:px-8 py-3.5 bg-white hover:bg-slate-100 text-[#46178f] font-black text-base sm:text-lg rounded-2xl shadow-xl flex items-center gap-2 transition-all cursor-pointer flex-shrink-0"
        >
          <span>Next</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </motion.button>
      </header>

      {/* Center Bar Chart Area (Simple, Authentic Kahoot Floor Style) */}
      <main className="flex-1 flex flex-col items-center justify-end max-w-4xl mx-auto w-full my-4">
        {/* The 4 Vertical Bar Columns */}
        <div className="flex items-end justify-center gap-4 sm:gap-8 w-full px-4">
          {question.choices.map((choice, idx) => {
            const count = answerCounts[idx] || 0;
            const isCorrect = idx === question.correct_index;
            const theme = CHOICES_THEME[idx];

            // Calculate height in pixels (0 votes = 6px minimum floor bar)
            const barHeight = count > 0 ? Math.round((count / maxVote) * maxBarHeightPx) : 6;

            return (
              <div key={idx} className="flex-1 max-w-[120px] sm:max-w-[150px] flex flex-col items-center">
                {/* Indicator checkmark & Count Number (Above the bar) */}
                <div className="flex flex-col items-center gap-1 mb-2 h-14 justify-end">
                  {isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    >
                      <Check className="w-4 h-4 stroke-[4]" />
                    </motion.div>
                  )}
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums drop-shadow">
                    {count}
                  </span>
                </div>

                {/* The Rising Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}px` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`w-full rounded-t-xl ${theme.bgClass} shadow-md ${
                    isCorrect ? "ring-2 ring-white" : ""
                  }`}
                />

                {/* Base Shape Floor Tile (Fixed Size - Never Distorted) */}
                <div
                  className={`w-full h-12 sm:h-14 ${theme.bgClass} rounded-b-xl flex items-center justify-center shadow-md border-t border-black/10`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 text-white flex items-center justify-center">
                    <KahootShape shape={theme.shape} size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Answer Choices Grid (2x2) */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-5xl mx-auto w-full pb-2">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correct_index;
          const theme = CHOICES_THEME[idx];

          return (
            <div
              key={idx}
              className={`p-3.5 sm:p-4 rounded-2xl flex items-center gap-3.5 text-white font-bold text-sm sm:text-base shadow-lg transition-all ${
                theme.bgClass
              } ${
                isCorrect
                  ? "ring-4 ring-white scale-[1.01]"
                  : "opacity-40 grayscale-[20%]"
              }`}
            >
              {/* Shape Icon in Dark Box */}
              <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
                <KahootShape shape={theme.shape} size={20} />
              </div>

              {/* Choice Text */}
              <span className="flex-1 truncate font-black text-white">{choice.text}</span>

              {/* Correct Checkmark Badge */}
              {isCorrect && (
                <div className="w-6 h-6 bg-white text-[#26890c] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <Check className="w-4 h-4 stroke-[4]" />
                </div>
              )}
            </div>
          );
        })}
      </footer>
    </div>
  );
}
