import React, { useState, useEffect } from 'react';
import { ScorePopup } from './ScorePopup';
import './ScorePopupManager.css';

interface ScoreUpdate {
  id: number;
  score: number;
  multiplier: number;
  position: { x: number; y: number };
  timestamp: number;
}

interface ScorePopupManagerProps {
  scoreUpdates: Array<{
    score: number;
    multiplier: number;
    cascadeLevel: number;
  }>;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const ScorePopupManager: React.FC<ScorePopupManagerProps> = ({
  scoreUpdates,
  containerRef,
}) => {
  const [popups, setPopups] = useState<ScoreUpdate[]>([]);

  useEffect(() => {
    if (scoreUpdates.length === 0) return;

    const latestUpdate = scoreUpdates[scoreUpdates.length - 1];
    if (!latestUpdate || latestUpdate.score === 0) return;

    // 컨테이너 위치 계산
    const rect = containerRef?.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    // 랜덤 오프셋 추가 (겹치지 않도록)
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 50 - 50; // 위쪽으로 치우치게

    const newPopup: ScoreUpdate = {
      id: Date.now() + Math.random(),
      score: latestUpdate.score,
      multiplier: latestUpdate.multiplier,
      position: {
        x: centerX + offsetX,
        y: centerY + offsetY,
      },
      timestamp: Date.now(),
    };

    setPopups(prev => [...prev, newPopup]);
  }, [scoreUpdates, containerRef]);

  const handlePopupComplete = (id: number) => {
    setPopups(prev => prev.filter(popup => popup.id !== id));
  };

  return (
    <div className="score-popup-manager">
      {popups.map(popup => (
        <ScorePopup
          key={popup.id}
          score={popup.score}
          multiplier={popup.multiplier}
          position={popup.position}
          onComplete={() => handlePopupComplete(popup.id)}
        />
      ))}
    </div>
  );
};