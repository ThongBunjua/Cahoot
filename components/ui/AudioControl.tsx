"use client";

import React, { useState, useEffect } from "react";
import { sounds } from "@/lib/audio/soundManager";
import { Volume2, VolumeX } from "lucide-react";

interface AudioControlProps {
  autoPlayLobby?: boolean;
  className?: string;
}

export function AudioControl({ autoPlayLobby = false, className = "" }: AudioControlProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMuted(sounds.getMuted());

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyM" && (e.target as HTMLElement).tagName !== "INPUT") {
        const nextMute = sounds.toggleMute();
        setIsMuted(nextMute);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggle = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={handleToggle}
      className={`relative z-50 flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all shadow-md cursor-pointer border-2 ${
        isMuted
          ? "bg-[#E21B3C] hover:bg-[#B0142D] text-white border-[#B0142D] border-b-4"
          : "bg-[#240B4D] hover:bg-[#1D083E] text-white border-[#1D083E] border-b-4"
      } active:border-b-2 active:translate-y-0.5 ${className}`}
      title={isMuted ? "Unmute Audio (Press M)" : "Mute Audio (Press M)"}
    >
      {isMuted ? (
        <>
          <VolumeX className="w-4 h-4 text-white" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            Muted
          </span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-[#FFA602]" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            Audio On
          </span>
        </>
      )}
    </button>
  );
}
