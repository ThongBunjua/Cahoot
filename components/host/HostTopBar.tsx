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
      <div className="w-full bg-[#110426] border-b border-purple-900/50 shadow-md px-3 sm:px-6 py-2 flex items-center justify-between text-white select-none z-40 flex-shrink-0">
        {/* Left: QR Icon + Join Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showJoinInfo && pin && (
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="flex items-center gap-2 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm group"
              title="Click to view QR Code"
            >
              <QrCode className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="text-slate-300 truncate">
                Join at <span className="font-semibold text-white">{siteUrl}</span> /{" "}
                <span className="font-black text-yellow-400 font-mono tracking-wider">{formatPin(pin)}</span>
              </span>
            </button>
          )}
        </div>

        {/* Center: Brand Logo */}
        <div className="flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-white drop-shadow-md select-none">
            Cahoot<span className="text-yellow-400">!</span>
          </span>
        </div>

        {/* Right: Players Count, Audio, Fullscreen, and Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {totalPlayers > 0 && (
            <div className="flex items-center gap-1.5 bg-purple-950/80 px-2.5 sm:px-3 py-1 rounded-xl border border-purple-700/50 text-xs sm:text-sm font-black text-slate-200">
              <Users className="w-3.5 h-3.5 text-yellow-400" />
              <span>{totalPlayers}</span>
            </div>
          )}

          <AudioControl />

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
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
