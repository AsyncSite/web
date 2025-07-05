import { AIStrategy } from './AIStrategy';
import { GameStateForAI, GuessHistory } from '../types/GameTypes';

// 전역 게임 메모리 - 모든 AI 인스턴스가 공유
export class GlobalGameMemory {
  private static instance: GlobalGameMemory;
  private allCombinations: Set<string> = new Set();
  private keywordStats: Map<number, { appearances: number; correctGuesses: number; totalGuesses: number }> = new Map();
  private playerPatterns: Map<number, Map<number, number>> = new Map(); // playerId -> keywordIdx -> 선택 횟수
  
  private constructor() {}
  
  static getInstance(): GlobalGameMemory {
    if (!GlobalGameMemory.instance) {
      GlobalGameMemory.instance = new GlobalGameMemory();
    }
    return GlobalGameMemory.instance;
  }
  
  reset(): void {
    this.allCombinations.clear();
    this.keywordStats.clear();
    this.playerPatterns.clear();
    console.log('[메모리] 게임 메모리 초기화');
  }
  
  addCombination(combination: number[]): void {
    const key = [...combination].sort((a, b) => a - b).join(',');
    this.allCombinations.add(key);
  }
  
  hasCombination(combination: number[]): boolean {
    const key = [...combination].sort((a, b) => a - b).join(',');
    return this.allCombinations.has(key);
  }
  
  getAllCombinations(): Set<string> {
    return new Set(this.allCombinations);
  }
  
  updateKeywordStats(guess: GuessHistory): void {
    guess.guess.forEach(keywordIdx => {
      const stats = this.keywordStats.get(keywordIdx) || { appearances: 0, correctGuesses: 0, totalGuesses: 0 };
      stats.appearances++;
      stats.totalGuesses += guess.guess.length;
      stats.correctGuesses += guess.correctCount;
      this.keywordStats.set(keywordIdx, stats);
    });
  }
  
  getKeywordScore(keywordIdx: number): number {
    const stats = this.keywordStats.get(keywordIdx);
    if (!stats || stats.appearances === 0) return 50; // 중립 점수
    
    // 평균 정답률 계산
    const avgCorrectRate = stats.correctGuesses / stats.totalGuesses;
    return avgCorrectRate * 100;
  }
  
  updatePlayerPattern(playerId: number, keywords: number[]): void {
    if (!this.playerPatterns.has(playerId)) {
      this.playerPatterns.set(playerId, new Map());
    }
    const pattern = this.playerPatterns.get(playerId)!;
    
    keywords.forEach(keywordIdx => {
      pattern.set(keywordIdx, (pattern.get(keywordIdx) || 0) + 1);
    });
  }
  
  getFrequentlyChosenKeywords(minFrequency: number = 3): number[] {
    const frequentKeywords: Map<number, number> = new Map();
    
    this.playerPatterns.forEach((pattern) => {
      pattern.forEach((count, keywordIdx) => {
        frequentKeywords.set(keywordIdx, (frequentKeywords.get(keywordIdx) || 0) + count);
      });
    });
    
    return Array.from(frequentKeywords.entries())
      .filter(([_, count]) => count >= minFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([idx, _]) => idx);
  }
}

export abstract class BaseStrategy implements AIStrategy {
  private gameMemory: GlobalGameMemory = GlobalGameMemory.getInstance();
  
