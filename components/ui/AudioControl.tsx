"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const closeTimeoutRef = useRef<any>(null);

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
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 450);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
  };

  // Direct calculation from bottom (0%) to top (100%)
  const updateVolumeFromPointer = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    // bottom = 0, top = 1
    const rawRatio = (rect.bottom - clientY) / rect.height;
    const clamped = Math.max(0, Math.min(1, rawRatio));
    setVolume(clamped);
    sounds.setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    updateVolumeFromPointer(e.clientY);

    const onPointerMove = (moveEvent: PointerEvent) => {
      updateVolumeFromPointer(moveEvent.clientY);
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  if (!mounted) return null;

  const currentVolPct = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center z-50 ${className}`}
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

      {/* 2. Seamless Hover Bridge & Vertical Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[100] flex flex-col items-center">
            {/* Invisible Hover Bridge connecting button and menu */}
            <div className="w-20 h-3 -mt-2 opacity-0 pointer-events-auto" />

            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-[#1E083E]/95 backdrop-blur-2xl px-3.5 py-4 rounded-3xl border-2 border-purple-800/70 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center gap-3 w-16"
            >
              {/* Top: Percentage Badge */}
              <span className="text-xs font-black text-yellow-400 font-mono tracking-tight select-none">
                {currentVolPct}%
              </span>

              {/* Center: Custom Vertical Volume Slider (Drag from Bottom up) */}
              <div
                ref={trackRef}
                onPointerDown={handlePointerDown}
                className="relative h-28 w-4 bg-[#120426] rounded-full cursor-pointer flex flex-col justify-end p-0.5 border border-purple-900/60 shadow-inner select-none touch-none"
              >
                {/* Active Level Fill Bar */}
                <div
                  className="w-full bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full transition-all duration-75 relative flex items-start justify-center"
                  style={{ height: `${currentVolPct}%` }}
                >
                  {/* Thumb Knob */}
                  <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md border-2 border-amber-500 -mt-1 flex-shrink-0" />
                </div>
              </div>

              {/* Bottom: Quick Mute / Unmute Button */}
              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-xl transition-all cursor-pointer shadow-sm ${
                  isMuted || currentVolPct === 0
                    ? "bg-[#E21B3C] text-white"
                    : "bg-[#33106B] text-yellow-400 hover:bg-[#240B4D]"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || currentVolPct === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
