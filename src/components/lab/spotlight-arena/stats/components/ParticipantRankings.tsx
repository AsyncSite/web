import React from 'react';
import { ParticipantStats } from '../../shared/types/storage';
import './StatsComponents.css';

interface ParticipantRankingsProps {
  rankings: Array<{
    participant: ParticipantStats;
    score: number;
    rank: number;
  }>;
  onSelectParticipant: (participantId: string) => void;
  gameType?: string;
}

const ParticipantRankings: React.FC<ParticipantRankingsProps> = ({ 
  rankings, 
  onSelectParticipant,
  gameType 
}) => {
  const topRankings = rankings.slice(0, 10);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 5) return '🏅';
    return '🎖️';
  };

  const getScoreDisplay = (item: typeof rankings[0]) => {
    if (gameType && item.participant.gameStats[gameType]) {
      const stats = item.participant.gameStats[gameType];
      return {
        primary: `${((stats.wins / stats.played) * 100).toFixed(1)}%`,
        secondary: `${stats.wins}승 / ${stats.played}게임`,
        tertiary: stats.avgRank ? `평균 ${stats.avgRank.toFixed(1)}위` : null
      };
    }
    return {
      primary: `${item.participant.winRate.toFixed(1)}%`,
      secondary: `${item.participant.wins}승 / ${item.participant.totalGames}게임`,
      tertiary: null
    };
  };

  return (
    <div className="stats-card participant-rankings-card">
      <h3>🏅 참가자 랭킹</h3>
      <p className="rankings-subtitle">
        {gameType ? '게임별 성적 기준' : '전체 성적 기준'}
      </p>
      
      {topRankings.length === 0 ? (
        <div className="empty-state">
          3게임 이상 참가한 플레이어가 없습니다.
        </div>
      ) : (
        <div className="rankings-list">
          {topRankings.map(item => {
            const scoreDisplay = getScoreDisplay(item);
            return (
              <div 
                key={item.participant.participantId}
                className="ranking-item"
                onClick={() => onSelectParticipant(item.participant.participantId)}
              >
                <div className="rank-badge">
                  <span className="rank-emoji">{getRankBadge(item.rank)}</span>
                  <span className="rank-number">{item.rank}</span>
                </div>
                
                <div className="participant-info">
                  <div className="participant-name">
                    {item.participant.name}
                  </div>
                  <div className="participant-stats">
                    <span className="stat-primary">{scoreDisplay.primary}</span>
                    <span className="stat-secondary">{scoreDisplay.secondary}</span>
                    {scoreDisplay.tertiary && (
                      <span className="stat-tertiary">{scoreDisplay.tertiary}</span>
                    )}
                  </div>
                </div>
                
                <div className="ranking-score">
                  {Math.round(item.score)}점
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParticipantRankings;