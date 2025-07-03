import { PlayerInfo, PlayerMove } from '../types/PlayerTypes';
import { GameStateForAI } from '../types/GameTypes';

export interface IPlayer {
  getInfo(): PlayerInfo;
  
  makeGuess(gameState: GameStateForAI): Promise<number[]>;
  
  isReady(): boolean;
  
  onTurnStart?(): void;
  
  onTurnEnd?(move: PlayerMove): void;
  
  reset(): void;
}

export abstract class BasePlayer implements IPlayer {
  protected playerInfo: PlayerInfo;
  protected ready: boolean = false;

  constructor(playerInfo: PlayerInfo) {
    this.playerInfo = playerInfo;
  }

  getInfo(): PlayerInfo {
    return this.playerInfo;
  }

  isReady(): boolean {
    return this.ready;
  }

  abstract makeGuess(gameState: GameStateForAI): Promise<number[]>;

  onTurnStart(): void {
    // Override in subclasses if needed
  }

  onTurnEnd(move: PlayerMove): void {
    // Override in subclasses if needed
  }

  reset(): void {
    this.ready = false;
  }
}