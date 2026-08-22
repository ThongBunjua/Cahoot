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
  const [isStartingSplash, setIsStartingSplash] = useState(false);

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

  const handleStartGameClick = () => {
    if (players.length === 0 || isStartingSplash) return;
    setIsStartingSplash(true);
    sounds.stopLobbyMusic();
    sounds.playGameStartSplash();

    // Automatically trigger Fullscreen (F11) for the Host on game start
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    }

    // 4.7s luxurious cinematic splash before transitioning to Question 1
    setTimeout(() => {
      onStartGame();
    }, 4700);
  };

  // Adaptive card size scaling based on total player count
  const getBadgeScaleClasses = (count: number) => {
    if (count <= 8) {
      return {
        card: "px-7 py-3.5 sm:px-9 sm:py-4.5 rounded-3xl border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] shadow-2xl gap-4",
        avatar: "text-3xl sm:text-4xl md:text-5xl",
        text: "text-lg sm:text-2xl md:text-3xl max-w-[260px] sm:max-w-[360px]",
        kick: "w-4 h-4",
      };
    }
    if (count <= 24) {
      return {
        card: "px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-2xl sm:rounded-3xl border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-xl gap-3",
        avatar: "text-2xl sm:text-3xl md:text-4xl",
        text: "text-base sm:text-xl md:text-2xl max-w-[200px] sm:max-w-[280px]",
        kick: "w-3.5 h-3.5",
      };
    }
    if (count <= 60) {
      return {
        card: "px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border border-[#240B4D] border-b-[4px] border-b-[#1D083E] shadow-lg gap-2.5",
        avatar: "text-xl sm:text-2xl",
        text: "text-xs sm:text-base md:text-lg max-w-[160px] sm:max-w-[220px]",
        kick: "w-3 h-3",
      };
    }
    return {
      card: "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#240B4D] border-b-3 border-b-[#1D083E] shadow-md gap-2",
      avatar: "text-lg sm:text-xl",
      text: "text-xs sm:text-sm font-black max-w-[120px] sm:max-w-[180px]",
      kick: "w-3 h-3",
    };
  };

  const scaleClasses = getBadgeScaleClasses(players.length);

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* ========================================================================= */}
      {/* CINEMATIC START GAME SPLASH (Super-Sized Smooth Expanding Cahoot! Logo 4.7s) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isStartingSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#46178F] flex flex-col items-center justify-center text-center p-6 select-none overflow-hidden"
          >
            {/* Glowing Aura Ring in Center */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.4, 2.2], opacity: [0, 0.8, 0.3] }}
              transition={{ duration: 4.7, ease: "easeOut" }}
              className="absolute w-[540px] h-[540px] rounded-full bg-gradient-to-r from-yellow-400/35 to-amber-500/25 blur-3xl pointer-events-none"
            />

            <motion.div
              initial={{ scale: 0.45, opacity: 0, y: 40 }}
              animate={{ scale: [0.45, 1.12, 1.3, 1.4], opacity: [0, 1, 1, 1], y: [40, 0, -5, -8] }}
              transition={{ duration: 4.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center relative z-10"
            >
              <h1 className="text-8xl sm:text-[130px] md:text-[180px] lg:text-[220px] font-black tracking-tighter text-white drop-shadow-[0_25px_80px_rgba(0,0,0,0.9)] leading-none select-none">
                Cahoot<span className="text-yellow-400 drop-shadow-[0_0_45px_rgba(250,204,21,0.95)]">!</span>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.35em] text-yellow-300 mt-6 drop-shadow-2xl"
              >
                Get ready to play!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP STATUS BAR (Header with z-50 to stay 100% Bright when QR is open) */}
      {/* ========================================================================= */}
      <div className="relative z-50 w-full bg-[#1e0741] px-6 sm:px-12 py-3 flex items-center justify-between border-b-2 border-purple-900/50 shadow-lg flex-shrink-0">
        {/* Left: Quiz title */}
        <div className="flex items-center gap-3">
          <span className="text-base sm:text-xl font-black text-purple-200 truncate max-w-xs sm:max-w-md">
            {quiz.title}
          </span>
          <span className="text-xs sm:text-sm font-black text-yellow-400 bg-[#33106B] px-3.5 py-1 rounded-full border border-purple-600/40 shadow-sm">
            {quiz.questions.length} Questions
          </span>
        </div>

        {/* Center: Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white drop-shadow-md">
            Cahoot<span className="text-yellow-400">!</span>
          </h2>
        </div>

        {/* Right: Players Count, Audio & Screen Controls */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2 bg-[#33106B] px-4 py-2 rounded-2xl border-2 border-purple-700/50 text-sm sm:text-lg font-black text-white shadow-md">
            <Users className="w-5 h-5 text-yellow-400" />
            <span>{players.length}</span>
          </div>

          <AudioControl autoPlayLobby={true} />

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-[#33106B] hover:bg-[#240B4D] text-white border-2 border-purple-700/50 shadow-md transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP MASTER BADGE: AUDITORIUM MASSIVE PIN & JOIN URL (Huge, Wide & High Visibility) */}
      {/* ========================================================================= */}
      <div className="relative z-50 w-full flex justify-center pt-2 sm:pt-4 px-4 flex-shrink-0">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white text-slate-950 rounded-3xl sm:rounded-[40px] shadow-[0_30px_90px_rgba(0,0,0,0.65)] border-2 border-slate-200 border-b-[10px] border-b-slate-300 flex items-stretch divide-x-2 divide-slate-200 overflow-hidden w-full max-w-[94vw] lg:max-w-7xl"
        >
          {/* Left Partition: Giant Join Instructions */}
          <div className="px-8 sm:px-14 py-4 sm:py-6 flex flex-col justify-center text-left flex-1">
            <span className="text-base sm:text-2xl md:text-3xl font-bold text-slate-600">
              Join at <span className="font-black text-slate-950 underline decoration-[#46178F] underline-offset-4 text-xl sm:text-3xl md:text-4xl">{siteUrl}</span>
            </span>
            <span className="text-xs sm:text-base font-semibold text-slate-500 mt-1">
              or scan with your mobile camera
            </span>
          </div>

          {/* Center Partition: Super-Sized Giant Game PIN (Auditorium Scale) */}
          <div className="px-10 sm:px-20 py-4 sm:py-6 flex flex-col justify-center text-center bg-slate-50/90">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-500">
              Game PIN:
            </span>
            <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[120px] font-black font-mono tracking-widest text-slate-950 leading-none mt-1 select-all drop-shadow-sm">
              {formatPin(pin)}
            </span>
          </div>

          {/* Right Partition: Built-in Big Live QR Code (110px) */}
          <button
            onClick={() => setShowQR(true)}
            className="p-4 sm:p-6 bg-white hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors group flex-shrink-0"
            title="Click to enlarge QR Code"
          >
            <div className="p-2 bg-white rounded-2xl border-2 border-slate-200 shadow-md group-hover:scale-105 transition-transform">
              <QRCodeSVG value={fullJoinUrl} size={110} />
            </div>
          </button>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CENTER STAGE: VIBRANT INTERACTIVE PLAYER ARENA (Each Player Displayed ONCE with Spring Pop) */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-[98vw] mx-auto px-4 sm:px-8 overflow-hidden my-auto py-2">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-300 max-w-lg my-auto">
            <div className="w-20 h-20 rounded-3xl bg-[#33106B] border-2 border-[#240B4D] border-b-[6px] border-b-[#1D083E] flex items-center justify-center mx-auto mb-3 animate-bounce shadow-2xl">
              <Sparkles className="w-10 h-10 text-[#FFA602]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1.5">
              Waiting for players to join...
            </h3>
            <p className="text-sm sm:text-base font-bold text-purple-200">
              Enter Game PIN <span className="text-yellow-400 font-mono font-black">{formatPin(pin)}</span> on your phone or scan the QR Code.
            </p>
          </div>
        ) : (
          /* Responsive Adaptive Player Grid Arena - Clean, Spring Pop, Zero Duplicates! */
          <div className="w-full flex-1 flex flex-wrap items-center justify-center content-center gap-3 sm:gap-4 md:gap-5 overflow-y-auto max-h-[50vh] p-2">
            <AnimatePresence mode="popLayout">
              {players.map((player, idx) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ scale: 0, opacity: 0, y: 25 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: [-(idx % 3) * 1.5, (idx % 3) * 1.5, -(idx % 3) * 1.5],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.07, y: -4 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 22,
                    y: { repeat: Infinity, duration: 2.4 + (idx % 4) * 0.4, ease: "easeInOut" },
                  }}
                  className="relative group select-none"
                >
                  <div
                    className={`bg-[#33106B] hover:bg-[#3d1480] flex items-center shadow-2xl transition-colors ${scaleClasses.card}`}
                  >
                    <span className={`${scaleClasses.avatar} flex-shrink-0 filter drop-shadow-md`}>
                      {player.avatar}
                    </span>
                    <span className={`font-black text-white truncate tracking-tight ${scaleClasses.text}`}>
                      {player.nickname}
                    </span>

                    <button
                      onClick={() => onKickPlayer(player.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 bg-[#E21B3C] hover:bg-[#B0142D] rounded-xl text-white transition-opacity shadow-md flex-shrink-0 cursor-pointer ml-1 active:scale-90"
                      title={`Remove ${player.nickname}`}
                    >
                      <X className={`${scaleClasses.kick} stroke-[3]`} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ACTION BAR: Ready indicator & Giant Start Game Button */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full max-w-[98vw] mx-auto px-6 sm:px-12 pb-4 sm:pb-5 flex items-center justify-between">
        {/* Left Indicator */}
        <div className="flex items-center gap-3 text-base sm:text-xl font-black text-purple-200">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{players.length} {players.length === 1 ? "Player" : "Players"} Ready</span>
        </div>

        {/* Right: Giant Start Game Button */}
        <motion.button
          whileHover={players.length > 0 && !isStartingSplash ? { scale: 1.05 } : {}}
          whileTap={players.length > 0 && !isStartingSplash ? { scale: 0.96 } : {}}
          disabled={players.length === 0 || isStartingSplash}
          onClick={handleStartGameClick}
          className={`px-10 sm:px-16 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-xl sm:text-2xl flex items-center gap-3.5 transition-all ${
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

      {/* QR Code Big Overlay Modal */}
      <QRCodeModal
        isOpen={showQR}
        pin={pin}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
}
