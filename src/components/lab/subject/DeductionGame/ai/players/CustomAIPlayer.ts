import { BasePlayer } from './BasePlayer';
import { PlayerInfo } from '../types/PlayerTypes';
import { GameStateForAI } from '../types/GameTypes';

export class CustomAIPlayer extends BasePlayer {
  private aiCode: string;
  private aiLanguage: 'javascript' | 'typescript';
  private executeTimeout: number = 5000; // 5 seconds max execution time
  
  constructor(playerInfo: PlayerInfo) {
    super(playerInfo);
    this.aiCode = playerInfo.customCode || '';
    this.aiLanguage = playerInfo.customLanguage || 'javascript';
    this.ready = this.validateCode();
  }

  async makeGuess(gameState: GameStateForAI): Promise<number[]> {
    try {
      const result = await this.executeAICode(gameState);
      
      if (!Array.isArray(result)) {
        throw new Error('AI function must return an array of indices');
      }
      
      const validIndices = result.filter(idx => 
        typeof idx === 'number' && 
        idx >= 0 && 
        idx < gameState.keywords.length &&
        !gameState.revealedWrongAnswers.includes(idx)
      );
      
      if (validIndices.length > gameState.answerCount) {
        return validIndices.slice(0, gameState.answerCount);
      }
      
      while (validIndices.length < gameState.answerCount) {
        const availableIndices = Array.from(
          { length: gameState.keywords.length }, 
          (_, i) => i
        ).filter(idx => 
          !validIndices.includes(idx) && 
          !gameState.revealedWrongAnswers.includes(idx)
        );
        
        if (availableIndices.length === 0) break;
        
        const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        validIndices.push(randomIdx);
      }
      
      return validIndices;
    } catch (error) {
      console.error('Custom AI execution error:', error);
      return this.fallbackStrategy(gameState);
    }
  }

  private async executeAICode(gameState: GameStateForAI): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('AI code execution timeout'));
      }, this.executeTimeout);

      try {
        const func = new Function('gameState', `
          ${this.aiCode}
          
          if (typeof makeGuess === 'function') {
            return makeGuess(gameState);
          } else {
            throw new Error('makeGuess function not found');
          }
        `);
        
        const result = func(gameState);
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private fallbackStrategy(gameState: GameStateForAI): number[] {
    const availableIndices = Array.from(
      { length: gameState.keywords.length }, 
      (_, i) => i
    ).filter(idx => !gameState.revealedWrongAnswers.includes(idx));
    
    const selectedIndices = [...gameState.revealedAnswers];
    
    while (selectedIndices.length < gameState.answerCount && availableIndices.length > 0) {
      const remaining = availableIndices.filter(idx => !selectedIndices.includes(idx));
      if (remaining.length === 0) break;
      
      const randomIdx = remaining[Math.floor(Math.random() * remaining.length)];
      selectedIndices.push(randomIdx);
    }
    
    return selectedIndices;
  }

  private validateCode(): boolean {
    if (!this.aiCode.trim()) return false;
    
    try {
      new Function('gameState', this.aiCode + '\n return typeof makeGuess === "function";');
      return true;
    } catch (error) {
      console.error('AI code validation error:', error);
      return false;
    }
  }

  updateCode(code: string, language: 'javascript' | 'typescript'): void {
    this.aiCode = code;
    this.aiLanguage = language;
    this.ready = this.validateCode();
  }

  getCode(): string {
    return this.aiCode;
  }

  getLanguage(): 'javascript' | 'typescript' {
    return this.aiLanguage;
  }
}