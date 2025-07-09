import React from 'react';
import { SymbolType, SYMBOLS } from '../types/symbol';
import { CascadeEffects } from './CascadeEffects';
import './SlotGrid.css';

interface SlotGridProps {
  grid: (SymbolType | null)[][];
  playerName: string;
  score: number;
  cascadeLevel: number;
  isSpinning: boolean;
  onSpin?: () => void;
  isPlayer?: boolean;
  animationState?: {
    removingPositions: { row: number; col: number }[];
    fallingPositions: { row: number; col: number; distance: number }[];
    newPositions: { row: number; col: number }[];
  };
}

export const SlotGrid: React.FC<SlotGridProps> = ({
  grid,
  playerName,
  score,
  cascadeLevel,
  isSpinning,
  onSpin,
  isPlayer = false,
  animationState,
}) => {
  const getCellAnimationClass = (row: number, col: number): string => {
    if (!animationState) return '';
    
    // 제거 중인 셀
    if (animationState.removingPositions.some(pos => pos.row === row && pos.col === col)) {
      return 'removing';
    }
    
    // 떨어지는 셀
    const fallingPos = animationState.fallingPositions.find(pos => pos.row === row && pos.col === col);
    if (fallingPos) {
      return 'falling';
    }
    
    // 새로 생성된 셀
    if (animationState.newPositions.some(pos => pos.row === row && pos.col === col)) {
      return 'new-symbol';
    }
    
    return '';
  };
  
  const getCellStyle = (row: number, col: number): React.CSSProperties => {
    const fallingPos = animationState?.fallingPositions.find(pos => pos.row === row && pos.col === col);
    if (fallingPos) {
      return {
        '--fall-distance': `${fallingPos.distance * 100}%`,
        '--fall-duration': `${0.3 + fallingPos.distance * 0.1}s`,
      } as React.CSSProperties;
    }
    return {};
  };
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
                className={`slot-cell ${symbol ? 'filled' : 'empty'} ${getCellAnimationClass(rowIndex, colIndex)}`}
                style={getCellStyle(rowIndex, colIndex)}
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
        
        {/* 캐스케이드 효과 */}
        <CascadeEffects 
          cascadeLevel={cascadeLevel} 
          isActive={cascadeLevel > 0 && !!animationState}
        />
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