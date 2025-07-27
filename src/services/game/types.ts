// Game type definitions for unified game data management

export type GameType = 'TETRIS' | 'DEDUCTION';

export interface BaseGameResult {
  gameType: GameType;
  score: number;
  playedAt: Date;
  timeElapsedSeconds: number;
}

export interface TetrisGameData extends BaseGameResult {
  gameType: 'TETRIS';
  linesCleared: number;
  level: number;
  maxCombo?: number;
}

export interface DeductionGameData extends BaseGameResult {
  gameType: 'DEDUCTION';
  difficulty: 'easy' | 'medium' | 'hard';
  guessesCount: number;
  hintsUsed?: number; // Deprecated - use wrongAnswerHintsUsed and correctAnswerHintsUsed
  wrongAnswerHintsUsed: number;
  correctAnswerHintsUsed: number;
  playersCount: number;
  won: boolean;
  opponentType: 'AI' | 'HUMAN';
  opponentDifficulty?: 'easy' | 'medium' | 'hard'; // For AI opponents
  opponentId?: string; // For human opponents
  turnDetails?: TurnDetail[];
}

export interface TurnDetail {
  turnNumber: number;
  thinkTimeSeconds: number;
  wasCorrect: boolean;
  hintUsedBefore: 'WRONG_ANSWER' | 'CORRECT_ANSWER' | null;
}

export type GameResult = TetrisGameData | DeductionGameData;

export interface GameHistory {
  id: string;
  gameType: GameType;
  score: number;
  playedAt: Date;
  additionalData: Record<string, any>;
}

export interface GameStatistics {
  gameType: GameType;
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  lastPlayedAt?: Date;
  additionalStats?: Record<string, any>;
}

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  userName: string;
  score: number;
  playedAt: Date;
  additionalData?: Record<string, any>;
}

export interface GameSession {
  sessionId: string;
  gameType: GameType;
  startedAt: Date;
  status: 'active' | 'completed' | 'abandoned';
}

// Error types for game data management
export class GameDataError extends Error {
  constructor(
    message: string,
    public code: 'NETWORK_ERROR' | 'STORAGE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: any
  ) {
    super(message);
    this.name = 'GameDataError';
  }
}

// Utility type for async operations with error handling
export type GameDataResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: GameDataError;
};