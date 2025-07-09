import { SymbolType } from './symbol';
import { ActiveEvent } from './event';

// 게임 상태
export type GameStatus = 'waiting' | 'playing' | 'finished';

// 애니메이션 상태
export interface AnimationState {
  removingPositions: { row: number; col: number }[];
  fallingPositions: { row: number; col: number; distance: number }[];
  newPositions: { row: number; col: number }[];
}

// 점수 업데이트 기록
export interface ScoreUpdate {
  score: number;
  multiplier: number;
  cascadeLevel: number;
  timestamp: number;
}

// 플레이어 통계
export interface PlayerStats {
  totalSpins: number;
  totalCascades: number;
  highestCombo: number;
  specialSymbolsTriggered: {
    bomb: number;
    star: number;
    bonus: number;
  };
}

// 플레이어 상태
export interface PlayerState {
  id: string;
  name: string;
  score: number;
  grid: (SymbolType | null)[][];
  cascadeLevel: number;
  isSpinning: boolean;
  remainingSpins: number; // 남은 스핀 횟수
  consecutiveFailures: number; // 연속 실패 횟수
  underdogBoost: number; // 언더독 부스트 배율
  animationState?: AnimationState;
  specialEffects?: Array<{
    type: SymbolType;
    position: { row: number; col: number };
    affectedPositions: Array<{ row: number; col: number }>;
  }>;
  scoreUpdates: ScoreUpdate[];
  stats: PlayerStats;
}

// 게임 설정
export interface GameConfig {
  gridSize: number;
  gameDuration: number; // 초 단위
  minMatchLength: number;
  cascadeMultipliers: number[];
  maxSpinsPerPlayer: number; // 플레이어당 최대 스핀 횟수
}

// 게임 상태
export interface SlotCascadeGameState {
  status: GameStatus;
  players: PlayerState[];
  remainingTime: number;
  config: GameConfig;
  specialEventActive: string | null;
  currentEvent?: ActiveEvent;
  lastEventTime: number;
  nextSpinGuaranteedCascades: number; // 다음 스핀 보장 캐스케이드
  eventScoreMultiplier: number; // 이벤트 점수 배율
  specialSymbolOnlyMode: boolean; // 특수 심볼만 모드
}

// 기본 게임 설정
export const DEFAULT_GAME_CONFIG: GameConfig = {
  gridSize: 3,
  gameDuration: 180, // 3분
  minMatchLength: 3,
  cascadeMultipliers: [1, 1.5, 2, 3],
  maxSpinsPerPlayer: 20, // 기본 20회
};