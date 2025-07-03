import { AIStrategy } from './AIStrategy';
import { GameStateForAI, GuessHistory } from '../types/GameTypes';
import { getIntersection, findGuessesWithCorrectCount } from '../inference/InferenceUtils';

export class MediumStrategy implements AIStrategy {
  selectKeywords(gameState: GameStateForAI): number[] {
    const { keywords, revealedAnswers, revealedWrongAnswers, answerCount, previousGuesses, myHints } = gameState;
    
    // 공개된 정답 먼저 포함
    const selectedIndices: number[] = [...revealedAnswers];
    
    // 사용 가능한 키워드 (오답과 힌트 제외)
    const availableIndices = Array.from(
      { length: keywords.length }, 
      (_, i) => i
    ).filter(idx => 
      !revealedWrongAnswers.includes(idx) && 
      !selectedIndices.includes(idx) &&
      !myHints.includes(idx)
    );
    
    // 기본 교집합 분석을 통한 후보 선정
    const candidates = this.analyzeCandidates(availableIndices, previousGuesses, answerCount);
    
    // 후보가 충분하면 그 중에서 선택
    const remaining = answerCount - selectedIndices.length;
    if (candidates.length >= remaining) {
      selectedIndices.push(...candidates.slice(0, remaining));
    } else {
      // 후보가 부족하면 나머지는 무작위
      selectedIndices.push(...candidates);
      
      const otherAvailable = availableIndices.filter(idx => !candidates.includes(idx));
      const shuffled = [...otherAvailable].sort(() => Math.random() - 0.5);
      const stillNeeded = answerCount - selectedIndices.length;
      
      selectedIndices.push(...shuffled.slice(0, stillNeeded));
    }
    
    return selectedIndices;
  }
  
  private analyzeCandidates(
    availableIndices: number[],
    previousGuesses: GuessHistory[],
    answerCount: number
  ): number[] {
    if (previousGuesses.length < 2) {
      return [];
    }
    
    // 점수 맵
    const scores = new Map<number, number>();
    availableIndices.forEach(idx => scores.set(idx, 0));
    
    // 최근 5개 추측만 분석
    const recentGuesses = previousGuesses.slice(-5);
    
    // 정답 개수가 많은 추측들 찾기
    const goodGuesses = recentGuesses.filter(g => g.correctCount >= answerCount * 0.5);
    
    if (goodGuesses.length >= 2) {
      // 좋은 추측들의 교집합 분석
      for (let i = 0; i < goodGuesses.length - 1; i++) {
        for (let j = i + 1; j < goodGuesses.length; j++) {
          const intersection = getIntersection(goodGuesses[i].guess, goodGuesses[j].guess);
          
          // 교집합에 있는 키워드에 점수 부여
          intersection.forEach(keyword => {
            if (scores.has(keyword)) {
              scores.set(keyword, scores.get(keyword)! + 2);
            }
          });
        }
      }
    }
    
    // 정답이 0개인 추측 분석 (확실한 오답 제외)
    const zeroGuesses = findGuessesWithCorrectCount(recentGuesses, 0);
    zeroGuesses.forEach(guess => {
      guess.guess.forEach(keyword => {
        scores.delete(keyword); // 점수 맵에서 제거
      });
    });
    
    // 점수가 높은 순으로 정렬
    const scoredCandidates = Array.from(scores.entries())
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword);
    
    return scoredCandidates;
  }

  getStrategyName(): string {
    return 'Medium AI';
  }

  getDescription(): string {
    return '공개된 정답과 기본적인 교집합 분석을 활용하여 선택합니다.';
  }
}