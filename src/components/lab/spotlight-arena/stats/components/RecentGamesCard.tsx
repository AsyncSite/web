import React, { useEffect, useState } from 'react';
import { gameHistoryService } from '../../shared/services';
import { GameHistory } from '../../shared/types/storage';
import './StatsComponents.css';

interface RecentGamesCardProps {
  limit: number;
  onViewAll: () => void;
}

const RecentGamesCard: React.FC<RecentGamesCardProps> = ({ limit, onViewAll }) => {
  const [recentGames, setRecentGames] = useState<GameHistory[]>([]);

  useEffect(() => {
    const games = gameHistoryService.getRecentGames(limit);
    setRecentGames(games);
  }, [limit]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  const getGameTypeEmoji = (gameType: string) => {
    switch (gameType) {
      case 'snail-race': return '🐌';
      case 'slot-machine': return '🎰';
      case 'dart-wheel': return '🎯';
      default: return '🎮';
    }
  };

  return (
    <div className="stats-card recent-games-card">
      <h3>🕒 최근 게임</h3>
      
      {recentGames.length === 0 ? (
        <div className="empty-state">
          아직 게임 기록이 없습니다.
        </div>
      ) : (
        <>
          <div className="recent-games-list">
            {recentGames.map(game => (
              <div key={game.id} className="recent-game-item">
                <div className="game-icon">
                  {getGameTypeEmoji(game.gameType)}
                </div>
                <div className="game-details">
                  <div className="game-winners">
                    🏆 {game.winners.map(w => w.name).join(', ')}
                  </div>
                  <div className="game-meta">
                    {game.participants.length}명 참가 • {formatTime(game.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="view-all-button" onClick={onViewAll}>
            전체 기록 보기 →
          </button>
        </>
      )}
    </div>
  );
};

export default RecentGamesCard;