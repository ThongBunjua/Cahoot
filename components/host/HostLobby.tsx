"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const [siteUrl, setSiteUrl] = useState("cahoot.live");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteUrl(window.location.host);
    }
  }, []);

  useEffect(() => {
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

  // Organize players systematically across 3 conveyor lanes
  const numRows = 3;
  const rows: Player[][] = Array.from({ length: numRows }, () => []);
  players.forEach((p, idx) => {
    rows[idx % numRows].push(p);
  });

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden select-none font-sans">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: WIDESCREEN FULL-WIDTH WITH DEAD-CENTERED URL & PIN BOX */}
      {/* ========================================================================= */}
      <header className="relative z-20 flex items-center justify-between gap-4 bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-[96vw] mx-auto min-h-[110px]">
        {/* Left: Quiz Info */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFA602] border-b-4 border-[#CC8400] flex items-center justify-center font-black text-3xl text-slate-950 shadow-md">
            !
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-400">
              Host Lobby • {quiz.questions.length} Questions
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* DEAD-CENTER: Super-Sized Join URL + Game PIN Badge (Mathematically Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white text-slate-950 px-8 sm:px-10 py-3.5 rounded-3xl shadow-2xl border-2 border-slate-200 border-b-[6px] border-b-slate-300 z-20">
          <div className="text-left flex flex-col justify-center">
            {/* Website Join URL */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-500 mb-1">
              <span className="uppercase tracking-wider">Join at</span>
              <span className="text-[#46178F] font-black bg-purple-50 px-3 py-0.5 rounded-xl border border-purple-200 tracking-normal text-sm sm:text-base select-all">
                {siteUrl}
              </span>
            </div>

            {/* Game PIN */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-500">
                PIN:
              </span>
              <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest font-mono text-slate-900 leading-none">
                {formatPin(pin)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl transition-colors cursor-pointer border border-slate-300 ml-1 flex-shrink-0"
            title="Show QR Code"
          >
            <QrCode className="w-7 h-7" />
          </button>
        </div>

        {/* Right: Control Tools */}
        <div className="flex items-center gap-3 z-10">
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
      {/* 2. MAIN CENTER: RELAXED SEAMLESS CONVEYOR (Full Width, No Toast) */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 my-3 md:my-5 flex flex-col items-center justify-center w-full max-w-[96vw] mx-auto overflow-hidden">
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
          /* Multi-Row Systematic Conveyor Lines Scrolling Calmly to the Right */
          <div className="w-full flex-1 flex flex-col justify-center gap-6 overflow-hidden py-2">
            {rows.map((rowPlayers, rowIndex) => {
              if (rowPlayers.length === 0) return null;

              // Ensure at least 12 items per row for smooth continuous seamless wrap
              const multiplier = Math.max(2, Math.ceil(12 / rowPlayers.length));
              const seamlessList = Array(multiplier).fill(rowPlayers).flat();
              const speedSec = 38 + rowIndex * 6; // Calm and readable pace

              return (
                <div
                  key={rowIndex}
                  className="w-full overflow-hidden flex relative"
                  style={{ maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)" }}
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
                      <motion.div
                        key={`${player.id}-${pIdx}`}
                        initial={{ scale: 0.2 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                        className="group relative bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] rounded-2xl px-6 py-3.5 flex items-center gap-3.5 shadow-xl select-none shrink-0"
                      >
                        <span className="text-3xl sm:text-4xl flex-shrink-0 select-none">
                          {player.avatar}
                        </span>
                        <span className="text-lg sm:text-xl font-black text-white truncate max-w-[180px] sm:max-w-[220px] tracking-tight">
                          {player.nickname}
                        </span>

                        <button
                          onClick={() => onKickPlayer(player.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 bg-[#E21B3C] hover:bg-[#B0142D] rounded-xl text-white transition-opacity shadow flex-shrink-0 cursor-pointer ml-1"
                          title={`Remove ${player.nickname}`}
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                        </button>
                      </motion.div>
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
      <footer className="relative z-20 flex items-center justify-between bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-[96vw] mx-auto">
        <div className="flex items-center gap-3.5 text-base sm:text-lg text-slate-300 font-bold">
          <span>Join at: <span className="text-yellow-400 font-black tracking-wide">{siteUrl}</span></span>
          <span className="text-purple-400">•</span>
          <span>PIN: <span className="text-white font-mono font-black text-2xl sm:text-3xl tracking-widest">{formatPin(pin)}</span></span>
        </div>

        <motion.button
          whileHover={players.length > 0 ? { scale: 1.04 } : {}}
          whileTap={players.length > 0 ? { scale: 0.96 } : {}}
          disabled={players.length === 0}
          onClick={onStartGame}
          className={`px-16 py-6 min-h-[82px] rounded-3xl font-black text-2xl sm:text-3xl flex items-center gap-4 transition-all ${
            players.length > 0
              ? "bg-[#26890C] hover:bg-[#22790A] text-white shadow-2xl cursor-pointer border-b-[8px] border-[#165406] active:border-b-[2px] active:translate-y-1.5"
              : "bg-[#240B4D] text-slate-500 border-2 border-[#1D083E] cursor-not-allowed"
          }`}
        >
          <span>Start Game</span>
          <Play className="w-8 h-8 fill-current" />
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
