import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';

export class EasyStrategy implements AIStrategy {
  selectKeywords(gameState: GameStateForAI): number[] {
    const { keywords, revealedWrongAnswers, answerCount } = gameState;
    
    const availableIndices = Array.from(
      { length: keywords.length }, 
      (_, i) => i
    ).filter(idx => !revealedWrongAnswers.includes(idx));
    
    const shuffled = [...availableIndices].sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, answerCount);
  }

  getStrategyName(): string {
    return 'Easy AI';
  }

  getDescription(): string {
    return '완전 무작위로 키워드를 선택합니다.';
  }
}