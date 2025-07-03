import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';

export class HardStrategy implements AIStrategy {
  selectKeywords(gameState: GameStateForAI): number[] {
    const { 
      keywords, 
      revealedAnswers, 
      revealedWrongAnswers, 
      answerCount,
      previousGuesses,
      myHints 
    } = gameState;
    
    const selectedIndices: number[] = [...revealedAnswers];
    
    const availableIndices = Array.from(
      { length: keywords.length }, 
      (_, i) => i
    ).filter(idx => 
      !revealedWrongAnswers.includes(idx) && 
      !selectedIndices.includes(idx) &&
      !myHints.includes(idx)
    );
    
    const frequencyMap = new Map<number, number>();
    availableIndices.forEach(idx => frequencyMap.set(idx, 0));
    
    previousGuesses.forEach(guess => {
      if (guess.correctCount > 0) {
        guess.guess.forEach(idx => {
          if (frequencyMap.has(idx)) {
            frequencyMap.set(idx, frequencyMap.get(idx)! + guess.correctCount);
          }
        });
      }
    });
    
    const sortedByFrequency = availableIndices.sort((a, b) => {
      const freqA = frequencyMap.get(a) || 0;
      const freqB = frequencyMap.get(b) || 0;
      if (freqA !== freqB) return freqB - freqA;
      return Math.random() - 0.5;
    });
    
    const remaining = answerCount - selectedIndices.length;
    selectedIndices.push(...sortedByFrequency.slice(0, remaining));
    
    return selectedIndices;
  }

  getStrategyName(): string {
    return 'Hard AI';
  }

  getDescription(): string {
    return '이전 추측을 분석하여 정답 가능성이 높은 키워드를 선택합니다.';
  }
}