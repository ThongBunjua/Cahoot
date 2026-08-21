"use client";

import React, { useState, useRef } from "react";
import { Question } from "@/lib/realtime/types";
import { KahootShape } from "@/components/ui/KahootShapes";
import { processLocalImage } from "@/lib/utils/imageUpload";
import {
  Check,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Trash2,
  Copy,
  X,
  Plus,
  Upload,
  Link as LinkIcon,
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

const TIME_OPTIONS = [5, 10, 20, 30, 60, 90];
const MULTIPLIER_OPTIONS = [
  { label: "Standard", value: 1.0 },
  { label: "Double", value: 2.0 },
  { label: "No Points", value: 0 },
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
  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChoiceTextChange = (index: number, text: string) => {
    const updatedChoices = [...question.choices];
    updatedChoices[index] = {
      ...updatedChoices[index],
      text,
    };
    onChange({ ...question, choices: updatedChoices });
  };

  const handleCorrectChoiceSelect = (index: number) => {
    onChange({ ...question, correct_index: index });
  };

  const handleQuestionTextChange = (text: string) => {
    onChange({ ...question, question_text: text });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await processLocalImage(file);
      onChange({ ...question, media_url: dataUrl });
      setShowImageInput(false);
    } catch (err: any) {
      alert(err.message || "Failed to process image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between p-3 sm:p-6 select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 1. Top Controls Bar: Question index, Time, Multiplier, Duplicate, Delete */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 text-white mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black px-3 py-1 bg-white/10 rounded-full border border-white/15">
            Q {questionNumber} / {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Limit Selector */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/15 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            <select
              value={question.time_limit}
              onChange={(e) =>
                onChange({ ...question, time_limit: parseInt(e.target.value, 10) })
              }
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {TIME_OPTIONS.map((sec) => (
                <option key={sec} value={sec} className="bg-slate-900 text-white">
                  {sec}s
                </option>
              ))}
            </select>
          </div>

          {/* Points Multiplier */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/15 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <select
              value={question.points_multiplier ?? 1.0}
              onChange={(e) =>
                onChange({
                  ...question,
                  points_multiplier: parseFloat(e.target.value),
                })
              }
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {MULTIPLIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duplicate Button */}
          <button
            onClick={onDuplicate}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer border border-white/15"
            title="Duplicate Question"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full transition-all cursor-pointer border border-red-500/30"
              title="Delete Question"
            >
              <Trash2 className="w-3.5 h-3.5" />
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

      {/* 3. Optional Image / Media Box (Upload from PC or Paste URL) */}
      <div className="w-full max-w-4xl mx-auto my-auto py-1">
        {question.media_url ? (
          <div className="relative mx-auto w-full max-w-xs h-32 sm:h-40 rounded-2xl overflow-hidden shadow-xl border-2 border-white/30 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.media_url}
              alt="Question illustration"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-all shadow text-xs flex items-center gap-1"
                title="Change image from computer"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChange({ ...question, media_url: "" })}
                className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-all shadow"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : showImageInput ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 max-w-lg mx-auto flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputMode("upload")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    inputMode === "upload"
                      ? "bg-[#FFA602] text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from PC</span>
                </button>
                <button
                  onClick={() => setInputMode("url")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    inputMode === "url"
                      ? "bg-[#FFA602] text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Paste URL</span>
                </button>
              </div>
              <button
                onClick={() => setShowImageInput(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {inputMode === "upload" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-yellow-400/60 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/5 hover:bg-white/10 flex flex-col items-center gap-1"
              >
                <Upload className="w-6 h-6 text-yellow-400 mb-1" />
                <span className="text-xs font-bold text-white">
                  {isUploading ? "Processing Image..." : "Click to choose image from your computer"}
                </span>
                <span className="text-[10px] text-slate-400">
                  Supports JPG, PNG, WEBP, GIF (Auto-optimized)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="url"
                  value={question.media_url || ""}
                  onChange={(e) => onChange({ ...question, media_url: e.target.value })}
                  placeholder="Paste image URL (https://...)"
                  className="flex-1 text-xs text-white bg-transparent outline-none placeholder:text-slate-400"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            {/* Direct Upload from Computer Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-slate-950 bg-[#FFA602] hover:bg-[#CC8400] px-4 py-2 rounded-full border border-yellow-300 shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image from PC</span>
            </button>

            {/* Paste URL Option */}
            <button
              onClick={() => {
                setShowImageInput(true);
                setInputMode("url");
              }}
              className="text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-full border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image URL</span>
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

              {/* Text Input */}
              <input
                type="text"
                value={choice.text}
                onChange={(e) => handleChoiceTextChange(layout.index, e.target.value)}
                placeholder={layout.placeholder}
                className="flex-1 text-slate-900 font-bold text-sm sm:text-base outline-none bg-transparent placeholder:text-slate-400 placeholder:font-medium"
              />

              {/* Correct Answer Checkbox Toggle Button */}
              <button
                type="button"
                onClick={() => handleCorrectChoiceSelect(layout.index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 border-2 ${
                  isCorrect
                    ? "bg-[#26890C] text-white border-white shadow-md scale-105"
                    : "bg-slate-100 border-slate-300 text-transparent hover:border-slate-400"
                }`}
                title={isCorrect ? "Correct answer" : "Mark as correct answer"}
              >
                <Check className={`w-4 h-4 stroke-[3] ${isCorrect ? "opacity-100" : "opacity-0"}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
