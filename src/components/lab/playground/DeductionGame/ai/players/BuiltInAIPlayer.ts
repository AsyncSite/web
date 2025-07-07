import { BasePlayer } from './BasePlayer';
import { PlayerInfo } from '../types/PlayerTypes';
import { GameStateForAI } from '../types/GameTypes';
import { AIStrategy } from '../strategies/AIStrategy';

export class BuiltInAIPlayer extends BasePlayer {
  private strategy: AIStrategy;
  private thinkingTime: number = 2000; // 2 seconds by default

  constructor(playerInfo: PlayerInfo, strategy: AIStrategy) {
    super(playerInfo);
    this.strategy = strategy;
    this.ready = true;
  }

  async makeGuess(gameState: GameStateForAI): Promise<number[]> {
    const startTime = Date.now();

    const selectedIndices = this.strategy.selectKeywords(gameState);

    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, this.thinkingTime - elapsedTime);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return selectedIndices;
  }

  setThinkingTime(milliseconds: number): void {
    this.thinkingTime = Math.max(500, milliseconds);
  }

  getStrategy(): AIStrategy {
    return this.strategy;
  }

  setStrategy(strategy: AIStrategy): void {
    this.strategy = strategy;
  }
}
