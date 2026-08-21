"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Quiz } from "@/lib/realtime/types";
import { formatPin } from "@/lib/utils/pinGenerator";
import { QRCodeModal } from "@/components/ui/QRCodeModal";
import { AudioControl } from "@/components/ui/AudioControl";
import { GameBackground } from "@/components/ui/GameBackground";
import { sounds } from "@/lib/audio/soundManager";
import { QRCodeSVG } from "qrcode.react";
import {
  Users,
  Play,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Lock,
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
  const [siteUrl, setSiteUrl] = useState("playcahoot.vercel.app");
  const [fullJoinUrl, setFullJoinUrl] = useState(`https://playcahoot.vercel.app/?pin=${pin}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host || "playcahoot.vercel.app";
      setSiteUrl(host);
      setFullJoinUrl(`${window.location.origin}/?pin=${pin}`);
    }
  }, [pin]);

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

  // Organize players systematically across 3 infinite conveyor lanes
  const numRows = 3;
  const rows: Player[][] = Array.from({ length: numRows }, () => []);
  players.forEach((p, idx) => {
    rows[idx % numRows].push(p);
  });

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP STATUS BAR (Header with z-50 to stay 100% Bright when QR is open) */}
      {/* ========================================================================= */}
      <div className="relative z-50 w-full bg-[#1e0741] px-6 sm:px-10 py-3 flex items-center justify-between border-b-2 border-purple-900/50 shadow-lg flex-shrink-0">
        {/* Left: Quiz title */}
        <div className="flex items-center gap-3">
          <span className="text-base sm:text-lg font-black text-purple-200 truncate max-w-xs sm:max-w-md">
            {quiz.title}
          </span>
          <span className="text-xs font-black text-yellow-400 bg-[#33106B] px-3 py-1 rounded-full border border-purple-600/40 shadow-sm">
            {quiz.questions.length} Questions
          </span>
        </div>

        {/* Center: Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white drop-shadow-md">
            Cahoot<span className="text-yellow-400">!</span>
          </h2>
        </div>

        {/* Right: Players Count, Audio & Screen Controls */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2 bg-[#33106B] px-4 py-2 rounded-2xl border-2 border-purple-700/50 text-sm sm:text-base font-black text-white shadow-md">
            <Users className="w-5 h-5 text-yellow-400" />
            <span>{players.length}</span>
          </div>

          <AudioControl autoPlayLobby={true} />

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-[#33106B] hover:bg-[#240B4D] text-white border-2 border-purple-700/50 shadow-md transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP MASTER BADGE: Unified Super-Sized Card (Join URL + Giant PIN + Live QR) */}
      {/* ========================================================================= */}
      <div className="relative z-50 w-full flex justify-center pt-3 sm:pt-5 px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white text-slate-950 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.55)] border-2 border-slate-200 border-b-[8px] border-b-slate-300 flex items-stretch divide-x-2 divide-slate-200 overflow-hidden"
        >
          {/* Left Partition: Join Instructions */}
          <div className="px-6 sm:px-10 py-3.5 sm:py-5 flex flex-col justify-center text-left">
            <span className="text-sm sm:text-base font-bold text-slate-600">
              Join at <span className="font-black text-slate-950 underline decoration-[#46178F] underline-offset-4 text-base sm:text-lg">{siteUrl}</span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              or scan with your mobile camera
            </span>
          </div>

          {/* Center Partition: Super-Sized Game PIN */}
          <div className="px-8 sm:px-14 py-3.5 sm:py-5 flex flex-col justify-center text-center bg-slate-50/80">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-500">
              Game PIN:
            </span>
            <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono tracking-widest text-slate-950 leading-none mt-1">
              {formatPin(pin)}
            </span>
          </div>

          {/* Right Partition: Built-in Live QR Code */}
          <button
            onClick={() => setShowQR(true)}
            className="p-3 sm:p-4 bg-white hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors group"
            title="Click to enlarge QR Code"
          >
            <div className="p-1.5 bg-white rounded-xl border-2 border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
              <QRCodeSVG value={fullJoinUrl} size={76} />
            </div>
          </button>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CENTER STAGE: Full-Width Infinite Conveyor Lines Scrolling Right */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-[98vw] mx-auto px-2 sm:px-6 overflow-hidden my-auto py-2">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-300 max-w-lg">
            <div className="w-24 h-24 rounded-3xl bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] flex items-center justify-center mx-auto mb-4 animate-bounce shadow-2xl">
              <Sparkles className="w-12 h-12 text-[#FFA602]" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Waiting for players to join...
            </h3>
            <p className="text-base sm:text-lg font-bold text-purple-200">
              Enter Game PIN <span className="text-yellow-400 font-mono font-black">{formatPin(pin)}</span> on your phone or scan the QR Code.
            </p>
          </div>
        ) : (
          /* Multi-Row Full-Width Continuous Rightward Conveyor Lines */
          <div className="w-full flex-1 flex flex-col justify-center gap-4 sm:gap-6 overflow-hidden py-2">
            {rows.map((rowPlayers, rowIndex) => {
              if (rowPlayers.length === 0) return null;

              // Systematic multiplier for infinite smooth loop without rapid single repeats
              const multiplier = Math.max(3, Math.ceil(15 / rowPlayers.length));
              const seamlessList = Array(multiplier).fill(rowPlayers).flat();
              const speedSec = 40 + rowIndex * 8; // Calm readable pace

              return (
                <div
                  key={rowIndex}
                  className="w-full overflow-hidden flex relative"
                  style={{
                    maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
                  }}
                >
                  <motion.div
                    animate={{ x: ["-50%", "0%"] }} // Smooth infinite scroll to the right
                    transition={{
                      duration: speedSec,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex gap-4 sm:gap-6 items-center flex-nowrap shrink-0 pr-6"
                  >
                    {seamlessList.map((player, pIdx) => (
                      <motion.div
                        key={`${player.id}-${pIdx}`}
                        initial={{ scale: 0.2 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                        className="group relative bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-3.5 sm:py-5 flex items-center gap-4 shadow-2xl select-none shrink-0"
                      >
                        <span className="text-3xl sm:text-5xl flex-shrink-0 filter drop-shadow-sm select-none">
                          {player.avatar}
                        </span>
                        <span className="text-xl sm:text-3xl font-black text-white truncate max-w-[200px] sm:max-w-[280px] tracking-tight">
                          {player.nickname}
                        </span>

                        <button
                          onClick={() => onKickPlayer(player.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-[#E21B3C] hover:bg-[#B0142D] rounded-xl text-white transition-opacity shadow flex-shrink-0 cursor-pointer ml-1"
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
      {/* 4. BOTTOM ACTION BAR: Ready indicator & Solid Start Game Button */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full max-w-[98vw] mx-auto px-6 sm:px-12 pb-6 flex items-center justify-between">
        {/* Left Indicator */}
        <div className="flex items-center gap-3 text-base sm:text-xl font-black text-purple-200">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{players.length} {players.length === 1 ? "Player" : "Players"} Ready</span>
        </div>

        {/* Right: Giant Start Game Button */}
        <motion.button
          whileHover={players.length > 0 ? { scale: 1.05 } : {}}
          whileTap={players.length > 0 ? { scale: 0.96 } : {}}
          disabled={players.length === 0}
          onClick={onStartGame}
          className={`px-10 sm:px-14 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-xl sm:text-2xl flex items-center gap-3.5 transition-all ${
            players.length > 0
              ? "bg-[#26890C] hover:bg-[#22790A] text-white shadow-2xl cursor-pointer border-b-[6px] border-[#165406] active:border-b-[2px] active:translate-y-1"
              : "bg-[#240B4D] text-slate-500 border-2 border-[#1D083E] cursor-not-allowed opacity-60"
          }`}
        >
          {players.length === 0 ? (
            <Lock className="w-6 h-6 text-slate-500" />
          ) : (
            <Play className="w-6 h-6 fill-white" />
          )}
          <span>Start Game</span>
        </motion.button>
      </div>

      {/* QR Code Big Overlay Modal (Header stays 100% bright above backdrop) */}
      <QRCodeModal
        isOpen={showQR}
        pin={pin}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
}
