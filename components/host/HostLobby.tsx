"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Quiz } from "@/lib/realtime/types";
import { formatPin } from "@/lib/utils/pinGenerator";
import { QRCodeModal } from "@/components/ui/QRCodeModal";
import { AudioControl } from "@/components/ui/AudioControl";
import { sounds } from "@/lib/audio/soundManager";
import {
  Users,
  QrCode,
  Play,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
} from "lucide-react";

interface HostLobbyProps {
  pin: string;
  quiz: Quiz;
  players: Player[];
  onStartGame: () => void;
  onKickPlayer: (id: string) => void;
}

export function HostLobby({
  pin,
  quiz,
  players,
  onStartGame,
  onKickPlayer,
}: HostLobbyProps) {
  const [showQR, setShowQR] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Start lobby music
    sounds.startLobbyMusic();

    return () => {
      sounds.stopLobbyMusic();
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-kahoot-dark text-white flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Background Animated Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-kahoot-red rounded-3xl animate-float" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-kahoot-blue rotate-45 animate-float delay-1000" />
        <div className="absolute top-1/3 right-12 w-28 h-28 bg-kahoot-yellow rounded-full animate-float delay-700" />
        <div className="absolute bottom-10 right-1/4 w-36 h-36 bg-kahoot-green rounded-2xl animate-float delay-500" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-kahoot-dark-surface/80 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-kahoot-purple to-pink-500 flex items-center justify-center font-black text-2xl shadow-lg">
            !
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Host Lobby • {quiz.questions.length} Questions
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-white truncate max-w-md">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Big Game PIN Badge */}
        <div className="flex items-center gap-3 bg-white text-slate-950 px-6 py-3 rounded-2xl shadow-2xl border-b-4 border-slate-300">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Join with Game PIN:
            </p>
            <p className="text-3xl sm:text-4xl font-black tracking-widest font-mono">
              {formatPin(pin)}
            </p>
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-colors"
            title="Show QR Code"
          >
            <QrCode className="w-6 h-6" />
          </button>
        </div>

        {/* Control Tools */}
        <div className="flex items-center gap-3">
          <AudioControl autoPlayLobby={true} />

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Center Area: Player List & Count */}
      <main className="relative z-10 flex-1 my-8 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-6 bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/15 shadow-xl">
          <Users className="w-5 h-5 text-yellow-400" />
          <span className="text-lg font-black text-white">
            {players.length} {players.length === 1 ? "Player" : "Players"} Joined
          </span>
        </div>

        {players.length === 0 ? (
          <div className="text-center text-slate-400 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Waiting for players...</h3>
            <p className="text-sm">
              Ask participants to enter PIN <span className="text-yellow-400 font-bold font-mono">{formatPin(pin)}</span> on their devices.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-5xl max-h-[45vh] overflow-y-auto p-4 custom-scrollbar">
            <AnimatePresence>
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="group relative bg-kahoot-dark-surface/90 border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl backdrop-blur-sm transition-all"
                >
                  <span className="text-2xl select-none">{player.avatar}</span>
                  <span className="text-lg font-bold text-white tracking-wide">{player.nickname}</span>
                  <button
                    onClick={() => onKickPlayer(player.id)}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-opacity shadow-md"
                    title={`Remove ${player.nickname}`}
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Bottom Floating Bar */}
      <footer className="relative z-10 flex items-center justify-between bg-kahoot-dark-surface/80 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-2 text-sm text-slate-400 font-bold">
          <span>Game PIN:</span>
          <span className="text-white font-mono font-black text-base">{pin}</span>
        </div>

        <motion.button
          whileHover={players.length > 0 ? { scale: 1.04 } : {}}
          whileTap={players.length > 0 ? { scale: 0.96 } : {}}
          disabled={players.length === 0}
          onClick={onStartGame}
          className={`px-10 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all ${
            players.length > 0
              ? "bg-kahoot-green hover:bg-kahoot-green-dark text-white shadow-3d-green cursor-pointer"
              : "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
          }`}
        >
          <span>Start Game</span>
          <Play className="w-6 h-6 fill-current" />
        </motion.button>
      </footer>

      {/* QR Code Big Overlay Modal */}
      <QRCodeModal
        isOpen={showQR}
        pin={pin}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
}
