"use client";

import React from "react";
import { motion } from "framer-motion";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Flame, Loader2, Check } from "lucide-react";

interface PlayerGameButtonsProps {
  onSelect: (choiceIndex: number) => void;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  timeRemaining: number;
  timeLimit: number;
  streak: number;
  questionIndex: number;
  totalQuestions: number;
}

const BUTTON_CONFIGS = [
  {
    index: 0,
    shape: "triangle" as const,
    color: "red",
    bgClass: "bg-kahoot-red hover:bg-[#c91835]",
    shadowClass: "shadow-3d-red",
    borderClass: "border-[#b8142f]",
  },
  {
    index: 1,
    shape: "diamond" as const,
    color: "blue",
    bgClass: "bg-kahoot-blue hover:bg-[#105cb7]",
    shadowClass: "shadow-3d-blue",
    borderClass: "border-[#0e4e9e]",
  },
  {
    index: 2,
    shape: "circle" as const,
    color: "yellow",
    bgClass: "bg-kahoot-yellow hover:bg-[#c08d00]",
    shadowClass: "shadow-3d-yellow",
    borderClass: "border-[#b28200]",
  },
  {
    index: 3,
    shape: "square" as const,
    color: "green",
    bgClass: "bg-kahoot-green hover:bg-[#20750a]",
    shadowClass: "shadow-3d-green",
    borderClass: "border-[#1d6b09]",
  },
];

export function PlayerGameButtons({
  onSelect,
  selectedAnswer,
  hasAnswered,
  timeRemaining,
  streak,
  questionIndex,
  totalQuestions,
}: PlayerGameButtonsProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-4 max-w-lg mx-auto">
      {/* Top Status Header */}
      <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 mb-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Q {questionIndex + 1}/{totalQuestions}
          </span>
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black px-2 py-0.5 rounded-full">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streak}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400">Time:</span>
          <span
            className={`font-black text-sm tabular-nums ${
              timeRemaining <= 5 ? "text-red-400 animate-pulse font-extrabold text-base" : "text-white"
            }`}
          >
            {timeRemaining}s
          </span>
        </div>
      </div>

      {/* Answer Submitted Floating Banner */}
      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-kahoot-purple text-white p-3 rounded-2xl border-2 border-white/30 text-center shadow-2xl mb-3 flex items-center justify-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
          <span className="text-sm font-black tracking-wide">
            Answer submitted! Look at the big screen...
          </span>
        </motion.div>
      )}

      {/* 2x2 Big Kahoot Color/Shape Buttons (NO question text to focus on Host) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 pb-2">
        {BUTTON_CONFIGS.map((btn) => {
          const isSelected = selectedAnswer === btn.index;
          const isDimmed = hasAnswered && !isSelected;

          return (
            <motion.button
              key={btn.index}
              disabled={hasAnswered}
              whileTap={!hasAnswered ? { scale: 0.94, translateY: 4 } : {}}
              onClick={() => onSelect(btn.index)}
              className={`relative w-full h-full min-h-[140px] sm:min-h-[180px] rounded-3xl flex items-center justify-center transition-all ${
                btn.bgClass
              } ${btn.shadowClass} ${
                isSelected
                  ? "ring-4 ring-white scale-[1.02] z-10"
                  : isDimmed
                  ? "opacity-30 grayscale-[50%]"
                  : "active:translate-y-1.5"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2 text-white">
                <KahootShape shape={btn.shape} size={64} className="drop-shadow-md" />
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-white text-slate-900 p-1.5 rounded-full shadow-lg">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
