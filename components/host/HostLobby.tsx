"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Quiz } from "@/lib/realtime/types";
import { formatPin } from "@/lib/utils/pinGenerator";
import { QRCodeModal } from "@/components/ui/QRCodeModal";
import { SoundControl } from "@/components/ui/SoundControl";
import { sounds } from "@/lib/audio/soundManager";
import {
  Users,
  QrCode,
  Play,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Music,
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
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    // Start lobby music on mount
    sounds.startLobbyMusic();
    setIsMusicPlaying(!sounds.getMuted());

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

  const toggleLobbyMusic = () => {
    if (isMusicPlaying) {
      sounds.stopLobbyMusic();
      setIsMusicPlaying(false);
    } else {
      sounds.startLobbyMusic();
      setIsMusicPlaying(true);
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
              Join at <span className="text-kahoot-purple font-bold">kahoot.it</span>
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
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLobbyMusic}
            className={`p-2.5 rounded-full border border-white/10 backdrop-blur-md transition-all ${
              isMusicPlaying ? "bg-kahoot-purple text-white shadow-lg" : "bg-slate-800 text-slate-400"
            }`}
            title="Toggle Lobby Synth Loop"
          >
            <Music className="w-5 h-5" />
          </button>
          <SoundControl />
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all"
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
          <div className="text-center p-8 max-w-md bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-4 bg-kahoot-purple/40 rounded-full flex items-center justify-center text-4xl animate-bounce-subtle">
              🎮
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Waiting for players...</h2>
            <p className="text-slate-300 text-sm font-medium">
              Ask players to visit <span className="font-bold text-yellow-300">kahoot.it</span> and enter PIN{" "}
              <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                {pin}
              </span>
            </p>
          </div>
        ) : (
          <div className="w-full max-w-5xl flex flex-wrap items-center justify-center gap-3 max-h-[50vh] overflow-y-auto p-4 custom-scrollbar">
            <AnimatePresence>
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="group relative flex items-center gap-2.5 bg-white text-slate-900 px-4 py-2.5 rounded-2xl font-black text-lg shadow-xl border-b-4 border-slate-300 transition-all hover:scale-105"
                >
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="truncate max-w-[140px]">{player.nickname}</span>
                  <button
                    onClick={() => onKickPlayer(player.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-all"
                    title="Remove Player"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Bottom Start Game Controller */}
      <footer className="relative z-10 flex items-center justify-between bg-kahoot-dark-surface/80 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-bold">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Realtime Broadcast Active (100% Free-Tier Architecture)</span>
        </div>

        <motion.button
          disabled={players.length === 0}
          whileHover={players.length > 0 ? { scale: 1.04 } : {}}
          whileTap={players.length > 0 ? { scale: 0.96 } : {}}
          onClick={onStartGame}
          className={`px-8 py-4 rounded-2xl font-black text-lg tracking-wide flex items-center gap-2.5 transition-all shadow-2xl ${
            players.length > 0
              ? "bg-kahoot-green hover:bg-kahoot-green-dark text-white shadow-3d-green cursor-pointer"
              : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Game</span>
        </motion.button>
      </footer>

      {/* QR Code Modal */}
      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} pin={pin} />
    </div>
  );
}
