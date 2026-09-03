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
  previousScore?: number;
  streak: number;
  lastPoints: number;
  lastCorrect: boolean | null;
  lastAnswerIndex: number | null;
  rank: number;
  previousRank?: number;
  correctCount?: number;
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
  questionStartTime: number;
  timeRemaining: number;
  players: Player[];
  answerCounts: [number, number, number, number];
  totalAnswersReceived: number;
}

export interface GamePlayerState {
  pin: string;
  player: Player | null;
  phase: GamePhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  questionText?: string;
  choices?: string[];
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

export type RealtimeEvent =
  | "CHECK_ROOM"
  | "ROOM_EXISTS"
  | "ROOM_NOT_FOUND"
  | "PLAYER_JOIN"
  | "PLAYER_LEAVE"
  | "PLAYER_KICK"
  | "LOBBY_SYNC"
  | "GET_READY"
  | "QUESTION_START"
  | "SUBMIT_ANSWER"
  | "QUESTION_END"
  | "SHOW_LEADERBOARD"
  | "GAME_OVER"
  | "PLAYER_ASSIGN_NAME";

export interface BroadcastPayload {
  event: RealtimeEvent;
  pin: string;
  data: any;
  timestamp?: number;
}
