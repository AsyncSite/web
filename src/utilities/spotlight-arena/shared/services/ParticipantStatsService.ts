import { BaseStorageService } from './BaseStorageService';
import { ParticipantStats, GameResult, GameHistory } from '../types/storage';
import { Participant } from '../types';

const STORAGE_KEY = 'spotlight-arena-participant-stats';
const MAX_PARTICIPANTS = 1000; // 최대 저장 참가자 수

export class ParticipantStatsService extends BaseStorageService {
  private static instance: ParticipantStatsService;

  private constructor() {
    super(STORAGE_KEY);
  }

  static getInstance(): ParticipantStatsService {
    if (!ParticipantStatsService.instance) {
      ParticipantStatsService.instance = new ParticipantStatsService();
    }
    return ParticipantStatsService.instance;
  }

  // 전체 통계 데이터 조회
  private getAllStats(): Map<string, ParticipantStats> {
    const data = this.getData<{ [key: string]: ParticipantStats }>();
    return new Map(Object.entries(data || {}));
  }

  // 전체 통계 데이터 저장
  private saveAllStats(statsMap: Map<string, ParticipantStats>): boolean {
    const data = Object.fromEntries(statsMap);
    return this.setData(data);
  }

  // 게임 결과로 통계 업데이트
  updateStats(gameResult: GameResult): void {
    const stats = this.getAllStats();
    const gameType = gameResult.gameType;

    // 모든 참가자 통계 업데이트
    gameResult.participants.forEach((participant, index) => {
      const existingStats = stats.get(participant.id) || this.createInitialStats(participant);

      // 전체 게임 통계
      existingStats.totalGames++;
      existingStats.lastPlayed = gameResult.endTime;

      // 게임별 통계
      if (!existingStats.gameStats[gameType]) {
        existingStats.gameStats[gameType] = {
          played: 0,
          wins: 0,
          avgRank: 0,
          lastPlayed: 0,
        };
      }

      const gameStats = existingStats.gameStats[gameType];
      gameStats.played++;
      gameStats.lastPlayed = gameResult.endTime;

      // 승자인 경우
      const winnerIndex = gameResult.winners.findIndex((w) => w.id === participant.id);
      if (winnerIndex !== -1) {
        existingStats.wins++;
        gameStats.wins++;

        // 평균 순위 계산 (순위가 있는 경우)
        const currentRank = winnerIndex + 1;
        gameStats.avgRank = gameStats.avgRank
          ? (gameStats.avgRank * (gameStats.played - 1) + currentRank) / gameStats.played
          : currentRank;
      }

      // 승률 재계산
      existingStats.winRate =
        existingStats.totalGames > 0 ? (existingStats.wins / existingStats.totalGames) * 100 : 0;

      stats.set(participant.id, existingStats);
    });

    // 저장 공간 관리
    this.cleanupOldParticipants(stats);

    this.saveAllStats(stats);
  }

  // 초기 통계 객체 생성
  private createInitialStats(participant: Participant): ParticipantStats {
    return {
      participantId: participant.id,
      name: participant.name,
      totalGames: 0,
      wins: 0,
      winRate: 0,
      gameStats: {},
      lastPlayed: Date.now(),
      createdAt: Date.now(),
    };
  }

  // 특정 참가자 통계 조회
  getParticipantStats(participantId: string): ParticipantStats | null {
    const stats = this.getAllStats();
    return stats.get(participantId) || null;
  }

  // 이름으로 참가자 검색
  findParticipantsByName(name: string): ParticipantStats[] {
    const stats = this.getAllStats();
    const results: ParticipantStats[] = [];

    stats.forEach((stat) => {
      if (stat.name.toLowerCase().includes(name.toLowerCase())) {
        results.push(stat);
      }
    });

    return results;
  }

