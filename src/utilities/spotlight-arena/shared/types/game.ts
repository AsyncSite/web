import { Participant } from './index';

export interface BaseGameProps {
  participants: Participant[];
  winnerCount: number;
  onBack: () => void;
  onReplay: () => void;
  onNewGame: () => void;
}

export interface GameConfig {
  winnerCount: number;
  trackLength?: number;
  gameDuration?: number;
  customSettings?: Record<string, unknown>;
}

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  tags: string[];
}

export interface GameEngine<TGameState> {
  initialize: (participants: Participant[], config: GameConfig) => TGameState;
  update: (state: TGameState, deltaTime: number) => TGameState;
  isComplete: (state: TGameState) => boolean;
  getWinners: (state: TGameState) => Participant[];
}
