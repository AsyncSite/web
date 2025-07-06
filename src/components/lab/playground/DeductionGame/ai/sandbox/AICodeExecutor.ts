import { GameStateForAI } from '../types/GameTypes';
import { AICodeValidator } from './AICodeValidator';

export interface ExecutionResult {
  success: boolean;
  result?: number[];
  error?: string;
  executionTime?: number;
  logs?: string[];
}

export interface SecureGameState {
  readonly keywords: ReadonlyArray<string>;
  readonly myHints: ReadonlyArray<number>;
  readonly answerCount: number;
  readonly previousGuesses: ReadonlyArray<{
    playerId: number;
    guess: number[];
    correctCount: number;
  }>;
  readonly revealedAnswers: ReadonlyArray<number>;
  readonly revealedWrongAnswers: ReadonlyArray<number>;
  readonly currentTurn: number;
  readonly timeLimit: number;
}

export class AICodeExecutor {
  private static instance: AICodeExecutor;
  private executionCounter = 0;
  private readonly MAX_EXECUTION_TIME = 2500; // 2.5 seconds with buffer

  static getInstance(): AICodeExecutor {
    if (!AICodeExecutor.instance) {
      AICodeExecutor.instance = new AICodeExecutor();
    }
    return AICodeExecutor.instance;
  }

  async executeUserAI(
    code: string,
    gameState: GameStateForAI,
    playerId: number
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const logs: string[] = [];

    try {
      // Step 1: Validate code
      const validation = AICodeValidator.validate(code);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Code validation failed: ${validation.errors.join('; ')}`,
          executionTime: performance.now() - startTime
        };
      }

      // Log warnings if any
      if (validation.warnings) {
        logs.push(...validation.warnings.map(w => `Warning: ${w}`));
      }

      // Step 2: Preprocess code
      const processedCode = AICodeValidator.preprocessCode(code);

      // Step 3: Create secure game state
      const secureGameState = this.createSecureGameState(gameState);

      // Step 4: Execute in worker
      const result = await this.executeInWorker(processedCode, secureGameState, logs);

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        result,
        executionTime,
        logs: logs.length > 0 ? logs : undefined
      };

    } catch (error: any) {
      const executionTime = performance.now() - startTime;
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        executionTime,
        logs: logs.length > 0 ? logs : undefined
      };
    }
  }

  private createSecureGameState(gameState: GameStateForAI): SecureGameState {
    // Deep freeze arrays and objects to prevent modification
    const deepFreeze = <T>(obj: T): T => {
      Object.freeze(obj);
      
      Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop as keyof T] !== null
            && (typeof obj[prop as keyof T] === 'object' || typeof obj[prop as keyof T] === 'function')
            && !Object.isFrozen(obj[prop as keyof T])) {
          deepFreeze(obj[prop as keyof T]);
        }
      });
      
      return obj;
    };

    return deepFreeze({
      keywords: [...gameState.keywords],
      myHints: [...gameState.myHints],
      answerCount: gameState.answerCount,
      previousGuesses: gameState.previousGuesses.map(g => ({
        playerId: g.playerId,
        guess: [...g.guess],
        correctCount: g.correctCount
      })),
      revealedAnswers: [...gameState.revealedAnswers],
      revealedWrongAnswers: [...gameState.revealedWrongAnswers],
      currentTurn: gameState.currentTurn,
      timeLimit: gameState.timeLimit
    });
  }

  private executeInWorker(
    code: string,
    gameState: SecureGameState,
    logs: string[]
  ): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const executionId = `exec_${++this.executionCounter}_${Date.now()}`;
      
      // Create worker
      // Get the correct path for the worker file
      const publicUrl = process.env.PUBLIC_URL || '';
      let workerPath = publicUrl + '/ai-worker.js';
      
      // In development, if the path starts with /web, use it directly
      if (window.location.pathname.startsWith('/web') && !workerPath.startsWith('/web')) {
        workerPath = '/web/ai-worker.js';
      }
      
      const worker = new Worker(workerPath);
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        worker.terminate();
        reject(new Error('Execution timeout exceeded (2 seconds)'));
      }, this.MAX_EXECUTION_TIME);

      // Handle messages
      worker.onmessage = (event) => {
        const { type, executionId: msgId, result, error, data } = event.data;

        if (type === 'log' && msgId === executionId) {
          const logMessage = data.map((arg: any) => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          logs.push(logMessage);
          return;
        }

        // Handle result or error
        if (msgId === executionId) {
          clearTimeout(timeoutId);
          worker.terminate();

          if (error) {
            reject(new Error(error));
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('No result returned from AI'));
          }
        }
      };

      // Handle worker errors
      worker.onerror = (error) => {
        clearTimeout(timeoutId);
        worker.terminate();
        
        // More detailed error message
        let errorMessage = 'Worker error: ';
        if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Failed to load worker file. Make sure ai-worker.js is in the public directory.';
        }
        
        console.error('Worker load error:', error);
        console.error('Worker path attempted:', workerPath);
        
        reject(new Error(errorMessage));
      };

      // Send execution request
      worker.postMessage({
        code,
        gameState,
        executionId
      });
    });
  }

  // Helper method to validate guess format
  static validateGuess(guess: number[], gameState: GameStateForAI): string | null {
    if (!Array.isArray(guess)) {
      return 'Guess must be an array';
    }

    if (guess.length !== gameState.answerCount) {
      return `Guess must contain exactly ${gameState.answerCount} elements`;
    }

    const keywordCount = gameState.keywords.length;
    for (let i = 0; i < guess.length; i++) {
      const idx = guess[i];
      
      if (typeof idx !== 'number' || !Number.isInteger(idx)) {
        return `Element at index ${i} must be an integer`;
      }

      if (idx < 0 || idx >= keywordCount) {
        return `Element at index ${i} (${idx}) is out of bounds`;
      }

      if (gameState.myHints.includes(idx)) {
        return `Element at index ${i} (${idx}) is one of your hints`;
      }
    }

    const uniqueIndices = new Set(guess);
    if (uniqueIndices.size !== guess.length) {
      return 'Guess contains duplicate indices';
    }

    return null; // Valid
  }
}