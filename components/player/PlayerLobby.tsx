"use client";

import React from "react";
import { motion } from "framer-motion";
import { Player } from "@/lib/realtime/types";
import { Sparkles, Loader2 } from "lucide-react";

interface PlayerLobbyProps {
  player: Player;
  pin: string;
  onLeave: () => void;
}

export function PlayerLobby({ player, pin, onLeave }: PlayerLobbyProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-sm w-full p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-28 h-28 bg-white/15 backdrop-blur-md rounded-3xl border-2 border-white/30 flex items-center justify-center text-6xl shadow-2xl mb-6 relative"
      >
        <span>{player.avatar}</span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-1.5 rounded-3xl border border-dashed border-white/40 pointer-events-none"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2"
      >
        You&apos;re in!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-base sm:text-lg font-bold text-slate-200 mb-6 flex items-center justify-center gap-1.5"
      >
        <span>See your nickname on screen?</span>
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
      </motion.p>

      <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <span className="text-2xl">{player.avatar}</span>
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase">Your Nickname</p>
            <p className="text-lg font-black text-white truncate max-w-[150px]">{player.nickname}</p>
          </div>
        </div>
        <span className="text-xs font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1.5 rounded-xl">
          PIN {pin}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-slate-300 bg-slate-900/40 px-4 py-2.5 rounded-full border border-white/10">
        <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
        <span>Waiting for host to start the game...</span>
      </div>

      <button
        onClick={onLeave}
        className="mt-8 text-xs font-bold text-slate-400 hover:text-white underline transition-colors"
      >
        Leave game
      </button>
    </div>
  );
}
