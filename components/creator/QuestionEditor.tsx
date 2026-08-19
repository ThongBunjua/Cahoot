"use client";

import React from "react";
import { Question, Choice } from "@/lib/realtime/types";
import { KahootShape } from "@/components/ui/KahootShapes";
import { Check, Clock, Sparkles, Image as ImageIcon, Trash2, Copy } from "lucide-react";

interface QuestionEditorProps {
  question: Question;
  questionNumber: number;
  onChange: (updated: Question) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

const CHOICE_THEMES = [
  { bg: "bg-kahoot-red", border: "border-[#b8142f]", shape: "triangle" as const, placeholder: "Answer 1 (Red Triangle)" },
  { bg: "bg-kahoot-blue", border: "border-[#0e4e9e]", shape: "diamond" as const, placeholder: "Answer 2 (Blue Diamond)" },
  { bg: "bg-kahoot-yellow", border: "border-[#b28200]", shape: "circle" as const, placeholder: "Answer 3 (Yellow Circle)" },
  { bg: "bg-kahoot-green", border: "border-[#1d6b09]", shape: "square" as const, placeholder: "Answer 4 (Green Square)" },
];

export function QuestionEditor({
  question,
  questionNumber,
  onChange,
  onDuplicate,
  onDelete,
  canDelete,
}: QuestionEditorProps) {
  const handleChoiceTextChange = (index: number, text: string) => {
    const updatedChoices = [...question.choices];
    updatedChoices[index] = { ...updatedChoices[index], text };
    onChange({ ...question, choices: updatedChoices });
  };

  const handleCorrectIndexChange = (index: number) => {
    onChange({ ...question, correct_index: index });
  };

  return (
    <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
      {/* Top Header Controls: Question Number, Time Limit, Points Multiplier, Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="bg-kahoot-purple text-white text-sm font-black px-3.5 py-1.5 rounded-xl">
            Question {questionNumber}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Limit Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10">
            <Clock className="w-4 h-4 text-slate-400" />
            <select
              value={question.time_limit}
              onChange={(e) => onChange({ ...question, time_limit: Number(e.target.value) })}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value={10} className="bg-slate-900">10 seconds</option>
              <option value={20} className="bg-slate-900">20 seconds</option>
              <option value={30} className="bg-slate-900">30 seconds</option>
              <option value={60} className="bg-slate-900">60 seconds</option>
            </select>
          </div>

          {/* Points Multiplier */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <select
              value={question.points_multiplier}
              onChange={(e) => onChange({ ...question, points_multiplier: Number(e.target.value) })}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value={1.0} className="bg-slate-900">Standard (1,000)</option>
              <option value={2.0} className="bg-slate-900">Double (2,000)</option>
              <option value={0.0} className="bg-slate-900">No points</option>
            </select>
          </div>

          {/* Duplicate & Delete Buttons */}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Duplicate Question"
          >
            <Copy className="w-4 h-4" />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
              title="Delete Question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Question Text Input */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
          Question Text
        </label>
        <textarea
          rows={2}
          value={question.question_text}
          onChange={(e) => onChange({ ...question, question_text: e.target.value })}
          placeholder="Start typing your question here..."
          className="w-full text-xl sm:text-2xl font-black p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl focus:border-kahoot-purple focus:bg-slate-800/90 text-white placeholder:text-slate-500 outline-none transition-all resize-none"
        />
      </div>

      {/* Optional Media Image URL */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
          <span>Image / Media URL (Optional)</span>
        </label>
        <input
          type="url"
          value={question.media_url || ""}
          onChange={(e) => onChange({ ...question, media_url: e.target.value })}
          placeholder="https://images.unsplash.com/..."
          className="w-full text-sm font-medium py-2.5 px-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:border-kahoot-purple text-white placeholder:text-slate-500 outline-none transition-all"
        />
      </div>

      {/* 4 Choices Grid with Correct Answer Toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Answer Choices (Select the checkmark for the correct answer)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {question.choices.map((choice, idx) => {
            const theme = CHOICE_THEMES[idx];
            const isCorrect = question.correct_index === idx;

            return (
              <div
                key={idx}
                className={`relative flex items-center p-3 rounded-2xl border-2 transition-all ${
                  theme.bg
                } ${isCorrect ? "ring-4 ring-white border-white scale-[1.01]" : "border-transparent"}`}
              >
                <div className="p-2 bg-black/20 rounded-xl text-white mr-3 flex-shrink-0">
                  <KahootShape shape={theme.shape} size={24} />
                </div>

                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => handleChoiceTextChange(idx, e.target.value)}
                  placeholder={theme.placeholder}
                  className="flex-1 bg-transparent text-white font-black text-base placeholder:text-white/50 outline-none pr-10"
                />

                {/* Correct Answer Checkbox Toggle */}
                <button
                  type="button"
                  onClick={() => handleCorrectIndexChange(idx)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCorrect
                      ? "bg-white text-slate-900 shadow-xl scale-110"
                      : "bg-black/30 text-white/50 hover:bg-black/50 hover:text-white"
                  }`}
                  title={isCorrect ? "Correct Answer" : "Mark as Correct"}
                >
                  <Check className={`w-5 h-5 stroke-[3] ${isCorrect ? "text-slate-950" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
