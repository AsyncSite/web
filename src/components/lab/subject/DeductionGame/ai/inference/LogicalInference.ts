/**
 * CSP 기반 논리적 추론 엔진
 * 제약 충족 문제(Constraint Satisfaction Problem)로 게임을 모델링하여
 * 가능한 정답 조합을 논리적으로 추론합니다.
 */

import { InferenceContext, InferenceResult, Constraint, IInferenceEngine } from './types';
import { GuessHistory } from '../types/GameTypes';
import { MemoizationCache, InferenceCache } from './MemoizationCache';

export class LogicalInference implements IInferenceEngine {
  private constraints: Constraint[] = [];
  private keywordCount: number = 0;
  private answerCount: number = 0;
  private cache: InferenceCache;
  
  constructor() {
    this.cache = new InferenceCache();
  }
  
  infer(context: InferenceContext): InferenceResult {
    this.keywordCount = context.gameState.keywords.length;
    this.answerCount = context.gameState.answerCount;
    
    // 캐시 키 생성
    const cacheKey = MemoizationCache.generateKey({
      keywords: context.gameState.keywords.length,
      answers: context.gameState.answerCount,
      revealed: context.gameState.revealedAnswers,
      wrong: context.gameState.revealedWrongAnswers,
      hints: context.gameState.myHints,
      guesses: context.gameState.previousGuesses.map(g => ({
        guess: g.guess,
        correct: g.correctCount
      }))
    });
    
    // 캐시된 결과 확인
    return this.cache.memoizeLogical(cacheKey, () => {
      // 제약 조건 수집
      this.collectConstraints(context);
      
      // CSP 풀이
      const possibleSolutions = this.solveCSP(context.timeout);
      
      // 결과 분석
      const result = this.analyzeResults(possibleSolutions, context);
      
      return result;
    });
  }
  
  reset(): void {
    this.constraints = [];
    this.keywordCount = 0;
    this.answerCount = 0;
    this.cache.clear();
  }
  
  private collectConstraints(context: InferenceContext): void {
    this.constraints = [];
    
    // 기본 제약: 정답 개수
    this.constraints.push({
      type: 'exact',
      keywords: Array.from({ length: this.keywordCount }, (_, i) => i),
      value: this.answerCount
    });
    
    // 힌트로부터 제약 (내 힌트는 정답이 아님)
    if (context.gameState.myHints.length > 0) {
      this.constraints.push({
        type: 'not_in',
        keywords: context.gameState.myHints,
        value: 0
      });
    }
    
    // 공개된 정답으로부터 제약
    context.gameState.revealedAnswers.forEach(answer => {
      this.constraints.push({
        type: 'exact',
        keywords: [answer],
        value: 1
      });
    });
    
    // 공개된 오답으로부터 제약
    context.gameState.revealedWrongAnswers.forEach(wrong => {
      this.constraints.push({
        type: 'exact',
        keywords: [wrong],
        value: 0
      });
    });
    
    // 이전 추측으로부터 제약
    this.extractConstraintsFromGuesses(context.gameState.previousGuesses);
    
    // 추가 제약 조건
    if (context.constraints) {
      this.constraints.push(...context.constraints);
    }
  }
  
  private extractConstraintsFromGuesses(guesses: GuessHistory[]): void {
    // 추측별 그룹화
    const guessesByPlayer = new Map<number, GuessHistory[]>();
    guesses.forEach(guess => {
      if (!guessesByPlayer.has(guess.playerId)) {
        guessesByPlayer.set(guess.playerId, []);
      }
      guessesByPlayer.get(guess.playerId)!.push(guess);
    });
    
    // 각 플레이어의 추측 분석
    guessesByPlayer.forEach((playerGuesses, playerId) => {
      this.analyzePlayerGuesses(playerGuesses, playerId);
    });
    
    // 전체 추측 간의 관계 분석
    this.analyzeGuessRelationships(guesses);
  }
  
  private analyzePlayerGuesses(guesses: GuessHistory[], playerId: number): void {
    // 연속된 추측 비교
    for (let i = 1; i < guesses.length; i++) {
      const prev = guesses[i - 1];
      const curr = guesses[i];
      
      const prevSet = new Set(prev.guess);
      const currSet = new Set(curr.guess);
      
      // 교집합
      const intersection = Array.from(prevSet).filter(x => currSet.has(x));
      
      // 차집합
      const removedFromPrev = Array.from(prevSet).filter(x => !currSet.has(x));
      const addedToCurr = Array.from(currSet).filter(x => !prevSet.has(x));
      
      // 정답 개수 변화 분석
      const correctDiff = curr.correctCount - prev.correctCount;
      
      if (removedFromPrev.length > 0 && addedToCurr.length > 0) {
        // 일부를 빼고 일부를 추가한 경우
        if (correctDiff > 0) {
          // 정답이 증가했다면, 추가된 것 중에 정답이 있음
          this.constraints.push({
            type: 'at_least',
            keywords: addedToCurr,
            value: correctDiff,
            source: { playerId, turnNumber: i }
          });
        } else if (correctDiff < 0) {
          // 정답이 감소했다면, 제거된 것 중에 정답이 있음
          this.constraints.push({
            type: 'at_least',
            keywords: removedFromPrev,
            value: -correctDiff,
            source: { playerId, turnNumber: i }
          });
        }
      }
    }
  }
  
