import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';
import { findGuessesWithCorrectCount } from '../inference/InferenceUtils';

export class EasyStrategy implements AIStrategy {
  selectKeywords(gameState: GameStateForAI): number[] {
    const { keywords, revealedAnswers, revealedWrongAnswers, answerCount, previousGuesses } = gameState;
    
    // 사용 가능한 키워드 인덱스
    const availableIndices = Array.from(
      { length: keywords.length }, 
      (_, i) => i
    ).filter(idx => !revealedWrongAnswers.includes(idx));
    
    // 공개된 정답은 반드시 포함
    const selected = [...revealedAnswers];
    
    // 가중치 기반 무작위 선택
    const weights = new Map<number, number>();
    
    // 기본 가중치 설정
    availableIndices.forEach(idx => {
      if (!selected.includes(idx)) {
        weights.set(idx, 1.0);
      }
    });
    
    // 최근 추측에서 정답률이 높았던 키워드에 약간의 가중치 부여
    if (previousGuesses.length > 0) {
      // 최근 3개 추측만 고려
      const recentGuesses = previousGuesses.slice(-3);
      
      recentGuesses.forEach(guess => {
        const successRate = guess.correctCount / guess.guess.length;
        
        // 성공률이 평균 이상인 추측에 포함된 키워드에 가중치 부여
        if (successRate >= 0.5) {
          guess.guess.forEach(keyword => {
            if (weights.has(keyword)) {
              // 성공률에 비례하여 가중치 증가 (최대 1.5배)
              const bonus = 1 + (successRate - 0.5);
              weights.set(keyword, (weights.get(keyword) || 1) * bonus);
            }
          });
        }
      });
    }
    
    // 가중치 기반 랜덤 선택
    while (selected.length < answerCount && weights.size > 0) {
      const totalWeight = Array.from(weights.values()).reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      
      let selectedKeyword = -1;
      const entries = Array.from(weights.entries());
      for (let i = 0; i < entries.length; i++) {
        const [keyword, weight] = entries[i];
        random -= weight;
        if (random <= 0) {
          selectedKeyword = keyword;
          break;
        }
      }
      
      if (selectedKeyword !== -1) {
        selected.push(selectedKeyword);
        weights.delete(selectedKeyword);
      }
    }
    
    return selected;
  }

  getStrategyName(): string {
    return 'Easy AI';
  }

  getDescription(): string {
    return '가중치 기반 무작위로 키워드를 선택합니다.';
  }
}