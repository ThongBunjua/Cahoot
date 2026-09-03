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
  const lastClickAudioRef = useRef(0);
  const lastActionTimeRef = useRef(0);

  const playThrottledClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClickAudioRef.current > 75) {
      lastClickAudioRef.current = now;
      sounds.playClick();
    }
  }, []);

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
  const endQuestion = useCallback((overridePlayers?: any, overrideAnswerCounts?: any) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentState = stateRef.current;
    sounds.playTimesUp();

    const currentQ = currentState.quiz.questions[currentState.currentQuestionIndex];
    // Safeguard: only use override if it is a real Array!
    const sourcePlayers = Array.isArray(overridePlayers) ? overridePlayers : currentState.players;
    const sourceAnswerCounts = Array.isArray(overrideAnswerCounts) ? overrideAnswerCounts : currentState.answerCounts;

    // Compute updated ranks with deterministic tie-breaker
    const sorted = [...sourcePlayers].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.id.localeCompare(b.id);
    });
    const rankedPlayers = sorted.map((p, idx) => ({
      ...p,
      previousRank: p.previousRank || idx + 1,
      previousScore: typeof p.previousScore === "number" ? p.previousScore : Math.max(0, p.score - (p.lastPoints || 0)),
      rank: idx + 1,
    }));

    // Synchronously update stateRef
    const updatedState = {
      ...currentState,
      phase: "question_results" as GamePhase,
      timeRemaining: 0,
      players: rankedPlayers,
      answerCounts: sourceAnswerCounts as [number, number, number, number],
    };
    stateRef.current = updatedState;
    setState(updatedState);

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
        const data = payload.data || {};
        const rawNickname = typeof data.nickname === "string" ? data.nickname : "Player";
        const cleanNickname = rawNickname.trim().replace(/[<>]/g, "").slice(0, 15) || "Player";
        const cleanId = String(data.id || `player_${Date.now()}`);
        const cleanAvatar = typeof data.avatar === "string" ? data.avatar : "🦊";

        // Check if player ID already registered (reconnect or handshake retry)
        const idExists = currentState.players.some((p) => p.id === cleanId);
        if (idExists) {
          syncLobby(currentState.players);
        } else {
          // Auto-resolve duplicate nickname to guarantee no player is dropped
          let uniqueNickname = cleanNickname;
          let suffix = 2;
          while (currentState.players.some((p) => p.nickname.toLowerCase() === uniqueNickname.toLowerCase())) {
            uniqueNickname = `${cleanNickname} ${suffix}`;
            suffix++;
          }

          const newPlayer: Player = {
            id: cleanId,
            nickname: uniqueNickname,
            avatar: cleanAvatar,
            score: 0,
            previousScore: 0,
            streak: 0,
            lastPoints: 0,
            lastCorrect: null,
            lastAnswerIndex: null,
            correctCount: 0,
            rank: currentState.players.length + 1,
            previousRank: currentState.players.length + 1,
            joinedAt: Date.now(),
          };
          const updatedPlayers = [...currentState.players, newPlayer];
          stateRef.current = { ...stateRef.current, players: updatedPlayers };
          setState((prev) => ({ ...prev, players: updatedPlayers }));
          playThrottledClick();
          syncLobby(updatedPlayers);

          if (uniqueNickname !== cleanNickname) {
            broadcast("PLAYER_ASSIGN_NAME", {
              playerId: cleanId,
              nickname: uniqueNickname,
            });
          }
        }
      }

      // 1.1 Player Leaves Room
      if (payload.event === "PLAYER_LEAVE") {
        const { id, nickname } = payload.data || {};
        const remainingPlayers = currentState.players.filter(
          (p) => p.id !== id && (!nickname || p.nickname.toLowerCase() !== String(nickname).toLowerCase())
        );
        stateRef.current = { ...stateRef.current, players: remainingPlayers };
        setState((prev) => ({ ...prev, players: remainingPlayers }));
        syncLobby(remainingPlayers);
      }

      // 2. Player Submits Answer during Question Phase
      if (payload.event === "SUBMIT_ANSWER" && currentState.phase === "question") {
        const payloadData = payload.data || {};
        const playerId = payloadData.playerId || payloadData.id;
        const nickname = payloadData.nickname;
        const answerIndex =
          typeof payloadData.answerIndex === "number"
            ? payloadData.answerIndex
            : typeof payloadData.choiceIndex === "number"
              ? payloadData.choiceIndex
              : -1;

        if (answerIndex < 0 || answerIndex > 3) return;

        const answerKey = String(playerId || nickname || "");
        if (answersMapRef.current.has(answerKey)) return;

        const question = currentState.quiz.questions[currentState.currentQuestionIndex];
        if (!question) return;

        const hostNow = Date.now();
        const responseTimeMs = Math.max(0, hostNow - currentState.questionStartTime);
        answersMapRef.current.set(answerKey, { answerIndex, timestamp: hostNow });

        const isCorrect = Number(answerIndex) === Number(question.correct_index);

        // Match player STRICTLY by playerId if present; fallback to nickname only if playerId missing
        const player = playerId
          ? currentState.players.find((p) => p.id === playerId)
          : currentState.players.find((p) => nickname && p.nickname.toLowerCase() === nickname.toLowerCase());
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

        // Update player record STRICTLY by playerId
        const updatedPlayers = currentState.players.map((p) => {
          const isMatch = playerId
            ? p.id === playerId
            : (nickname && p.nickname.toLowerCase() === nickname.toLowerCase());

          if (isMatch) {
            return {
              ...p,
              score: p.score + points,
              streak: newStreak,
              lastPoints: points,
              lastCorrect: isCorrect,
              lastAnswerIndex: answerIndex,
              correctCount: (p.correctCount || 0) + (isCorrect ? 1 : 0),
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
        playThrottledClick();

        // Check if EVERY registered player has actually submitted an answer
        const allRegisteredPlayersAnswered =
          updatedPlayers.length > 0 &&
          updatedPlayers.every((p) => p.lastAnswerIndex !== null && typeof p.lastAnswerIndex === "number");

        if (allRegisteredPlayersAnswered) {
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

    answersMapRef.current.clear();

    // Snapshot each player's true previousScore and previousRank before this question begins
    const sortedBefore = [...stateRef.current.players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.id.localeCompare(b.id);
    });

    const snapshottedPlayers = stateRef.current.players.map((p) => {
      const currentRank = sortedBefore.findIndex((sp) => sp.id === p.id) + 1;
      return {
        ...p,
        previousScore: p.score,
        previousRank: currentRank,
        lastPoints: 0,
        lastCorrect: null,
        lastAnswerIndex: null,
      };
    });

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

    timerRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const rem = Math.max(0, Math.ceil(limit - elapsedSec));

      if (rem <= 5 && rem > 0) {
        sounds.playTick(1.0 + (5 - rem) * 0.1);
      }

      if (elapsedSec >= limit) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        endQuestion();
      } else {
        setState((prev) => {
          if (prev.phase !== "question") return prev;
          return { ...prev, timeRemaining: rem };
        });
      }
    }, 200);
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
    const now = Date.now();
    if (now - lastActionTimeRef.current < 800) return;
    lastActionTimeRef.current = now;

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
    const now = Date.now();
    if (now - lastActionTimeRef.current < 800) return;
    lastActionTimeRef.current = now;

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
