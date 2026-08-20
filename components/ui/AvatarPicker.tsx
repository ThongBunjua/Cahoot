"use client";

import React from "react";
import { motion } from "framer-motion";

export const AVATARS = [
  // 1. Sleek Animals & Creatures (Clean & Modern)
  "🦊", "🦁", "🐺", "🐼", "🐻", "🐯", "🐨", "🦉",
  "🦅", "🦈", "🐬", "🐉", "🦄", "🐙", "🦖", "🦚",
  // 2. Cosmic, Hero & Gaming Badges (Gamified & Premium)
  "👑", "💎", "⚡", "🔥", "🌟", "🚀", "🪐", "🏆",
  "🎮", "👾", "🤖", "🛡️", "⚔️", "🎯", "🔮", "🍀"
];

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

export function AvatarPicker({ selectedAvatar, onSelect }: AvatarPickerProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-600">
          Choose Your Avatar ({AVATARS.length} styles)
        </label>
      </div>

      <div className="grid grid-cols-8 gap-2 p-3 bg-[#33106B] rounded-2xl border-2 border-[#240B4D] shadow-inner max-h-[190px] overflow-y-auto">
        {AVATARS.map((avatar) => {
          const isSelected = selectedAvatar === avatar;
          return (
            <motion.button
              key={avatar}
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(avatar)}
              className={`aspect-square text-2xl rounded-xl transition-all flex items-center justify-center cursor-pointer border ${
                isSelected
                  ? "bg-[#FFA602] border-2 border-white shadow-lg scale-110 z-10 text-slate-950"
                  : "bg-[#240B4D] border-[#1D083E] hover:bg-[#46178F] hover:border-purple-400 opacity-80 hover:opacity-100"
              }`}
            >
              <span className="select-none filter drop-shadow-sm">{avatar}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
