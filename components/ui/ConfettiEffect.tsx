"use client";

import { useEffect } from "react";

interface ConfettiEffectProps {
  trigger?: boolean;
  duration?: number;
}

export function ConfettiEffect({ trigger = true, duration = 2500 }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger || typeof window === "undefined") return;

    let isMounted = true;

    // Dynamic import to guarantee safe client-only execution on all mobile browsers
    import("canvas-confetti")
      .then((module) => {
        if (!isMounted) return;
        const confetti = module.default || module;
        if (typeof confetti !== "function") return;

        const colors = ["#E21B3C", "#1368CE", "#D89E00", "#26890C", "#46178F", "#FFA602"];

        try {
          // Initial burst
          confetti({
            particleCount: 80,
            spread: 75,
            origin: { y: 0.6 },
            colors,
          });
        } catch (e) {}
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [trigger, duration]);

  return null;
}
