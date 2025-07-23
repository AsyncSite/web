import React from 'react';
import TetrisGame from './TetrisGame';
import GameErrorBoundary from '../../../common/GameErrorBoundary';

const Tetris: React.FC = () => {
  return (
    <GameErrorBoundary gameName="테트리스">
      <TetrisGame />
    </GameErrorBoundary>
  );
};

export default Tetris;