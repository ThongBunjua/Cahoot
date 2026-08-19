"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger?: boolean;
  duration?: number;
}

export function ConfettiEffect({ trigger = true, duration = 3000 }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger || typeof window === "undefined") return;

    const colors = ["#E21B3C", "#1368CE", "#D89E00", "#26890C", "#46178F", "#FFA602"];

    // Initial big burst
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    });

    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 35,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 35,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 250);

    return () => clearInterval(interval);
  }, [trigger, duration]);

  return null;
}