  selectKeywords(gameState: GameStateForAI): number[] {
    console.log('=== 지능형 AI 실행 ===');
    console.log(`턴 ${gameState.currentTurn}: 키워드 ${gameState.keywords.length}개 중 정답 ${gameState.answerCount}개 찾기`);
    
    // 게임 메모리 업데이트 - 모든 이전 추측을 전역 메모리에 저장
    this.updateGlobalMemory(gameState);
    
    // 1. 확실한 정답과 오답 수집
    const definiteAnswers = new Set<number>(gameState.revealedAnswers);
    const definiteWrongs = new Set<number>();
    
    // 내 힌트는 모두 오답
    gameState.myHints.forEach(hint => definiteWrongs.add(hint));
    
    // 공개된 오답 추가
    gameState.revealedWrongAnswers.forEach(wrong => definiteWrongs.add(wrong));
    
    // 공개된 다른 플레이어의 힌트도 오답
    if (gameState.revealedOtherHints && gameState.revealedOtherHints.length > 0) {
      gameState.revealedOtherHints.forEach(({ hints }) => {
        hints.forEach(hintIdx => definiteWrongs.add(hintIdx));
      });
    }
    
    console.log(`내 힌트 (오답): ${gameState.myHints.map(i => gameState.keywords[i])}`);
    console.log(`공개된 오답: ${gameState.revealedWrongAnswers.map(i => gameState.keywords[i])}`);
    console.log(`공개된 정답: ${gameState.revealedAnswers.map(i => gameState.keywords[i])}`);
    
    // 2. 이전 추측 분석으로 추가 정보 획득
    this.analyzeAllGuesses(gameState, definiteAnswers, definiteWrongs);
    
    // 3. 자주 선택되는 키워드 확인
    const frequentKeywords = this.gameMemory.getFrequentlyChosenKeywords(3);
    console.log(`자주 선택되는 키워드: ${frequentKeywords.map(i => gameState.keywords[i]).join(', ')}`);
    
    // 4. 선택 가능한 키워드 목록 생성
    const possibleKeywords: number[] = [];
    for (let i = 0; i < gameState.keywords.length; i++) {
      if (!definiteWrongs.has(i)) {
        possibleKeywords.push(i);
      }
    }
    
    console.log(`확실한 정답: ${definiteAnswers.size}개`);
    console.log(`확실한 오답: ${definiteWrongs.size}개`);
    console.log(`선택 가능한 키워드: ${possibleKeywords.length}개`);
    
    // 5. 이미 충분한 정답을 아는 경우
    if (definiteAnswers.size >= gameState.answerCount) {
      console.log('모든 정답을 알고 있음! 게임 종료!');
      return Array.from(definiteAnswers).slice(0, gameState.answerCount);
    }
    
    // 6. 각 키워드의 점수 계산 (메모리 기반 점수 포함)
    const scores = this.calculateScoresWithMemory(gameState, possibleKeywords, definiteAnswers, definiteWrongs, frequentKeywords);
    
    // 7. 최종 추측 구성
    let finalGuess = this.buildFinalGuess(scores, definiteAnswers, gameState.answerCount);
    
    // 8. 중복 추측 방지: 전역 메모리 기반 확인
    finalGuess = this.preventDuplicateGuessWithGlobalMemory(finalGuess, gameState, scores);
    
    // 9. 이번 추측을 전역 메모리에 추가
    this.gameMemory.addCombination(finalGuess);
    
    console.log('최종 선택:', finalGuess.map(i => gameState.keywords[i]));
    return finalGuess;
  }

  // 전역 메모리 업데이트
  private updateGlobalMemory(gameState: GameStateForAI): void {
    // 모든 이전 추측을 전역 메모리에 추가
    gameState.previousGuesses.forEach(guess => {
      this.gameMemory.addCombination(guess.guess);
      this.gameMemory.updateKeywordStats(guess);
      this.gameMemory.updatePlayerPattern(guess.playerId, guess.guess);
    });
  }
  
  // 메모리 기반 점수 계산
  private calculateScoresWithMemory(
    gameState: GameStateForAI,
    possibleKeywords: number[],
    definiteAnswers: Set<number>,
    definiteWrongs: Set<number>,
    frequentKeywords: number[]
  ): Map<number, number> {
    const scores = new Map<number, number>();
    
    // 확실한 정답은 최고 점수
    definiteAnswers.forEach(idx => {
      scores.set(idx, 1000);
    });
    
    // 가능한 키워드들의 점수 계산
    possibleKeywords.forEach(idx => {
      if (!definiteAnswers.has(idx) && !definiteWrongs.has(idx)) {
        // 기본 점수 계산
        let score = this.calculateKeywordScore(idx, gameState, definiteAnswers, definiteWrongs);
        
        // 메모리 기반 점수 보정
        const memoryScore = this.gameMemory.getKeywordScore(idx);
        score = score * 0.7 + memoryScore * 0.3; // 가중 평균
        
        // 자주 선택되는 키워드 보너스
        if (frequentKeywords.includes(idx)) {
          score *= 1.5;
          console.log(`[메모리] ${gameState.keywords[idx]}는 자주 선택됨 - 보너스 적용`);
        }
        
        scores.set(idx, score);
      }
    });
    
    // 점수별로 정렬하여 출력
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('상위 10개 키워드 점수 (메모리 반영):');
    sorted.forEach(([idx, score]) => {
      console.log(`  ${gameState.keywords[idx]}: ${score.toFixed(2)}점`);
    });
    
    return scores;
  }
  