  private analyzeGuessRelationships(guesses: GuessHistory[]): void {
    // 동일한 정답 개수를 가진 추측들 분석
    const guessesByCorrectCount = new Map<number, GuessHistory[]>();
    guesses.forEach(guess => {
      const count = guess.correctCount;
      if (!guessesByCorrectCount.has(count)) {
        guessesByCorrectCount.set(count, []);
      }
      guessesByCorrectCount.get(count)!.push(guess);
    });
    
    // 정답 개수가 0인 추측들 - 모두 오답
    const zeroCorrectGuesses = guessesByCorrectCount.get(0) || [];
    zeroCorrectGuesses.forEach(guess => {
      this.constraints.push({
        type: 'not_in',
        keywords: guess.guess,
        value: 0
      });
    });
    
    // 정답 개수가 최대인 추측들 - 모두 정답
    const maxCorrectGuesses = guessesByCorrectCount.get(this.answerCount) || [];
    maxCorrectGuesses.forEach(guess => {
      guess.guess.forEach(keyword => {
        this.constraints.push({
          type: 'exact',
          keywords: [keyword],
          value: 1
        });
      });
    });
  }
  
  private solveCSP(timeout?: number): Set<Set<number>> {
    const startTime = Date.now();
    const solutions = new Set<Set<number>>();
    const maxSolutions = 1000; // 메모리 제한
    
    // 확실한 정답과 오답 먼저 식별
    const definiteAnswers = new Set<number>();
    const definiteWrongs = new Set<number>();
    
    this.constraints.forEach(constraint => {
      if (constraint.type === 'exact' && constraint.keywords.length === 1) {
        if (constraint.value === 1) {
          definiteAnswers.add(constraint.keywords[0]);
        } else if (constraint.value === 0) {
          definiteWrongs.add(constraint.keywords[0]);
        }
      } else if (constraint.type === 'not_in') {
        constraint.keywords.forEach(k => definiteWrongs.add(k));
      }
    });
    
    // 가능한 키워드들
    const possibleKeywords = Array.from({ length: this.keywordCount }, (_, i) => i)
      .filter(i => !definiteWrongs.has(i));
    
    // 백트래킹으로 가능한 조합 찾기
    const backtrack = (current: Set<number>, startIdx: number) => {
      // 타임아웃 체크
      if (timeout && Date.now() - startTime > timeout) {
        return;
      }
      
      // 해 개수 제한
      if (solutions.size >= maxSolutions) {
        return;
      }
      
      // 확실한 정답은 반드시 포함
      if (current.size === 0) {
        definiteAnswers.forEach(ans => current.add(ans));
      }
      
      // 정답 개수 도달
      if (current.size === this.answerCount) {
        if (this.validateSolution(current)) {
          solutions.add(new Set(current));
        }
        return;
      }
      
      // 가지치기: 남은 가능한 키워드가 부족한 경우
      const remaining = this.answerCount - current.size;
      const availableCount = possibleKeywords.length - startIdx;
      if (remaining > availableCount) {
        return;
      }
      
      // 재귀 탐색
      for (let i = startIdx; i < possibleKeywords.length; i++) {
        const keyword = possibleKeywords[i];
        if (!current.has(keyword) && !definiteWrongs.has(keyword)) {
          current.add(keyword);
          
          // 가지치기: 현재 상태가 제약을 위반하는지 체크
          if (this.isPartialSolutionValid(current)) {
            backtrack(current, i + 1);
          }
          
          current.delete(keyword);
        }
      }
    };
    
    backtrack(new Set<number>(), 0);
    
    return solutions;
  }
  
  private validateSolution(solution: Set<number>): boolean {
    // 모든 제약 조건 검증
    for (const constraint of this.constraints) {
      const relevantCount = constraint.keywords.filter(k => solution.has(k)).length;
      
      switch (constraint.type) {
        case 'exact':
          if (relevantCount !== constraint.value) return false;
          break;
        case 'at_least':
          if (relevantCount < constraint.value) return false;
          break;
        case 'at_most':
          if (relevantCount > constraint.value) return false;
          break;
        case 'not_in':
          if (relevantCount > 0) return false;
          break;
      }
    }
    
    return true;
  }
  