  // 상위 당첨자 조회
  getTopWinners(limit: number = 10, gameType?: string): ParticipantStats[] {
    const stats = Array.from(this.getAllStats().values());

    // 게임 타입별 필터링
    const filteredStats = gameType
      ? stats.filter((s) => s.gameStats[gameType] && s.gameStats[gameType].played > 0)
      : stats;

    // 정렬 (승률 -> 총 승리 수 -> 총 게임 수)
    filteredStats.sort((a, b) => {
      if (gameType) {
        const aWinRate = (a.gameStats[gameType].wins / a.gameStats[gameType].played) * 100;
        const bWinRate = (b.gameStats[gameType].wins / b.gameStats[gameType].played) * 100;
        if (aWinRate !== bWinRate) return bWinRate - aWinRate;
        return b.gameStats[gameType].wins - a.gameStats[gameType].wins;
      } else {
        if (a.winRate !== b.winRate) return b.winRate - a.winRate;
        if (a.wins !== b.wins) return b.wins - a.wins;
        return b.totalGames - a.totalGames;
      }
    });

    return filteredStats.slice(0, limit);
  }

  // 최근 활동 참가자 조회
  getRecentParticipants(limit: number = 20): ParticipantStats[] {
    const stats = Array.from(this.getAllStats().values());

    stats.sort((a, b) => b.lastPlayed - a.lastPlayed);

    return stats.slice(0, limit);
  }

  // 게임별 통계 조회
  getGameTypeStats(gameType: string): Array<ParticipantStats & { gameSpecificStats: any }> {
    const stats = Array.from(this.getAllStats().values());

    return stats
      .filter((s) => s.gameStats[gameType] && s.gameStats[gameType].played > 0)
      .map((s) => ({
        ...s,
        gameSpecificStats: s.gameStats[gameType],
      }))
      .sort((a, b) => b.gameSpecificStats.wins - a.gameSpecificStats.wins);
  }

  // 참가자 삭제
  deleteParticipant(participantId: string): boolean {
    const stats = this.getAllStats();
    const deleted = stats.delete(participantId);

    if (deleted) {
      this.saveAllStats(stats);
    }

    return deleted;
  }

  // 모든 통계 초기화
  clearAllStats(): void {
    this.clearData();
  }

  // 오래된 참가자 정리 (최근 90일 이내 활동이 없는 경우)
  private cleanupOldParticipants(stats: Map<string, ParticipantStats>): void {
    if (stats.size <= MAX_PARTICIPANTS) return;

    const cutoffDate = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90일
    const statsArray = Array.from(stats.entries());

    // 최근 활동 순으로 정렬
    statsArray.sort((a, b) => b[1].lastPlayed - a[1].lastPlayed);

    // 오래된 참가자 제거
    for (let i = MAX_PARTICIPANTS; i < statsArray.length; i++) {
      if (statsArray[i][1].lastPlayed < cutoffDate) {
        stats.delete(statsArray[i][0]);
      }
    }
  }

  // 스토리지 용량 초과 처리
  protected handleQuotaExceeded(): void {
    const stats = this.getAllStats();
    const statsArray = Array.from(stats.entries());

    // 최근 활동 순으로 정렬 후 하위 20% 제거
    statsArray.sort((a, b) => b[1].lastPlayed - a[1].lastPlayed);
    const keepCount = Math.floor(statsArray.length * 0.8);

    const newStats = new Map(statsArray.slice(0, keepCount));
    this.saveAllStats(newStats);
  }

  // 데이터 유효성 검증
  protected validateData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    return Object.values(data).every(
      (stat: any) =>
        stat.participantId &&
        stat.name &&
        typeof stat.totalGames === 'number' &&
        typeof stat.wins === 'number' &&
        stat.gameStats,
    );
  }

  // 통계 요약 정보
  getStatsSummary() {
    const stats = this.getAllStats();
    let totalGamesPlayed = 0;
    let totalWins = 0;
    const gameTypes = new Set<string>();

    stats.forEach((stat) => {
      totalGamesPlayed += stat.totalGames;
      totalWins += stat.wins;
      Object.keys(stat.gameStats).forEach((gameType) => gameTypes.add(gameType));
    });

    return {
      totalParticipants: stats.size,
      totalGamesPlayed,
      totalWins,
      averageWinRate: stats.size > 0 ? (totalWins / totalGamesPlayed) * 100 : 0,
      uniqueGameTypes: gameTypes.size,
    };
  }
}
