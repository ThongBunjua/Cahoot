"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameHostState, GamePhase, Player, Quiz, RealtimeEvent } from "./types";
import { getRealtimeChannel } from "./realtimeProvider";
import { calculateScore } from "@/lib/utils/scoring";
import { sounds } from "@/lib/audio/soundManager";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SessionManager } from "./sessionManager";
import { SyncBridge } from "./syncBridge";

export function useGameHost(pin: string, quiz: Quiz) {
  const [state, setState] = useState<GameHostState>({
    pin,
    quiz,
    phase: "lobby",
    currentQuestionIndex: 0,
    questionStartTime: 0,
    timeRemaining: 0,
    players: [],
    answerCounts: [0, 0, 0, 0],
    totalAnswersReceived: 0,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const timerRef = useRef<any>(null);
  const answersMapRef = useRef<Map<string, { answerIndex: number; timestamp: number }>>(new Map());

  // Broadcast event helper
  const broadcast = useCallback((event: RealtimeEvent, data: any) => {
    const channel = getRealtimeChannel(pin);
    channel.broadcast(event, data);
  }, [pin]);

  // Sync lobby state helper
  const syncLobby = useCallback((players: Player[]) => {
    broadcast("LOBBY_SYNC", {
      pin,
      quizTitle: quiz.title,
      totalQuestions: quiz.questions.length,
      players: players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        rank: p.rank,
      })),
    });
  }, [broadcast, pin, quiz]);

  // Register Host in Active Session Registry & DB Session
  useEffect(() => {
    SessionManager.registerHost(pin, quiz.title);
    SyncBridge.hostRegisterRoom(pin, quiz.id);

    return () => {
      SessionManager.unregisterHost(pin);
    };
  }, [pin, quiz.id, quiz.title]);

  // Dual-Path: Periodic heartbeat broadcast + DB sync during lobby
  useEffect(() => {
    if (state.phase === "lobby") {
      const interval = setInterval(async () => {
        syncLobby(stateRef.current.players);

        try {
          const dbPlayers = await SyncBridge.fetchRoomPlayers(pin);
          if (dbPlayers.length > 0) {
            const current = stateRef.current.players;
            let hasNew = false;
            const merged = [...current];

            for (const dp of dbPlayers) {
              const exists = merged.some(
                (p) => p.id === dp.id || p.nickname.toLowerCase() === dp.nickname.toLowerCase()
              );
              if (!exists) {
                merged.push({
                  ...dp,
                  previousScore: dp.score || 0,
                  previousRank: merged.length + 1,
                });
                hasNew = true;
              }
            }

            if (hasNew) {
              stateRef.current = { ...stateRef.current, players: merged };
              setState((prev) => ({ ...prev, players: merged }));
              sounds.playClick();
              syncLobby(merged);
            }
          }
        } catch (e) {
          // ignore
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [state.phase, pin, syncLobby]);

  // End the question and show results
  const endQuestion = useCallback((overridePlayers?: Player[], overrideAnswerCounts?: [number, number, number, number]) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentState = stateRef.current;
    sounds.playTimesUp();

    const currentQ = currentState.quiz.questions[currentState.currentQuestionIndex];
    const sourcePlayers = overridePlayers || currentState.players;
    const sourceAnswerCounts = overrideAnswerCounts || currentState.answerCounts;

    // Compute updated ranks with previousRank and previousScore preserved
    const sorted = [...sourcePlayers].sort((a, b) => b.score - a.score);
    const rankedPlayers = sorted.map((p, idx) => ({
      ...p,
      previousRank: p.previousRank || idx + 1,
      previousScore: typeof p.previousScore === "number" ? p.previousScore : Math.max(0, p.score - (p.lastPoints || 0)),
      rank: idx + 1,
    }));

    // Synchronously update stateRef
    stateRef.current = {
      ...currentState,
      phase: "question_results",
      timeRemaining: 0,
      players: rankedPlayers,
      answerCounts: sourceAnswerCounts,
    };

    setState(stateRef.current);

    // Broadcast question end to all players with full result data
    broadcast("QUESTION_END", {
      questionIndex: currentState.currentQuestionIndex,
      correctIndex: currentQ.correct_index,
      answerCounts: sourceAnswerCounts,
      playerResults: rankedPlayers.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        isCorrect: Boolean(p.lastCorrect),
        pointsEarned: p.lastPoints || 0,
        totalScore: p.score,
        streak: p.streak,
        rank: p.rank,
      })),
    });
  }, [broadcast]);

  // Handle incoming player join / answer submissions / check room pings
  useEffect(() => {
    const channel = getRealtimeChannel(pin);

    const unsubscribe = channel.subscribe((payload) => {
      if (payload.pin !== pin) return;

      const currentState = stateRef.current;

      // 0. Player checks if room exists
      if (payload.event === "CHECK_ROOM") {
        broadcast("ROOM_EXISTS", {
          pin,
          quizTitle: quiz.title,
          status: currentState.phase,
          totalPlayers: currentState.players.length,
        });
        syncLobby(currentState.players);
      }

      // 1. Player Joins Lobby
      if (payload.event === "PLAYER_JOIN") {
        const { id, nickname, avatar } = payload.data;
        const exists = currentState.players.some(
          (p) => p.id === id || p.nickname.toLowerCase() === nickname.toLowerCase()
        );

        if (!exists) {
          const newPlayer: Player = {
            id,
            nickname,
            avatar: avatar || "🦊",
            score: 0,
            previousScore: 0,
            streak: 0,
            lastPoints: 0,
            lastCorrect: null,
            lastAnswerIndex: null,
            rank: currentState.players.length + 1,
            previousRank: currentState.players.length + 1,
            joinedAt: Date.now(),
          };
          const updatedPlayers = [...currentState.players, newPlayer];
          stateRef.current = { ...stateRef.current, players: updatedPlayers };
          setState((prev) => ({ ...prev, players: updatedPlayers }));
          sounds.playClick();
          syncLobby(updatedPlayers);
        } else {
          syncLobby(currentState.players);
        }
      }

      // 2. Player Submits Answer during Question Phase
      if (payload.event === "SUBMIT_ANSWER" && currentState.phase === "question") {
        const { playerId, nickname, answerIndex } = payload.data;
        const answerKey = `${playerId}_${nickname || ""}`;
        if (answersMapRef.current.has(answerKey)) return;

        const question = currentState.quiz.questions[currentState.currentQuestionIndex];
        if (!question) return;

        const hostNow = Date.now();
        const responseTimeMs = Math.max(0, hostNow - currentState.questionStartTime);
        answersMapRef.current.set(answerKey, { answerIndex, timestamp: hostNow });

        const isCorrect = answerIndex === question.correct_index;
        
        // Match player by ID or Nickname
        const player = currentState.players.find(
          (p) => p.id === playerId || (nickname && p.nickname.toLowerCase() === nickname.toLowerCase())
        );
        const currentStreak = player ? player.streak : 0;

        const { points, newStreak } = calculateScore({
          isCorrect,
          responseTimeMs,
          timeLimitSeconds: question.time_limit,
          pointsMultiplier: question.points_multiplier ?? 1.0,
          currentStreak,
        });

        // Update answer counts
        const newAnswerCounts = [...currentState.answerCounts] as [number, number, number, number];
        if (answerIndex >= 0 && answerIndex < 4) {
          newAnswerCounts[answerIndex]++;
        }

        const newTotalAnswers = currentState.totalAnswersReceived + 1;

        // Update player record
        const updatedPlayers = currentState.players.map((p) => {
          if (p.id === playerId || (nickname && p.nickname.toLowerCase() === nickname.toLowerCase())) {
            return {
              ...p,
              score: p.score + points,
              streak: newStreak,
              lastPoints: points,
              lastCorrect: isCorrect,
              lastAnswerIndex: answerIndex,
            };
          }
          return p;
        });

        // Synchronously update stateRef
        stateRef.current = {
          ...currentState,
          players: updatedPlayers,
          answerCounts: newAnswerCounts,
          totalAnswersReceived: newTotalAnswers,
        };

        setState(stateRef.current);
        sounds.playClick();

        // If all players have answered, end question immediately
        if (newTotalAnswers >= currentState.players.length && currentState.players.length > 0) {
          endQuestion(updatedPlayers, newAnswerCounts);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pin, syncLobby, broadcast, quiz.title, endQuestion]);

  // Start Intro Phase ("Get Ready" with 3-2-1 morphing shapes, phone pop-up, 5s reading bar)
  const startGetReady = useCallback((questionIndex: number) => {
    const updatedState = {
      ...stateRef.current,
      phase: "get_ready" as GamePhase,
      currentQuestionIndex: questionIndex,
      answerCounts: [0, 0, 0, 0] as [number, number, number, number],
      totalAnswersReceived: 0,
    };
    stateRef.current = updatedState;
    setState(updatedState);

    answersMapRef.current.clear();

    const currentQ = quiz.questions[questionIndex];

    broadcast("GET_READY", {
      questionIndex,
      totalQuestions: quiz.questions.length,
      questionText: currentQ?.question_text,
    });
  }, [broadcast, quiz]);

  // Start the Game from Lobby
  const startGame = useCallback(() => {
    sounds.stopLobbyMusic();
    startGetReady(0);
  }, [startGetReady]);

  // Start Question Gameplay Countdown (20s Timer with 4 answer blocks)
  const startQuestion = useCallback((questionIndex?: number) => {
    const qIdx = typeof questionIndex === "number" ? questionIndex : stateRef.current.currentQuestionIndex;
    const currentQ = quiz.questions[qIdx];
    if (!currentQ) return;

    const startTime = Date.now();
    const limit = currentQ.time_limit;

    // Snapshot each player's previousScore and previousRank before this question begins
    const snapshottedPlayers = stateRef.current.players.map((p, idx) => ({
      ...p,
      previousScore: p.score,
      previousRank: p.rank || idx + 1,
      lastPoints: 0,
      lastCorrect: null,
      lastAnswerIndex: null,
    }));

    const updatedState = {
      ...stateRef.current,
      phase: "question" as GamePhase,
      currentQuestionIndex: qIdx,
      questionStartTime: startTime,
      timeRemaining: limit,
      players: snapshottedPlayers,
      answerCounts: [0, 0, 0, 0] as [number, number, number, number],
      totalAnswersReceived: 0,
    };
    stateRef.current = updatedState;
    setState(updatedState);

    broadcast("QUESTION_START", {
      questionIndex: qIdx,
      totalQuestions: quiz.questions.length,
      questionText: currentQ.question_text,
      mediaUrl: currentQ.media_url || "",
      choices: currentQ.choices,
      timeLimit: limit,
      hostStartTime: startTime,
    });

    if (timerRef.current) clearInterval(timerRef.current);

    let remaining = limit;
    timerRef.current = setInterval(() => {
      remaining -= 0.1;
      const rounded = Math.max(0, Math.ceil(remaining));

      if (remaining <= 5 && remaining > 0 && Math.abs(remaining - Math.round(remaining)) < 0.15) {
        sounds.playTick(1.0 + (5 - remaining) * 0.1);
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        endQuestion();
      } else {
        setState((prev) => ({ ...prev, timeRemaining: rounded }));
      }
    }, 100);
  }, [broadcast, endQuestion, quiz]);

  // Show Final 1st/2nd/3rd Podium
  const showPodium = useCallback(() => {
    sounds.playPodiumFanfare();
    const sorted = [...stateRef.current.players].sort((a, b) => b.score - a.score);

    const updatedState = {
      ...stateRef.current,
      phase: "podium" as GamePhase,
      players: sorted,
    };
    stateRef.current = updatedState;
    setState(updatedState);

    broadcast("GAME_OVER", {
      top3: sorted.slice(0, 3).map((p) => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        rank: p.rank,
      })),
      allPlayers: sorted.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        rank: p.rank,
      })),
    });

    if (isSupabaseConfigured()) {
      persistGameResults(pin, quiz.id, sorted).catch(console.warn);
    }
  }, [broadcast, pin, quiz]);

  // Transition from question results to leaderboard (or directly to podium on last question)
  const showLeaderboard = useCallback(() => {
    const isLast = stateRef.current.currentQuestionIndex >= quiz.questions.length - 1;
    if (isLast) {
      showPodium();
      return;
    }

    const sorted = [...stateRef.current.players].sort((a, b) => b.score - a.score);

    const updatedState = {
      ...stateRef.current,
      phase: "leaderboard" as GamePhase,
      players: sorted,
    };
    stateRef.current = updatedState;
    setState(updatedState);

    broadcast("SHOW_LEADERBOARD", {
      topPlayers: sorted.slice(0, 5).map((p) => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        streak: p.streak,
        rank: p.rank,
      })),
      isLastQuestion: false,
    });
  }, [broadcast, quiz, showPodium]);

  // Advance to next question or final podium
  const nextStep = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.currentQuestionIndex < quiz.questions.length - 1) {
      startGetReady(currentState.currentQuestionIndex + 1);
    } else {
      showPodium();
    }
  }, [quiz, startGetReady, showPodium]);

  // Kick a player from lobby
  const kickPlayer = useCallback((playerId: string) => {
    const updated = stateRef.current.players.filter((p) => p.id !== playerId);
    stateRef.current = { ...stateRef.current, players: updated };
    setState((prev) => ({ ...prev, players: updated }));
    broadcast("PLAYER_KICK", { playerId });
    syncLobby(updated);
  }, [broadcast, syncLobby]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      sounds.stopLobbyMusic();
    };
  }, []);

  return {
    state,
    startGame,
    startQuestion,
    endQuestion,
    showLeaderboard,
    nextStep,
    kickPlayer,
    syncLobby: () => syncLobby(state.players),
  };
}

// Background batch persistence helper
async function persistGameResults(pin: string, quizId: string, players: Player[]) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { data: session } = await supabase
      .from("game_sessions")
      .upsert({
        pin,
        quiz_id: quizId,
        status: "finished",
        ended_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (session && session.id) {
      const playerRows = players.map((p) => ({
        session_id: session.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        streak: p.streak,
        rank: p.rank,
      }));

      await supabase.from("session_players").upsert(playerRows, { onConflict: "session_id,nickname" });
    }
  } catch (err) {
    console.warn("Async persist game session error:", err);
  }
}
