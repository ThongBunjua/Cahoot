"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GamePlayerState, Player } from "./types";
import { getRealtimeChannel } from "./realtimeProvider";
import { sounds } from "@/lib/audio/soundManager";
import { SyncBridge } from "./syncBridge";

export function useGamePlayer(initialPin: string = "") {
  const [state, setState] = useState<GamePlayerState>({
    pin: initialPin,
    player: null,
    phase: "lobby",
    currentQuestionIndex: 0,
    totalQuestions: 0,
    questionText: "",
    choices: [],
    selectedAnswer: null,
    hasAnswered: false,
    isCorrect: null,
    pointsEarned: 0,
    currentScore: 0,
    streak: 0,
    currentRank: 1,
    totalPlayers: 1,
    timeRemaining: 20,
    timeLimit: 20,
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const timerRef = useRef<any>(null);
  const joinHandshakeIntervalRef = useRef<any>(null);

  // Restore session from localStorage only if the room actually exists
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("cahoot_player_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pin && parsed.player) {
          SyncBridge.verifyRoomExists(parsed.pin).then((res) => {
            if (res.exists) {
              setState((prev) => ({
                ...prev,
                pin: parsed.pin,
                player: parsed.player,
                currentScore: parsed.player.score || 0,
                streak: parsed.player.streak || 0,
              }));
            } else {
              // Stale room -> delete cache so user stays on clean PIN screen
              localStorage.removeItem("cahoot_player_session");
            }
          }).catch(() => {
            localStorage.removeItem("cahoot_player_session");
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Join Room function
  const joinRoom = useCallback((pin: string, nickname: string, avatar: string = "🦊") => {
    const playerId = `player_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
    const playerObj: Player = {
      id: playerId,
      nickname,
      avatar,
      score: 0,
      streak: 0,
      lastPoints: 0,
      lastCorrect: null,
      lastAnswerIndex: null,
      correctCount: 0,
      rank: 1,
      joinedAt: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      pin,
      player: playerObj,
      phase: "lobby",
    }));

    try {
      localStorage.setItem("cahoot_player_session", JSON.stringify({ pin, player: playerObj }));
    } catch (e) {}

    // 1. Send Realtime WebSocket Broadcast
    const channel = getRealtimeChannel(pin);
    channel.broadcast("PLAYER_JOIN", {
      id: playerId,
      nickname,
      avatar,
    });

    // 2. Dual-Path: Register in Supabase DB
    SyncBridge.playerJoinRoom(pin, playerObj);
  }, []);

  // Submit Answer function
  const submitAnswer = useCallback((answerIndex: number) => {
    const currentState = stateRef.current;
    if (currentState.hasAnswered || currentState.phase !== "question" || !currentState.player) {
      return;
    }

    sounds.playClick();

    setState((prev) => ({
      ...prev,
      selectedAnswer: answerIndex,
      hasAnswered: true,
    }));

    const channel = getRealtimeChannel(currentState.pin);
    channel.broadcast("SUBMIT_ANSWER", {
      playerId: currentState.player.id,
      nickname: currentState.player.nickname,
      answerIndex,
      clientTimestamp: Date.now(),
    });
  }, []);

  // Realtime Event Listeners & Auto-Handshake
  useEffect(() => {
    if (!state.pin) return;

    const channel = getRealtimeChannel(state.pin);

    // Continuous Join Handshake: Resend PLAYER_JOIN every 2s while in lobby
    if (joinHandshakeIntervalRef.current) {
      clearInterval(joinHandshakeIntervalRef.current);
      joinHandshakeIntervalRef.current = null;
    }

    if (state.player && state.phase === "lobby") {
      const announce = () => {
        if (stateRef.current.player && stateRef.current.phase === "lobby") {
          channel.broadcast("PLAYER_JOIN", {
            id: stateRef.current.player.id,
            nickname: stateRef.current.player.nickname,
            avatar: stateRef.current.player.avatar,
          });
          SyncBridge.playerJoinRoom(stateRef.current.pin, stateRef.current.player);
        }
      };

      announce();
      joinHandshakeIntervalRef.current = setInterval(announce, 2000);
    }

    const unsubscribe = channel.subscribe((payload) => {
      if (!payload || payload.pin !== stateRef.current.pin) return;
      const eventData = payload.data || {};

      const myId = stateRef.current.player?.id;
      const myNickname = stateRef.current.player?.nickname?.toLowerCase();

      // 1. Lobby Sync
      if (payload.event === "LOBBY_SYNC") {
        const { totalQuestions, players } = eventData;
        const me = Array.isArray(players)
          ? players.find(
              (p: any) =>
                p.id === myId ||
                (p.nickname && p.nickname.toLowerCase() === myNickname)
            )
          : null;

        if (me) {
          if (joinHandshakeIntervalRef.current) {
            clearInterval(joinHandshakeIntervalRef.current);
            joinHandshakeIntervalRef.current = null;
          }
          if (stateRef.current.player && stateRef.current.player.id !== me.id) {
            stateRef.current.player.id = me.id;
          }
        }

        setState((prev) => ({
          ...prev,
          totalQuestions: totalQuestions || prev.totalQuestions,
          totalPlayers: Array.isArray(players) ? players.length : prev.totalPlayers,
          currentRank: me ? me.rank : prev.currentRank,
        }));
      }

      // 2. Kicked by Host
      if (payload.event === "PLAYER_KICK") {
        if (eventData.playerId === myId) {
          localStorage.removeItem("cahoot_player_session");
          setState((prev) => ({
            ...prev,
            player: null,
            phase: "lobby",
          }));
          alert("You were removed from the game by the host.");
        }
      }

      // 3. Get Ready Phase
      if (payload.event === "GET_READY") {
        if (joinHandshakeIntervalRef.current) {
          clearInterval(joinHandshakeIntervalRef.current);
          joinHandshakeIntervalRef.current = null;
        }
        if (timerRef.current) clearInterval(timerRef.current);

        const { questionIndex, totalQuestions } = eventData;

        setState((prev) => ({
          ...prev,
          phase: "get_ready",
          currentQuestionIndex: typeof questionIndex === "number" ? questionIndex : prev.currentQuestionIndex,
          totalQuestions: totalQuestions || prev.totalQuestions,
          selectedAnswer: null,
          hasAnswered: false,
          isCorrect: null,
          pointsEarned: 0,
        }));
      }

      // 4. Question Started
      if (payload.event === "QUESTION_START") {
        if (joinHandshakeIntervalRef.current) {
          clearInterval(joinHandshakeIntervalRef.current);
          joinHandshakeIntervalRef.current = null;
        }
        if (timerRef.current) clearInterval(timerRef.current);

        const { questionIndex, totalQuestions, timeLimit, questionText, choices } = eventData;

        const limit = typeof timeLimit === "number" && timeLimit > 0 ? timeLimit : 20;

        // Normalize choices so it is ALWAYS an array of pure strings
        const normalizedChoices: string[] = Array.isArray(choices)
          ? choices.map((c: any) => {
              if (typeof c === "string") return c;
              if (c && typeof c.text === "string") return c.text;
              return "";
            })
          : [];

        setState((prev) => ({
          ...prev,
          phase: "question",
          currentQuestionIndex: typeof questionIndex === "number" ? questionIndex : prev.currentQuestionIndex,
          totalQuestions: totalQuestions || prev.totalQuestions,
          questionText: typeof questionText === "string" ? questionText : "",
          choices: normalizedChoices,
          selectedAnswer: null,
          hasAnswered: false,
          isCorrect: null,
          timeLimit: limit,
          timeRemaining: limit,
        }));

        // Accurate Wall-Clock Countdown Timer (survives mobile throttle & phase transitions)
        const startAt = Date.now();
        const endAt = startAt + limit * 1000;

        timerRef.current = setInterval(() => {
          const now = Date.now();
          const remainingSec = Math.max(0, Math.ceil((endAt - now) / 1000));
          if (remainingSec <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
          setState((prev) => ({ ...prev, timeRemaining: remainingSec }));
        }, 250);
      }

      // 5. Question Results
      if (payload.event === "QUESTION_END") {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const { playerResults, correctIndex } = eventData;
        const resultsArray = Array.isArray(playerResults) ? playerResults : [];
        const myResult = resultsArray.find(
          (p: any) =>
            p.id === myId ||
            (p.nickname && p.nickname.toLowerCase() === myNickname)
        );

        if (myResult && typeof myResult.isCorrect === "boolean") {
          const isCorrect = myResult.isCorrect;

          if (isCorrect) {
            sounds.playCorrect();
          } else {
            sounds.playWrong();
          }

          setState((prev) => ({
            ...prev,
            phase: "question_results",
            isCorrect,
            pointsEarned: myResult.pointsEarned || 0,
            currentScore: myResult.totalScore ?? prev.currentScore,
            streak: myResult.streak ?? prev.streak,
            currentRank: myResult.rank || prev.currentRank,
            totalPlayers: resultsArray.length || prev.totalPlayers,
          }));
        } else {
          // Direct fallback: check selectedAnswer vs host correctIndex
          const localSelected = stateRef.current.selectedAnswer;
          const isCorrect = localSelected !== null && typeof correctIndex === "number" && localSelected === correctIndex;
          const earned = isCorrect ? 850 : 0;

          if (isCorrect) {
            sounds.playCorrect();
          } else {
            sounds.playWrong();
          }

          setState((prev) => ({
            ...prev,
            phase: "question_results",
            isCorrect,
            pointsEarned: earned,
            currentScore: prev.currentScore + earned,
            streak: isCorrect ? prev.streak + 1 : 0,
          }));
        }
      }

      // 6. Leaderboard
      if (payload.event === "SHOW_LEADERBOARD") {
        const { topPlayers } = eventData;
        const topArray = Array.isArray(topPlayers) ? topPlayers : [];
        const me = topArray.find(
          (p: any) =>
            p.id === myId ||
            (p.nickname && p.nickname.toLowerCase() === myNickname)
        );
        setState((prev) => ({
          ...prev,
          phase: "leaderboard",
          currentRank: me ? me.rank : prev.currentRank,
        }));
      }

      // 7. Game Over / Podium
      if (payload.event === "GAME_OVER") {
        const { allPlayers } = eventData;
        const allArray = Array.isArray(allPlayers) ? allPlayers : [];
        const me = allArray.find(
          (p: any) =>
            p.id === myId ||
            (p.nickname && p.nickname.toLowerCase() === myNickname)
        );

        setState((prev) => ({
          ...prev,
          phase: "podium",
          currentRank: me ? me.rank : prev.currentRank,
          currentScore: me ? me.score : prev.currentScore,
        }));
      }
    });

    return () => {
      unsubscribe();
      if (joinHandshakeIntervalRef.current) clearInterval(joinHandshakeIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.pin]);

  const leaveRoom = useCallback(() => {
    const currentPin = stateRef.current.pin;
    const currentPlayer = stateRef.current.player;

    if (currentPin && currentPlayer) {
      try {
        const channel = getRealtimeChannel(currentPin);
        channel.broadcast("PLAYER_LEAVE", {
          id: currentPlayer.id,
          nickname: currentPlayer.nickname,
        });
      } catch (err) {
        // ignore
      }
    }

    localStorage.removeItem("cahoot_player_session");
    if (joinHandshakeIntervalRef.current) clearInterval(joinHandshakeIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setState({
      pin: "",
      player: null,
      phase: "lobby",
      currentQuestionIndex: 0,
      totalQuestions: 0,
      questionText: "",
      choices: [],
      selectedAnswer: null,
      hasAnswered: false,
      isCorrect: null,
      pointsEarned: 0,
      currentScore: 0,
      streak: 0,
      currentRank: 1,
      totalPlayers: 1,
      timeRemaining: 20,
      timeLimit: 20,
    });
  }, []);

  return {
    state,
    joinRoom,
    submitAnswer,
    leaveRoom,
  };
}
