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

  const joinUrl = typeof window !== "undefined"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-kahoot-dark-card border border-white/15 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          <h3 className="text-2xl font-black text-white tracking-tight mb-1">
            Scan to Join Game
          </h3>
          <p className="text-sm text-slate-300 mb-6">
            Point your mobile camera to join room <span className="font-bold text-yellow-400">#{pin}</span>
          </p>

          <div className="p-4 bg-white rounded-2xl shadow-inner mb-6">
            <QRCodeSVG value={joinUrl} size={200} level="H" includeMargin={false} />
          </div>

          <div className="w-full flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-white/10">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none px-2 truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-kahoot-purple hover:bg-kahoot-purple-light text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
