import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';

export class EasyStrategy implements AIStrategy {
  private recentGuesses: Set<string> = new Set();
  
  selectKeywords(gameState: GameStateForAI): number[] {

    // 확실한 정답만 수집 (매우 제한적으로만 사용)
    const definiteAnswers = new Set<number>(gameState.revealedAnswers);
    
    // 확실한 오답 수집 (내 힌트와 공개된 오답만)
    const definiteWrongs = new Set<number>();
    gameState.myHints.forEach(hint => definiteWrongs.add(hint));
    gameState.revealedWrongAnswers.forEach(wrong => definiteWrongs.add(wrong));
    
    // 선택 가능한 키워드 목록
    const availableKeywords: number[] = [];
    for (let i = 0; i < gameState.keywords.length; i++) {
      if (!definiteWrongs.has(i)) {
        availableKeywords.push(i);
      }
    }

    // Easy AI는 다른 플레이어의 힌트나 이전 추측을 분석하지 않습니다
    // 단순히 무작위로 선택합니다
    
    const finalGuess: number[] = [];
    
    // 1. 확실한 정답이 있으면 먼저 포함 (하지만 모든 정답을 알아도 일부만 사용)
    const answersToUse = Array.from(definiteAnswers);
    const maxAnswersToUse = Math.min(
      Math.floor(gameState.answerCount * 0.7), // 최대 70%만 사용
      answersToUse.length
    );
    
    // 확실한 정답 중에서도 무작위로 선택
    const shuffledAnswers = this.shuffle([...answersToUse]);
    for (let i = 0; i < maxAnswersToUse && finalGuess.length < gameState.answerCount; i++) {
      finalGuess.push(shuffledAnswers[i]);
    }
    
    // 2. 나머지는 완전 무작위로 선택
    const remainingCandidates = availableKeywords.filter(idx => !finalGuess.includes(idx));
    const shuffledCandidates = this.shuffle([...remainingCandidates]);
    
    for (let i = 0; i < shuffledCandidates.length && finalGuess.length < gameState.answerCount; i++) {
      finalGuess.push(shuffledCandidates[i]);
    }
    
    // 3. 가끔씩 의도적으로 실수하기 (10% 확률로 잘못된 선택)
    if (Math.random() < 0.1 && finalGuess.length === gameState.answerCount) {
      const wrongIndex = Math.floor(Math.random() * finalGuess.length);
      const wrongCandidates = remainingCandidates.filter(idx => !finalGuess.includes(idx));
      if (wrongCandidates.length > 0) {
        finalGuess[wrongIndex] = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)];
      }
    }
    
    // 중복 방지를 위한 간단한 체크 (최근 3턴만 기억)
    const guessKey = [...finalGuess].sort((a, b) => a - b).join(',');
    if (this.recentGuesses.has(guessKey) && remainingCandidates.length >= gameState.answerCount) {
      return this.selectKeywords(gameState); // 재귀적으로 다시 선택
    }
    
    // 최근 추측 기록 유지 (3개까지만)
    this.recentGuesses.add(guessKey);
    if (this.recentGuesses.size > 3) {
      const oldest = this.recentGuesses.values().next().value;
      if (oldest) {
        this.recentGuesses.delete(oldest);
      }
    }
    
    return finalGuess;
  }
  
  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  getStrategyName(): string {
    return 'Easy AI';
  }

  getDescription(): string {
    return 'AI가 무작위로 키워드를 선택합니다. 가끔 실수도 합니다.';
  }
}