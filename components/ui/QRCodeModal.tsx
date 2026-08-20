"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: string;
}

export function QRCodeModal({ isOpen, onClose, pin }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join?pin=${pin}`
      : `https://kahoot.it/?pin=${pin}`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white text-slate-900 border-2 border-slate-200 border-b-[8px] border-b-slate-300 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            Scan to Join Game
          </h3>
          <p className="text-sm text-slate-600 font-bold mb-6">
            Point your mobile camera to join room <span className="font-black text-[#46178F]">#{pin}</span>
          </p>

          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl mb-6 shadow-inner">
            <QRCodeSVG value={joinUrl} size={200} level="H" includeMargin={false} />
          </div>

          <div className="w-full flex items-center gap-2 p-2 bg-slate-100 rounded-2xl border border-slate-300">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="bg-transparent text-xs text-slate-800 font-mono font-bold flex-1 outline-none px-2 truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-[#26890C] hover:bg-[#22790A] text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border-b-2 border-[#1B6108]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
