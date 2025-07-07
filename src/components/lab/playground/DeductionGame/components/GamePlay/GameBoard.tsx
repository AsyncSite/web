import React from 'react';

interface GameBoardProps {
  keywordPool: string[];
  currentGuess: number[];
  onGuessChange: (guess: number[]) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ keywordPool, currentGuess, onGuessChange }) => {
  return (
    <div className="game-board">
      <h3>키워드 선택</h3>
      <div className="keyword-grid">
        {keywordPool.map((keyword, index) => (
          <button
            key={index}
            className={`keyword-button ${currentGuess.includes(index) ? 'selected' : ''}`}
            onClick={() => {
              const newGuess = currentGuess.includes(index)
                ? currentGuess.filter((i) => i !== index)
                : [...currentGuess, index];
              onGuessChange(newGuess);
            }}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
