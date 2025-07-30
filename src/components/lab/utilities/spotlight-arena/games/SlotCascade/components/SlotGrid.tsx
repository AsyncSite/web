import React, { useRef } from 'react';
import { SymbolType, SYMBOLS } from '../types/symbol';
import { ScoreUpdate } from '../types/game';
import { CascadeEffects } from './CascadeEffects';
import { SpecialEffects } from './SpecialEffects';
import { ComboDisplay } from './ComboDisplay';
import { ScorePopupManager } from './ScorePopupManager';
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
  specialEffects?: Array<{
    type: SymbolType;
    position: { row: number; col: number };
    affectedPositions: Array<{ row: number; col: number }>;
  }>;
  scoreUpdates?: ScoreUpdate[];
  remainingSpins?: number;
  underdogBoost?: number;
  consecutiveFailures?: number;
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
  specialEffects = [],
  scoreUpdates = [],
  remainingSpins = 0,
  underdogBoost = 1.0,
  consecutiveFailures = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div ref={containerRef} className={`slot-grid-container ${isPlayer ? 'player-grid' : ''}`}>
      <div className="slot-grid-header">
        <div className="player-name">{playerName}</div>
        <div className="player-stats">
          <div className="player-score">{score.toLocaleString()}점</div>
          <div className="remaining-spins">남은 스핀: {remainingSpins}회</div>
        </div>
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
        
        {/* 특수 심볼 효과 */}
        {specialEffects.length > 0 && (
          <SpecialEffects 
            effects={specialEffects}
            gridSize={grid.length}
          />
        )}
        
        {/* 콤보 표시 */}
        <ComboDisplay 
          cascadeLevel={cascadeLevel}
          isActive={cascadeLevel > 0 && !!animationState}
        />
      </div>
      
      {/* 점수 팝업 매니저 */}
      <ScorePopupManager 
        scoreUpdates={scoreUpdates}
        containerRef={containerRef}
      />
      
      {cascadeLevel > 0 && (
        <div className="cascade-indicator">
          캐스케이드 x{cascadeLevel}
        </div>
      )}
      
      {/* 언더독 부스트 표시 */}
      {underdogBoost > 1.1 && (
        <div className="underdog-boost-indicator">
          <span className="boost-icon">🔥</span>
          <span className="boost-text">부스트 x{underdogBoost.toFixed(1)}</span>
          {consecutiveFailures >= 3 && (
            <span className="failure-streak">연속 실패 {consecutiveFailures}회</span>
          )}
        </div>
      )}
      
      {isPlayer && onSpin && (
        <button 
          className="spin-button"
          onClick={onSpin}
          disabled={isSpinning || remainingSpins <= 0}
        >
          {isSpinning ? '회전 중...' : remainingSpins <= 0 ? '스핀 소진' : '🎰 스핀!'}
        </button>
      )}
    </div>
  );
};