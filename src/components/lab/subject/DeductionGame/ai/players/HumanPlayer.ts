import { BasePlayer } from './BasePlayer';
import { PlayerInfo } from '../types/PlayerTypes';
import { GameStateForAI } from '../types/GameTypes';

export class HumanPlayer extends BasePlayer {
  private resolveGuess?: (indices: number[]) => void;
  
  constructor(playerInfo: PlayerInfo) {
    super(playerInfo);
    this.ready = true;
  }

  async makeGuess(gameState: GameStateForAI): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.resolveGuess = resolve;
    });
  }

  submitGuess(indices: number[]): void {
    if (this.resolveGuess) {
      this.resolveGuess(indices);
      this.resolveGuess = undefined;
    }
  }

  isWaitingForInput(): boolean {
    return this.resolveGuess !== undefined;
  }

  reset(): void {
    super.reset();
    this.resolveGuess = undefined;
    this.ready = true;
  }
}