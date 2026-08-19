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

  // Restore session from localStorage if available
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("cahoot_player_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pin && parsed.player) {
          setState((prev) => ({
            ...prev,
            pin: parsed.pin,
            player: parsed.player,
            currentScore: parsed.player.score || 0,
            streak: parsed.player.streak || 0,
          }));
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
      if (payload.pin !== stateRef.current.pin) return;

      const myId = stateRef.current.player?.id;
      const myNickname = stateRef.current.player?.nickname?.toLowerCase();

      // 1. Lobby Sync
      if (payload.event === "LOBBY_SYNC") {
        const { totalQuestions, players } = payload.data;
        const me = players
          ? players.find(
              (p: any) =>
                p.id === myId ||
                (p.nickname && p.nickname.toLowerCase() === myNickname)
            )
          : null;

        // If Host confirmed we are in the lobby, update ID and stop the handshake interval
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
          totalPlayers: players ? players.length : prev.totalPlayers,
          currentRank: me ? me.rank : prev.currentRank,
        }));
      }

      // 2. Kicked by Host
      if (payload.event === "PLAYER_KICK") {
        if (payload.data.playerId === myId) {
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

        const { questionIndex, totalQuestions } = payload.data;

        setState((prev) => ({
          ...prev,
          phase: "get_ready",
          currentQuestionIndex: questionIndex,
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

        const { questionIndex, totalQuestions, timeLimit } = payload.data;

        setState((prev) => ({
          ...prev,
          phase: "question",
          currentQuestionIndex: questionIndex,
          totalQuestions: totalQuestions || prev.totalQuestions,
          selectedAnswer: null,
          hasAnswered: false,
          isCorrect: null,
          timeLimit: timeLimit || 20,
          timeRemaining: timeLimit || 20,
        }));

        let remaining = timeLimit || 20;
        timerRef.current = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setState((prev) => ({ ...prev, timeRemaining: Math.max(0, remaining) }));
        }, 1000);
      }

      // 5. Question Results - Match by BOTH ID and Nickname
      if (payload.event === "QUESTION_END") {
        if (timerRef.current) clearInterval(timerRef.current);

        const { playerResults } = payload.data;
        const myResult = playerResults
          ? playerResults.find(
              (p: any) =>
                p.id === myId ||
                (p.nickname && p.nickname.toLowerCase() === myNickname)
            )
          : null;

        if (myResult) {
          const isCorrect = Boolean(myResult.isCorrect);

          if (isCorrect) {
            sounds.playCorrect();
          } else {
            sounds.playWrong();
          }

          setState((prev) => ({
            ...prev,
            phase: "question_results",
            isCorrect: isCorrect,
            pointsEarned: myResult.pointsEarned || 0,
            currentScore: myResult.totalScore || prev.currentScore,
            streak: myResult.streak || 0,
            currentRank: myResult.rank || prev.currentRank,
            totalPlayers: playerResults.length,
          }));
        } else {
          // Fallback: If player selected answer locally, check if choice matches correct index directly
          const localSelected = stateRef.current.selectedAnswer;
          const correctIdx = payload.data.correctIndex;
          const localCorrect = localSelected !== null && localSelected === correctIdx;

          if (localCorrect) {
            sounds.playCorrect();
          } else {
            sounds.playWrong();
          }

          setState((prev) => ({
            ...prev,
            phase: "question_results",
            isCorrect: localCorrect,
            pointsEarned: localCorrect ? 800 : 0,
          }));
        }
      }

      // 6. Leaderboard
      if (payload.event === "SHOW_LEADERBOARD") {
        const { topPlayers } = payload.data;
        const me = topPlayers
          ? topPlayers.find(
              (p: any) =>
                p.id === myId ||
                (p.nickname && p.nickname.toLowerCase() === myNickname)
            )
          : null;
        setState((prev) => ({
          ...prev,
          phase: "leaderboard",
          currentRank: me ? me.rank : prev.currentRank,
        }));
      }

      // 7. Game Over / Podium
      if (payload.event === "GAME_OVER") {
        const { allPlayers } = payload.data;
        const me = allPlayers
          ? allPlayers.find(
              (p: any) =>
                p.id === myId ||
                (p.nickname && p.nickname.toLowerCase() === myNickname)
            )
          : null;

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
  }, [state.pin, state.player, state.phase]);

  const leaveRoom = useCallback(() => {
    localStorage.removeItem("cahoot_player_session");
    if (joinHandshakeIntervalRef.current) clearInterval(joinHandshakeIntervalRef.current);
    setState({
      pin: "",
      player: null,
      phase: "lobby",
      currentQuestionIndex: 0,
      totalQuestions: 0,
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
