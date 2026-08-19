"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
import { sounds } from "@/lib/audio/soundManager";
import { motion } from "framer-motion";

interface AudioControlProps {
  className?: string;
  autoPlayLobby?: boolean;
}

export function AudioControl({ className = "", autoPlayLobby = false }: AudioControlProps) {
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());

  useEffect(() => {
    // Subscribe to sound state changes
    const unsubscribe = sounds.subscribe((muted) => {
      setIsMuted(muted);
    });

    // Start lobby music if autoPlay is requested and not muted
    if (autoPlayLobby && !sounds.getMuted()) {
      sounds.startLobbyMusic();
    }

    return () => {
      unsubscribe();
    };
  }, [autoPlayLobby]);

  const handleToggle = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted && autoPlayLobby) {
      sounds.startLobbyMusic();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleToggle}
      title={isMuted ? "Unmute Music & Sounds" : "Mute Music & Sounds"}
      className={`relative z-50 flex items-center gap-2 px-3.5 py-2 rounded-2xl backdrop-blur-md transition-all shadow-lg cursor-pointer border ${
        isMuted
          ? "bg-slate-900/80 hover:bg-slate-900 text-slate-400 border-white/10"
          : "bg-emerald-500/90 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
      } ${className}`}
    >
      {isMuted ? (
        <>
          <VolumeX className="w-4 h-4 text-red-400" />
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline text-slate-300">
            Music Off
          </span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-white animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">
            Music On
          </span>
          {/* Animated sound wave bars */}
          <div className="flex items-end gap-0.5 h-3 ml-0.5">
            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce" />
          </div>
        </>
      )}
    </motion.button>
  );
}
