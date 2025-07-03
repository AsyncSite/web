import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';

export class MediumStrategy implements AIStrategy {
  selectKeywords(gameState: GameStateForAI): number[] {
    const { keywords, revealedAnswers, revealedWrongAnswers, answerCount } = gameState;
    
    const selectedIndices: number[] = [...revealedAnswers];
    
    const availableIndices = Array.from(
      { length: keywords.length }, 
      (_, i) => i
    ).filter(idx => 
      !revealedWrongAnswers.includes(idx) && 
      !selectedIndices.includes(idx)
    );
    
    const shuffled = [...availableIndices].sort(() => Math.random() - 0.5);
    const remaining = answerCount - selectedIndices.length;
    
    selectedIndices.push(...shuffled.slice(0, remaining));
    
    return selectedIndices;
  }

  getStrategyName(): string {
    return 'Medium AI';
  }

  getDescription(): string {
    return '공개된 정답을 우선 선택하고 나머지는 무작위로 선택합니다.';
  }
}