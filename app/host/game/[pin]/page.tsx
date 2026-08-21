"use client";

import React, { useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import { QuizStore, STARTER_QUIZZES } from "@/lib/store/quizStore";
import { useGameHost } from "@/lib/realtime/useGameHost";
import { HostLobby } from "@/components/host/HostLobby";
import { HostQuestionIntro } from "@/components/host/HostQuestionIntro";
import { HostQuestion } from "@/components/host/HostQuestion";
import { HostResults } from "@/components/host/HostResults";
import { HostLeaderboard } from "@/components/host/HostLeaderboard";
import { HostPodium } from "@/components/host/HostPodium";
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
    startQuestion,
    endQuestion,
    showLeaderboard,
    nextStep,
    kickPlayer,
  } = useGameHost(pin, quiz);

  const currentQuestion = quiz.questions[state.currentQuestionIndex] || quiz.questions[0];

  // Wrap in LayoutGroup so layoutId animations work seamlessly across phase switches
  const renderPhase = () => {
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
          <HostQuestionIntro
            question={currentQuestion}
            questionIndex={state.currentQuestionIndex}
            totalQuestions={quiz.questions.length}
            onIntroComplete={() => startQuestion(state.currentQuestionIndex)}
          />
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
            isLastQuestion={state.currentQuestionIndex >= quiz.questions.length - 1}
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
  };

  return <LayoutGroup>{renderPhase()}</LayoutGroup>;
}
