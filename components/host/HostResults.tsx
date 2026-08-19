"use client";

import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Check, X, ArrowRight, BarChart3 } from "lucide-react";

interface HostResultsProps {
  question: Question;
  answerCounts: [number, number, number, number];
  onNext: () => void;
}

const BAR_STYLES = [
  {
    bgClass: "bg-kahoot-red",
    borderClass: "border-[#b8142f]",
    shape: "triangle" as const,
  },
  {
    bgClass: "bg-kahoot-blue",
    borderClass: "border-[#0e4e9e]",
    shape: "diamond" as const,
  },
  {
    bgClass: "bg-kahoot-yellow",
    borderClass: "border-[#b28200]",
    shape: "circle" as const,
  },
  {
    bgClass: "bg-kahoot-green",
    borderClass: "border-[#1d6b09]",
    shape: "square" as const,
  },
];

export function HostResults({ question, answerCounts, onNext }: HostResultsProps) {
  const totalVotes = answerCounts.reduce((a, b) => a + b, 0);
  const maxVote = Math.max(...answerCounts, 1);

  return (
    <div className="min-h-screen bg-kahoot-dark text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between bg-kahoot-dark-surface/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-kahoot-purple rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Round Breakdown
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white truncate max-w-xl">
              {question.question_text}
            </h2>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-base rounded-2xl shadow-3d-white flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </header>

      {/* Middle Bar Chart Visualization */}
      <main className="flex-1 my-8 flex items-end justify-center gap-4 sm:gap-8 max-w-4xl mx-auto w-full pb-8">
        {question.choices.map((choice, idx) => {
          const count = answerCounts[idx] || 0;
          const isCorrect = idx === question.correct_index;
          const heightPercent = totalVotes > 0 ? Math.max((count / maxVote) * 100, 8) : 8;
          const style = BAR_STYLES[idx] || BAR_STYLES[0];

          return (
            <div key={idx} className="flex-1 flex flex-col items-center max-w-[140px] h-[340px] justify-end">
              {/* Vote Count & Checkmark */}
              <div className="flex flex-col items-center gap-1 mb-2">
                {isCorrect ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-1.5 bg-green-500 text-white rounded-full shadow-lg"
                  >
                    <Check className="w-5 h-5 stroke-[4]" />
                  </motion.div>
                ) : (
                  <div className="p-1.5 bg-red-500/40 text-white/50 rounded-full">
                    <X className="w-4 h-4" />
                  </div>
                )}
                <span className="text-2xl font-black text-white tabular-nums">{count}</span>
              </div>

              {/* Animated Column Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`w-full rounded-2xl flex items-center justify-center p-3 shadow-2xl border-t-4 border-white/30 ${
                  style.bgClass
                } ${isCorrect ? "ring-4 ring-white" : "opacity-80"}`}
              >
                <KahootShape shape={style.shape} size={32} />
              </motion.div>
            </div>
          );
        })}
      </main>

      {/* Bottom Answers Legend */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-5xl mx-auto w-full">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correct_index;
          const style = BAR_STYLES[idx] || BAR_STYLES[0];

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl flex items-center gap-3 text-white font-black text-base shadow-lg transition-all ${
                style.bgClass
              } ${isCorrect ? "ring-4 ring-white scale-[1.02]" : "opacity-40 grayscale-[30%]"}`}
            >
              <div className="p-1.5 bg-black/20 rounded-lg">
                <KahootShape shape={style.shape} size={24} />
              </div>
              <span className="flex-1 truncate">{choice.text}</span>
              {isCorrect && (
                <div className="bg-white text-slate-900 p-1 rounded-full shadow-md">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </footer>
    </div>
  );
}
