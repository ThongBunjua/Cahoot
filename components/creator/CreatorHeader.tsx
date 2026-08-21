"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Save, Play, Settings, X, Sparkles, Check, Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { processLocalImage } from "@/lib/utils/imageUpload";

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

const PRESET_COVERS = [
  { name: "Tech & Code", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80" },
  { name: "Cosmos & Stars", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80" },
  { name: "World Nature", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80" },
  { name: "Cyber Neon", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80" },
];

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
  const [coverInputMode, setCoverInputMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveClick = () => {
    onSave();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await processLocalImage(file, 1200, 0.85);
      onCoverImageChange(dataUrl);
    } catch (err: any) {
      alert(err.message || "Failed to process cover image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Hidden File Input for Cover Image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleCoverUpload}
        className="hidden"
      />

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
          </div>

          {/* Settings & Cover Image Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 bg-[#33106B] hover:bg-[#240B4D] text-white text-xs sm:text-sm font-bold rounded-xl border border-purple-700/50 flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer"
            title="Edit Quiz Cover, Title, and Description"
          >
            <Settings className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Quiz Settings & Cover</span>
          </button>
        </div>

        {/* Right Section: Save & Launch Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSaveClick}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Saved</span>
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
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Save & Host</span>
          </button>
        </div>
      </header>

      {/* Settings & Cover Image Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#1e1b36] rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white border border-white/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span>Quiz Settings & Cover Image</span>
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Quiz Title */}
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

              {/* Quiz Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Tell players what this quiz is about..."
                  className="w-full text-sm font-medium p-3 bg-slate-900/80 border border-white/15 rounded-xl focus:border-purple-500 outline-none text-white resize-none placeholder:text-slate-500"
                />
              </div>

              {/* Cover Image Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-yellow-400" />
                    <span>Quiz Cover Image</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCoverInputMode("upload")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        coverInputMode === "upload" ? "bg-[#FFA602] text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Upload from PC
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverInputMode("url")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        coverInputMode === "url" ? "bg-[#FFA602] text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                {/* Current Cover Preview */}
                {coverImage ? (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-purple-500/40 bg-slate-950 shadow-inner mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Quiz Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 bg-black/70 hover:bg-black text-white rounded-full text-xs shadow transition-all cursor-pointer"
                        title="Change Cover from PC"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onCoverImageChange("")}
                        className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full shadow transition-all cursor-pointer"
                        title="Remove Cover Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : coverInputMode === "upload" ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-yellow-400/70 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center gap-1 mb-3"
                  >
                    <Upload className="w-7 h-7 text-yellow-400 mb-1" />
                    <span className="text-xs font-bold text-white">
                      {isUploading ? "Uploading & Compressing Cover..." : "Click to choose cover image from your PC"}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP, GIF (Auto-optimized)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => onCoverImageChange(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-sm p-3 bg-slate-900/80 border border-white/15 rounded-xl focus:border-purple-500 outline-none text-white placeholder:text-slate-500"
                    />
                  </div>
                )}

                {/* Preset Themes Selector */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Or Choose a Preset Theme:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_COVERS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => onCoverImageChange(preset.url)}
                        className={`p-1.5 rounded-xl border text-left transition-all overflow-hidden flex flex-col gap-1 cursor-pointer ${
                          coverImage === preset.url
                            ? "border-yellow-400 ring-2 ring-yellow-400/40 bg-purple-900/40"
                            : "border-white/10 hover:border-white/20 bg-slate-900/50"
                        }`}
                      >
                        <div className="w-full h-12 rounded-lg overflow-hidden bg-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 truncate px-1">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 text-sm font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave();
                  setShowSettings(false);
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer"
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
