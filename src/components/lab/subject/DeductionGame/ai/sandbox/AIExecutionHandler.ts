import { GameStateForAI } from '../types/GameTypes';
import { AICodeExecutor, ExecutionResult } from './AICodeExecutor';
import { PerformanceMonitor, PerformanceMetrics } from './PerformanceMonitor';

export interface AIExecutionResult {
  playerId: number;
  playerName: string;
  guess: number[];
  success: boolean;
  executionTime: number;
  error?: string;
  logs?: string[];
  metrics?: PerformanceMetrics;
}

export class AIExecutionHandler {
  private static instance: AIExecutionHandler;
  private executor: AICodeExecutor;
  private monitor: PerformanceMonitor;

  private constructor() {
    this.executor = AICodeExecutor.getInstance();
    this.monitor = PerformanceMonitor.getInstance();
  }

  static getInstance(): AIExecutionHandler {
    if (!AIExecutionHandler.instance) {
      AIExecutionHandler.instance = new AIExecutionHandler();
    }
    return AIExecutionHandler.instance;
  }

  async executeWithFallback(
    userCode: string,
    gameState: GameStateForAI,
    playerId: number,
    playerName: string
  ): Promise<AIExecutionResult> {
    try {
      // Measure execution with performance monitoring
      const [executionResult, metrics] = await this.monitor.measureExecution(
        () => this.executor.executeUserAI(userCode, gameState, playerId),
        { playerId }
      );

      if (executionResult.success && executionResult.result) {
        // Log successful execution
        console.log(`AI execution successful for player ${playerId} (${playerName})`, {
          executionTime: executionResult.executionTime,
          guess: executionResult.result,
          logs: executionResult.logs
        });

        return {
          playerId,
          playerName,
          guess: executionResult.result,
          success: true,
          executionTime: executionResult.executionTime || 0,
          logs: executionResult.logs,
          metrics
        };
      } else {
        // Execution failed but was caught properly
        throw new Error(executionResult.error || 'Unknown execution error');
      }

    } catch (error: any) {
      console.error(`AI execution failed for player ${playerId} (${playerName}):`, error);

      // Generate fallback guess
      const fallbackGuess = this.generateFallbackGuess(gameState);
      
      const errorDetails = error.metrics ? {
        error: error.error?.message || 'Unknown error',
        executionTime: error.metrics.executionTime
      } : {
        error: error.message || 'Unknown error',
        executionTime: 0
      };

      return {
        playerId,
        playerName,
        guess: fallbackGuess,
        success: false,
        ...errorDetails,
        metrics: error.metrics
      };
    }
  }

  private generateFallbackGuess(gameState: GameStateForAI): number[] {
    const available: number[] = [];
    
    // Find all available keywords (not hints, not revealed wrong answers)
    for (let i = 0; i < gameState.keywords.length; i++) {
      if (!gameState.myHints.includes(i) && 
          !gameState.revealedWrongAnswers.includes(i)) {
        available.push(i);
      }
    }

    // Start with revealed answers
    const guess = [...gameState.revealedAnswers];

    // Fill remaining slots randomly
    while (guess.length < gameState.answerCount && available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const selected = available.splice(randomIndex, 1)[0];
      
      if (!guess.includes(selected)) {
        guess.push(selected);
      }
    }

    // If still not enough (edge case), fill with any valid indices
    if (guess.length < gameState.answerCount) {
      for (let i = 0; i < gameState.keywords.length && guess.length < gameState.answerCount; i++) {
        if (!gameState.myHints.includes(i) && !guess.includes(i)) {
          guess.push(i);
        }
      }
    }

    return guess.slice(0, gameState.answerCount);
  }

  // Get execution statistics for a player
  getPlayerStats(playerId: number) {
    return this.monitor.getPlayerStats(playerId);
  }

  // Get global execution statistics
  getGlobalStats() {
    return this.monitor.getGlobalStats();
  }

  // Validate AI code without executing
  async validateCode(code: string): Promise<{ valid: boolean; errors?: string[]; warnings?: string[] }> {
    const { AICodeValidator } = await import('./AICodeValidator');
    
    const result = AICodeValidator.validate(code);
    
    return {
      valid: result.isValid,
      errors: result.errors.length > 0 ? result.errors : undefined,
      warnings: result.warnings
    };
  }

  // Test AI code with a sample game state
  async testAICode(
    code: string,
    sampleGameState?: GameStateForAI
  ): Promise<{
    success: boolean;
    result?: number[];
    error?: string;
    executionTime?: number;
    logs?: string[];
  }> {
    // Use provided game state or create a sample one
    const testGameState = sampleGameState || this.createSampleGameState();
    
    try {
      const result = await this.executor.executeUserAI(code, testGameState, -1); // -1 for test player ID
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Test execution failed'
      };
    }
  }

  private createSampleGameState(): GameStateForAI {
    return {
      keywords: ['사과', '바나나', '체리', '포도', '망고', '복숭아', '딸기', '수박', '멜론', '키위'],
      myHints: [1, 3], // 바나나, 포도는 정답이 아님
      answerCount: 3,
      previousGuesses: [
        { playerId: 1, guess: [0, 2, 4], correctCount: 2 },
        { playerId: 2, guess: [2, 5, 6], correctCount: 1 }
      ],
      revealedAnswers: [],
      revealedWrongAnswers: [7], // 수박은 정답이 아님
      currentTurn: 3,
      timeLimit: 60
    };
  }
}