import React, { useEffect, useState } from 'react';
import { SymbolType } from '../types/symbol';
import './SpecialEffects.css';

interface SpecialEffect {
  type: SymbolType;
  position: { row: number; col: number };
  affectedPositions: Array<{ row: number; col: number }>;
}

interface SpecialEffectsProps {
  effects: SpecialEffect[];
  gridSize: number;
  onComplete?: () => void;
}

export const SpecialEffects: React.FC<SpecialEffectsProps> = ({ 
  effects, 
  gridSize, 
  onComplete 
}) => {
  const [activeEffects, setActiveEffects] = useState<SpecialEffect[]>([]);

  useEffect(() => {
    if (effects.length === 0) return;

    setActiveEffects(effects);

    // 애니메이션 완료 후 콜백
    const timer = setTimeout(() => {
      setActiveEffects([]);
      if (onComplete) onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [effects, onComplete]);

  const getCellPosition = (row: number, col: number) => {
    const cellSize = 100 / gridSize;
    return {
      top: `${row * cellSize + cellSize / 2}%`,
      left: `${col * cellSize + cellSize / 2}%`,
    };
  };

  return (
    <div className="special-effects-container">
      {activeEffects.map((effect, index) => {
        const position = getCellPosition(effect.position.row, effect.position.col);

        if (effect.type === 'bomb') {
          return (
            <div
              key={`bomb-${index}`}
              className="bomb-effect"
              style={position}
            >
              {/* 폭발 중심 */}
              <div className="explosion-center" />
              
              {/* 폭발 파동 */}
              {[1, 2, 3].map(wave => (
                <div
                  key={wave}
                  className="explosion-wave"
                  style={{
                    animationDelay: `${wave * 0.1}s`,
                  }}
                />
              ))}
              
              {/* 파편 효과 */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="explosion-fragment"
                  style={{
                    transform: `rotate(${i * 45}deg)`,
                  }}
                />
              ))}
            </div>
          );
        }

        if (effect.type === 'star') {
          return (
            <div
              key={`star-${index}`}
              className="star-effect"
              style={position}
            >
              {/* 십자 빔 */}
              <div className="star-beam horizontal" />
              <div className="star-beam vertical" />
              
              {/* 중심 플래시 */}
              <div className="star-flash" />
              
              {/* 반짝임 효과 */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="star-sparkle"
                  style={{
                    transform: `rotate(${i * 90 + 45}deg)`,
                  }}
                />
              ))}
            </div>
          );
        }

        if (effect.type === 'bonus') {
          return (
            <div
              key={`bonus-${index}`}
              className="bonus-effect"
              style={position}
            >
              {/* 선물 상자 열리는 효과 */}
              <div className="gift-box">
                <div className="gift-lid" />
                <div className="gift-box-body" />
              </div>
              
              {/* 보너스 점수 표시 */}
              <div className="bonus-score">
                +{Math.floor(Math.random() * 451) + 50}
              </div>
              
              {/* 색종이 효과 */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    '--confetti-color': ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd700', '#ff6348', '#98d8c8'][i],
                    '--confetti-delay': `${i * 0.1}s`,
                    '--confetti-x': `${(Math.random() - 0.5) * 100}px`,
                    '--confetti-y': `${Math.random() * -100}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};