"use client";

import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Check, X, ArrowRight, Sparkles, Trophy } from "lucide-react";

interface HostResultsProps {
  question: Question;
  answerCounts: [number, number, number, number];
  onNext: () => void;
}

const BAR_STYLES = [
  {
    gradient: "from-[#ff2e56] to-[#c91238]",
    shadow: "shadow-[0_10px_30px_rgba(226,27,60,0.5)]",
    ring: "ring-[#ff4d70]",
    badgeBg: "bg-[#E21B3C]",
    shape: "triangle" as const,
    label: "Red",
  },
  {
    gradient: "from-[#2582f0] to-[#0e4e9e]",
    shadow: "shadow-[0_10px_30px_rgba(19,104,206,0.5)]",
    ring: "ring-[#3d94f6]",
    badgeBg: "bg-[#1368CE]",
    shape: "diamond" as const,
    label: "Blue",
  },
  {
    gradient: "from-[#f5b800] to-[#b88500]",
    shadow: "shadow-[0_10px_30px_rgba(216,158,0,0.5)]",
    ring: "ring-[#ffd043]",
    badgeBg: "bg-[#D89E00]",
    shape: "circle" as const,
    label: "Yellow",
  },
  {
    gradient: "from-[#32b512] to-[#1a6607]",
    shadow: "shadow-[0_10px_30px_rgba(38,137,12,0.5)]",
    ring: "ring-[#43ce22]",
    badgeBg: "bg-[#26890C]",
    shape: "square" as const,
    label: "Green",
  },
];

export function HostResults({ question, answerCounts, onNext }: HostResultsProps) {
  const totalVotes = answerCounts.reduce((a, b) => a + b, 0);
  const maxVote = Math.max(...answerCounts, 1);

  return (
    <div className="h-screen max-h-screen bg-gradient-to-b from-[#18092e] via-[#100321] to-[#0a0117] text-white flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden relative">
      {/* Background Ambient Lights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header: Question Title & Next Button */}
      <header className="relative z-10 flex items-center justify-between bg-white/10 backdrop-blur-xl px-4 sm:px-6 py-3 rounded-2xl border border-white/15 shadow-xl max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-md flex-shrink-0">
            <Trophy className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-yellow-400">
                Answer Results
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-bold text-slate-300">
                {totalVotes} {totalVotes === 1 ? "Response" : "Responses"}
              </span>
            </div>
            <h2 className="text-sm sm:text-lg md:text-xl font-black text-white truncate drop-shadow">
              {question.question_text}
            </h2>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-xl shadow-[0_8px_20px_rgba(16,185,129,0.35)] flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
        </motion.button>
      </header>

      {/* Middle 3D Bar Chart Visualizer */}
      <main className="relative z-10 flex-1 my-3 sm:my-5 flex items-end justify-center gap-4 sm:gap-8 max-w-4xl mx-auto w-full pb-4 max-h-[360px]">
        {question.choices.map((choice, idx) => {
          const count = answerCounts[idx] || 0;
          const isCorrect = idx === question.correct_index;
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const heightPercent = totalVotes > 0 ? Math.max((count / maxVote) * 100, 14) : 14;
          const style = BAR_STYLES[idx] || BAR_STYLES[0];

          return (
            <div key={idx} className="flex-1 flex flex-col items-center max-w-[130px] sm:max-w-[160px] h-full justify-end">
              {/* Vote Count & Correct/Incorrect Indicator Top Badge */}
              <div className="flex flex-col items-center gap-1 mb-2">
                {isCorrect ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="p-1.5 bg-gradient-to-tr from-emerald-500 to-green-400 text-white rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] border-2 border-white ring-4 ring-green-400/40"
                  >
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[4]" />
                  </motion.div>
                ) : (
                  <div className="p-1 bg-white/10 text-slate-400 rounded-full border border-white/15">
                    <X className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex items-baseline gap-1 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums drop-shadow-md">
                    {count}
                  </span>
                  {totalVotes > 0 && (
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">
                      ({percentage}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Animated 3D Glossy Column Pillar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`w-full rounded-2xl sm:rounded-3xl flex flex-col items-center justify-between p-3 bg-gradient-to-t ${
                  style.gradient
                } ${style.shadow} border-t-4 border-white/40 relative overflow-hidden transition-all ${
                  isCorrect
                    ? "ring-4 ring-white shadow-[0_0_35px_rgba(255,255,255,0.4)] scale-[1.02]"
                    : "opacity-85 hover:opacity-100"
                }`}
              >
                {/* Glossy top highlight overlay */}
                <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-2xl" />

                <div className="my-auto text-white drop-shadow-md">
                  <KahootShape shape={style.shape} size={36} />
                </div>
              </motion.div>
            </div>
          );
        })}
      </main>

      {/* Bottom 4 Answers Legend Cards (2x2 Grid) */}
      <footer className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-5xl mx-auto w-full">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correct_index;
          const style = BAR_STYLES[idx] || BAR_STYLES[0];
          const count = answerCounts[idx] || 0;

          return (
            <div
              key={idx}
              className={`p-3 sm:p-3.5 rounded-2xl flex items-center gap-3 text-white font-black text-xs sm:text-sm shadow-xl transition-all border-2 ${
                style.badgeBg
              } ${
                isCorrect
                  ? "border-white ring-4 ring-green-400/50 shadow-[0_0_25px_rgba(34,197,94,0.4)] scale-[1.01]"
                  : "border-transparent opacity-65"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-black/25 flex items-center justify-center flex-shrink-0 shadow-inner">
                <KahootShape shape={style.shape} size={20} />
              </div>

              <span className="flex-1 truncate text-white">{choice.text}</span>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-black bg-black/25 px-2 py-1 rounded-lg tabular-nums">
                  {count}
                </span>

                {isCorrect && (
                  <div className="bg-white text-emerald-700 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[4]" />
                    <span className="hidden sm:inline">Correct</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </footer>
    </div>
  );
}
