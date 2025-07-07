import React from 'react';
import { GlobalStats } from '../../shared/types/storage';
import './StatsComponents.css';

interface GlobalStatsCardProps {
  stats: GlobalStats;
  periodStats: {
    gamesPlayed: number;
    uniqueParticipants: Set<string>;
    popularGames: { [key: string]: number };
  };
  avgDuration: number;
}

const GlobalStatsCard: React.FC<GlobalStatsCardProps> = ({ stats, periodStats, avgDuration }) => {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}분 ${seconds}초`;
  };

  return (
    <div className="stats-card global-stats-card">
      <h3>🌍 전체 통계</h3>

      <div className="stats-grid-internal">
        <div className="stat-item">
          <div className="stat-value">{stats.totalGamesPlayed.toLocaleString()}</div>
          <div className="stat-label">총 게임 수</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">{stats.totalParticipants.toLocaleString()}</div>
          <div className="stat-label">총 참가자 수</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">{periodStats.gamesPlayed}</div>
          <div className="stat-label">기간 내 게임</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">{periodStats.uniqueParticipants.size}</div>
          <div className="stat-label">활성 참가자</div>
        </div>
      </div>

      <div className="additional-stats">
        <div className="stat-row">
          <span className="stat-label">평균 게임 시간:</span>
          <span className="stat-value-inline">{formatDuration(avgDuration)}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">가장 인기 있는 게임:</span>
          <span className="stat-value-inline">{getGameTypeName(stats.mostPlayedGame)}</span>
        </div>
      </div>
    </div>
  );
};

const getGameTypeName = (gameType: string) => {
  switch (gameType) {
    case 'snail-race':
      return '🐌 달팽이 레이스';
    case 'slot-machine':
      return '🎰 슬롯머신';
    case 'dart-wheel':
      return '🎯 다트 휠';
    default:
      return gameType;
  }
};

export default GlobalStatsCard;
