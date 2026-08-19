"use client";

import React from "react";
import { motion } from "framer-motion";

export const AVATARS = [
  "🦊", "🦁", "🐼", "🦄", "🚀", "👾", "🤖", "⚡",
  "🔥", "👑", "🍕", "🎸", "🎯", "🥑", "🏆", "🌈"
];

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

export function AvatarPicker({ selectedAvatar, onSelect }: AvatarPickerProps) {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
        Choose Your Game Avatar
      </label>
      <div className="grid grid-cols-8 gap-2 p-2 bg-slate-900/60 rounded-2xl border border-white/10 backdrop-blur-sm">
        {AVATARS.map((avatar) => {
          const isSelected = selectedAvatar === avatar;
          return (
            <motion.button
              key={avatar}
              type="button"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(avatar)}
              className={`text-2xl p-1.5 rounded-xl transition-all flex items-center justify-center ${
                isSelected
                  ? "bg-kahoot-purple ring-2 ring-white scale-110 shadow-lg"
                  : "hover:bg-white/10 opacity-75 hover:opacity-100"
              }`}
            >
              {avatar}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
