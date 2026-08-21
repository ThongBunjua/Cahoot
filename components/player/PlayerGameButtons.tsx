"use client";

import React from "react";
import { motion } from "framer-motion";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Flame, Check } from "lucide-react";

interface PlayerGameButtonsProps {
  onSelect: (choiceIndex: number) => void;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  timeRemaining?: number;
  timeLimit?: number;
  streak?: number;
  questionIndex?: number;
  totalQuestions?: number;
  questionText?: string;
  choices?: string[];
}

const BUTTON_CONFIGS = [
  {
    index: 0,
    shape: "triangle" as const,
    color: "red",
    bgClass: "bg-[#E21B3C] hover:bg-[#C91835]",
    borderClass: "border-b-[6px] border-[#B0142D] active:border-b-[2px]",
    textShadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
  },
  {
    index: 1,
    shape: "diamond" as const,
    color: "blue",
    bgClass: "bg-[#1368CE] hover:bg-[#105CB7]",
    borderClass: "border-b-[6px] border-[#0E4E9E] active:border-b-[2px]",
    textShadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
  },
  {
    index: 2,
    shape: "circle" as const,
    color: "yellow",
    bgClass: "bg-[#FFA602] hover:bg-[#E59500]",
    borderClass: "border-b-[6px] border-[#CC8400] active:border-b-[2px]",
    textShadow: "drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)]",
  },
  {
    index: 3,
    shape: "square" as const,
    color: "green",
    bgClass: "bg-[#26890C] hover:bg-[#20750A]",
    borderClass: "border-b-[6px] border-[#1B6108] active:border-b-[2px]",
    textShadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
  },
];

export function PlayerGameButtons({
  onSelect,
  selectedAnswer,
  hasAnswered,
  timeRemaining = 20,
  timeLimit = 20,
  streak = 0,
  questionIndex = 0,
  totalQuestions = 1,
  questionText = "",
  choices = [],
}: PlayerGameButtonsProps) {
  const safeTimeLimit = typeof timeLimit === "number" && timeLimit > 0 ? timeLimit : 20;
  const safeRemaining = typeof timeRemaining === "number" ? Math.max(0, timeRemaining) : 0;
  const progressPercent = Math.max(0, Math.min(100, (safeRemaining / safeTimeLimit) * 100));
  const isUrgent = safeRemaining <= 5 && safeRemaining > 0;
  const safeChoices = Array.isArray(choices) ? choices : [];

  return (
    <div className="w-full h-full max-w-6xl mx-auto flex flex-col justify-between p-2.5 sm:p-4 md:p-6 lg:p-8 flex-1 min-h-[94dvh] font-sans select-none gap-2 sm:gap-3">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Question Counter & Streak Badge ONLY (No top timer) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between bg-[#33106B] rounded-2xl px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-lg flex-shrink-0 w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-yellow-400">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs sm:text-sm font-black px-3 py-0.5 rounded-full shadow-sm">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#D97706] text-[#D97706]" />
              <span>{streak} Streak</span>
            </div>
          )}
        </div>

        <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
          Cahoot! Live
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. QUESTION TEXT BOX ON PLAYER DEVICE (Responsive & Scroll-Safe for Long Text) */}
      {/* ========================================================================= */}
      {Boolean(questionText) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-xl border-2 border-slate-200 border-b-[6px] border-b-slate-300 text-center flex flex-col justify-center max-h-[22vh] overflow-y-auto flex-shrink-0 w-full"
        >
          <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-snug break-words">
            {questionText}
          </h2>
        </motion.div>
      )}

      {/* Answer Submitted Floating Banner */}
      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#26890C] text-white py-2 sm:py-2.5 px-4 rounded-2xl border-2 border-[#1B6108] text-center shadow-lg flex items-center justify-center gap-2 flex-shrink-0 w-full"
        >
          <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          <span className="text-xs sm:text-sm md:text-base font-black tracking-wide">
            Answer submitted! Look at the big screen...
          </span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 3. 2x2 GEOMETRIC ANSWER BUTTONS (Unified White Text + Responsive 50/50 Stretch) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-4 md:gap-5 flex-1 w-full min-h-[300px] sm:min-h-[380px] md:min-h-[460px]">
        {BUTTON_CONFIGS.map((btn) => {
          const isSelected = selectedAnswer === btn.index;
          const isDimmed = hasAnswered && !isSelected;
          const rawChoice = safeChoices[btn.index];
          const choiceText = typeof rawChoice === "string" ? rawChoice : (rawChoice as any)?.text ? String((rawChoice as any).text) : "";

          return (
            <motion.button
              key={btn.index}
              disabled={hasAnswered}
              whileTap={!hasAnswered ? { scale: 0.97, translateY: 3 } : {}}
              onClick={() => onSelect(btn.index)}
              className={`relative w-full h-full rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 flex flex-col justify-between transition-all cursor-pointer shadow-xl ${
                btn.bgClass
              } ${btn.borderClass} ${
                isSelected
                  ? "ring-4 ring-white scale-[1.02] z-10 shadow-2xl"
                  : isDimmed
                  ? "opacity-35 grayscale-[30%] cursor-default"
                  : "active:translate-y-1"
              }`}
            >
              {/* Top Row: Geometric Shape Icon + Checkmark */}
              <div className="w-full flex items-center justify-between flex-shrink-0">
                <div className="p-1 rounded-xl text-white">
                  <KahootShape shape={btn.shape} size={36} className="drop-shadow-md" />
                </div>

                {isSelected && (
                  <div className="bg-white text-slate-950 p-1.5 sm:p-2 rounded-full shadow-lg">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3.5]" />
                  </div>
                )}
              </div>

              {/* Bottom Row: Unified Pure White Text with High Contrast Shadow */}
              <div className="w-full text-left mt-2 flex-1 flex items-end">
                {choiceText ? (
                  <p
                    className={`font-black text-white text-xs sm:text-base md:text-lg lg:text-xl leading-snug break-words line-clamp-4 ${btn.textShadow}`}
                  >
                    {choiceText}
                  </p>
                ) : (
                  <span className="text-xs font-bold opacity-0">Option</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM COUNTDOWN PROGRESS BAR & DIGITAL TIMER (Single Timer Display) */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-col gap-1.5 pt-1 flex-shrink-0">
        {/* Progress Track */}
        <div className="w-full h-3 sm:h-4 bg-[#240B4D] rounded-full border-2 border-[#1D083E] overflow-hidden p-0.5 shadow-inner">
          <motion.div
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
            className={`h-full rounded-full transition-all duration-300 ${
              isUrgent
                ? "bg-[#E21B3C] shadow-[0_0_15px_#E21B3C]"
                : safeRemaining <= 10
                ? "bg-[#FFA602]"
                : "bg-[#26890C]"
            }`}
          />
        </div>

        {/* Timer Label */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-300 px-1">
          <span className="uppercase tracking-wider text-slate-400">Time Remaining</span>
          <span
            className={`tabular-nums font-black ${
              isUrgent ? "text-red-400 text-sm sm:text-base font-extrabold animate-pulse" : "text-yellow-400"
            }`}
          >
            {safeRemaining} / {safeTimeLimit}s
          </span>
        </div>
      </div>
    </div>
  );
}
