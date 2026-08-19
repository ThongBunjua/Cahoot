"use client";

import React, { useState } from "react";
import { Question } from "@/lib/realtime/types";
import {
  SlidersHorizontal,
  Palette,
  Clock,
  Sparkles,
  HelpCircle,
  X,
  CheckSquare,
  HelpCircle as QuestionIcon,
} from "lucide-react";

interface PropertiesSidebarProps {
  question: Question;
  onChange: (updated: Question) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export function PropertiesSidebar({
  question,
  onChange,
  onDuplicate,
  onDelete,
  canDelete,
  isOpen,
  onToggle,
}: PropertiesSidebarProps) {
  const [activeTab, setActiveTab] = useState<"properties" | "themes">("properties");

  return (
    <div className="flex select-none z-30 flex-shrink-0 relative">
      {/* Expanded Inspector Panel */}
      {isOpen && (
        <aside className="fixed md:relative right-11 top-14 bottom-0 md:top-0 md:right-0 w-64 sm:w-72 bg-[#171329] border-l border-white/10 flex flex-col justify-between shadow-2xl md:shadow-none z-30 text-white">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-black text-xs sm:text-sm text-white tracking-tight">
              Question Properties
            </h3>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Properties Controls */}
          <div className="p-3 sm:p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {/* Question Type */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <QuestionIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Question type</span>
              </label>
              <div className="relative">
                <select
                  value="quiz"
                  onChange={() => {}}
                  className="w-full text-xs font-bold p-2.5 bg-slate-900/80 border border-white/15 rounded-xl focus:border-[#7c28e8] outline-none text-white appearance-none cursor-pointer"
                >
                  <option value="quiz" className="bg-[#171329]">🎯 Quiz (4 Choices)</option>
                  <option value="true_false" className="bg-[#171329]">⚖️ True or False</option>
                </select>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Time limit</span>
              </label>
              <div className="relative">
                <select
                  value={question.time_limit}
                  onChange={(e) => onChange({ ...question, time_limit: Number(e.target.value) })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-900/80 border border-white/15 rounded-xl focus:border-[#7c28e8] outline-none text-white cursor-pointer"
                >
                  <option value={5} className="bg-[#171329]">5 seconds</option>
                  <option value={10} className="bg-[#171329]">10 seconds</option>
                  <option value={20} className="bg-[#171329]">20 seconds</option>
                  <option value={30} className="bg-[#171329]">30 seconds</option>
                  <option value={60} className="bg-[#171329]">60 seconds</option>
                  <option value={90} className="bg-[#171329]">90 seconds</option>
                  <option value={120} className="bg-[#171329]">2 minutes</option>
                </select>
              </div>
            </div>

            {/* Points */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Points</span>
              </label>
              <div className="relative">
                <select
                  value={question.points_multiplier}
                  onChange={(e) => onChange({ ...question, points_multiplier: Number(e.target.value) })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-900/80 border border-white/15 rounded-xl focus:border-[#7c28e8] outline-none text-white cursor-pointer"
                >
                  <option value={1.0} className="bg-[#171329]">Standard (1,000 pts)</option>
                  <option value={2.0} className="bg-[#171329]">Double points (2,000 pts)</option>
                  <option value={0.0} className="bg-[#171329]">No points (0 pts)</option>
                </select>
              </div>
            </div>

            {/* Answer Options */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-green-400" />
                <span>Answer options</span>
              </label>
              <div className="relative">
                <select
                  value="single"
                  onChange={() => {}}
                  className="w-full text-xs font-bold p-2.5 bg-slate-900/80 border border-white/15 rounded-xl focus:border-[#7c28e8] outline-none text-white cursor-pointer"
                >
                  <option value="single" className="bg-[#171329]">Single select</option>
                  <option value="multi" className="bg-[#171329]">Multi-select</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons: Delete & Duplicate */}
          <div className="p-2.5 sm:p-3 border-t border-white/10 bg-black/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all"
                >
                  Delete
                </button>
              )}
              <button
                onClick={onDuplicate}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs font-bold rounded-xl transition-all"
              >
                Duplicate
              </button>
            </div>

            <button
              onClick={() => alert("Cahoot! Studio allows you to author questions with custom times, media, and correct answers.")}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Far Right Vertical Tab Bar */}
      <div className="w-11 md:w-12 bg-[#120f21] border-l border-white/10 flex flex-col items-center py-3 gap-4 text-white">
        <button
          onClick={() => {
            if (!isOpen) onToggle();
            setActiveTab("themes");
          }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold p-1 rounded-xl transition-colors ${
            activeTab === "themes" && isOpen
              ? "text-[#a855f7]"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Themes"
        >
          <Palette className="w-4 h-4 md:w-5 md:h-5" />
          <span>Themes</span>
        </button>

        <button
          onClick={() => {
            if (!isOpen) onToggle();
            setActiveTab("properties");
          }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold p-1 rounded-xl transition-colors ${
            activeTab === "properties" && isOpen
              ? "text-[#a855f7]"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Properties"
        >
          <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
          <span>Properties</span>
        </button>
      </div>
    </div>
  );
}
