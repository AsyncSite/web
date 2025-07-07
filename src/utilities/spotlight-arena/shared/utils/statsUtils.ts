import { GameHistory, ParticipantStats, GlobalStats } from '../types/storage';
import { gameHistoryService, participantStatsService } from '../services';

// 전체 통계 계산
export function calculateGlobalStats(): GlobalStats {
  const history = gameHistoryService.getHistory();
  const participantStats = participantStatsService.getStatsSummary();

  const gameTypeStats: { [key: string]: number } = {};

  history.forEach((game: GameHistory) => {
    gameTypeStats[game.gameType] = (gameTypeStats[game.gameType] || 0) + 1;
  });

  const mostPlayedGame = Object.entries(gameTypeStats).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return {
    totalGamesPlayed: history.length,
    gameTypeStats,
    mostPlayedGame,
    totalParticipants: participantStats.totalParticipants,
    lastUpdated: Date.now(),
  };
}

// 참가자의 연속 승리/패배 계산
export function calculateStreaks(participantId: string): {
  currentWinStreak: number;
  currentLoseStreak: number;
  maxWinStreak: number;
  maxLoseStreak: number;
} {
  const games = gameHistoryService.getParticipantGames(participantId);

  let currentWinStreak = 0;
  let currentLoseStreak = 0;
  let maxWinStreak = 0;
  let maxLoseStreak = 0;
  let tempWinStreak = 0;
  let tempLoseStreak = 0;

  // 최신 게임부터 확인 (games는 이미 최신순으로 정렬됨)
  games.forEach((game: GameHistory, index: number) => {
    const isWinner = game.winners.some((w: any) => w.id === participantId);

    if (isWinner) {
      tempWinStreak++;
      tempLoseStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, tempWinStreak);

      // 현재 연속 기록 업데이트 (가장 최근 게임들만)
      if (index === 0) {
        currentWinStreak = tempWinStreak;
      }
    } else {
      tempLoseStreak++;
      tempWinStreak = 0;
      maxLoseStreak = Math.max(maxLoseStreak, tempLoseStreak);

      if (index === 0) {
        currentLoseStreak = tempLoseStreak;
      }
    }
  });

  return {
    currentWinStreak,
    currentLoseStreak,
    maxWinStreak,
    maxLoseStreak,
  };
}

// 특정 기간 동안의 통계
export function getStatsForPeriod(days: number): {
  gamesPlayed: number;
  uniqueParticipants: Set<string>;
  popularGames: { [key: string]: number };
} {
  const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentGames = gameHistoryService.getFilteredGames({ startDate: cutoffDate });

  const uniqueParticipants = new Set<string>();
  const popularGames: { [key: string]: number } = {};

  recentGames.forEach((game: GameHistory) => {
    game.participants.forEach((p: any) => uniqueParticipants.add(p.id));
    popularGames[game.gameType] = (popularGames[game.gameType] || 0) + 1;
  });

  return {
    gamesPlayed: recentGames.length,
    uniqueParticipants,
    popularGames,
  };
}

// 참가자 간 대전 기록
export function getHeadToHeadStats(
  participantId1: string,
  participantId2: string,
): {
  totalGames: number;
  participant1Wins: number;
  participant2Wins: number;
  draws: number;
  gameBreakdown: { [gameType: string]: { p1Wins: number; p2Wins: number; draws: number } };
} {
  const games = gameHistoryService.getHistory();

  let totalGames = 0;
  let participant1Wins = 0;
  let participant2Wins = 0;
  let draws = 0;
  const gameBreakdown: { [gameType: string]: { p1Wins: number; p2Wins: number; draws: number } } =
    {};

  games.forEach((game: GameHistory) => {
    const hasP1 = game.participants.some((p: any) => p.id === participantId1);
    const hasP2 = game.participants.some((p: any) => p.id === participantId2);

    if (hasP1 && hasP2) {
      totalGames++;

      const p1Won = game.winners.some((w: any) => w.id === participantId1);
      const p2Won = game.winners.some((w: any) => w.id === participantId2);

      if (!gameBreakdown[game.gameType]) {
        gameBreakdown[game.gameType] = { p1Wins: 0, p2Wins: 0, draws: 0 };
      }

      if (p1Won && !p2Won) {
        participant1Wins++;
        gameBreakdown[game.gameType].p1Wins++;
      } else if (p2Won && !p1Won) {
        participant2Wins++;
        gameBreakdown[game.gameType].p2Wins++;
      } else if (p1Won && p2Won) {
        draws++;
        gameBreakdown[game.gameType].draws++;
      }
    }
  });

  return {
    totalGames,
    participant1Wins,
    participant2Wins,
    draws,
    gameBreakdown,
  };
}

