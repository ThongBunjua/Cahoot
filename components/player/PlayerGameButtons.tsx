"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Loader2 } from "lucide-react";

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

function getPlayerChoiceFontSize(text: string) {
  const len = text ? text.trim().length : 0;
  if (len <= 35) return "text-xs sm:text-base md:text-lg";
  if (len <= 80) return "text-[11px] sm:text-sm md:text-base";
  if (len <= 140) return "text-[10px] sm:text-xs md:text-sm leading-snug";
  return "text-[10px] sm:text-xs md:text-sm leading-snug";
}

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
      {/* 1. TOP HEADER: Question Number Only */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between bg-[#33106B] rounded-2xl px-4 py-2 border-2 border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-md flex-shrink-0 w-full">
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-400">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-purple-300">
          Cahoot!
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTER STAGE: 4 Answer Buttons OR Minimalist Waiting Spinner */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {!hasAnswered ? (
          /* State A: 4 Big Color Choice Buttons */
          <motion.div
            key="buttons-grid"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 flex-1 w-full h-full min-h-0"
          >
            {BUTTON_CONFIGS.map((btn) => {
              const rawChoice = safeChoices[btn.index];
              const choiceText =
                typeof rawChoice === "string"
                  ? rawChoice
                  : (rawChoice as any)?.text
                  ? String((rawChoice as any).text)
                  : "";

              return (
                <motion.button
                  key={btn.index}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelect(btn.index)}
                  className={`relative w-full h-full rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col justify-between transition-all cursor-pointer shadow-lg overflow-hidden ${btn.bgClass} ${btn.borderClass} active:translate-y-1`}
                >
                  {/* Top: Geometric Shape Icon */}
                  <div className="w-full flex items-center justify-between flex-shrink-0">
                    <div className="p-1 rounded-xl text-white">
                      <KahootShape shape={btn.shape} size={36} className="drop-shadow-md" />
                    </div>
                  </div>

                  {/* Bottom: Choice Text */}
                  <div className="w-full text-left mt-1 flex-1 flex items-end overflow-hidden">
                    {choiceText ? (
                      <p
                        className={`font-black text-white leading-normal sm:leading-relaxed break-words py-0.5 ${getPlayerChoiceFontSize(choiceText)} ${btn.textShadow}`}
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
          </motion.div>
        ) : (
          /* State B: Clean Minimalist Spinner (No Emoji, Pure Minimal) */
          <motion.div
            key="loading-spinner-stage"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 w-full flex flex-col items-center justify-center text-center p-6 bg-[#33106B] rounded-3xl border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] shadow-2xl"
          >
            {/* Minimal Smooth Spinner */}
            <div className="mb-5 flex items-center justify-center">
              <Loader2 className="w-14 h-14 sm:w-16 sm:h-16 text-yellow-400 animate-spin" />
            </div>

            {/* Answer Submitted Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Answer Submitted
            </h2>

            {/* Minimal Subtitle */}
            <p className="text-sm font-bold text-slate-300">
              Look at the host screen
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. BOTTOM BAR: Avatar & Name (Left) + Score Badge (Right) */}
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

      {/* Embedded CSS for 60fps Liquid-Smooth Player Timer Bar */}
      <style jsx>{`
        @keyframes smoothPlayerTimerScale {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 4. BOTTOM-MOST: FULL-WIDTH SLIM COUNTDOWN PROGRESS BAR (SMOOTH 60FPS) */}
      {/* ========================================================================= */}
      <div className="w-full h-2 sm:h-2.5 bg-[#240B4D] rounded-full overflow-hidden flex-shrink-0 shadow-inner">
        <div
          style={{
            animation: `smoothPlayerTimerScale ${safeTimeLimit}s linear forwards`,
            transformOrigin: "left",
          }}
          className={`h-full w-full rounded-full transition-colors duration-300 ${
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
