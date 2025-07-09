import React from 'react';
import { SymbolType, SYMBOLS } from '../types/symbol';
import './SlotGrid.css';

interface SlotGridProps {
  grid: (SymbolType | null)[][];
  playerName: string;
  score: number;
  cascadeLevel: number;
  isSpinning: boolean;
  onSpin?: () => void;
  isPlayer?: boolean;
}

export const SlotGrid: React.FC<SlotGridProps> = ({
  grid,
  playerName,
  score,
  cascadeLevel,
  isSpinning,
  onSpin,
  isPlayer = false,
}) => {
  return (
    <div className={`slot-grid-container ${isPlayer ? 'player-grid' : ''}`}>
      <div className="slot-grid-header">
        <div className="player-name">{playerName} {isPlayer && '(나)'}</div>
        <div className="player-score">{score.toLocaleString()}점</div>
      </div>
      
      <div className={`slot-grid ${isSpinning ? 'spinning' : ''}`}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="slot-row">
            {row.map((symbol, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`slot-cell ${symbol ? 'filled' : 'empty'}`}
              >
                {symbol && (
                  <div className="symbol-wrapper">
                    <span className="symbol-icon">
                      {SYMBOLS[symbol].icon}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {cascadeLevel > 0 && (
        <div className="cascade-indicator">
          캐스케이드 x{cascadeLevel}
        </div>
      )}
      
      {isPlayer && onSpin && (
        <button 
          className="spin-button"
          onClick={onSpin}
          disabled={isSpinning}
        >
          {isSpinning ? '회전 중...' : '🎰 스핀!'}
        </button>
      )}
    </div>
  );
};