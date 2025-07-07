import { Participant } from '../types';

// 게임 기록
export interface GameHistory {
  id: string;
  gameType: string; // 'snail-race', 'slot-machine' 등
  timestamp: number;
  participants: Participant[];
  winners: Participant[];
  gameConfig: {
    winnerCount: number;
    // 게임별 추가 설정
    [key: string]: any;
  };
  duration: number; // 게임 진행 시간 (밀리초)
}

// 참가자 통계
export interface ParticipantStats {
  participantId: string;
  name: string;
  totalGames: number;
  wins: number;
  winRate: number;
  gameStats: {
    [gameType: string]: {
      played: number;
      wins: number;
      avgRank?: number;
      lastPlayed?: number;
    };
  };
  lastPlayed: number;
  createdAt: number;
}

// 전체 통계
export interface GlobalStats {
  totalGamesPlayed: number;
  gameTypeStats: {
    [gameType: string]: number;
  };
  mostPlayedGame: string;
  totalParticipants: number;
  lastUpdated: number;
}

// 스토리지 버전 관리
export interface StorageVersion {
  version: number;
  migratedAt: number;
}

// 게임 결과 데이터 (게임 종료 시 전달)
export interface GameResult {
  gameType: string;
  participants: Participant[];
  winners: Participant[];
  gameConfig: any;
  startTime: number;
  endTime: number;
}

// 필터 옵션
export interface GameHistoryFilter {
  gameType?: string;
  participantId?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

// 정렬 옵션
export interface SortOptions {
  field: 'timestamp' | 'gameType' | 'winnerCount';
  order: 'asc' | 'desc';
}
