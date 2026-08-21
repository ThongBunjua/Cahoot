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

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* 1. TOP STATUS BAR (Minimal Header matching Kahoot UI) */}
      {/* ========================================================================= */}
      <div className="relative z-40 w-full bg-[#1e0741] px-6 py-2.5 flex items-center justify-between border-b border-purple-900/40 shadow-sm flex-shrink-0">
        {/* Left: Quiz title */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-purple-300">
            {quiz.title}
          </span>
          <span className="text-xs font-bold text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/50">
            {quiz.questions.length} Qs
          </span>
        </div>

        {/* Center: Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-white">
            Cahoot<span className="text-yellow-400">!</span>
          </h2>
        </div>

        {/* Right: Players Count, Audio & Screen Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#33106B] px-3 py-1.5 rounded-xl border border-purple-700/40 text-xs sm:text-sm font-black text-white shadow-sm">
            <Users className="w-4 h-4 text-yellow-400" />
            <span>{players.length}</span>
          </div>

          <AudioControl autoPlayLobby={true} />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#33106B] hover:bg-[#240B4D] text-white border border-purple-700/40 shadow-sm transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP MASTER BADGE: Unified White Card (Join URL + Giant PIN + Live QR) */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full flex justify-center pt-4 sm:pt-6 px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white text-slate-950 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-slate-200 border-b-[6px] border-b-slate-300 flex items-stretch divide-x-2 divide-slate-200 overflow-hidden"
        >
          {/* Left Partition: Join Instructions */}
          <div className="px-6 sm:px-8 py-3.5 sm:py-4 flex flex-col justify-center text-left">
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              Join at <span className="font-black text-slate-950 underline decoration-[#46178F] underline-offset-2">{siteUrl}</span>
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">
              or scan with your mobile camera
            </span>
          </div>

          {/* Center Partition: Game PIN */}
          <div className="px-8 sm:px-12 py-3.5 sm:py-4 flex flex-col justify-center text-center bg-slate-50/70">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
              Game PIN:
            </span>
            <span className="text-3xl sm:text-5xl md:text-6xl font-black font-mono tracking-widest text-slate-950 leading-none mt-1">
              {formatPin(pin)}
            </span>
          </div>

          {/* Right Partition: Seamless Embedded QR Code */}
          <button
            onClick={() => setShowQR(true)}
            className="p-2 sm:p-3 bg-white hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors group"
            title="Click to enlarge QR Code"
          >
            <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
              <QRCodeSVG value={fullJoinUrl} size={64} />
            </div>
          </button>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CENTER STAGE: Huge Brand Logo & Player Cards Grid/Conveyor */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 overflow-hidden my-auto py-4">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-300 max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Sparkles className="w-10 h-10 text-[#FFA602]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1.5">
              Waiting for players...
            </h3>
            <p className="text-xs sm:text-sm font-bold text-purple-200">
              Enter the Game PIN or scan the QR Code on your phone to join.
            </p>
          </div>
        ) : (
          /* High-Visibility Large Player Badges (Clean, Spacious, No Rapid Repeating) */
          <div className="w-full flex-1 flex items-center justify-center overflow-y-auto max-h-[46vh] py-2 px-4 custom-scrollbar">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 max-w-5xl">
              <AnimatePresence>
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="group relative bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-3.5 sm:py-4 flex items-center gap-4 shadow-2xl select-none"
                  >
                    <span className="text-3xl sm:text-5xl flex-shrink-0 filter drop-shadow-sm select-none">
                      {player.avatar}
                    </span>
                    <span className="text-xl sm:text-3xl font-black text-white tracking-tight truncate max-w-[200px] sm:max-w-[280px]">
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
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. FLOATING RIGHT/BOTTOM ACTION: SLEEK START BUTTON (Matching Image 3) */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 pb-6 flex items-center justify-between">
        {/* Left Indicator */}
        <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-purple-200">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span>{players.length} {players.length === 1 ? "player" : "players"} ready in lobby</span>
        </div>

        {/* Right: Start Game Button */}
        <motion.button
          whileHover={players.length > 0 ? { scale: 1.05 } : {}}
          whileTap={players.length > 0 ? { scale: 0.96 } : {}}
          disabled={players.length === 0}
          onClick={onStartGame}
          className={`px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl font-black text-lg sm:text-xl flex items-center gap-3 transition-all ${
            players.length > 0
              ? "bg-white text-slate-950 hover:bg-slate-100 shadow-2xl cursor-pointer border-b-[5px] border-slate-300 active:border-b-[1px] active:translate-y-1"
              : "bg-white/40 text-slate-700 border-b-[4px] border-slate-400/50 cursor-not-allowed opacity-60"
          }`}
        >
          {players.length === 0 ? (
            <Lock className="w-5 h-5 text-slate-700" />
          ) : (
            <Play className="w-5 h-5 fill-slate-950" />
          )}
          <span>Start</span>
        </motion.button>
      </div>

      {/* QR Code Big Overlay Modal */}
      <QRCodeModal
        isOpen={showQR}
        pin={pin}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
}
