"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { KahootShape } from "@/components/ui/KahootShapes";
import { CircularTimer } from "@/components/ui/CircularTimer";
import { AudioControl } from "@/components/ui/AudioControl";
import { sounds } from "@/lib/audio/soundManager";
import { Users, FastForward } from "lucide-react";
import Image from "next/image";

interface HostQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  totalAnswersReceived: number;
  totalPlayers: number;
  onSkip: () => void;
}

const CHOICE_STYLES = [
  {
    bgClass: "bg-[#e21b3c]",
    shape: "triangle" as const,
  },
  {
    bgClass: "bg-[#1368ce]",
    shape: "diamond" as const,
  },
  {
    bgClass: "bg-[#d89e00]",
    shape: "circle" as const,
  },
  {
    bgClass: "bg-[#26890c]",
    shape: "square" as const,
  },
];

export function HostQuestion({
  question,
  questionIndex,
  totalQuestions,
  timeRemaining,
  totalAnswersReceived,
  totalPlayers,
  onSkip,
}: HostQuestionProps) {
  // Start background question tension music
  useEffect(() => {
    sounds.startQuestionMusic();
    return () => {
      sounds.stopQuestionMusic();
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#46178f] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Top Bar: Question Index, Timer, Audio Control, Skip Button */}
      <header className="flex items-center justify-between gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 shadow-xl max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest bg-white text-[#46178f] px-3.5 py-1.5 rounded-xl shadow-md">
            {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            {question.time_limit}s Time Limit
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AudioControl />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSkip}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Skip</span>
            <FastForward className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Middle Center Canvas: Large Question Text + Media + Circular Countdown + Answer Count */}
      <main className="flex-1 my-3 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md mb-4"
        >
          {question.question_text}
        </motion.h1>

        <div className="flex items-center justify-center gap-8 sm:gap-16 w-full max-w-2xl my-2">
          {/* Left: Circular Countdown Timer */}
          <div className="flex flex-col items-center">
            <CircularTimer
              timeRemaining={timeRemaining}
              totalTime={question.time_limit}
              size={110}
              strokeWidth={10}
            />
          </div>

          {/* Center Image if available */}
          {question.media_url ? (
            <div className="relative w-48 h-32 sm:w-64 sm:h-40 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-black/40">
              <Image
                src={question.media_url}
                alt="Question media"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
              💡
            </div>
          )}

          {/* Right: Live Answers Counter */}
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md px-5 py-4 rounded-3xl border border-white/20 shadow-2xl min-w-[100px]">
            <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
              {totalAnswersReceived}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">
              <Users className="w-3 h-3 text-yellow-400" />
              <span>Answers</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom 4 Answer Options (2x2 Grid) */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-5xl mx-auto w-full pb-2">
        {question.choices.map((choice, idx) => {
          const style = CHOICE_STYLES[idx] || CHOICE_STYLES[0];
          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl flex items-center gap-4 text-white font-black text-base sm:text-lg shadow-xl ${style.bgClass}`}
            >
              <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
                <KahootShape shape={style.shape} size={22} />
              </div>
              <span className="truncate">{choice.text}</span>
            </div>
          );
        })}
      </footer>
    </div>
  );
}
