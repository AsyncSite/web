import { BasePlayer } from './BasePlayer';
import { PlayerInfo } from '../types/PlayerTypes';
import { GameStateForAI } from '../types/GameTypes';
import { AIExecutionHandler } from '../sandbox/AIExecutionHandler';

export class CustomAIPlayer extends BasePlayer {
  private aiCode: string;
  private aiLanguage: 'javascript' | 'typescript';
  private executionHandler: AIExecutionHandler;
  
  constructor(playerInfo: PlayerInfo) {
    super(playerInfo);
    this.aiCode = playerInfo.customCode || '';
    this.aiLanguage = playerInfo.customLanguage || 'javascript';
    this.executionHandler = AIExecutionHandler.getInstance();
    this.ready = this.validateCode();
  }

  async makeGuess(gameState: GameStateForAI): Promise<number[]> {
    try {
      // Use the secure sandbox execution
      const result = await this.executionHandler.executeWithFallback(
        this.aiCode,
        gameState,
        this.playerInfo.id,
        this.playerInfo.nickname
      );

      if (!result.success) {
        console.error(`Custom AI execution failed for ${this.playerInfo.nickname}:`, result.error);
        if (result.logs && result.logs.length > 0) {
          console.log(`AI logs for ${this.playerInfo.nickname}:`, result.logs);
        }
      }

      return result.guess;
    } catch (error) {
      console.error('Unexpected error in Custom AI execution:', error);
      return this.fallbackStrategy(gameState);
    }
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
    
    // Use the execution handler's validation
    const validationPromise = this.executionHandler.validateCode(this.aiCode);
    
    // Since constructor can't be async, we'll do a simple check here
    // and rely on full validation during execution
    try {
      // Basic syntax check
      new Function(this.aiCode);
      return true;
    } catch (error) {
      console.error('AI code validation error:', error);
      return false;
    }
  }

  async validateCodeAsync(): Promise<{ valid: boolean; errors?: string[]; warnings?: string[] }> {
    return await this.executionHandler.validateCode(this.aiCode);
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