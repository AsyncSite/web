import { SymbolType } from './symbol';

// 게임 상태
export type GameStatus = 'waiting' | 'playing' | 'finished';

// 애니메이션 상태
export interface AnimationState {
  removingPositions: { row: number; col: number }[];
  fallingPositions: { row: number; col: number; distance: number }[];
  newPositions: { row: number; col: number }[];
}

// 플레이어 상태
export interface PlayerState {
  id: string;
  name: string;
  score: number;
  grid: (SymbolType | null)[][];
  cascadeLevel: number;
  isSpinning: boolean;
  animationState?: AnimationState;
  specialEffects?: Array<{
    type: SymbolType;
    position: { row: number; col: number };
    affectedPositions: Array<{ row: number; col: number }>;
  }>;
}

// 게임 설정
export interface GameConfig {
  gridSize: number;
  gameDuration: number; // 초 단위
  minMatchLength: number;
  cascadeMultipliers: number[];
}

// 게임 상태
export interface SlotCascadeGameState {
  status: GameStatus;
  players: PlayerState[];
  remainingTime: number;
  config: GameConfig;
  specialEventActive: string | null;
}

// 기본 게임 설정
export const DEFAULT_GAME_CONFIG: GameConfig = {
  gridSize: 3,
  gameDuration: 180, // 3분
  minMatchLength: 3,
  cascadeMultipliers: [1, 1.5, 2, 3],
};