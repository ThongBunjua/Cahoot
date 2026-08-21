"use client";

import React from "react";
import { motion } from "framer-motion";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Flame, Loader2, Check, Clock } from "lucide-react";

interface PlayerGameButtonsProps {
  onSelect: (choiceIndex: number) => void;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  timeRemaining: number;
  timeLimit: number;
  streak: number;
  questionIndex: number;
  totalQuestions: number;
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
    textClass: "text-white",
    iconColor: "white",
  },
  {
    index: 1,
    shape: "diamond" as const,
    color: "blue",
    bgClass: "bg-[#1368CE] hover:bg-[#105CB7]",
    borderClass: "border-b-[6px] border-[#0E4E9E] active:border-b-[2px]",
    textClass: "text-white",
    iconColor: "white",
  },
  {
    index: 2,
    shape: "circle" as const,
    color: "yellow",
    bgClass: "bg-[#FFA602] hover:bg-[#E59500]",
    borderClass: "border-b-[6px] border-[#CC8400] active:border-b-[2px]",
    textClass: "text-slate-950",
    iconColor: "#0F172A",
  },
  {
    index: 3,
    shape: "square" as const,
    color: "green",
    bgClass: "bg-[#26890C] hover:bg-[#20750A]",
    borderClass: "border-b-[6px] border-[#1B6108] active:border-b-[2px]",
    textClass: "text-white",
    iconColor: "white",
  },
];

export function PlayerGameButtons({
  onSelect,
  selectedAnswer,
  hasAnswered,
  timeRemaining,
  timeLimit,
  streak,
  questionIndex,
  totalQuestions,
  questionText,
  choices = [],
}: PlayerGameButtonsProps) {
  const safeTimeLimit = timeLimit > 0 ? timeLimit : 20;
  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / safeTimeLimit) * 100));
  const isUrgent = timeRemaining <= 5 && timeRemaining > 0;

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-4 max-w-xl mx-auto font-sans select-none">
      {/* ========================================================================= */}
      {/* 1. TOP STATUS HEADER: Question Counter, Streak & Timer */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between bg-[#33106B] rounded-2xl px-4 py-2 border-2 border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-lg mb-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-400">
            Q {questionIndex + 1}/{totalQuestions}
          </span>
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
              <span>{streak} Streak</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className={`w-4 h-4 ${isUrgent ? "text-red-400 animate-pulse" : "text-slate-300"}`} />
          <span
            className={`font-black text-sm sm:text-base tabular-nums ${
              isUrgent ? "text-red-400 animate-pulse font-black text-lg" : "text-white"
            }`}
          >
            {timeRemaining}s
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. QUESTION TEXT BOX ON PLAYER DEVICE (โจทย์คำถามบนหน้าจอมือถือ) */}
      {/* ========================================================================= */}
      {questionText && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl border-2 border-slate-200 border-b-[6px] border-b-slate-300 text-center flex flex-col justify-center min-h-[64px] sm:min-h-[76px] mb-2.5 flex-shrink-0"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-snug line-clamp-3">
            {questionText}
          </h2>
        </motion.div>
      )}

      {/* Answer Submitted Floating Banner */}
      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#26890C] text-white py-2 px-4 rounded-2xl border-2 border-[#1B6108] text-center shadow-lg mb-2.5 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span className="text-xs sm:text-sm font-black tracking-wide">
            Answer submitted! Look at the big screen...
          </span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 3. 2x2 GEOMETRIC ANSWER BUTTONS WITH TEXT (ปุ่ม 4 สีพร้อมรูปทรงและข้อความคำตอบ) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 flex-1 pb-2">
        {BUTTON_CONFIGS.map((btn) => {
          const isSelected = selectedAnswer === btn.index;
          const isDimmed = hasAnswered && !isSelected;
          const choiceText = choices[btn.index] || "";

          return (
            <motion.button
              key={btn.index}
              disabled={hasAnswered}
              whileTap={!hasAnswered ? { scale: 0.96, translateY: 3 } : {}}
              onClick={() => onSelect(btn.index)}
              className={`relative w-full h-full min-h-[110px] sm:min-h-[140px] rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col justify-between transition-all cursor-pointer shadow-lg ${
                btn.bgClass
              } ${btn.borderClass} ${
                isSelected
                  ? "ring-4 ring-white scale-[1.02] z-10 shadow-2xl"
                  : isDimmed
                  ? "opacity-35 grayscale-[40%] cursor-default"
                  : "active:translate-y-1"
              }`}
            >
              {/* Top Row: Shape Icon + Selected Badge */}
              <div className="w-full flex items-center justify-between">
                <div className="p-1 rounded-lg">
                  <KahootShape shape={btn.shape} size={32} className="drop-shadow-md" />
                </div>

                {isSelected && (
                  <div className="bg-white text-slate-950 p-1.5 rounded-full shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Bottom: Answer Text (ข้อความตัวเลือกคำตอบ) */}
              <div className="w-full text-left mt-1">
                {choiceText ? (
                  <p
                    className={`font-black text-xs sm:text-sm md:text-base leading-snug line-clamp-3 ${btn.textClass}`}
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
      {/* 4. BOTTOM COUNTDOWN PROGRESS BAR & DIGITAL TIMER (แถบนับเวลาถอยหลัง) */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-col gap-1.5 pt-1.5 flex-shrink-0">
        {/* Progress Track */}
        <div className="w-full h-3 sm:h-3.5 bg-[#240B4D] rounded-full border-2 border-[#1D083E] overflow-hidden p-0.5 shadow-inner">
          <motion.div
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
            className={`h-full rounded-full transition-all duration-300 ${
              isUrgent
                ? "bg-[#E21B3C] shadow-[0_0_12px_#E21B3C]"
                : timeRemaining <= 10
                ? "bg-[#FFA602]"
                : "bg-[#26890C]"
            }`}
          />
        </div>

        {/* Timer Label */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-black text-slate-300 px-1">
          <span className="uppercase tracking-wider text-slate-400">Time Remaining</span>
          <span
            className={`tabular-nums font-black ${
              isUrgent ? "text-red-400 text-sm font-extrabold animate-pulse" : "text-yellow-400"
            }`}
          >
            {timeRemaining} / {safeTimeLimit}s
          </span>
        </div>
      </div>
    </div>
  );
}
