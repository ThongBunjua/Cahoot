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
  "LuckyCharm", "CaptainQuiz", "NeonRider", "GoldenHawk"
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
      className="w-full max-w-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            PIN: {pin}
          </span>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
          >
            Change PIN
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-4xl p-2 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
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
              className="w-full text-lg sm:text-xl font-bold py-3 px-4 bg-slate-100 border-2 border-slate-300 rounded-2xl focus:border-kahoot-purple focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
            <button
              type="button"
              onClick={handleRandomName}
              title="Generate random nickname"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-kahoot-purple transition-colors"
            >
              <Dice5 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-bold text-center animate-pulse">{error}</p>
        )}

        <AvatarPicker selectedAvatar={avatar} onSelect={setAvatar} />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-4 px-6 bg-kahoot-green hover:bg-kahoot-green-dark text-white text-lg font-black tracking-wide rounded-2xl shadow-3d-green transition-all flex items-center justify-center gap-2 mt-2"
        >
          <span>OK, go!</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>
    </motion.div>
  );
}
