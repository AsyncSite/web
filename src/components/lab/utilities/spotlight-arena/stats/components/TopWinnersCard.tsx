import React from 'react';
import { ParticipantStats } from '../../shared/types/storage';
import './StatsComponents.css';

interface TopWinnersCardProps {
  winners: ParticipantStats[];
  onSelectParticipant: (participantId: string) => void;
  gameType?: string;
}

const TopWinnersCard: React.FC<TopWinnersCardProps> = ({
  winners,
  onSelectParticipant,
  gameType,
}) => {
  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}위`;
    }
  };

  const getWinRate = (stats: ParticipantStats) => {
    if (gameType && stats.gameStats[gameType]) {
      const gameStats = stats.gameStats[gameType];
      return gameStats.played > 0 ? ((gameStats.wins / gameStats.played) * 100).toFixed(1) : '0.0';
    }
    return stats.winRate.toFixed(1);
  };

  const getWins = (stats: ParticipantStats) => {
    if (gameType && stats.gameStats[gameType]) {
      return stats.gameStats[gameType].wins;
    }
    return stats.wins;
  };

  const getGames = (stats: ParticipantStats) => {
    if (gameType && stats.gameStats[gameType]) {
      return stats.gameStats[gameType].played;
    }
    return stats.totalGames;
  };

  return (
    <div className="stats-card top-winners-card">
      <h3>🏆 상위 당첨자</h3>

      {winners.length === 0 ? (
        <div className="empty-state">아직 기록이 없습니다.</div>
      ) : (
        <div className="winners-list">
          {winners.map((winner, index) => (
            <div
              key={winner.participantId}
              className="winner-item"
              onClick={() => onSelectParticipant(winner.participantId)}
            >
              <div className="winner-rank">{getRankEmoji(index)}</div>
              <div className="winner-info">
                <div className="winner-name">{winner.name}</div>
                <div className="winner-stats">
                  <span className="win-rate">{getWinRate(winner)}%</span>
                  <span className="win-count">
                    {getWins(winner)}승 / {getGames(winner)}게임
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopWinnersCard;
