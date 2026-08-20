"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Quiz } from "@/lib/realtime/types";
import { formatPin } from "@/lib/utils/pinGenerator";
import { QRCodeModal } from "@/components/ui/QRCodeModal";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
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

  // New Player Entrance Toast
  const [newestPlayer, setNewestPlayer] = useState<Player | null>(null);
  const prevPlayersCountRef = useRef(players.length);

  useEffect(() => {
    sounds.startLobbyMusic();
    return () => {
      sounds.stopLobbyMusic();
    };
  }, []);

  // Detect newly joined player and trigger dramatic pop-up
  useEffect(() => {
    if (players.length > prevPlayersCountRef.current) {
      const latest = players[players.length - 1];
      if (latest) {
        setNewestPlayer(latest);
        sounds.playClick();
        const t = setTimeout(() => {
          setNewestPlayer(null);
        }, 1500); // Display for 1.5 seconds
        return () => clearTimeout(t);
      }
    }
    prevPlayersCountRef.current = players.length;
  }, [players]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Distribute players evenly across 3 lanes
  const numRows = 3;
  const rows: Player[][] = Array.from({ length: numRows }, () => []);
  players.forEach((p, idx) => {
    rows[idx % numRows].push(p);
  });

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 relative overflow-hidden select-none font-sans">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* NEW PLAYER ENTRANCE DRAMATIC POP-UP TOAST */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {newestPlayer && (
          <motion.div
            initial={{ scale: 0.2, y: 50, opacity: 0 }}
            animate={{ scale: 1.1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="fixed top-28 z-50 pointer-events-none left-1/2 -translate-x-1/2 bg-white text-slate-950 px-8 py-4 rounded-3xl border-4 border-[#FFA602] border-b-[8px] border-b-[#CC8400] shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex items-center gap-4"
          >
            <span className="text-5xl select-none">{newestPlayer.avatar}</span>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#46178F] block">
                🎉 New Player Joined!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {newestPlayer.nickname}
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: 100% Solid 3D (PIN, Quiz Info, Audio & Fullscreen) */}
      {/* ========================================================================= */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] p-4 sm:p-6 rounded-3xl shadow-2xl max-w-7xl mx-auto w-full">
        {/* Left: Quiz Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFA602] border-b-4 border-[#CC8400] flex items-center justify-center font-black text-3xl text-slate-950 shadow-md">
            !
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-400">
              Host Lobby • {quiz.questions.length} Questions
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white truncate max-w-md md:max-w-lg">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Center: Super-Sized Game PIN Badge */}
        <div className="flex items-center gap-3 bg-white text-slate-950 px-8 py-3.5 rounded-3xl shadow-xl border-2 border-slate-200 border-b-[6px] border-b-slate-300">
          <div className="text-left">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
              Join with Game PIN:
            </p>
            <p className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest font-mono text-slate-900 leading-none mt-1">
              {formatPin(pin)}
            </p>
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl transition-colors cursor-pointer border border-slate-300 ml-2"
            title="Show QR Code"
          >
            <QrCode className="w-7 h-7" />
          </button>
        </div>

        {/* Right: Control Tools */}
        <div className="flex items-center gap-3">
          <AudioControl autoPlayLobby={true} />

          <button
            onClick={toggleFullscreen}
            className="p-3.5 rounded-2xl bg-[#240B4D] hover:bg-[#1D083E] text-white border-2 border-[#1D083E] border-b-4 border-black shadow-md transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CENTER: SEAMLESS INFINITE MARQUEE TO THE RIGHT (No Scrollbar) */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 my-3 md:my-5 flex flex-col items-center justify-center max-w-7xl mx-auto w-full overflow-hidden">
        {/* Joined Players Count Pill */}
        <div className="flex items-center gap-2.5 mb-4 bg-[#33106B] px-8 py-3 rounded-full border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-lg flex-shrink-0">
          <Users className="w-6 h-6 text-[#FFA602]" />
          <span className="text-lg sm:text-xl font-black text-white">
            {players.length} {players.length === 1 ? "Player" : "Players"} Joined
          </span>
        </div>

        {players.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-300 max-w-lg">
            <div className="w-24 h-24 rounded-3xl bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Sparkles className="w-12 h-12 text-[#FFA602]" />
            </div>
            <h3 className="text-3xl font-black text-white mb-2">Waiting for players to join...</h3>
            <p className="text-base font-bold text-slate-300">
              Ask everyone to enter PIN <span className="text-[#FFA602] font-black font-mono">{formatPin(pin)}</span> on their phone or scan the QR Code.
            </p>
          </div>
        ) : (
          /* Multi-Row Smooth Conveyor Lines Scrolling to the Right */
          <div className="w-full flex-1 flex flex-col justify-center gap-6 overflow-hidden py-2">
            {rows.map((rowPlayers, rowIndex) => {
              if (rowPlayers.length === 0) return null;

              // Ensure at least 10 items per row for smooth continuous seamless wrap
              const multiplier = Math.max(2, Math.ceil(12 / rowPlayers.length));
              const seamlessList = Array(multiplier).fill(rowPlayers).flat();
              const speedSec = 22 + rowIndex * 5;

              return (
                <div
                  key={rowIndex}
                  className="w-full overflow-hidden flex relative"
                  style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}
                >
                  <motion.div
                    animate={{ x: ["-50%", "0%"] }} // Smooth continuous scroll to the right
                    transition={{
                      duration: speedSec,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex gap-4 items-center flex-nowrap shrink-0 pr-4"
                  >
                    {seamlessList.map((player, pIdx) => (
                      <div
                        key={`${player.id}-${pIdx}`}
                        className="group relative bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] rounded-2xl px-6 py-3.5 flex items-center gap-3.5 shadow-xl select-none shrink-0"
                      >
                        <span className="text-3xl sm:text-4xl flex-shrink-0 select-none">
                          {player.avatar}
                        </span>
                        <span className="text-lg sm:text-xl font-black text-white truncate max-w-[160px] sm:max-w-[200px] tracking-tight">
                          {player.nickname}
                        </span>

                        <button
                          onClick={() => onKickPlayer(player.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 bg-[#E21B3C] hover:bg-[#B0142D] rounded-xl text-white transition-opacity shadow flex-shrink-0 cursor-pointer ml-1"
                          title={`Remove ${player.nickname}`}
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM FLOATING BAR: 100% Solid Start Game Button */}
      {/* ========================================================================= */}
      <footer className="relative z-20 flex items-center justify-between bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] p-4 sm:p-6 rounded-3xl shadow-2xl max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 text-base text-slate-300 font-bold">
          <span>Game PIN:</span>
          <span className="text-white font-mono font-black text-2xl">{pin}</span>
        </div>

        <motion.button
          whileHover={players.length > 0 ? { scale: 1.04 } : {}}
          whileTap={players.length > 0 ? { scale: 0.96 } : {}}
          disabled={players.length === 0}
          onClick={onStartGame}
          className={`px-12 py-4.5 rounded-2xl font-black text-2xl flex items-center gap-3 transition-all ${
            players.length > 0
              ? "bg-[#26890C] hover:bg-[#22790A] text-white shadow-2xl cursor-pointer border-b-[6px] border-[#1A6107] active:border-b-[2px] active:translate-y-1"
              : "bg-[#240B4D] text-slate-500 border-2 border-[#1D083E] cursor-not-allowed"
          }`}
        >
          <span>Start Game</span>
          <Play className="w-7 h-7 fill-current" />
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
