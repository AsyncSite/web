import React, { useEffect, useState } from 'react';
import './ScorePopup.css';

interface ScorePopupProps {
  score: number;
  multiplier: number;
  position: { x: number; y: number };
  onComplete: () => void;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  score,
  multiplier,
  position,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="score-popup"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="score-value">+{score}</div>
      {multiplier > 1 && (
        <div className="score-multiplier">x{multiplier}</div>
      )}
    </div>
  );
};