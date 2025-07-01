import React from 'react';
import './DeductionGame.css';

const DeductionGame: React.FC = () => {
  return (
    <div className="deduction-game">
      <div className="game-header">
        <h1>Exclusive Deduction Game</h1>
        <p>추론 게임에서 정답을 찾아보세요!</p>
      </div>
      
      <div className="game-content">
        <div className="coming-soon">
          <h2>게임 준비 중...</h2>
          <p>곧 만나볼 수 있습니다!</p>
        </div>
      </div>
    </div>
  );
};

export default DeductionGame;