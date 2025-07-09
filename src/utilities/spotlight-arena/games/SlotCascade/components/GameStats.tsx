import React from 'react';
import './GameStats.css';

interface GameStatsProps {
  totalSpins: number;
  totalCascades: number;
  highestCombo: number;
  specialSymbolsTriggered: {
    bomb: number;
    star: number;
    bonus: number;
  };
}

export const GameStats: React.FC<GameStatsProps> = ({
  totalSpins,
  totalCascades,
  highestCombo,
  specialSymbolsTriggered,
}) => {
  return (
    <div className="game-stats">
      <h4 className="stats-title">전체 게임 통계</h4>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">총 스핀</div>
          <div className="stat-value">{totalSpins}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">총 캐스케이드</div>
          <div className="stat-value">{totalCascades}</div>
        </div>
        
        <div className="stat-item highlight">
          <div className="stat-label">최고 콤보</div>
          <div className="stat-value">x{highestCombo}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">평균 캐스케이드</div>
          <div className="stat-value">
            {totalSpins > 0 ? (totalCascades / totalSpins).toFixed(1) : '0'}
          </div>
        </div>
      </div>
      
      <div className="special-symbols-stats">
        <h5>특수 심볼 발동</h5>
        <div className="symbol-stats">
          <div className="symbol-stat">
            <span className="symbol-icon">💣</span>
            <span className="symbol-count">{specialSymbolsTriggered.bomb}</span>
          </div>
          <div className="symbol-stat">
            <span className="symbol-icon">🌟</span>
            <span className="symbol-count">{specialSymbolsTriggered.star}</span>
          </div>
          <div className="symbol-stat">
            <span className="symbol-icon">🎁</span>
            <span className="symbol-count">{specialSymbolsTriggered.bonus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};