  // 전역 메모리 기반 중복 방지
  private preventDuplicateGuessWithGlobalMemory(
    guess: number[],
    gameState: GameStateForAI,
    scores: Map<number, number>
  ): number[] {
    // 전역 메모리에서 중복 확인
    if (this.gameMemory.hasCombination(guess)) {
      console.log('[메모리] 전역 중복 감지! 새로운 조합 생성 중...');
      console.log(`[메모리] 중복 조합: ${guess.map(i => gameState.keywords[i]).join(', ')}`);
      
      // 체계적으로 새로운 조합 생성
      return this.generateNewCombinationWithMemory(guess, gameState, scores);
    }
    
    return guess;
  }
  
  // 메모리 기반 새로운 조합 생성
  private generateNewCombinationWithMemory(
    originalGuess: number[],
    gameState: GameStateForAI,
    scores: Map<number, number>
  ): number[] {
    const allCombinations = this.gameMemory.getAllCombinations();
    console.log(`[메모리] 현재까지 ${allCombinations.size}개의 조합이 시도됨`);
    
    // 확실한 정답은 유지
    const mustInclude = originalGuess.filter(idx => 
      gameState.revealedAnswers.includes(idx)
    );
    
    // 점수 높은 순으로 후보 정렬
    const candidates = Array.from(scores.entries())
      .filter(([idx]) => !mustInclude.includes(idx))
      .sort((a, b) => b[1] - a[1]);
    
    // 새로운 조합 시도 (최대 50회)
    for (let attempt = 0; attempt < 50; attempt++) {
      const newGuess = [...mustInclude];
      const needed = gameState.answerCount - newGuess.length;
      
      // 상위 후보 중에서 선택 (약간의 무작위성 추가)
      const pool = candidates.slice(0, needed * 2);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < needed && i < shuffled.length; i++) {
        newGuess.push(shuffled[i][0]);
      }
      
      // 중복 확인
      if (!this.gameMemory.hasCombination(newGuess)) {
        console.log(`[메모리] ${attempt + 1}번 시도 후 새로운 조합 생성 성공`);
        console.log(`[메모리] 새 조합: ${newGuess.map(i => gameState.keywords[i]).join(', ')}`);
        return newGuess;
      }
    }
    
