import { GameStateForAI } from '../types/GameTypes';

export interface AIStrategy {
  selectKeywords(gameState: GameStateForAI): number[];

  getStrategyName(): string;

  getDescription(): string;
}
