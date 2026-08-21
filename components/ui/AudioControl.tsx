"use client";

import React, { useState, useEffect, useRef } from "react";
import { sounds } from "@/lib/audio/soundManager";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioControlProps {
  autoPlayLobby?: boolean;
  className?: string;
}

export function AudioControl({ className = "" }: AudioControlProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hoverTimeoutRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    setIsMuted(sounds.getMuted());
    setVolume(sounds.getVolume());

    const unsubscribe = sounds.subscribe((muted, vol) => {
      setIsMuted(muted);
      setVolume(vol);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyM" && (e.target as HTMLElement).tagName !== "INPUT") {
        const nextMute = sounds.toggleMute();
        setIsMuted(nextMute);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener("keydown", handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value) / 100;
    setVolume(newVol);
    sounds.setVolume(newVol);
  };

  if (!mounted) return null;

  const currentVolPct = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div
      className={`relative z-50 inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Main Icon Button (Icon Only - No Text!) */}
      <button
        onClick={handleToggleMute}
        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer border-2 ${
          isMuted || currentVolPct === 0
            ? "bg-[#E21B3C] hover:bg-[#B0142D] text-white border-[#B0142D] border-b-4"
            : "bg-[#33106B] hover:bg-[#240B4D] text-white border-[#240B4D] border-b-4"
        } active:border-b-2 active:translate-y-0.5`}
        title={isMuted ? "Unmute (Press M)" : "Mute (Press M)"}
      >
        {isMuted || currentVolPct === 0 ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : currentVolPct < 50 ? (
          <Volume1 className="w-5 h-5 text-[#FFA602]" />
        ) : (
          <Volume2 className="w-5 h-5 text-[#FFA602]" />
        )}
      </button>

      {/* 2. Vertical Downward Hover Slider Popover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 bg-[#1E083E]/95 backdrop-blur-xl p-3.5 rounded-3xl border-2 border-purple-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center gap-3 z-[100]"
          >
            {/* Top: Percentage Badge */}
            <span className="text-[11px] font-black text-yellow-400 font-mono tracking-tight select-none">
              {currentVolPct}%
            </span>

            {/* Center: Vertical Volume Slider Track */}
            <div className="relative h-28 w-8 flex items-center justify-center my-1">
              <input
                type="range"
                min="0"
                max="100"
                value={currentVolPct}
                onChange={handleVolumeChange}
                className="w-28 h-2.5 bg-[#33106B] rounded-full appearance-none cursor-pointer accent-[#FFA602] -rotate-90 origin-center border border-purple-900/60 shadow-inner"
                style={{
                  WebkitAppearance: "none",
                }}
              />
            </div>

            {/* Bottom: Mute Toggle Icon Symbol */}
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isMuted || currentVolPct === 0
                  ? "bg-[#E21B3C] text-white"
                  : "bg-[#33106B] text-yellow-400 hover:bg-[#240B4D]"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || currentVolPct === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
