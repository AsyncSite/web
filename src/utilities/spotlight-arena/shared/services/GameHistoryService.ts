import { BaseStorageService } from './BaseStorageService';
import { GameHistory, GameResult, GameHistoryFilter, SortOptions } from '../types/storage';

const STORAGE_KEY = 'spotlight-arena-game-history';
const MAX_HISTORY_SIZE = 500; // 최대 저장 게임 수
const DEFAULT_DAYS_TO_KEEP = 30; // 기본 보관 기간 (일)

export class GameHistoryService extends BaseStorageService {
  private static instance: GameHistoryService;

  private constructor() {
    super(STORAGE_KEY);
  }

  static getInstance(): GameHistoryService {
    if (!GameHistoryService.instance) {
      GameHistoryService.instance = new GameHistoryService();
    }
    return GameHistoryService.instance;
  }

  // 게임 결과 저장
  saveGameResult(result: GameResult): string | null {
    const history = this.getHistory();
    const newGame: GameHistory = {
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gameType: result.gameType,
      timestamp: result.endTime,
      participants: result.participants,
      winners: result.winners,
      gameConfig: result.gameConfig,
      duration: result.endTime - result.startTime
    };

    history.unshift(newGame); // 최신 게임을 앞에 추가

    // 최대 개수 초과 시 오래된 게임 제거
    if (history.length > MAX_HISTORY_SIZE) {
      history.splice(MAX_HISTORY_SIZE);
    }

    const saved = this.setData(history);
    return saved ? newGame.id : null;
  }

  // 전체 히스토리 조회
  getHistory(): GameHistory[] {
    const data = this.getData<GameHistory[]>();
    return data || [];
  }

  // 필터링된 게임 조회
  getFilteredGames(filter: GameHistoryFilter): GameHistory[] {
    let history = this.getHistory();

    // 게임 타입 필터
    if (filter.gameType) {
      history = history.filter(game => game.gameType === filter.gameType);
    }

    // 참가자 필터
    if (filter.participantId) {
      history = history.filter(game => 
        game.participants.some(p => p.id === filter.participantId)
      );
    }

    // 날짜 범위 필터
    if (filter.startDate) {
      history = history.filter(game => game.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      history = history.filter(game => game.timestamp <= filter.endDate!);
    }

    // 개수 제한
    if (filter.limit) {
      history = history.slice(0, filter.limit);
    }

    return history;
  }

  // 최근 게임 조회
  getRecentGames(limit: number = 10): GameHistory[] {
    return this.getFilteredGames({ limit });
  }

  // 게임 타입별 조회
  getGamesByType(gameType: string, limit?: number): GameHistory[] {
    return this.getFilteredGames({ gameType, limit });
  }

  // 특정 게임 조회
  getGameById(gameId: string): GameHistory | null {
    const history = this.getHistory();
    return history.find(game => game.id === gameId) || null;
  }

  // 참가자의 게임 이력
  getParticipantGames(participantId: string, limit?: number): GameHistory[] {
    return this.getFilteredGames({ participantId, limit });
  }

  // 정렬된 게임 목록
  getSortedGames(sortOptions: SortOptions, filter?: GameHistoryFilter): GameHistory[] {
    let games = filter ? this.getFilteredGames(filter) : this.getHistory();

    games.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOptions.field) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'gameType':
          comparison = a.gameType.localeCompare(b.gameType);
          break;
        case 'winnerCount':
          comparison = a.winners.length - b.winners.length;
          break;
      }

      return sortOptions.order === 'asc' ? comparison : -comparison;
    });

    return games;
  }

  // 오래된 기록 정리
  clearOldHistory(daysToKeep: number = DEFAULT_DAYS_TO_KEEP): number {
    const history = this.getHistory();
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    const filteredHistory = history.filter(game => game.timestamp >= cutoffDate);
    const removedCount = history.length - filteredHistory.length;

    if (removedCount > 0) {
      this.setData(filteredHistory);
    }

    return removedCount;
  }

  // 전체 기록 삭제
  clearAllHistory(): void {
    this.clearData();
  }

  // 스토리지 용량 초과 처리
  protected handleQuotaExceeded(): void {
    // 가장 오래된 10% 삭제
    const history = this.getHistory();
    const keepCount = Math.floor(history.length * 0.9);
    const newHistory = history.slice(0, keepCount);
    this.setData(newHistory);
  }

  // 데이터 유효성 검증
  protected validateData(data: any): boolean {
    if (!Array.isArray(data)) return false;
    
    return data.every(game => 
      game.id && 
      game.gameType && 
      game.timestamp && 
      Array.isArray(game.participants) && 
      Array.isArray(game.winners)
    );
  }

  // 통계 데이터 추출
  getStatsSummary() {
    const history = this.getHistory();
    const gameTypes = new Map<string, number>();
    
    history.forEach(game => {
      gameTypes.set(game.gameType, (gameTypes.get(game.gameType) || 0) + 1);
    });

    return {
      totalGames: history.length,
      gameTypeBreakdown: Object.fromEntries(gameTypes),
      oldestGame: history[history.length - 1]?.timestamp,
      newestGame: history[0]?.timestamp
    };
  }
}