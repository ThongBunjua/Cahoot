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

  // Restore session only if user explicitly scanned QR or has ?pin= in URL matching saved PIN
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPin = urlParams.get("pin");

      const saved = localStorage.getItem("cahoot_player_session");
      if (saved) {
        const parsed = JSON.parse(saved);

        // If user loaded the site directly without ?pin=, ALWAYS purge old session to start at clean PIN screen!
        if (!urlPin) {
          localStorage.removeItem("cahoot_player_session");
          return;
        }

        // If user loaded a specific PIN in URL, verify if it matches saved session
        if (parsed && parsed.pin && parsed.player && parsed.pin === urlPin) {
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
              // Stale/Closed room -> purge cache immediately
              localStorage.removeItem("cahoot_player_session");
            }
          }).catch(() => {
            localStorage.removeItem("cahoot_player_session");
          });
        } else {
          localStorage.removeItem("cahoot_player_session");
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Join Room function
  const joinRoom = useCallback((pin: string, nickname: string, avatar: string = "🦊") => {
    const cleanPin = pin.replace(/\s+/g, "").trim();
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
      pin: cleanPin,
      player: playerObj,
      phase: "lobby",
    }));

    try {
      localStorage.setItem("cahoot_player_session", JSON.stringify({ pin: cleanPin, player: playerObj }));
    } catch (e) {}

    // 1. Send Realtime WebSocket Broadcast
    const channel = getRealtimeChannel(cleanPin);
    channel.broadcast("PLAYER_JOIN", {
      id: playerId,
      nickname,
      avatar,
    });

    // 2. Dual Backup: Register with Supabase DB
    SyncBridge.playerJoinRoom(cleanPin, playerObj).catch(() => {});

    // 3. Reliable Handshake: Periodically announce presence until Host acknowledges
    if (joinHandshakeIntervalRef.current) clearInterval(joinHandshakeIntervalRef.current);
    let attempts = 0;
    joinHandshakeIntervalRef.current = setInterval(() => {
      attempts++;
      if (attempts > 5) {
        clearInterval(joinHandshakeIntervalRef.current);
        joinHandshakeIntervalRef.current = null;
        return;
      }
      channel.broadcast("PLAYER_JOIN", {
        id: playerId,
        nickname,
        avatar,
      });
    }, 1500);
  }, []);

  // Submit Answer
  const submitAnswer = useCallback(
    (choiceIndex: number) => {
      const { player, pin, hasAnswered, timeRemaining, timeLimit, currentQuestionIndex } =
        stateRef.current;

      if (!player || !pin || hasAnswered) return;

      sounds.playClick();

      // Kahoot Formula: Up to 1000 pts scaled by response speed
      const effectiveTime = Math.max(0.5, timeRemaining);
      const limit = Math.max(1, timeLimit);
      const speedRatio = effectiveTime / limit;
      const basePoints = Math.round(500 + 500 * speedRatio);

      setState((prev) => ({
        ...prev,
        selectedAnswer: choiceIndex,
        hasAnswered: true,
      }));

      // Broadcast answer to Host immediately with all field aliases
      const channel = getRealtimeChannel(pin);
      channel.broadcast("SUBMIT_ANSWER", {
        id: player.id,
        playerId: player.id,
        nickname: player.nickname,
        avatar: player.avatar,
        choiceIndex,
        answerIndex: choiceIndex,
        timeRemaining: effectiveTime,
        points: basePoints,
        questionIndex: currentQuestionIndex,
      });
    },
    []
  );

  // Subscribe to Realtime Host Events
  useEffect(() => {
    if (!state.pin) return;

    const channel = getRealtimeChannel(state.pin);

    const unsubscribe = channel.subscribe((payload) => {
      if (payload.pin !== state.pin) return;

      const eventData = payload.data || {};
      const myId = stateRef.current.player?.id;
      const myNickname = stateRef.current.player?.nickname?.toLowerCase();

      // 0. Name Assignment / Auto-Disambiguation Sync
      if (payload.event === "PLAYER_ASSIGN_NAME" && eventData.playerId === myId) {
        const assignedName = eventData.nickname;
        if (assignedName && typeof assignedName === "string") {
          setState((prev) => {
            const updatedPlayer = prev.player ? { ...prev.player, nickname: assignedName } : prev.player;
            try {
              if (updatedPlayer) {
                localStorage.setItem("cahoot_player_session", JSON.stringify({ pin: prev.pin, player: updatedPlayer }));
              }
            } catch (e) {}
            return {
              ...prev,
              player: updatedPlayer,
            };
          });
        }
      }

      if (payload.event === "LOBBY_SYNC" && Array.isArray(eventData.players)) {
        const serverMe = eventData.players.find((p: any) => p.id === myId);
        if (serverMe && serverMe.nickname && stateRef.current.player && serverMe.nickname !== stateRef.current.player.nickname) {
          setState((prev) => {
            const updatedPlayer = prev.player ? { ...prev.player, nickname: serverMe.nickname } : prev.player;
            try {
              if (updatedPlayer) {
                localStorage.setItem("cahoot_player_session", JSON.stringify({ pin: prev.pin, player: updatedPlayer }));
              }
            } catch (e) {}
            return {
              ...prev,
              player: updatedPlayer,
            };
          });
        }
      }

      // 1. Kick Event
      if (payload.event === "PLAYER_KICK" && eventData.playerId === myId) {
        localStorage.removeItem("cahoot_player_session");
        setState((prev) => ({ ...prev, player: null, pin: "", phase: "lobby" }));
        return;
      }

      // 2. Start Game / Question Intro
      if (payload.event === "GET_READY") {
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

      // 3. Question Start
      if (payload.event === "QUESTION_START") {
        const { question, questionIndex, totalQuestions, choices, questionText, timeLimit } = eventData;
        const qObj = question || {};
        const rawLimit = typeof timeLimit === "number" && timeLimit > 0
          ? timeLimit
          : typeof qObj.time_limit === "number" && qObj.time_limit > 0
          ? qObj.time_limit
          : 20;

        const rawChoices = Array.isArray(choices) ? choices : Array.isArray(qObj.choices) ? qObj.choices : [];
        const normalizedChoices: string[] = rawChoices.map((c: any) =>
          typeof c === "string" ? c : c?.text || ""
        );

        const text = questionText || qObj.question_text || qObj.question || "";

        setState((prev) => ({
          ...prev,
          phase: "question",
          currentQuestionIndex: typeof questionIndex === "number" ? questionIndex : prev.currentQuestionIndex,
          totalQuestions: totalQuestions || prev.totalQuestions,
          questionText: typeof text === "string" ? text : "",
          choices: normalizedChoices,
          selectedAnswer: null,
          hasAnswered: false,
          isCorrect: null,
          timeLimit: rawLimit,
          timeRemaining: rawLimit,
        }));

        // Accurate Wall-Clock Countdown Timer
        const startAt = Date.now();
        const endAt = startAt + rawLimit * 1000;

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

      // 4. Question Results
      if (payload.event === "QUESTION_END") {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const { playerResults, correctIndex } = eventData;
        const resultsArray = Array.isArray(playerResults) ? playerResults : [];
        const myResult = myId
          ? resultsArray.find((p: any) => p.id === myId)
          : resultsArray.find((p: any) => p.nickname && p.nickname.toLowerCase() === myNickname);

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

      // 5. Leaderboard
      if (payload.event === "SHOW_LEADERBOARD") {
        const { topPlayers } = eventData;
        const topArray = Array.isArray(topPlayers) ? topPlayers : [];
        const me = myId
          ? topArray.find((p: any) => p.id === myId)
          : topArray.find((p: any) => p.nickname && p.nickname.toLowerCase() === myNickname);
        setState((prev) => ({
          ...prev,
          phase: "leaderboard",
          currentRank: me ? me.rank : prev.currentRank,
        }));
      }

      // 6. Game Over / Podium -> IMMEDIATELY PURGE STORAGE
      if (payload.event === "GAME_OVER") {
        localStorage.removeItem("cahoot_player_session");
        const { allPlayers } = eventData;
        const allArray = Array.isArray(allPlayers) ? allPlayers : [];
        const me = myId
          ? allArray.find((p: any) => p.id === myId)
          : allArray.find((p: any) => p.nickname && p.nickname.toLowerCase() === myNickname);

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