// 시간대별 게임 통계
export function getGamesByTimeOfDay(): { [hour: number]: number } {
  const games = gameHistoryService.getHistory();
  const hourlyStats: { [hour: number]: number } = {};

  // 0-23시 초기화
  for (let i = 0; i < 24; i++) {
    hourlyStats[i] = 0;
  }

  games.forEach((game: GameHistory) => {
    const hour = new Date(game.timestamp).getHours();
    hourlyStats[hour]++;
  });

  return hourlyStats;
}

// 평균 게임 시간 계산
export function getAverageGameDuration(gameType?: string): number {
  const games = gameType
    ? gameHistoryService.getGamesByType(gameType)
    : gameHistoryService.getHistory();

  if (games.length === 0) return 0;

  const totalDuration = games.reduce((sum: number, game: GameHistory) => sum + game.duration, 0);
  return totalDuration / games.length;
}

// 참가자 순위 계산 (ELO 방식 간소화)
export function calculateParticipantRankings(gameType?: string): Array<{
  participant: ParticipantStats;
  score: number;
  rank: number;
}> {
  const allStats = participantStatsService.getRecentParticipants(100);

  const rankings = allStats
    .filter((stat: ParticipantStats) => {
      if (gameType) {
        return stat.gameStats[gameType] && stat.gameStats[gameType].played >= 3;
      }
      return stat.totalGames >= 3;
    })
    .map((stat: ParticipantStats) => {
      let score: number;

      if (gameType && stat.gameStats[gameType]) {
        const gameStats = stat.gameStats[gameType];
        // 승률 * 1000 + 승리 수 * 10 - 평균 순위 * 50
        score =
          (gameStats.wins / gameStats.played) * 1000 +
          gameStats.wins * 10 -
          (gameStats.avgRank || 0) * 50;
      } else {
        // 전체 게임 기준
        score = stat.winRate * 10 + stat.wins * 5 + Math.log(stat.totalGames + 1) * 20;
      }

      return { participant: stat, score };
    })
    .sort((a: any, b: any) => b.score - a.score)
    .map((item: any, index: number) => ({ ...item, rank: index + 1 }));

  return rankings;
}

// 참가자 추천 (자주 함께 플레이하는 참가자)
export function getFrequentCoPlayers(
  participantId: string,
  limit: number = 5,
): Array<{
  participant: ParticipantStats;
  gamesPlayedTogether: number;
  winRateWhenTogether: number;
}> {
  const games = gameHistoryService.getParticipantGames(participantId);
  const coPlayerStats = new Map<string, { games: number; wins: number }>();

  games.forEach((game: GameHistory) => {
    const isWinner = game.winners.some((w: any) => w.id === participantId);

    game.participants.forEach((p: any) => {
      if (p.id !== participantId) {
        if (!coPlayerStats.has(p.id)) {
          coPlayerStats.set(p.id, { games: 0, wins: 0 });
        }

        const stats = coPlayerStats.get(p.id)!;
        stats.games++;
        if (isWinner) stats.wins++;
      }
    });
  });

  const results: Array<{
    participant: ParticipantStats;
    gamesPlayedTogether: number;
    winRateWhenTogether: number;
  }> = [];

  coPlayerStats.forEach((stats, playerId) => {
    const participantStats = participantStatsService.getParticipantStats(playerId);
    if (participantStats) {
      results.push({
        participant: participantStats,
        gamesPlayedTogether: stats.games,
        winRateWhenTogether: (stats.wins / stats.games) * 100,
      });
    }
  });

  return results.sort((a, b) => b.gamesPlayedTogether - a.gamesPlayedTogether).slice(0, limit);
}
