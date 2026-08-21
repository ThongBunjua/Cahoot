"use client";

import React, { useState, useEffect } from "react";
import { AudioControl } from "@/components/ui/AudioControl";
import { QRCodeModal } from "@/components/ui/QRCodeModal";
import { QrCode, Users, Maximize2, Minimize2 } from "lucide-react";
import { formatPin } from "@/lib/utils/pinGenerator";

interface HostTopBarProps {
  pin?: string;
  totalPlayers?: number;
  actionButton?: React.ReactNode;
  showJoinInfo?: boolean;
}

export function HostTopBar({
  pin = "",
  totalPlayers = 0,
  actionButton,
  showJoinInfo = true,
}: HostTopBarProps) {
  const [showQR, setShowQR] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [siteUrl, setSiteUrl] = useState("playcahoot.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteUrl(window.location.host || "playcahoot.vercel.app");
    }
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
    <>
      <div className="relative w-full h-16 sm:h-20 bg-[#0e0321] border-b-2 border-purple-900/60 shadow-xl px-4 sm:px-8 md:px-12 py-3 flex items-center justify-between text-white select-none z-40 flex-shrink-0">
        {/* Left: QR Icon + Join Info */}
        <div className="flex items-center gap-3.5 min-w-0 z-10">
          {showJoinInfo && pin && (
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="flex items-center gap-3 bg-purple-950/75 hover:bg-purple-900 border border-purple-700/60 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-base font-bold transition-all cursor-pointer shadow-sm group"
              title="Click to view QR Code"
            >
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="text-slate-300 truncate">
                Join at <span className="font-semibold text-white">{siteUrl}</span> /{" "}
                <span className="font-black text-yellow-400 font-mono tracking-wider text-base sm:text-lg">{formatPin(pin)}</span>
              </span>
            </button>
          )}
        </div>

        {/* Center: Brand Logo - 100% DEAD CENTER OF SCREEN via absolute positioning */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md select-none">
            Cahoot<span className="text-yellow-400">!</span>
          </span>
        </div>

        {/* Right: Players Count, Audio, Fullscreen, and Action Button */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 z-10">
          {totalPlayers > 0 && (
            <div className="flex items-center gap-2 bg-purple-950/80 px-3.5 py-2 rounded-2xl border border-purple-700/60 text-xs sm:text-base font-black text-slate-200 shadow-sm">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span>{totalPlayers}</span>
            </div>
          )}

          <AudioControl />

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 sm:p-3 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {actionButton && <div className="ml-1 sm:ml-2">{actionButton}</div>}
        </div>
      </div>

      {/* QR Code Modal popup */}
      {pin && (
        <QRCodeModal
          isOpen={showQR}
          pin={pin}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}

