"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useGamePlayer } from "@/lib/realtime/useGamePlayer";
import { PinForm } from "@/components/player/PinForm";
import { NicknameForm } from "@/components/player/NicknameForm";
import { PlayerLobby } from "@/components/player/PlayerLobby";
import { PlayerGameButtons } from "@/components/player/PlayerGameButtons";
import { PlayerFeedback } from "@/components/player/PlayerFeedback";
import { PlayerPodium } from "@/components/player/PlayerPodium";
import { SoundControl } from "@/components/ui/SoundControl";
import { PaperCutBackground } from "@/components/ui/PaperCutBackground";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

function KahootPlayerContent() {
  const searchParams = useSearchParams();
  const initialPinParam = searchParams.get("pin") || "";

  const [enteredPin, setEnteredPin] = useState(initialPinParam);
  const [step, setStep] = useState<"pin" | "nickname" | "game">(
    initialPinParam ? "nickname" : "pin"
  );

  const { state, joinRoom, submitAnswer, leaveRoom } = useGamePlayer(enteredPin);

  useEffect(() => {
    if (state.player) {
      setStep("game");
    }
  }, [state.player]);

  const handlePinSubmit = (pin: string) => {
    setEnteredPin(pin);
    setStep("nickname");
  };

  const handleNicknameSubmit = (nickname: string, avatar: string) => {
    joinRoom(enteredPin, nickname, avatar);
    setStep("game");
  };

  const handleBackToPin = () => {
    setStep("pin");
  };

  const handlePlayAgain = () => {
    leaveRoom();
    setStep("pin");
    setEnteredPin("");
  };

  return (
    <div className="min-h-screen min-h-[100dvh] text-white flex flex-col justify-between items-center p-3 sm:p-6 relative overflow-hidden select-none">
      {/* Material / Paper-Cut Purple Gradient Background */}
      <PaperCutBackground />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-4xl flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          {step !== "game" && (
            <Link
              href="/quizzes"
              className="text-[11px] sm:text-xs font-black uppercase tracking-wider bg-white/15 hover:bg-white/25 text-white px-3.5 py-1.5 rounded-full border border-white/20 transition-all backdrop-blur-md shadow-md"
            >
              Host a Game
            </Link>
          )}
        </div>
        <SoundControl />
      </header>

      {/* Main Center Floating Card Area */}
      <main className="relative z-20 w-full flex-1 flex flex-col items-center justify-center my-auto py-4">
        {step !== "game" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 sm:mb-8 text-center px-4"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] flex items-center justify-center">
              Cahoot<span className="text-yellow-400">!</span>
            </h1>
            <p className="text-[10px] sm:text-xs font-black text-white/90 uppercase tracking-[0.25em] mt-1.5 drop-shadow-md">
              LIVE MULTIPLAYER TRIVIA
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === "pin" && (
            <PinForm
              key="pin-form"
              initialPin={enteredPin}
              onSubmit={handlePinSubmit}
            />
          )}

          {step === "nickname" && (
            <NicknameForm
              key="nickname-form"
              pin={enteredPin}
              onSubmit={handleNicknameSubmit}
              onBack={handleBackToPin}
            />
          )}

          {step === "game" && state.player && (
            <div key="game-view" className="w-full h-full flex flex-col items-center justify-center">
              {state.phase === "lobby" && (
                <PlayerLobby
                  player={state.player}
                  pin={state.pin}
                  onLeave={handlePlayAgain}
                />
              )}

              {state.phase === "get_ready" && (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-24 h-24 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center text-4xl font-black shadow-2xl mb-4"
                  >
                    !
                  </motion.div>
                  <h2 className="text-3xl font-black text-white">Get Ready!</h2>
                  <p className="text-sm font-bold text-slate-200 mt-2">
                    Question {state.currentQuestionIndex + 1} of {state.totalQuestions}
                  </p>
                </div>
              )}

              {state.phase === "question" && (
                <PlayerGameButtons
                  onSelect={submitAnswer}
                  selectedAnswer={state.selectedAnswer}
                  hasAnswered={state.hasAnswered}
                  timeRemaining={state.timeRemaining}
                  timeLimit={state.timeLimit}
                  streak={state.streak}
                  questionIndex={state.currentQuestionIndex}
                  totalQuestions={state.totalQuestions}
                />
              )}

              {state.phase === "question_results" && (
                <PlayerFeedback
                  isCorrect={state.isCorrect}
                  pointsEarned={state.pointsEarned}
                  currentScore={state.currentScore}
                  streak={state.streak}
                  currentRank={state.currentRank}
                  totalPlayers={state.totalPlayers}
                />
              )}

              {state.phase === "leaderboard" && (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-white/10 max-w-sm w-full shadow-2xl">
                  <span className="text-5xl mb-3">📊</span>
                  <h2 className="text-2xl font-black text-white mb-1">Scoreboard</h2>
                  <p className="text-sm font-bold text-slate-300 mb-4">
                    Look at the big screen!
                  </p>
                  <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/15">
                    <span className="text-xs uppercase font-bold text-slate-400 block">
                      Your Current Rank
                    </span>
                    <span className="text-3xl font-black text-yellow-400">
                      #{state.currentRank}
                    </span>
                  </div>
                </div>
              )}

              {state.phase === "podium" && (
                <PlayerPodium
                  rank={state.currentRank}
                  score={state.currentScore}
                  onPlayAgain={handlePlayAgain}
                />
              )}
            </div>
          )}
        </AnimatePresence>
      </main>


    </div>
  );
}

export default function KahootPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1b0738] text-white flex items-center justify-center">
          <p className="text-xl font-bold">Loading Cahoot!...</p>
        </div>
      }
    >
      <KahootPlayerContent />
    </Suspense>
  );
}
