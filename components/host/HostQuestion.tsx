"use client";

import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/realtime/types";
import { KahootShape } from "@/components/ui/KahootShapes";
import { CircularTimer } from "@/components/ui/CircularTimer";
import { Users, FastForward, Sparkles } from "lucide-react";
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
    bgClass: "bg-kahoot-red",
    shadowClass: "shadow-3d-red",
    shape: "triangle" as const,
  },
  {
    bgClass: "bg-kahoot-blue",
    shadowClass: "shadow-3d-blue",
    shape: "diamond" as const,
  },
  {
    bgClass: "bg-kahoot-yellow",
    shadowClass: "shadow-3d-yellow",
    shape: "circle" as const,
  },
  {
    bgClass: "bg-kahoot-green",
    shadowClass: "shadow-3d-green",
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
  return (
    <div className="min-h-screen bg-kahoot-dark text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar: Question Index, Circular Timer, Skip Button */}
      <header className="flex items-center justify-between gap-4 bg-kahoot-dark-surface/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black uppercase tracking-widest bg-kahoot-purple text-white px-3.5 py-1.5 rounded-xl shadow-md">
            {questionIndex + 1} / {totalQuestions}
          </span>
          {question.points_multiplier === 2.0 && (
            <span className="flex items-center gap-1 text-xs font-black uppercase bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl shadow-md animate-pulse">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>2X Double Points</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <CircularTimer
            timeRemaining={timeRemaining}
            totalTime={question.time_limit}
            size={72}
            strokeWidth={7}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
            <Users className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-black text-white tabular-nums">
              {totalAnswersReceived} / {totalPlayers} Answered
            </span>
          </div>

          <button
            onClick={onSkip}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
            title="Skip Question"
          >
            <span>Skip</span>
            <FastForward className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Middle Center: Question Text & Media Image */}
      <main className="flex-1 my-4 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border-b-4 border-slate-300 text-center mb-4"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug">
            {question.question_text}
          </h2>
        </motion.div>

        {question.media_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-44 sm:h-56 md:h-64 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 mb-2 bg-slate-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.media_url}
              alt="Question illustration"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </main>

      {/* Bottom Area: 4 Kahoot Answer Cards with Shapes & Text */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-6xl mx-auto w-full">
        {question.choices.map((choice, idx) => {
          const style = CHOICE_STYLES[idx] || CHOICE_STYLES[0];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center gap-4 text-white text-lg sm:text-xl font-black shadow-xl ${style.bgClass} ${style.shadowClass}`}
            >
              <div className="p-2 bg-black/20 rounded-xl flex items-center justify-center">
                <KahootShape shape={style.shape} size={36} />
              </div>
              <span className="flex-1 drop-shadow-sm line-clamp-2">{choice.text}</span>
            </motion.div>
          );
        })}
      </footer>
    </div>
  );
}
