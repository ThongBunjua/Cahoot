"use client";

import React from "react";
import { motion } from "framer-motion";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Check } from "lucide-react";

interface PlayerGameButtonsProps {
  onSelect: (choiceIndex: number) => void;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  timeRemaining?: number;
  timeLimit?: number;
  questionIndex?: number;
  totalQuestions?: number;
  choices?: string[];
  nickname?: string;
  avatar?: string;
  score?: number;
}

const BUTTON_CONFIGS = [
  {
    index: 0,
    shape: "triangle" as const,
    color: "red",
    bgClass: "bg-[#E21B3C] hover:bg-[#C91835]",
    borderClass: "border-b-[5px] border-[#B0142D] active:border-b-[1px]",
    textShadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]",
  },
  {
    index: 1,
    shape: "diamond" as const,
    color: "blue",
    bgClass: "bg-[#1368CE] hover:bg-[#105CB7]",
    borderClass: "border-b-[5px] border-[#0E4E9E] active:border-b-[1px]",
    textShadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]",
  },
  {
    index: 2,
    shape: "circle" as const,
    color: "yellow",
    bgClass: "bg-[#FFA602] hover:bg-[#E59500]",
    borderClass: "border-b-[5px] border-[#CC8400] active:border-b-[1px]",
    textShadow: "drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]",
  },
  {
    index: 3,
    shape: "square" as const,
    color: "green",
    bgClass: "bg-[#26890C] hover:bg-[#20750A]",
    borderClass: "border-b-[5px] border-[#1B6108] active:border-b-[1px]",
    textShadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]",
  },
];

export function PlayerGameButtons({
  onSelect,
  selectedAnswer,
  hasAnswered,
  timeRemaining = 20,
  timeLimit = 20,
  questionIndex = 0,
  totalQuestions = 1,
  choices = [],
  nickname = "Player",
  avatar = "🦊",
  score = 0,
}: PlayerGameButtonsProps) {
  const safeTimeLimit = typeof timeLimit === "number" && timeLimit > 0 ? timeLimit : 20;
  const safeRemaining = typeof timeRemaining === "number" ? Math.max(0, timeRemaining) : 0;
  const progressPercent = Math.max(0, Math.min(100, (safeRemaining / safeTimeLimit) * 100));
  const isUrgent = safeRemaining <= 5 && safeRemaining > 0;
  const safeChoices = Array.isArray(choices) ? choices : [];

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col justify-between p-2 sm:p-3 md:p-4 flex-1 overflow-hidden font-sans select-none gap-2">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Question Number Only (Classic Kahoot Style) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between bg-[#33106B] rounded-2xl px-4 py-2 border-2 border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-md flex-shrink-0 w-full">
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-400">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-purple-300">
          Cahoot!
        </span>
      </div>

      {/* Answer Submitted Floating Banner (Compact) */}
      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#26890C] text-white py-1.5 px-3 rounded-xl border border-[#1B6108] text-center shadow-md flex items-center justify-center gap-1.5 flex-shrink-0 w-full"
        >
          <Check className="w-4 h-4 stroke-[3.5]" />
          <span className="text-xs sm:text-sm font-black">
            Answer submitted! Look at the big screen...
          </span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 2. CENTER: 2X2 GEOMETRIC ANSWER BUTTONS (Exact Classic Kahoot Look) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 flex-1 w-full h-full min-h-0">
        {BUTTON_CONFIGS.map((btn) => {
          const isSelected = selectedAnswer === btn.index;
          const isDimmed = hasAnswered && !isSelected;
          const rawChoice = safeChoices[btn.index];
          const choiceText = typeof rawChoice === "string" ? rawChoice : (rawChoice as any)?.text ? String((rawChoice as any).text) : "";

          return (
            <motion.button
              key={btn.index}
              disabled={hasAnswered}
              whileTap={!hasAnswered ? { scale: 0.97 } : {}}
              onClick={() => onSelect(btn.index)}
              className={`relative w-full h-full rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col justify-between transition-all cursor-pointer shadow-lg overflow-hidden ${
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
                  <div className="bg-white text-slate-950 p-1.5 rounded-full shadow-lg">
                    <Check className="w-4 h-4 stroke-[3.5]" />
                  </div>
                )}
              </div>

              {/* Bottom Row: Unified White Text with Word Break */}
              <div className="w-full text-left mt-1 flex-1 flex items-end overflow-hidden">
                {choiceText ? (
                  <p
                    className={`font-black text-white text-xs sm:text-base md:text-lg leading-snug break-words line-clamp-3 ${btn.textShadow}`}
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
      {/* 3. BOTTOM BAR: Avatar & Name (Left) + Score Badge (Right) [Image 2 Style] */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between bg-white text-slate-950 px-3 sm:px-4 py-2 rounded-2xl shadow-md border-2 border-slate-200 border-b-[4px] border-b-slate-300 flex-shrink-0 w-full">
        {/* Left: Avatar & Nickname */}
        <div className="flex items-center gap-2 truncate">
          <span className="text-xl sm:text-2xl filter drop-shadow-sm select-none">{avatar}</span>
          <span className="text-sm sm:text-base font-black text-slate-900 truncate max-w-[160px] sm:max-w-[240px]">
            {nickname}
          </span>
        </div>

        {/* Right: Solid Dark Score Badge */}
        <div className="bg-[#121124] text-white px-3 sm:px-4 py-1 rounded-xl font-black text-sm sm:text-base tabular-nums border border-black shadow-inner">
          {score.toLocaleString()}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM-MOST: FULL-WIDTH SLIM COUNTDOWN PROGRESS BAR (No Text Number) */}
      {/* ========================================================================= */}
      <div className="w-full h-2 sm:h-2.5 bg-[#240B4D] rounded-full overflow-hidden flex-shrink-0 shadow-inner">
        <motion.div
          style={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.25, ease: "linear" }}
          className={`h-full rounded-full transition-all duration-200 ${
            isUrgent
              ? "bg-[#E21B3C] shadow-[0_0_12px_#E21B3C]"
              : safeRemaining <= 10
              ? "bg-[#FFA602]"
              : "bg-[#26890C]"
          }`}
        />
      </div>
    </div>
  );
}
