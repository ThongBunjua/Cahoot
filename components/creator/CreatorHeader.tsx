"use client";

import React, { useState } from "react";
import { ArrowLeft, Save, Play, Settings, X, Sparkles, Check } from "lucide-react";
import Link from "next/link";

interface CreatorHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  description: string;
  onDescriptionChange: (newDesc: string) => void;
  coverImage: string;
  onCoverImageChange: (newUrl: string) => void;
  onSave: () => void;
  onSaveAndHost: () => void;
}

export function CreatorHeader({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  coverImage,
  onCoverImageChange,
  onSave,
  onSaveAndHost,
}: CreatorHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveClick = () => {
    onSave();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <>
      <header className="h-14 bg-[#141026] border-b border-white/10 px-3 sm:px-5 flex items-center justify-between gap-3 select-none shadow-md z-30 text-white flex-shrink-0">
        {/* Left Section: Back link, Brand, Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Link
            href="/quizzes"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex-shrink-0"
            title="Back to Quizzes"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <Link href="/quizzes" className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xl font-black text-white tracking-tight">
              Cahoot<span className="text-yellow-400">!</span>
            </span>
          </Link>

          <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />

          {/* Title Editor */}
          <div className="flex items-center gap-1.5 flex-1 max-w-sm sm:max-w-md min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter quiz title..."
              className="bg-transparent hover:bg-white/5 focus:bg-white/10 text-white font-bold text-sm sm:text-base px-2.5 py-1 rounded-xl border border-transparent focus:border-white/20 outline-none truncate transition-all w-full placeholder:text-slate-500"
            />
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              title="Quiz Settings (Description, Cover Image)"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Section: Save & Launch Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSaveClick}
            className="px-3 sm:px-4 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1.5"
          >
            {savedNotice ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </button>

          <button
            onClick={onSaveAndHost}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Save & Host</span>
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e1b36] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-white border border-white/15">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Quiz Settings</span>
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full text-sm font-bold p-3 bg-slate-900/80 border border-white/15 rounded-xl focus:border-purple-500 outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Tell players what this quiz is about..."
                  className="w-full text-sm font-medium p-3 bg-slate-900/80 border border-white/15 rounded-xl focus:border-purple-500 outline-none text-white resize-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => onCoverImageChange(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-sm p-3 bg-slate-900/80 border border-white/15 rounded-xl focus:border-purple-500 outline-none text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 text-sm font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave();
                  setShowSettings(false);
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-md"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
