export type ShapeType = "triangle" | "diamond" | "circle" | "square";
export type ColorType = "red" | "blue" | "yellow" | "green";

export interface Choice {
  text: string;
  shape: ShapeType;
  color: ColorType;
}

export interface Question {
  id: string;
  quiz_id?: string;
  question_text: string;
  media_url?: string;
  time_limit: number; // e.g. 10, 20, 30, 60
  choices: Choice[];
  correct_index: number; // 0, 1, 2, 3
  points_multiplier: number; // 1.0, 2.0, 0
  order_index: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  creator_id?: string | null;
  is_public: boolean;
  questions: Question[];
  created_at?: string;
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  lastPoints: number;
  lastCorrect: boolean | null;
  lastAnswerIndex: number | null;
  rank: number;
  joinedAt: number;
}

export type GamePhase =
  | "lobby"
  | "get_ready"
  | "question"
  | "question_results"
  | "leaderboard"
  | "podium";

export interface GameHostState {
  pin: string;
  quiz: Quiz;
  phase: GamePhase;
  currentQuestionIndex: number;
  questionStartTime: number; // Timestamp when question countdown started
  timeRemaining: number;
  players: Player[];
  answerCounts: [number, number, number, number]; // Counts for [red, blue, yellow, green]
  totalAnswersReceived: number;
}

export interface GamePlayerState {
  pin: string;
  player: Player | null;
  phase: GamePhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  isCorrect: boolean | null;
  pointsEarned: number;
  currentScore: number;
  streak: number;
  currentRank: number;
  totalPlayers: number;
  timeRemaining: number;
  timeLimit: number;
}

// REALTIME BROADCAST EVENT ENUMS & PAYLOADS
export type RealtimeEvent =
  | "CHECK_ROOM"
  | "ROOM_EXISTS"
  | "LOBBY_SYNC"
  | "PLAYER_JOIN"
  | "PLAYER_LEAVE"
  | "PLAYER_KICK"
  | "GAME_START"
  | "GET_READY"
  | "QUESTION_START"
  | "SUBMIT_ANSWER"
  | "QUESTION_END"
  | "SHOW_LEADERBOARD"
  | "NEXT_QUESTION"
  | "GAME_OVER";

export interface BroadcastPayload {
  event: RealtimeEvent;
  pin: string;
  data: any;
  timestamp: number;
}