  private isPartialSolutionValid(partial: Set<number>): boolean {
    // 부분해가 제약을 위반하는지 빠르게 체크
    for (const constraint of this.constraints) {
      const relevantCount = constraint.keywords.filter(k => partial.has(k)).length;
      
      switch (constraint.type) {
        case 'exact':
          // 부분해에서는 exact 제약을 완전히 검증할 수 없음
          if (constraint.keywords.length === 1 && partial.has(constraint.keywords[0])) {
            if (constraint.value === 0) return false;
          }
          break;
        case 'at_most':
          if (relevantCount > constraint.value) return false;
          break;
        case 'not_in':
          if (relevantCount > 0) return false;
          break;
      }
    }
    
    return true;
  }
  
  private analyzeResults(solutions: Set<Set<number>>, context: InferenceContext): InferenceResult {
    const probabilities = new Map<number, number>();
    const certainAnswers = new Set<number>();
    const certainWrongs = new Set<number>();
    
    // 초기화
    for (let i = 0; i < this.keywordCount; i++) {
      probabilities.set(i, 0);
    }
    
    if (solutions.size === 0) {
      // 해가 없는 경우 - 제약 조건이 모순
      return {
        probabilities,
        certainAnswers,
        certainWrongs,
        possibleSolutions: solutions,
        confidence: 0
      };
    }
    
    // 각 키워드가 해에 포함되는 빈도 계산
    const frequency = new Map<number, number>();
    solutions.forEach(solution => {
      solution.forEach(keyword => {
        frequency.set(keyword, (frequency.get(keyword) || 0) + 1);
      });
    });
    
    // 확률 계산 및 확실한 정답/오답 식별
    const solutionCount = solutions.size;
    for (let i = 0; i < this.keywordCount; i++) {
      const freq = frequency.get(i) || 0;
      const prob = freq / solutionCount;
      probabilities.set(i, prob);
      
      if (prob === 1) {
        certainAnswers.add(i);
      } else if (prob === 0) {
        certainWrongs.add(i);
      }
    }
    
    // 최적 추측 계산 (정보 이득 최대화)
    const optimalGuess = this.computeOptimalGuess(solutions, context);
    
    // 신뢰도 계산
    const confidence = this.computeConfidence(solutions, certainAnswers.size);
    
    return {
      probabilities,
      certainAnswers,
      certainWrongs,
      possibleSolutions: solutions,
      optimalGuess,
      confidence
    };
  }
  
  private computeOptimalGuess(solutions: Set<Set<number>>, context: InferenceContext): number[] {
    if (solutions.size === 1) {
      // 해가 유일한 경우
      const firstSolution = solutions.values().next().value;
      return Array.from(firstSolution);
    }
    
    // 정보 이득이 최대인 추측 찾기
    const candidates: number[] = [];
    const probMap = new Map<number, number>();
    
    // 각 키워드의 확률 계산
    solutions.forEach(solution => {
      solution.forEach(keyword => {
        probMap.set(keyword, (probMap.get(keyword) || 0) + 1);
      });
    });
    
    // 확률이 0.3~0.7 사이인 키워드 우선 선택 (불확실성이 높은 것)
    const uncertainKeywords: Array<[number, number]> = [];
    probMap.forEach((count, keyword) => {
      const prob = count / solutions.size;
      if (prob > 0.3 && prob < 0.7) {
        uncertainKeywords.push([keyword, Math.abs(prob - 0.5)]);
      }
    });
    
    // 불확실성이 높은 순으로 정렬
    uncertainKeywords.sort((a, b) => a[1] - b[1]);
    
    // 상위 키워드 선택
    uncertainKeywords.slice(0, context.gameState.answerCount).forEach(([keyword]) => {
      candidates.push(keyword);
    });
    
    // 부족한 경우 확률이 높은 키워드로 채우기
    if (candidates.length < context.gameState.answerCount) {
      const highProbKeywords: Array<[number, number]> = [];
      probMap.forEach((count, keyword) => {
        if (!candidates.includes(keyword)) {
          highProbKeywords.push([keyword, count]);
        }
      });
      
      highProbKeywords.sort((a, b) => b[1] - a[1]);
      
      while (candidates.length < context.gameState.answerCount && highProbKeywords.length > 0) {
        candidates.push(highProbKeywords.shift()![0]);
      }
    }
    
    return candidates;
  }
  
  private computeConfidence(solutions: Set<Set<number>>, certainCount: number): number {
    if (solutions.size === 0) return 0;
    if (solutions.size === 1) return 1;
    
    // 해의 개수와 확실한 정답 개수를 기반으로 신뢰도 계산
    const solutionFactor = Math.min(1, 10 / solutions.size);
    const certaintyFactor = certainCount / this.answerCount;
    
    return 0.5 * solutionFactor + 0.5 * certaintyFactor;
  }
}