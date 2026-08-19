"use client";

import React, { useState } from "react";
import { Question } from "@/lib/realtime/types";
import { KahootShape } from "@/components/ui/KahootShapes";
import {
  Check,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Trash2,
  Copy,
  X,
  Plus,
} from "lucide-react";

interface QuestionStageProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onChange: (updated: Question) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

const CHOICE_LAYOUTS = [
  {
    index: 0,
    shape: "triangle" as const,
    badgeBg: "bg-[#E21B3C]",
    placeholder: "Add answer 1 (Red Triangle)",
  },
  {
    index: 1,
    shape: "diamond" as const,
    badgeBg: "bg-[#1368CE]",
    placeholder: "Add answer 2 (Blue Diamond)",
  },
  {
    index: 2,
    shape: "circle" as const,
    badgeBg: "bg-[#D89E00]",
    placeholder: "Add answer 3 (Yellow Circle)",
  },
  {
    index: 3,
    shape: "square" as const,
    badgeBg: "bg-[#26890C]",
    placeholder: "Add answer 4 (Green Square)",
  },
];

export function QuestionStage({
  question,
  questionNumber,
  totalQuestions,
  onChange,
  onDuplicate,
  onDelete,
  canDelete,
}: QuestionStageProps) {
  const [showImageInput, setShowImageInput] = useState(Boolean(question.media_url));

  const handleQuestionTextChange = (text: string) => {
    onChange({ ...question, question_text: text });
  };

  const handleChoiceTextChange = (index: number, text: string) => {
    const updated = [...question.choices];
    updated[index] = { ...updated[index], text };
    onChange({ ...question, choices: updated });
  };

  const handleCorrectToggle = (index: number) => {
    onChange({ ...question, correct_index: index });
  };

  return (
    <div className="flex-1 h-full max-h-full overflow-y-auto custom-scrollbar flex flex-col justify-between p-3 sm:p-5 md:p-6 bg-gradient-to-b from-[#250d42] via-[#17062b] to-[#0f031c] relative select-none text-white">
      {/* 1. Top Controls Bar: Question #, Time Limit, Points, Duplicate, Delete */}
      <div className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-xl">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>

        {/* Essential Working Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Limit Selector */}
          <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-white/15">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={question.time_limit}
              onChange={(e) => onChange({ ...question, time_limit: Number(e.target.value) })}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value={10} className="bg-[#1e1b36]">10s</option>
              <option value={20} className="bg-[#1e1b36]">20s</option>
              <option value={30} className="bg-[#1e1b36]">30s</option>
              <option value={60} className="bg-[#1e1b36]">60s</option>
            </select>
          </div>

          {/* Points Multiplier */}
          <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <select
              value={question.points_multiplier}
              onChange={(e) => onChange({ ...question, points_multiplier: Number(e.target.value) })}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value={1.0} className="bg-[#1e1b36]">Standard (1,000)</option>
              <option value={2.0} className="bg-[#1e1b36]">Double (2,000)</option>
              <option value={0.0} className="bg-[#1e1b36]">No points</option>
            </select>
          </div>

          {/* Duplicate Question */}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Duplicate Question"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete Question */}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
              title="Delete Question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Question Input Card */}
      <div className="w-full max-w-4xl mx-auto my-2">
        <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-5 border border-white/60 text-center">
          <input
            type="text"
            value={question.question_text}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            placeholder="Type your question here..."
            className="w-full text-center text-lg sm:text-2xl font-black text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* 3. Optional Image / Media Box */}
      <div className="w-full max-w-4xl mx-auto my-auto py-1">
        {question.media_url ? (
          <div className="relative mx-auto w-full max-w-xs h-32 sm:h-40 rounded-2xl overflow-hidden shadow-xl border-2 border-white/30 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.media_url}
              alt="Question illustration"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onChange({ ...question, media_url: "" })}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-all shadow"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : showImageInput ? (
          <div className="bg-white/10 border border-white/15 rounded-2xl p-3 max-w-lg mx-auto flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="url"
              value={question.media_url || ""}
              onChange={(e) => onChange({ ...question, media_url: e.target.value })}
              placeholder="Paste image URL (https://...)"
              className="flex-1 text-xs text-white bg-transparent outline-none placeholder:text-slate-400"
            />
            <button
              onClick={() => setShowImageInput(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setShowImageInput(true)}
              className="text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image URL (Optional)</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. 4 Answer Choices in 2x2 Grid with Checkmark Toggle */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {CHOICE_LAYOUTS.map((layout) => {
          const choice = question.choices[layout.index];
          const isCorrect = question.correct_index === layout.index;

          return (
            <div
              key={layout.index}
              className={`bg-white rounded-xl sm:rounded-2xl p-2 shadow-lg border-2 flex items-center gap-2.5 transition-all ${
                isCorrect ? "border-[#26890C] ring-4 ring-green-200" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Colored Shape Badge on Left */}
              <div
                className={`w-9 sm:w-11 h-9 sm:h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-inner ${layout.badgeBg}`}
              >
                <KahootShape shape={layout.shape} size={20} />
              </div>

              {/* Choice Input Text */}
              <input
                type="text"
                value={choice?.text || ""}
                onChange={(e) => handleChoiceTextChange(layout.index, e.target.value)}
                placeholder={layout.placeholder}
                className="flex-1 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent py-1.5 min-w-0"
              />

              {/* Checkmark button to select correct answer */}
              <button
                type="button"
                onClick={() => handleCorrectToggle(layout.index)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mr-1 ${
                  isCorrect
                    ? "bg-[#26890C] border-[#26890C] text-white shadow-md scale-105"
                    : "border-slate-300 hover:border-slate-400 text-transparent"
                }`}
                title={isCorrect ? "Correct Answer" : "Mark as correct answer"}
              >
                <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[4] ${isCorrect ? "text-white" : ""}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
