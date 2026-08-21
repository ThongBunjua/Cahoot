"use client";

import React, { useState, useEffect, Suspense, Component, ErrorInfo, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useGamePlayer } from "@/lib/realtime/useGamePlayer";
import { PinForm } from "@/components/player/PinForm";
import { NicknameForm } from "@/components/player/NicknameForm";
import { PlayerLobby } from "@/components/player/PlayerLobby";
import { PlayerGetReady } from "@/components/player/PlayerGetReady";
import { PlayerGameButtons } from "@/components/player/PlayerGameButtons";
import { PlayerFeedback } from "@/components/player/PlayerFeedback";
import { PlayerPodium } from "@/components/player/PlayerPodium";
import { PaperCutBackground } from "@/components/ui/PaperCutBackground";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

// Client-side Error Boundary to catch any unexpected errors gracefully
class PlayerErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorText: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorText: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorText: error?.message || "Unknown error" };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[PlayerErrorBoundary caught]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#1b0738] text-white flex flex-col items-center justify-center p-6 text-center z-50">
          <div className="bg-[#33106B] p-8 rounded-3xl border-2 border-white/20 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
            <span className="text-5xl">⚡</span>
            <h2 className="text-2xl font-black">Connection Refreshed</h2>
            <p className="text-xs text-slate-300">
              Your session was refreshed. Click below to reconnect to the game.
            </p>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("cahoot_player_session");
                  window.location.href = "/";
                }
              }}
              className="w-full py-3.5 px-6 bg-[#26890C] hover:bg-[#22790A] text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] text-white flex flex-col justify-between items-center p-2 sm:p-4 md:p-6 overflow-hidden select-none">
      {/* Material / Paper-Cut Purple Gradient Background */}
      <PaperCutBackground />

      {/* Main Center Floating Card Area */}
      <main className="relative z-20 w-full h-full flex-1 flex flex-col items-center justify-center my-auto overflow-hidden">
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

          {step === "game" && (
            <motion.div
              key="game-view"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full flex-1 flex flex-col items-center justify-center overflow-hidden"
            >
              {(!state.player || state.phase === "lobby") && (
                <PlayerLobby
                  player={state.player || { id: "temp", nickname: "Player", avatar: "🦊", score: 0, streak: 0, lastPoints: 0, lastCorrect: null, lastAnswerIndex: null, rank: 1, joinedAt: Date.now() }}
                  pin={state.pin || enteredPin}
                  onLeave={handlePlayAgain}
                />
              )}

              {state.player && state.phase === "get_ready" && (
                <PlayerGetReady
                  questionIndex={state.currentQuestionIndex}
                  totalQuestions={Math.max(1, state.totalQuestions)}
                />
              )}

              {state.player && state.phase === "question" && (
                <PlayerGameButtons
                  onSelect={submitAnswer}
                  selectedAnswer={state.selectedAnswer}
                  hasAnswered={state.hasAnswered}
                  timeRemaining={state.timeRemaining}
                  timeLimit={state.timeLimit}
                  questionIndex={state.currentQuestionIndex}
                  totalQuestions={Math.max(1, state.totalQuestions)}
                  choices={state.choices || []}
                  nickname={state.player?.nickname}
                  avatar={state.player?.avatar}
                  score={state.currentScore || 0}
                />
              )}

              {state.player && state.phase === "question_results" && (
                <PlayerFeedback
                  isCorrect={state.isCorrect}
                  pointsEarned={state.pointsEarned || 0}
                  currentScore={state.currentScore || 0}
                  streak={state.streak || 0}
                  currentRank={state.currentRank || 1}
                  totalPlayers={Math.max(1, state.totalPlayers)}
                />
              )}

              {state.player && state.phase === "leaderboard" && (
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
                      #{state.currentRank || 1}
                    </span>
                  </div>
                </div>
              )}

              {state.player && state.phase === "podium" && (
                <PlayerPodium
                  score={state.currentScore || 0}
                  nickname={state.player?.nickname}
                  avatar={state.player?.avatar}
                  onPlayAgain={handlePlayAgain}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function KahootPlayerPage() {
  return (
    <PlayerErrorBoundary>
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-[#1b0738] text-white flex items-center justify-center">
            <p className="text-xl font-bold">Loading Cahoot!...</p>
          </div>
        }
      >
        <KahootPlayerContent />
      </Suspense>
    </PlayerErrorBoundary>
  );
}
