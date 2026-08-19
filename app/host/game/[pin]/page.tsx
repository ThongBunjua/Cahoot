"use client";

import React, { useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { QuizStore, STARTER_QUIZZES } from "@/lib/store/quizStore";
import { useGameHost } from "@/lib/realtime/useGameHost";
import { HostLobby } from "@/components/host/HostLobby";
import { HostQuestion } from "@/components/host/HostQuestion";
import { HostResults } from "@/components/host/HostResults";
import { HostLeaderboard } from "@/components/host/HostLeaderboard";
import { HostPodium } from "@/components/host/HostPodium";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { generateGamePin } from "@/lib/utils/pinGenerator";

export default function HostGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pin = (params.pin as string) || "123456";
  const quizId = searchParams.get("quizId");

  // Lookup quiz or fallback to starter
  const quiz = useMemo(() => {
    if (quizId) {
      const found = QuizStore.getQuizById(quizId);
      if (found) return found;
    }
    return STARTER_QUIZZES[0];
  }, [quizId]);

  const {
    state,
    startGame,
    endQuestion,
    showLeaderboard,
    nextStep,
    kickPlayer,
  } = useGameHost(pin, quiz);

  const currentQuestion = quiz.questions[state.currentQuestionIndex] || quiz.questions[0];

  // Render Phase Views
  switch (state.phase) {
    case "lobby":
      return (
        <HostLobby
          pin={pin}
          quiz={quiz}
          players={state.players}
          onStartGame={startGame}
          onKickPlayer={kickPlayer}
        />
      );

    case "get_ready":
      return (
        <div className="min-h-screen bg-kahoot-dark text-white flex flex-col items-center justify-center p-8 select-none relative overflow-hidden">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-center max-w-2xl"
          >
            <span className="text-sm font-black uppercase tracking-widest bg-kahoot-purple text-white px-5 py-2 rounded-2xl shadow-xl mb-6 inline-block">
              Question {state.currentQuestionIndex + 1} of {quiz.questions.length}
            </span>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-8">
              {currentQuestion.question_text}
            </h1>

            <div className="w-24 h-24 mx-auto rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-4xl shadow-2xl animate-pulse">
              !
            </div>

            <p className="mt-6 text-xl font-bold text-slate-300">
              Get Ready!
            </p>
          </motion.div>
        </div>
      );

    case "question":
      return (
        <HostQuestion
          question={currentQuestion}
          questionIndex={state.currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          timeRemaining={state.timeRemaining}
          totalAnswersReceived={state.totalAnswersReceived}
          totalPlayers={state.players.length}
          onSkip={endQuestion}
        />
      );

    case "question_results":
      return (
        <HostResults
          question={currentQuestion}
          answerCounts={state.answerCounts}
          onNext={showLeaderboard}
        />
      );

    case "leaderboard":
      return (
        <HostLeaderboard
          players={state.players}
          isLastQuestion={state.currentQuestionIndex >= quiz.questions.length - 1}
          onNext={nextStep}
        />
      );

    case "podium":
      return (
        <HostPodium
          quiz={quiz}
          players={state.players}
          onPlayAgain={() => {
            const newPin = generateGamePin();
            router.push(`/host/game/${newPin}?quizId=${quiz.id}`);
          }}
        />
      );

    default:
      return null;
  }
}
