import React from 'react';

interface TurnIndicatorProps {
  currentPlayer: string;
  turnNumber: number;
  maxTurns?: number;
  timeRemaining: number;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ 
  currentPlayer, 
  turnNumber, 
  maxTurns, 
  timeRemaining 
}) => {
  return (
    <div className="turn-indicator">
      <div className="current-turn">
        <h2>{currentPlayer}의 턴</h2>
        <p>턴 {turnNumber}{maxTurns && `/${maxTurns}`}</p>
      </div>
      <div className="timer">
        <span className="time">{timeRemaining}초</span>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${(timeRemaining / 30) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TurnIndicator;