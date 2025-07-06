import React from 'react';
import './StatsComponents.css';

interface GameTypeChartProps {
  gameTypeStats: { [key: string]: number };
}

const GameTypeChart: React.FC<GameTypeChartProps> = ({ gameTypeStats }) => {
  const total = Object.values(gameTypeStats).reduce((sum, count) => sum + count, 0);
  
  const gameTypes = Object.entries(gameTypeStats)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));

  const getGameTypeInfo = (type: string) => {
    switch (type) {
      case 'snail-race': 
        return { name: '달팽이 레이스', emoji: '🐌', color: '#10B981' };
      case 'slot-machine': 
        return { name: '슬롯머신', emoji: '🎰', color: '#F59E0B' };
      case 'dart-wheel': 
        return { name: '다트 휠', emoji: '🎯', color: '#EF4444' };
      default: 
        return { name: type, emoji: '🎮', color: '#6B7280' };
    }
  };

  return (
    <div className="stats-card game-type-chart full-width">
      <h3>📊 게임별 플레이 통계</h3>
      
      {gameTypes.length === 0 ? (
        <div className="empty-state">
          아직 플레이한 게임이 없습니다.
        </div>
      ) : (
        <div className="chart-container">
          {gameTypes.map(({ type, count, percentage }) => {
            const info = getGameTypeInfo(type);
            return (
              <div key={type} className="chart-item">
                <div className="chart-header">
                  <span className="game-emoji">{info.emoji}</span>
                  <span className="game-name">{info.name}</span>
                  <span className="game-count">{count}회</span>
                </div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: info.color
                    }}
                  />
                  <span className="chart-percentage">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameTypeChart;