"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sounds } from "@/lib/audio/soundManager";

export function SoundControl({ className = "" }: { className?: string }) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(sounds.getMuted());
  }, []);

  const handleToggle = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sounds.playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center ${className}`}
      title={muted ? "Unmute Audio" : "Mute Audio"}
      aria-label={muted ? "Unmute Audio" : "Mute Audio"}
    >
      {muted ? (
        <VolumeX className="w-5 h-5 text-red-400" />
      ) : (
        <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
      )}
    </button>
  );
}
