"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarPicker, AVATARS } from "@/components/ui/AvatarPicker";
import { ArrowRight, Dice5, Check, Edit3, Loader2 } from "lucide-react";
import { sounds } from "@/lib/audio/soundManager";
import { getRealtimeChannel } from "@/lib/realtime/realtimeProvider";

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
  const [isChecking, setIsChecking] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    originalName: string;
    suggestedName: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

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
    const cleanName = nickname.trim().replace(/[<>]/g, "");
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
    setIsChecking(true);

    const channel = getRealtimeChannel(pin);
    const checkId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    let resolved = false;

    // Safety timeout: If host doesn't respond within 500ms, proceed directly with cleanName
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        setIsChecking(false);
        onSubmit(cleanName, avatar);
      }
    }, 500);

    const unsubscribe = channel.subscribe((payload) => {
      if (payload.pin === pin && payload.event === "NICKNAME_RESULT") {
        const data = payload.data || {};
        if (data.checkId === checkId) {
          resolved = true;
          clearTimeout(timeoutId);
          unsubscribe();
          setIsChecking(false);

          if (data.isTaken) {
            setDuplicateInfo({
              originalName: cleanName,
              suggestedName: data.suggestedNickname || `${cleanName} 2`,
            });
          } else {
            onSubmit(cleanName, avatar);
          }
        }
      }
    });

    channel.broadcast("CHECK_NICKNAME", {
      pin,
      checkId,
      nickname: cleanName,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm font-sans relative"
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
              ref={inputRef}
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
        <AvatarPicker
          selectedAvatar={avatar}
          onSelect={(a) => {
            setAvatar(a);
            sounds.playClick();
          }}
        />

        <motion.button
          type="submit"
          disabled={isChecking}
          whileHover={{ scale: isChecking ? 1 : 1.02 }}
          whileTap={{ scale: isChecking ? 1 : 0.96 }}
          className="w-full py-4 px-6 bg-[#26890C] hover:bg-[#22790A] disabled:bg-slate-400 text-white text-xl font-black tracking-wide rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-b-[6px] border-[#165406] active:border-b-[2px] active:translate-y-1 mt-1"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span>OK, go!</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </>
          )}
        </motion.button>
      </form>

      {/* Duplicate Nickname Confirmation Modal */}
      <AnimatePresence>
        {duplicateInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-[#33106B] border-2 border-white/20 border-b-[8px] border-b-[#1D083E] rounded-3xl p-6 sm:p-7 max-w-sm w-full text-white shadow-2xl flex flex-col items-center gap-4 text-center select-none"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-3xl shadow-inner">
                ⚠️
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  ชื่อนี้มีคนใช้แล้วในห้อง!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  มีเพื่อนใช้ชื่อ <span className="font-bold text-amber-300">"{duplicateInfo.originalName}"</span> ในห้องแล้ว
                </p>
              </div>

              <div className="w-full bg-[#240B4D] border-2 border-[#1D083E] rounded-2xl p-3.5 flex flex-col items-center gap-1 shadow-inner">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ชื่อที่ระบบแนะนำ
                </span>
                <span className="text-2xl font-black text-yellow-400 tracking-wide">
                  {duplicateInfo.suggestedName}
                </span>
              </div>

              <div className="w-full flex flex-col gap-2.5 mt-1">
                {/* Option 1: Confirm suggested duplicate name */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    sounds.playClick();
                    onSubmit(duplicateInfo.suggestedName, avatar);
                  }}
                  className="w-full py-3.5 px-5 bg-[#26890C] hover:bg-[#22790A] text-white font-black text-base rounded-2xl shadow-lg border-b-4 border-[#165406] active:border-b active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>ใช้ชื่อ "{duplicateInfo.suggestedName}" เลย</span>
                </motion.button>

                {/* Option 2: Edit nickname */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    sounds.playClick();
                    setDuplicateInfo(null);
                    setTimeout(() => {
                      inputRef.current?.focus();
                      inputRef.current?.select();
                    }, 100);
                  }}
                  className="w-full py-3 px-5 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-sm rounded-2xl border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>✏️ เปลี่ยนชื่อใหม่</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

