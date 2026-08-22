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

// Deterministic string hash for permanent stable lane assignment across 5 conveyor lines
function getStableLane(playerId: string, numLanes: number = 5): number {
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = (hash << 5) - hash + playerId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % numLanes;
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

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    }

    setTimeout(() => {
      onStartGame();
    }, 4700);
  };

  // Organize players into 5 STABLE conveyor lanes (existing players never jump vertically)
  const numRows = 5;
  const rows: Player[][] = Array.from({ length: numRows }, () => []);
  players.forEach((p) => {
    const lane = getStableLane(p.id, numRows);
    rows[lane].push(p);
  });

  // Balanced varied speeds for natural, endless arcade flow
  const laneSpeeds = [35, 42, 38, 45, 32];

  return (
    <div className="h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between select-none overflow-hidden font-sans relative">
      {/* Dynamic Animated Pattern Background */}
      <GameBackground />

      {/* Embedded CSS for True Non-Colliding Continuous Flex Marquee Streams */}
      <style jsx>{`
        @keyframes marqueeStreamLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marqueeStreamRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .marquee-track-left {
          display: flex;
          align-items: center;
          width: max-content;
          will-change: transform;
          animation: marqueeStreamLeft linear infinite;
        }
        .marquee-track-right {
          display: flex;
          align-items: center;
          width: max-content;
          will-change: transform;
          animation: marqueeStreamRight linear infinite;
        }
        .marquee-track-left:hover,
        .marquee-track-right:hover {
          animation-play-state: paused;
        }
      `}</style>

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
      {/* 1. TOP STATUS BAR */}
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
      {/* 2. TOP MASTER BADGE: AUDITORIUM MASSIVE PIN & JOIN URL */}
      {/* ========================================================================= */}
      <div className="relative z-40 w-full flex justify-center pt-2 sm:pt-4 px-4 flex-shrink-0">
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

          {/* Right Partition: Built-in Big Live QR Code */}
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
      {/* 3. CENTER STAGE: 5 NON-COLLIDING ENDLESS CONVEYOR LANES (Zero Overlap Guaranteed) */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-[98vw] mx-auto px-2 sm:px-6 overflow-hidden my-auto py-1">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-300 max-w-lg">
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
          /* Exactly 5 Conveyor Lines with Physical Non-Overlapping Flex Streams */
          <div className="w-full flex-1 flex flex-col justify-center gap-2 sm:gap-3 py-1 overflow-hidden">
            {rows.map((rowPlayers, rowIndex) => {
              if (rowPlayers.length === 0) return null;
              const speedSec = laneSpeeds[rowIndex % laneSpeeds.length];

              // Ensure at least 4 items in track for seamless infinite looping
              let displayList: Player[] = [...rowPlayers];
              while (displayList.length < 5) {
                displayList = [...displayList, ...rowPlayers];
              }

              // Dynamic animation direction: alternating lanes for rich arcade look
              const isEven = rowIndex % 2 === 0;

              return (
                <div
                  key={rowIndex}
                  className="w-full h-16 sm:h-20 md:h-22 overflow-hidden relative flex items-center"
                  style={{
                    maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
                  }}
                >
                  <div
                    className={isEven ? "marquee-track-left" : "marquee-track-right"}
                    style={{
                      animationDuration: `${speedSec}s`,
                    }}
                  >
                    {/* Primary Set */}
                    <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 flex-shrink-0">
                      {displayList.map((player, pIdx) => (
                        <div
                          key={`p1_${player.id}_${pIdx}`}
                          className="group relative bg-[#33106B] hover:bg-[#3D147D] border-2 border-[#240B4D] border-b-[5px] sm:border-b-[6px] border-b-[#1D083E] rounded-2xl sm:rounded-3xl px-5 py-2.5 sm:px-7 sm:py-3.5 flex items-center gap-3 sm:gap-4 shadow-2xl select-none flex-shrink-0 transition-transform hover:scale-105"
                        >
                          <span className="text-2xl sm:text-4xl md:text-5xl flex-shrink-0 filter drop-shadow-md select-none">
                            {player.avatar}
                          </span>
                          <span className="text-base sm:text-xl md:text-2xl font-black text-white whitespace-nowrap tracking-tight">
                            {player.nickname}
                          </span>

                          <button
                            onClick={() => onKickPlayer(player.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 bg-[#E21B3C] hover:bg-[#B0142D] rounded-xl text-white transition-opacity shadow flex-shrink-0 cursor-pointer ml-1"
                            title={`Remove ${player.nickname}`}
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Identical Duplicate Set for Perfect Seamless Infinite Loop */}
                    <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 flex-shrink-0" aria-hidden>
                      {displayList.map((player, pIdx) => (
                        <div
                          key={`p2_${player.id}_${pIdx}`}
                          className="group relative bg-[#33106B] hover:bg-[#3D147D] border-2 border-[#240B4D] border-b-[5px] sm:border-b-[6px] border-b-[#1D083E] rounded-2xl sm:rounded-3xl px-5 py-2.5 sm:px-7 sm:py-3.5 flex items-center gap-3 sm:gap-4 shadow-2xl select-none flex-shrink-0 transition-transform hover:scale-105"
                        >
                          <span className="text-2xl sm:text-4xl md:text-5xl flex-shrink-0 filter drop-shadow-md select-none">
                            {player.avatar}
                          </span>
                          <span className="text-base sm:text-xl md:text-2xl font-black text-white whitespace-nowrap tracking-tight">
                            {player.nickname}
                          </span>

                          <button
                            onClick={() => onKickPlayer(player.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 bg-[#E21B3C] hover:bg-[#B0142D] rounded-xl text-white transition-opacity shadow flex-shrink-0 cursor-pointer ml-1"
                            title={`Remove ${player.nickname}`}
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ACTION BAR */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full max-w-[98vw] mx-auto px-6 sm:px-12 pb-4 sm:pb-5 flex items-center justify-between flex-shrink-0">
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