    // 모든 시도가 실패하면 최선의 선택 반환
    console.log('[메모리] 경고: 새로운 조합 생성 실패');
    return originalGuess;
  }

  // 모든 추측 분석
  private analyzeAllGuesses(gameState: GameStateForAI, definiteAnswers: Set<number>, definiteWrongs: Set<number>): void {
    // 1. 정답이 0개인 추측 - 모든 키워드가 오답
    gameState.previousGuesses.forEach(guess => {
      if (guess.correctCount === 0) {
        guess.guess.forEach(idx => {
          definiteWrongs.add(idx);
        });
        console.log(`정답 0개 추측에서 오답 발견: ${guess.guess.map(i => gameState.keywords[i])}`);
      }
    });
    
    // 2. 추측 간 비교로 확실한 정답/오답 찾기
    for (let i = 0; i < gameState.previousGuesses.length - 1; i++) {
      for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
        this.compareGuesses(
          gameState.previousGuesses[i], 
          gameState.previousGuesses[j], 
          definiteAnswers, 
          definiteWrongs,
          gameState
        );
      }
    }
    
    // 3. 제약 조건 확인
    gameState.previousGuesses.forEach(guess => {
      this.checkConstraints(guess, definiteAnswers, definiteWrongs, gameState);
    });
  }

  // 두 추측 비교
  private compareGuesses(
    guess1: GuessHistory, 
    guess2: GuessHistory, 
    definiteAnswers: Set<number>, 
    definiteWrongs: Set<number>, 
    gameState: GameStateForAI
  ): void {
    // 두 추측의 차이 계산
    const onlyIn1 = guess1.guess.filter(x => !guess2.guess.includes(x));
    const onlyIn2 = guess2.guess.filter(x => !guess1.guess.includes(x));
    
    // 정확히 하나씩만 다른 경우
    if (onlyIn1.length === 1 && onlyIn2.length === 1) {
      const idx1 = onlyIn1[0];
      const idx2 = onlyIn2[0];
      
      if (guess1.correctCount > guess2.correctCount) {
        // idx1은 정답, idx2는 오답
        if (!definiteAnswers.has(idx1) && !definiteWrongs.has(idx1)) {
          definiteAnswers.add(idx1);
          console.log(`비교 분석: ${gameState.keywords[idx1]}는 정답!`);
        }
        if (!definiteWrongs.has(idx2) && !definiteAnswers.has(idx2)) {
          definiteWrongs.add(idx2);
          console.log(`비교 분석: ${gameState.keywords[idx2]}는 오답!`);
        }
      } else if (guess2.correctCount > guess1.correctCount) {
        // idx2는 정답, idx1은 오답
        if (!definiteAnswers.has(idx2) && !definiteWrongs.has(idx2)) {
          definiteAnswers.add(idx2);
          console.log(`비교 분석: ${gameState.keywords[idx2]}는 정답!`);
        }
        if (!definiteWrongs.has(idx1) && !definiteAnswers.has(idx1)) {
          definiteWrongs.add(idx1);
          console.log(`비교 분석: ${gameState.keywords[idx1]}은 오답!`);
        }
      }
    }
  }

  // 제약 조건 확인
  private checkConstraints(
    guess: GuessHistory, 
    definiteAnswers: Set<number>, 
    definiteWrongs: Set<number>, 
    gameState: GameStateForAI
  ): void {
    let knownAnswers = 0;
    let knownWrongs = 0;
    const unknownIndices: number[] = [];
    
    guess.guess.forEach(idx => {
      if (definiteAnswers.has(idx)) {
        knownAnswers++;
      } else if (definiteWrongs.has(idx)) {
        knownWrongs++;
      } else {
        unknownIndices.push(idx);
      }
    });
    
    // 알려진 정답만으로 이미 correctCount를 달성한 경우
    if (knownAnswers === guess.correctCount) {
      // 나머지 unknown은 모두 오답
      unknownIndices.forEach(idx => {
        if (!definiteWrongs.has(idx)) {
          definiteWrongs.add(idx);
          console.log(`제약 조건: ${gameState.keywords[idx]}는 오답 (이미 충분한 정답)`);
        }
      });
    }
    
    // unknown과 known answers의 합이 정확히 correctCount인 경우
    if (knownAnswers + unknownIndices.length === guess.correctCount && unknownIndices.length > 0) {
      // 모든 unknown이 정답
      unknownIndices.forEach(idx => {
        if (!definiteAnswers.has(idx)) {
          definiteAnswers.add(idx);
          console.log(`제약 조건: ${gameState.keywords[idx]}는 정답 (나머지 모두 정답)`);
        }
      });
    }
  }


  // 개별 키워드 점수 계산
  private calculateKeywordScore(
    keywordIdx: number, 
    gameState: GameStateForAI, 
    definiteAnswers: Set<number>, 
    definiteWrongs: Set<number>
  ): number {
    let totalAppearances = 0;
    let weightedCorrect = 0;
    
    gameState.previousGuesses.forEach(guess => {
      if (guess.guess.includes(keywordIdx)) {
        totalAppearances++;
        
        // 이 추측에서 알려진 정답/오답 개수
        let knownAnswers = 0;
        let knownWrongs = 0;
        let unknownCount = 0;
        
        guess.guess.forEach(idx => {
          if (definiteAnswers.has(idx)) knownAnswers++;
          else if (definiteWrongs.has(idx)) knownWrongs++;
          else unknownCount++;
        });
        
        // 남은 정답 개수
        const remainingCorrect = Math.max(0, guess.correctCount - knownAnswers);
        
        // 이 키워드가 정답일 확률
        if (unknownCount > 0 && remainingCorrect > 0) {
          const probability = remainingCorrect / unknownCount;
          weightedCorrect += probability;
        }
      }
    });
    
    // 기본 점수 (아직 선택되지 않은 키워드는 중립적)
    if (totalAppearances === 0) {
      return 50; // 중립 점수
    }
    
    // 평균 확률을 점수로 변환
    return (weightedCorrect / totalAppearances) * 100;
  }

  // 최종 추측 구성
  private buildFinalGuess(scores: Map<number, number>, definiteAnswers: Set<number>, answerCount: number): number[] {
    // 점수 순으로 정렬
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1]);
    
    const finalGuess: number[] = [];
    
    // 높은 점수부터 선택
    for (const [idx, score] of sorted) {
      if (finalGuess.length >= answerCount) break;
      finalGuess.push(idx);
    }
    
    // 혹시 부족하면 (이런 일은 없어야 함)
    if (finalGuess.length < answerCount) {
      console.error('경고: 선택 가능한 키워드가 부족합니다!');
    }
    
    return finalGuess;
  }
  

  abstract getStrategyName(): string;
  abstract getDescription(): string;
}