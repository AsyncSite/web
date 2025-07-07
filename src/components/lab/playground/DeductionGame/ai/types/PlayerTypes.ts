export type PlayerType = 'human' | 'built-in-ai' | 'custom-ai';

export interface PlayerInfo {
  id: number;
  nickname: string;
  type: PlayerType;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  customCode?: string;
  customLanguage?: 'javascript' | 'typescript';
}

export interface PlayerMove {
  selectedIndices: number[];
  timeUsed: number;
  timestamp: number;
}

export interface PlayerMoveResult {
  playerId: number;
  playerName: string;
  guess: number[];
  guessKeywords: string[];
  correctCount: number;
  turnNumber: number;
  timeUsed: number;
}
