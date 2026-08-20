"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Player } from "@/lib/realtime/types";
import { AudioControl } from "@/components/ui/AudioControl";
import { sounds } from "@/lib/audio/soundManager";
import {
  Trophy,
  Flame,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Users,
} from "lucide-react";

interface HostLeaderboardProps {
  players: Player[];
  isLastQuestion: boolean;
  onNext: () => void;
}

const CARD_HEIGHT_PX = 104; // Slot spacing: Card height (88px) + Gap (16px)

export function HostLeaderboard({ players, isLastQuestion, onNext }: HostLeaderboardProps) {
  // Current live counting scores for each player
  const [displayScores, setDisplayScores] = useState<{ [id: string]: number }>({});
  // Current dynamic slot ranks (0-indexed) for each player as scores tick up
  const [dynamicSlots, setDynamicSlots] = useState<{ [id: string]: number }>({});
  // State indicating counting has finished
  const [isCountingFinished, setIsCountingFinished] = useState(false);

  // 1. Initial list sorted by starting score BEFORE this question
  const initialSorted = [...players].sort((a, b) => {
    const scoreA =
      typeof a.previousScore === "number" ? a.previousScore : Math.max(0, a.score - (a.lastPoints || 0));
    const scoreB =
      typeof b.previousScore === "number" ? b.previousScore : Math.max(0, b.score - (b.lastPoints || 0));
    return scoreB - scoreA;
  });

  // 2. Final list sorted by current score AFTER this question
  const finalSorted = [...players].sort((a, b) => b.score - a.score);

  // Take the stable unique set of Top 5 players
  const topPlayerIds = Array.from(
    new Set([
      ...initialSorted.slice(0, 5).map((p) => p.id),
      ...finalSorted.slice(0, 5).map((p) => p.id),
    ])
  ).slice(0, 5);

  const topPlayers = topPlayerIds
    .map((id) => finalSorted.find((p) => p.id === id) || initialSorted.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  // Ref to track last overtakes and play sound cues
  const lastLeaderIdRef = useRef<string>(initialSorted[0]?.id || "");

  useEffect(() => {
    sounds.playLeaderboard();

    // 1. Initialize starting scores & initial slot positions
    const initialScoresMap: { [id: string]: number } = {};
    const initialSlotsMap: { [id: string]: number } = {};

    players.forEach((p) => {
      const startScore =
        typeof p.previousScore === "number"
          ? p.previousScore
          : Math.max(0, p.score - (p.lastPoints || 0));
      initialScoresMap[p.id] = startScore;
    });

    topPlayers.forEach((p) => {
      const initialRank = initialSorted.findIndex((item) => item.id === p.id);
      initialSlotsMap[p.id] = Math.max(0, initialRank >= 0 ? initialRank : 4);
    });

    setDisplayScores(initialScoresMap);
    setDynamicSlots(initialSlotsMap);

    // 2. Start Live 4.0-Second Continuous Overtake Engine!
    // As scores tick up, whenever a player's running score exceeds another player,
    // their slot immediately swaps, causing real-time live overtaking!
    const totalDurationMs = 4200; // 4.2 seconds of thrilling live race!
    const startTime = Date.now() + 500; // 500ms initial suspense pause
    let animFrameId: number;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < 0) {
        animFrameId = requestAnimationFrame(tick);
        return;
      }

      const rawProgress = Math.min(1, elapsed / totalDurationMs);
      // Custom ease-out curve for natural deceleration towards the end
      const progress = 1 - Math.pow(1 - rawProgress, 2.2);

      // Compute live score for all players at this millisecond
      const currentScoresMap: { [id: string]: number } = {};
      players.forEach((p) => {
        const start =
          typeof p.previousScore === "number"
            ? p.previousScore
            : Math.max(0, p.score - (p.lastPoints || 0));
        const target = p.score;
        const diff = target - start;
        currentScoresMap[p.id] = Math.round(start + diff * progress);
      });
      setDisplayScores(currentScoresMap);

      // Dynamically rank top players based on their LIVE current score
      const sortedByLiveScore = [...topPlayers].sort((a, b) => {
        const scoreA = currentScoresMap[a.id] ?? 0;
        const scoreB = currentScoresMap[b.id] ?? 0;
        return scoreB - scoreA;
      });

      const updatedSlots: { [id: string]: number } = {};
      sortedByLiveScore.forEach((p, idx) => {
        updatedSlots[p.id] = idx;
      });
      setDynamicSlots(updatedSlots);

      // Play tick / overtake chime when #1 leader changes
      const currentLeaderId = sortedByLiveScore[0]?.id;
      if (currentLeaderId && currentLeaderId !== lastLeaderIdRef.current) {
        lastLeaderIdRef.current = currentLeaderId;
        sounds.playClick();
      }

      if (rawProgress < 1) {
        animFrameId = requestAnimationFrame(tick);
      } else {
        // Counting complete!
        setIsCountingFinished(true);
        sounds.playClick();
      }
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [players]);

  return (
    <div className="min-h-screen w-screen bg-[#46178F] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans relative">
      {/* ========================================================================= */}
      {/* 1. HEADER: 100% Solid 3D Colors (No Glassmorphism, No Gradients) */}
      {/* ========================================================================= */}
      <header className="w-full flex justify-between items-center max-w-6xl mx-auto pt-1 z-20">
        {/* Left Standings Box: Solid Deep Purple #33106B with Solid 3D Bottom Border */}
        <div className="flex items-center gap-3.5 bg-[#33106B] px-6 py-3 rounded-2xl border-2 border-[#240B4D] border-b-[5px] border-b-[#1D083E] shadow-md">
          <div className="p-2.5 bg-[#FFA602] border-b-2 border-[#CC8400] rounded-xl text-slate-950 shadow-sm">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FFA602] block leading-none">
              Standings
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight mt-0.5">
              Leaderboard
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <AudioControl />

          {/* Next Button: 100% Solid Green #26890C with 3D Push Extrusion */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="px-8 py-3.5 bg-[#26890C] hover:bg-[#22790A] text-white font-black text-base md:text-lg rounded-2xl shadow-lg flex items-center gap-2.5 transition-all cursor-pointer border-b-[6px] border-[#1A6107] active:border-b-[2px] active:translate-y-1"
          >
            <span>{isLastQuestion ? "Final Podium 🏆" : "Next Question"}</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </motion.button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CENTER: LIVE REAL-TIME OVERTAKING RACE (100% Solid 3D White Cards) */}
      {/* ========================================================================= */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-auto py-4 z-10">
        <div className="relative w-full h-[530px]">
          {topPlayers.map((player) => {
            const initialRank = initialSorted.findIndex((p) => p.id === player.id) + 1;
            const finalRank = finalSorted.findIndex((p) => p.id === player.id) + 1;
            const rankDelta = initialRank - finalRank; // Positive = Climbed up, Negative = Dropped down!

            // Current live slot index (0, 1, 2, 3, 4)
            const currentSlot = dynamicSlots[player.id] ?? (initialRank - 1);
            const liveRankNumber = currentSlot + 1;
            const slotY = currentSlot * CARD_HEIGHT_PX;

            const currentScoreVal = displayScores[player.id] ?? player.score;
            const pointsGained = player.lastPoints || 0;

            const isClimber = isCountingFinished && rankDelta > 0;
            const isDropper = isCountingFinished && rankDelta < 0;

            return (
              <motion.div
                key={player.id}
                initial={{ y: (initialRank - 1) * CARD_HEIGHT_PX, opacity: 0 }}
                animate={{
                  y: slotY,
                  opacity: 1,
                  zIndex: liveRankNumber === 1 ? 30 : 25 - liveRankNumber,
                }}
                transition={{
                  y: { type: "spring", stiffness: 65, damping: 13, mass: 1 },
                }}
                className={`absolute left-0 right-0 top-0 h-[88px] bg-white rounded-2xl px-6 md:px-8 border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-md flex items-center justify-between transition-all will-change-transform ${
                  liveRankNumber === 1
                    ? "border-amber-400 border-b-[6px] border-b-amber-500"
                    : isClimber
                    ? "border-emerald-400 border-b-[6px] border-b-emerald-500"
                    : isDropper
                    ? "border-rose-300 border-b-[6px] border-b-rose-400"
                    : ""
                }`}
              >
                {/* Left Section: 54px Solid Rank Badge + Avatar + Nickname */}
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  {/* Solid 3D Rank Badge (100% Solid Colors, Extruded Bottom Border) */}
                  <div
                    className={`w-13 h-13 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0 transition-colors duration-300 ${
                      liveRankNumber === 1
                        ? "bg-[#FFA602] border-b-4 border-[#CC8400] text-slate-950"
                        : liveRankNumber === 2
                        ? "bg-[#94A3B8] border-b-4 border-[#64748B] text-white"
                        : liveRankNumber === 3
                        ? "bg-[#D97706] border-b-4 border-[#92400E] text-white"
                        : "bg-[#33106B] border-b-4 border-[#240B4D] text-white"
                    }`}
                  >
                    {liveRankNumber}
                  </div>

                  {/* Avatar */}
                  <div className="text-3xl md:text-4xl filter drop-shadow-sm flex-shrink-0 select-none">
                    {player.avatar}
                  </div>

                  {/* Nickname & Dynamic Indicators */}
                  <div className="min-w-0 flex items-center gap-2.5 md:gap-3 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate max-w-[140px] sm:max-w-xs md:max-w-sm tracking-tight">
                      {player.nickname}
                    </h3>

                    {/* Streak Badge: Solid Amber */}
                    {player.streak > 1 && (
                      <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-black bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-0.5 rounded-full flex-shrink-0">
                        <Flame className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                        <span>{player.streak} Streak</span>
                      </span>
                    )}

                    {/* Rank Climbed Badge (Solid Green ▲) */}
                    {isCountingFinished && rankDelta > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7] font-black px-2.5 py-0.5 rounded-full text-xs shadow-sm flex-shrink-0"
                      >
                        <ArrowUp className="w-3.5 h-3.5 stroke-[3] text-[#059669]" />
                        <span>+{rankDelta}</span>
                      </motion.span>
                    )}

                    {/* Rank Dropped Badge (Solid Red ▼) */}
                    {isCountingFinished && rankDelta < 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] font-black px-2.5 py-0.5 rounded-full text-xs shadow-sm flex-shrink-0"
                      >
                        <ArrowDown className="w-3.5 h-3.5 stroke-[3] text-[#DC2626]" />
                        <span>{rankDelta}</span>
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Right Section: Solid Points Gained Pill + Total Score */}
                <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
                  {/* Points Gained Pill: Solid Light Blue */}
                  {pointsGained > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-black px-3 py-1 rounded-xl text-sm md:text-base shadow-sm"
                    >
                      +{pointsGained.toLocaleString()}
                    </motion.div>
                  )}

                  {/* Total Score: Solid Dark Slate-900 */}
                  <div className="text-right min-w-[85px] sm:min-w-[105px]">
                    <span className="text-2xl md:text-4xl font-black text-slate-900 tabular-nums tracking-tight block leading-none">
                      {currentScoreVal.toLocaleString()}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 block uppercase tracking-wider mt-1">
                      pts
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. FOOTER: 100% Solid Player Count Indicator */}
      {/* ========================================================================= */}
      <footer className="w-full text-center text-xs font-bold text-slate-200 pb-2 z-20">
        {players.length > 5 && (
          <span className="bg-[#33106B] px-5 py-2 rounded-full border border-[#240B4D] inline-flex items-center gap-2 shadow-sm text-sm">
            <Users className="w-4 h-4 text-[#FFA602]" />
            <span>+ {players.length - 5} more players competing below</span>
          </span>
        )}
      </footer>
    </div>
  );
}
