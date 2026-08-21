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

  const { state, joinRoom, submitAnswer, leaveRoom } = useGamePlayer(initialPinParam);

  // If user visits "/" with no ?pin=, ALWAYS start at clean PIN form and wipe any stale cached session
  useEffect(() => {
    if (!initialPinParam) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cahoot_player_session");
      }
      setStep("pin");
      setEnteredPin("");
    }
  }, [initialPinParam]);

  useEffect(() => {
    if (state.player && state.pin) {
      setStep("game");
    } else if (!state.player && !initialPinParam) {
      setStep("pin");
    }
  }, [state.player, state.pin, initialPinParam]);

  const handlePinSubmit = (pin: string) => {
    setEnteredPin(pin);
    setStep("nickname");
  };

  const handleNicknameSubmit = (nickname: string, avatar: string) => {
    joinRoom(enteredPin, nickname, avatar);
    setStep("game");
  };

  const handleBackToPin = () => {
    leaveRoom();
    setStep("pin");
    setEnteredPin("");
  };

  const handlePlayAgain = () => {
    leaveRoom();
    setStep("pin");
    setEnteredPin("");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#46178F] text-white flex flex-col items-center justify-center p-4 overflow-hidden font-sans select-none">
      {/* Background Graphic */}
      <PaperCutBackground />

      <AnimatePresence mode="wait">
        {step === "pin" && (
          <motion.div
            key="pin-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm relative z-10"
          >
            <PinForm onSubmit={handlePinSubmit} />
          </motion.div>
        )}

        {step === "nickname" && (
          <motion.div
            key="nickname-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm relative z-10"
          >
            <NicknameForm
              pin={enteredPin}
              onSubmit={handleNicknameSubmit}
              onBack={handleBackToPin}
            />
          </motion.div>
        )}

        {step === "game" && (
          <motion.div
            key="game-play-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center relative z-10"
          >
            {(!state.player || state.phase === "lobby") && (
              <PlayerLobby
                player={state.player || { id: "temp", nickname: "Player", avatar: "🦊", score: 0, streak: 0, lastPoints: 0, lastCorrect: null, lastAnswerIndex: null, rank: 1, joinedAt: Date.now() }}
                pin={state.pin || enteredPin}
                onLeave={handleBackToPin}
              />
            )}

            {state.player && state.phase === "get_ready" && (
              <PlayerGetReady
                questionIndex={state.currentQuestionIndex}
                totalQuestions={state.totalQuestions}
              />
            )}

            {state.player && state.phase === "question" && (
              <PlayerGameButtons
                onSelect={submitAnswer}
                hasAnswered={state.hasAnswered}
                selectedAnswer={state.selectedAnswer}
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
                isLastQuestion={state.currentQuestionIndex + 1 >= state.totalQuestions && state.totalQuestions > 0}
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
    </div>
  );
}

export default function Home() {
  return (
    <PlayerErrorBoundary>
      <Suspense
        fallback={
          <div className="fixed inset-0 w-full h-[100dvh] bg-[#46178F] flex items-center justify-center">
            <span className="text-3xl font-black text-white animate-pulse">
              Cahoot<span className="text-yellow-400">!</span>
            </span>
          </div>
        }
      >
        <KahootPlayerContent />
      </Suspense>
    </PlayerErrorBoundary>
  );
}
