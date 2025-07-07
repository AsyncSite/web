import { ReactNode } from 'react';
import ResultDisplay from '../../common/ResultDisplay';
import { BaseGameProps } from '../types/game';
import { GameStatus, Participant } from '../types';

export interface BaseGameState {
  status: GameStatus;
  winners: Participant[];
}

interface BaseGameComponentProps<TGameState extends BaseGameState> extends BaseGameProps {
  gameState: TGameState;
  gameName: string;
  children: ReactNode;
}

export function BaseGame<TGameState extends BaseGameState>({
  gameState,
  gameName,
  onBack,
  onReplay,
  onNewGame,
  children,
}: BaseGameComponentProps<TGameState>): ReactNode {
  if (gameState.status === 'finished') {
    return (
      <ResultDisplay
        winners={gameState.winners}
        gameName={gameName}
        onReplay={onReplay}
        onNewGame={onNewGame}
        onGoHome={onBack}
      />
    );
  }

  return <>{children}</>;
}
