// 참가자 정보
export interface Participant {
  id: string;
  name: string;
  order: number;
}

// 게임 설정
export interface GameSettings {
  participants: Participant[];
  winnerCount: number;
  allowDuplicates: boolean;
}

// 게임 상태
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  status: GameStatus;
  winners: Participant[];
  settings: GameSettings;
}

// 게임 정보
export interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  minPlayers: number;
  maxPlayers: number;
  available: boolean;
}

// 달팽이 레이스 타입
export interface SnailRaceEvent {
  id: string;
  name: string;
  icon: string;
  duration: number;
  speedModifier: number;
  probability: number;
}

export interface Snail {
  id: string;
  participant: Participant;
  position: number;
  speed: number;
  baseSpeed: number;
  color: string;
  activeEvent?: {
    event: SnailRaceEvent;
    startTime: number;
  };
}

export interface SnailRaceState extends GameState {
  snails: Snail[];
  trackLength: number;
  elapsedTime: number;
  events: SnailRaceEvent[];
}