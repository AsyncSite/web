import { IPlayer } from './players/BasePlayer';
import { HumanPlayer } from './players/HumanPlayer';
import { BuiltInAIPlayer } from './players/BuiltInAIPlayer';
import { CustomAIPlayer } from './players/CustomAIPlayer';
import { PlayerInfo, PlayerType } from './types/PlayerTypes';
import { AIStrategy } from './strategies/AIStrategy';
import { EasyStrategy } from './strategies/EasyStrategy';
import { MediumStrategy } from './strategies/MediumStrategy';
import { HardStrategy } from './strategies/HardStrategy';

export class PlayerFactory {
  private static strategyCache: Map<string, AIStrategy> = new Map();

  static createPlayer(playerInfo: PlayerInfo): IPlayer {
    switch (playerInfo.type) {
      case 'human':
        return new HumanPlayer(playerInfo);
        
      case 'built-in-ai':
        const strategy = this.getStrategy(playerInfo.aiDifficulty || 'medium');
        return new BuiltInAIPlayer(playerInfo, strategy);
        
      case 'custom-ai':
        return new CustomAIPlayer(playerInfo);
        
      default:
        throw new Error(`Unknown player type: ${playerInfo.type}`);
    }
  }

  private static getStrategy(difficulty: 'easy' | 'medium' | 'hard'): AIStrategy {
    if (!this.strategyCache.has(difficulty)) {
      let strategy: AIStrategy;
      
      switch (difficulty) {
        case 'easy':
          strategy = new EasyStrategy();
          break;
        case 'medium':
          strategy = new MediumStrategy();
          break;
        case 'hard':
          strategy = new HardStrategy();
          break;
        default:
          strategy = new MediumStrategy();
      }
      
      this.strategyCache.set(difficulty, strategy);
    }
    
    return this.strategyCache.get(difficulty)!;
  }

  static createBuiltInAIOpponent(
    id: number, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): IPlayer {
    const playerInfo: PlayerInfo = {
      id,
      nickname: `AI (${difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'})`,
      type: 'built-in-ai',
      aiDifficulty: difficulty
    };
    
    return this.createPlayer(playerInfo);
  }

  static isHumanPlayer(player: IPlayer): player is HumanPlayer {
    return player instanceof HumanPlayer;
  }

  static isBuiltInAIPlayer(player: IPlayer): player is BuiltInAIPlayer {
    return player instanceof BuiltInAIPlayer;
  }

  static isCustomAIPlayer(player: IPlayer): player is CustomAIPlayer {
    return player instanceof CustomAIPlayer;
  }
}