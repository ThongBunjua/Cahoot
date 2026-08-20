"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AvatarPicker, AVATARS } from "@/components/ui/AvatarPicker";
import { ArrowRight, Dice5 } from "lucide-react";
import { sounds } from "@/lib/audio/soundManager";

interface NicknameFormProps {
  pin: string;
  onSubmit: (nickname: string, avatar: string) => void;
  onBack: () => void;
}

const FUN_NAMES = [
  "QuizMaster", "Brainiac", "PixelHero", "SpeedyFox",
  "CosmicStar", "SuperCoder", "NinjaTrivia", "ThunderBolt",
  "LuckyCharm", "CaptainQuiz", "NeonRider", "GoldenHawk",
  "AlphaWolf", "StarGazer", "CyberKnight", "ApexPanda"
];

export function NicknameForm({ pin, onSubmit, onBack }: NicknameFormProps) {
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");

  const handleRandomName = () => {
    const randomName = FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
    const randomNum = Math.floor(Math.random() * 99) + 1;
    setNickname(`${randomName}${randomNum}`);
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setAvatar(randomAvatar);
    sounds.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nickname.trim();
    if (!cleanName) {
      setError("Please enter a nickname");
      sounds.playWrong();
      return;
    }
    if (cleanName.length > 15) {
      setError("Nickname must be 15 characters or less");
      return;
    }
    sounds.playClick();
    onSubmit(cleanName, avatar);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm font-sans"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.5)] border-2 border-slate-200 border-b-[8px] border-b-slate-300 flex flex-col gap-4 text-slate-900"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-[#46178F] bg-purple-50 border border-purple-200 px-3.5 py-1 rounded-full">
            Game PIN: {pin}
          </span>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
          >
            Change PIN
          </button>
        </div>

        {/* Selected Avatar & Input Row */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-[#33106B] rounded-2xl border-2 border-[#240B4D] border-b-4 border-[#1D083E] shadow-sm flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 select-none">
            {avatar}
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              autoFocus
              maxLength={15}
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError("");
              }}
              className="w-full text-lg sm:text-xl font-black py-3.5 pl-4 pr-11 bg-white border-2 border-slate-300 rounded-2xl focus:border-[#46178F] focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-bold text-slate-900 shadow-inner"
            />
            <button
              type="button"
              onClick={handleRandomName}
              title="Generate random nickname"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#46178F] transition-colors cursor-pointer"
            >
              <Dice5 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-xs font-bold text-center animate-pulse">{error}</p>
        )}

        {/* Curated Minimalist Avatar Grid */}
        <AvatarPicker selectedAvatar={avatar} onSelect={(a) => {
          setAvatar(a);
          sounds.playClick();
        }} />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-4 px-6 bg-[#26890C] hover:bg-[#22790A] text-white text-xl font-black tracking-wide rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-b-[6px] border-[#165406] active:border-b-[2px] active:translate-y-1 mt-1"
        >
          <span>OK, go!</span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </motion.button>
      </form>
    </motion.div>
  );
}
