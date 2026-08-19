"use client";

import React from "react";
import { Question } from "@/lib/realtime/types";
import { Plus } from "lucide-react";

interface SlideSidebarProps {
  questions: Question[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAddQuestion: () => void;
}

export function SlideSidebar({
  questions,
  activeIndex,
  onSelect,
  onAddQuestion,
}: SlideSidebarProps) {
  return (
    <aside className="w-full md:w-56 bg-[#120f22] border-b md:border-b-0 md:border-r border-white/10 p-3 flex flex-row md:flex-col justify-between gap-3 overflow-x-auto md:overflow-y-auto custom-scrollbar select-none flex-shrink-0 max-h-24 md:max-h-full text-white">
      {/* Slides Thumbnail List */}
      <div className="flex flex-row md:flex-col gap-2 flex-1">
        {questions.map((q, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={q.id}
              onClick={() => onSelect(idx)}
              className="flex flex-col gap-1 min-w-[110px] md:min-w-0 cursor-pointer group flex-shrink-0"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Question {idx + 1}
                </span>
                <span className="text-[10px] text-slate-500 font-bold hidden md:inline">
                  {q.time_limit}s
                </span>
              </div>

              {/* Miniature Slide Card */}
              <div
                className={`w-full aspect-[16/10] bg-[#1b1730] rounded-xl p-2 border-2 transition-all shadow-md flex flex-col justify-between relative overflow-hidden ${
                  isActive
                    ? "border-purple-500 ring-2 ring-purple-500/30 bg-[#241e40]"
                    : "border-white/10 hover:border-white/20 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Mini Question Text */}
                <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight text-center my-auto">
                  {q.question_text || "Untitled question"}
                </p>

                {/* 4 colored answer indicators */}
                <div className="grid grid-cols-2 gap-0.5 w-full mt-auto">
                  <div className="h-1 rounded-xs bg-[#E21B3C]" />
                  <div className="h-1 rounded-xs bg-[#1368CE]" />
                  <div className="h-1 rounded-xs bg-[#D89E00]" />
                  <div className="h-1 rounded-xs bg-[#26890C]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action: + Add Question Button */}
      <div className="flex flex-row md:flex-col pt-1 md:pt-3 border-l md:border-l-0 md:border-t border-white/10 pl-2 md:pl-0 flex-shrink-0 items-center justify-center">
        <button
          onClick={onAddQuestion}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap w-full active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Question</span>
        </button>
      </div>
    </aside>
  );
}
