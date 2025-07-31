import React from 'react';
import './MatchHighlight.css';

interface MatchHighlightProps {
  positions: { row: number; col: number }[];
  gridSize: number;
}

export const MatchHighlight: React.FC<MatchHighlightProps> = ({ positions, gridSize }) => {
  if (positions.length === 0) return null;

  // 매칭 패턴 타입 결정 (가로, 세로, 대각선)
  const getMatchType = (): string => {
    if (positions.every(pos => pos.row === positions[0].row)) {
      return 'horizontal';
    }
    if (positions.every(pos => pos.col === positions[0].col)) {
      return 'vertical';
    }
    return 'diagonal';
  };

  const matchType = getMatchType();

  // 매칭 라인의 위치 계산
  const getLineStyle = (): React.CSSProperties => {
    const cellSize = 100 / gridSize; // 퍼센트로 계산
    
    if (matchType === 'horizontal') {
      const row = positions[0].row;
      return {
        top: `${row * cellSize + cellSize / 2}%`,
        left: `${Math.min(...positions.map(p => p.col)) * cellSize}%`,
        width: `${(Math.max(...positions.map(p => p.col)) - Math.min(...positions.map(p => p.col)) + 1) * cellSize}%`,
        height: '4px',
      };
    }
    
    if (matchType === 'vertical') {
      const col = positions[0].col;
      return {
        top: `${Math.min(...positions.map(p => p.row)) * cellSize}%`,
        left: `${col * cellSize + cellSize / 2}%`,
        width: '4px',
        height: `${(Math.max(...positions.map(p => p.row)) - Math.min(...positions.map(p => p.row)) + 1) * cellSize}%`,
      };
    }
    
    // 대각선
    const minRow = Math.min(...positions.map(p => p.row));
    const maxRow = Math.max(...positions.map(p => p.row));
    const minCol = Math.min(...positions.map(p => p.col));
    const maxCol = Math.max(...positions.map(p => p.col));
    
    const isLeftToRight = positions[0].col < positions[positions.length - 1].col;
    
    return {
      top: `${minRow * cellSize}%`,
      left: `${minCol * cellSize}%`,
      width: `${(maxCol - minCol + 1) * cellSize}%`,
      height: `${(maxRow - minRow + 1) * cellSize}%`,
      transform: isLeftToRight ? 'none' : 'scaleX(-1)',
    };
  };

  return (
    <div className={`match-highlight ${matchType}`} style={getLineStyle()}>
      <div className="match-line" />
    </div>
  );
};