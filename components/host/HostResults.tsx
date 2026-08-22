"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { GameBackground } from "@/components/ui/GameBackground";
import { HostTopBar } from "@/components/host/HostTopBar";
import { sounds } from "@/lib/audio/soundManager";
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

function getAnswerFontSize(text: string) {
  const len = text ? text.trim().length : 0;
  if (len <= 40) return "text-lg sm:text-2xl md:text-3xl lg:text-4xl";
  if (len <= 85) return "text-base sm:text-xl md:text-2xl lg:text-3xl";
  if (len <= 140) return "text-sm sm:text-lg md:text-xl lg:text-2xl";
  return "text-xs sm:text-base md:text-lg lg:text-xl leading-snug";
}

export function HostResults({
  question,
  answerCounts,
  isLastQuestion = false,
  pin = "",
  totalPlayers = 0,
  onNext,
}: HostResultsProps) {
  const maxVote = Math.max(...answerCounts, 1);
  const [isRevealed, setIsRevealed] = useState(false);

  // Staged suspense reveal: Bars rise first (0s - 0.75s), then Grand Reveal pops at 0.8s!
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
      sounds.playCorrect();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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
      <div className="w-full max-w-[98vw] mx-auto px-2 sm:px-4 z-20 flex-shrink-0 mt-2 sm:mt-4 mb-1">
        <div className="w-full bg-white text-slate-900 min-h-[95px] sm:min-h-[120px] md:min-h-[135px] px-6 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-3xl border-2 border-slate-200 border-b-[8px] border-b-slate-300 shadow-2xl flex items-center justify-center overflow-visible">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 text-center tracking-tight leading-normal sm:leading-relaxed break-words w-full py-1">
            {question.question_text}
          </h2>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CENTER: DYNAMIC 3-PHASE RAPID RISING BAR CHART WITH SUSPENSE */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-end max-w-[96vw] mx-auto w-full my-1 sm:my-2 z-10 px-2 sm:px-6 min-h-0">
        <div className="flex items-end justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-16 w-full max-w-5xl h-full min-h-0 pb-1">
          {question.choices.map((choice, idx) => {
            const count = answerCounts[idx] || 0;
            const isCorrect = idx === question.correct_index;
            const theme = CHOICES_SOLID_THEME[idx];

            // Dynamic percentage height capped at max 68% of available space to guarantee top headroom
            const maxPercent = 68;
            const minPercent = 4;
            const barHeightPercent =
              count === 0
                ? minPercent
                : Math.round(minPercent + (count / maxVote) * (maxPercent - minPercent));

            return (
              <div
                key={idx}
                className={`flex-1 max-w-[120px] sm:max-w-[160px] md:max-w-[200px] h-full flex flex-col justify-end items-center transition-all duration-500 ${
                  isRevealed
                    ? isCorrect
                      ? "opacity-100 scale-[1.03] z-20"
                      : "opacity-25 grayscale-[60%] z-10"
                    : "opacity-100 z-10"
                }`}
              >
                {/* Indicator Checkmark & Animated Count Number */}
                <div className="flex flex-col items-center gap-1 mb-1.5 flex-shrink-0">
                  {isCorrect ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isRevealed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 15 }}
                      className="w-9 h-9 sm:w-11 sm:h-11 bg-[#26890C] border-3 border-white text-white rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(38,137,12,0.9)] animate-bounce"
                    >
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[4]" />
                    </motion.div>
                  ) : (
                    <div className="h-9 sm:h-11" />
                  )}

                  {/* Number pops up as bar reaches peak */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.3, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.35 + idx * 0.05, duration: 0.4, ease: "easeOut" }}
                    className="text-2xl sm:text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight drop-shadow-md"
                  >
                    {count}
                  </motion.span>
                </div>

                {/* Unified Full-Column Container with Rapid Rising Animation */}
                <motion.div
                  initial={{ height: "14%" }}
                  animate={{ height: `${barHeightPercent + 15}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-full flex flex-col justify-end rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all ${
                    isRevealed && isCorrect
                      ? "border-4 border-white shadow-[0_0_40px_rgba(255,255,255,0.85)] ring-4 ring-white/30"
                      : "border-2 border-white/10"
                  }`}
                >
                  {/* The Solid Color Bar Body */}
                  <div className={`w-full flex-1 ${theme.bgClass}`} />

                  {/* Base Shape Solid Floor Tile */}
                  <div
                    className={`w-full h-11 sm:h-14 ${theme.bgClass} flex items-center justify-center border-t-2 border-black/20 ${theme.borderBottomClass} flex-shrink-0`}
                  >
                    <span className="text-xl sm:text-3xl text-white select-none drop-shadow">
                      {theme.shapeSymbol}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ZONE: MASSIVE SOLID 2X2 ANSWER GRID WITH STAGED REVEAL (Thai Safe) */}
      {/* ========================================================================= */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-[96vw] mx-auto w-full pb-3 sm:pb-4 px-2 sm:px-4 z-20 flex-shrink-0">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correct_index;
          const theme = CHOICES_SOLID_THEME[idx];

          return (
            <motion.div
              key={idx}
              animate={
                isRevealed
                  ? isCorrect
                    ? { scale: 1.02, opacity: 1 }
                    : { scale: 1, opacity: 0.2 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.4 }}
              className={`min-h-[80px] sm:min-h-[95px] md:min-h-[110px] rounded-2xl md:rounded-3xl flex items-center px-5 sm:px-8 border-b-[8px] sm:border-b-[10px] py-3 transition-all overflow-visible ${
                theme.borderBottomClass
              } ${theme.bgClass} ${
                isRevealed && isCorrect
                  ? "border-4 border-white shadow-[0_0_40px_rgba(38,137,12,0.9)] ring-4 ring-emerald-400"
                  : "border-2 border-white/20"
              }`}
            >
              <span className="text-2xl sm:text-4xl md:text-5xl mr-3 sm:mr-5 text-white select-none drop-shadow-md flex-shrink-0">
                {theme.shapeSymbol}
              </span>

              <span className={`flex-1 font-black text-white tracking-tight leading-normal sm:leading-relaxed break-words py-1 ${getAnswerFontSize(choice.text)}`}>
                {choice.text}
              </span>

              {isCorrect && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isRevealed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 15 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-[#26890C] rounded-full flex items-center justify-center shadow-2xl flex-shrink-0 ml-3 animate-pulse"
                >
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[4]" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </footer>
    </div>
  );
}

