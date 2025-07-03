/**
 * 베이지안 추론 엔진
 * 확률적 접근법을 통해 각 키워드가 정답일 가능성을 계산합니다.
 */

import { InferenceContext, InferenceResult, IInferenceEngine, ProbabilityUpdate } from './types';
import { GuessHistory, GameStateForAI } from '../types/GameTypes';
import { MemoizationCache, InferenceCache } from './MemoizationCache';

interface Prior {
  keyword: number;
  probability: number;
}

export class ProbabilisticInference implements IInferenceEngine {
  private priors: Map<number, number> = new Map();
  private posteriors: Map<number, number> = new Map();
  private cache: InferenceCache;
  
  constructor() {
    this.cache = new InferenceCache();
  }
  
  infer(context: InferenceContext): InferenceResult {
    const { gameState } = context;
    
    // 캐시 키 생성
    const cacheKey = MemoizationCache.generateKey({
      keywords: gameState.keywords.length,
      answers: gameState.answerCount,
      revealed: gameState.revealedAnswers,
      wrong: gameState.revealedWrongAnswers,
      hints: gameState.myHints,
      // 확률적 추론은 최근 추측에 더 민감하므로 최근 5개만 캐시 키에 포함
      recentGuesses: gameState.previousGuesses.slice(-5).map(g => ({
        guess: g.guess,
        correct: g.correctCount
      }))
    });
    
    // 캐시된 결과 확인
    return this.cache.memoizeProbabilistic(cacheKey, () => {
      // 사전 확률 초기화
      this.initializePriors(gameState.keywords.length, gameState);
      
      // 베이지안 업데이트
      this.updateProbabilities(gameState);
      
      // 결과 분석
      const result = this.analyzeResults(gameState);
      
      return result;
    });
  }
  
  reset(): void {
    this.priors.clear();
    this.posteriors.clear();
    this.cache.clear();
  }
  
  private initializePriors(keywordCount: number, gameState: GameStateForAI): void {
    // 균등 사전 확률로 시작
    const baseProbability = gameState.answerCount / keywordCount;
    
    for (let i = 0; i < keywordCount; i++) {
      // 힌트는 정답이 아니므로 확률 0
      if (gameState.myHints.includes(i)) {
        this.priors.set(i, 0);
      }
      // 공개된 정답은 확률 1
      else if (gameState.revealedAnswers.includes(i)) {
        this.priors.set(i, 1);
      }
      // 공개된 오답은 확률 0
      else if (gameState.revealedWrongAnswers.includes(i)) {
        this.priors.set(i, 0);
      }
      // 나머지는 균등 확률
      else {
        this.priors.set(i, baseProbability);
      }
    }
    
    // 사후 확률 초기화
    this.posteriors = new Map(this.priors);
  }
  
  private updateProbabilities(gameState: GameStateForAI): void {
    // 각 추측에 대해 베이지안 업데이트 수행
    gameState.previousGuesses.forEach(guess => {
      this.bayesianUpdate(guess, gameState);
    });
    
    // 정규화
    this.normalizeProbabilities(gameState.answerCount);
  }
  
  private bayesianUpdate(guess: GuessHistory, gameState: GameStateForAI): void {
    const { guess: guessedKeywords, correctCount } = guess;
    const guessSize = guessedKeywords.length;
    
    // 추측에 포함된 키워드와 포함되지 않은 키워드 분리
    const inGuess = new Set(guessedKeywords);
    const notInGuess: number[] = [];
    
    for (let i = 0; i < gameState.keywords.length; i++) {
      if (!inGuess.has(i)) {
        notInGuess.push(i);
      }
    }
    
    // 각 키워드에 대해 우도(likelihood) 계산
    for (let i = 0; i < gameState.keywords.length; i++) {
      const currentProb = this.posteriors.get(i) || 0;
      
      // 이미 확정된 키워드는 업데이트하지 않음
      if (currentProb === 0 || currentProb === 1) continue;
      
      let likelihood: number;
      
      if (inGuess.has(i)) {
        // 키워드가 추측에 포함된 경우
        likelihood = this.calculateLikelihoodInGuess(
          i, guessedKeywords, correctCount, gameState
        );
      } else {
        // 키워드가 추측에 포함되지 않은 경우
        likelihood = this.calculateLikelihoodNotInGuess(
          i, guessedKeywords, correctCount, gameState
        );
      }
      
      // 베이즈 정리: P(A|B) = P(B|A) * P(A) / P(B)
      const updatedProb = likelihood * currentProb;
      this.posteriors.set(i, updatedProb);
    }
  }
  
  private calculateLikelihoodInGuess(
    keyword: number,
    guessedKeywords: number[],
    correctCount: number,
    gameState: GameStateForAI
  ): number {
    // P(correctCount | keyword가 정답)
    const otherKeywordsInGuess = guessedKeywords.filter(k => k !== keyword);
    
    // 다른 키워드들 중에서 정답일 확률의 합
    let expectedOtherCorrect = 0;
    otherKeywordsInGuess.forEach(k => {
      expectedOtherCorrect += this.posteriors.get(k) || 0;
    });
    
    // 이 키워드가 정답이라면, 나머지에서 (correctCount - 1)개가 정답이어야 함
    const targetOtherCorrect = correctCount - 1;
    
    // 정규분포 근사를 사용한 우도 계산
    const variance = this.calculateVariance(otherKeywordsInGuess);
    const likelihood = this.gaussianPDF(
      targetOtherCorrect,
      expectedOtherCorrect,
      Math.sqrt(variance)
    );
    
    return likelihood;
  }
  
  private calculateLikelihoodNotInGuess(
    keyword: number,
    guessedKeywords: number[],
    correctCount: number,
    gameState: GameStateForAI
  ): number {
    // P(correctCount | keyword가 정답이 아님)
    let expectedCorrect = 0;
    guessedKeywords.forEach(k => {
      expectedCorrect += this.posteriors.get(k) || 0;
    });
    
    // 이 키워드가 정답이 아니라면, 추측에서 correctCount개가 정답이어야 함
    const variance = this.calculateVariance(guessedKeywords);
    const likelihood = this.gaussianPDF(
      correctCount,
      expectedCorrect,
      Math.sqrt(variance)
    );
    
    return likelihood;
  }
  
  private calculateVariance(keywords: number[]): number {
    // 이항분포의 분산 계산
    let variance = 0;
    keywords.forEach(k => {
      const p = this.posteriors.get(k) || 0;
      variance += p * (1 - p);
    });
    return Math.max(0.1, variance); // 최소 분산값 설정
  }
  
  private gaussianPDF(x: number, mean: number, stdDev: number): number {
    // 정규분포 확률밀도함수
    const diff = x - mean;
    const exponent = -(diff * diff) / (2 * stdDev * stdDev);
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    return coefficient * Math.exp(exponent);
  }
  
  private normalizeProbabilities(answerCount: number): void {
    // 전체 확률의 합이 정답 개수와 같도록 정규화
    let totalProb = 0;
    this.posteriors.forEach(prob => {
      totalProb += prob;
    });
    
    if (totalProb > 0) {
      const normalizationFactor = answerCount / totalProb;
      this.posteriors.forEach((prob, keyword) => {
        this.posteriors.set(keyword, prob * normalizationFactor);
      });
    }
  }
  
  private analyzeResults(gameState: GameStateForAI): InferenceResult {
    const certainAnswers = new Set<number>();
    const certainWrongs = new Set<number>();
    const probabilities = new Map<number, number>();
    
    // 확률 임계값
    const CERTAIN_THRESHOLD = 0.95;
    const IMPOSSIBLE_THRESHOLD = 0.05;
    
    this.posteriors.forEach((prob, keyword) => {
      // 확률 제한 (0~1)
      const clampedProb = Math.max(0, Math.min(1, prob));
      probabilities.set(keyword, clampedProb);
      
      if (clampedProb >= CERTAIN_THRESHOLD) {
        certainAnswers.add(keyword);
      } else if (clampedProb <= IMPOSSIBLE_THRESHOLD) {
        certainWrongs.add(keyword);
      }
    });
    
    // 최적 추측 계산
    const optimalGuess = this.computeOptimalGuess(probabilities, gameState);
    
    // 신뢰도 계산
    const confidence = this.computeConfidence(probabilities, gameState);
    
    return {
      probabilities,
      certainAnswers,
      certainWrongs,
      optimalGuess,
      confidence
    };
  }
  
  private computeOptimalGuess(
    probabilities: Map<number, number>,
    gameState: GameStateForAI
  ): number[] {
    // 확률 기반 최적 추측 계산
    const candidates: Array<[number, number]> = [];
    
    probabilities.forEach((prob, keyword) => {
      // 이미 공개된 정답이나 오답은 제외
      if (!gameState.revealedAnswers.includes(keyword) &&
          !gameState.revealedWrongAnswers.includes(keyword)) {
        candidates.push([keyword, prob]);
      }
    });
    
    // 확률이 높은 순으로 정렬
    candidates.sort((a, b) => b[1] - a[1]);
    
    // 정보 이득을 고려한 선택
    const selected: number[] = [];
    const targetCount = gameState.answerCount;
    
    // 먼저 확실한 정답 선택
    gameState.revealedAnswers.forEach(ans => selected.push(ans));
    
    // 높은 확률의 키워드 선택
    for (const [keyword, prob] of candidates) {
      if (selected.length >= targetCount) break;
      
      // 확률이 0.7 이상이면 선택
      if (prob >= 0.7) {
        selected.push(keyword);
      }
    }
    
    // 부족한 경우 정보 이득이 높은 키워드 선택 (확률이 0.4~0.6인 것)
    if (selected.length < targetCount) {
      const uncertainCandidates = candidates
        .filter(([k, p]) => p >= 0.4 && p <= 0.6 && !selected.includes(k))
        .sort((a, b) => Math.abs(a[1] - 0.5) - Math.abs(b[1] - 0.5));
      
      for (const [keyword] of uncertainCandidates) {
        if (selected.length >= targetCount) break;
        selected.push(keyword);
      }
    }
    
    // 그래도 부족하면 나머지 높은 확률 키워드로 채우기
    if (selected.length < targetCount) {
      for (const [keyword] of candidates) {
        if (selected.length >= targetCount) break;
        if (!selected.includes(keyword)) {
          selected.push(keyword);
        }
      }
    }
    
    return selected;
  }
  
  private computeConfidence(
    probabilities: Map<number, number>,
    gameState: GameStateForAI
  ): number {
    // 확률 분포의 엔트로피를 기반으로 신뢰도 계산
    let entropy = 0;
    let maxProb = 0;
    let highProbCount = 0;
    
    probabilities.forEach(prob => {
      if (prob > 0 && prob < 1) {
        entropy -= prob * Math.log2(prob) + (1 - prob) * Math.log2(1 - prob);
      }
      maxProb = Math.max(maxProb, prob);
      if (prob >= 0.7) highProbCount++;
    });
    
    // 엔트로피가 낮을수록 확신이 높음
    const maxEntropy = gameState.keywords.length;
    const entropyFactor = 1 - (entropy / maxEntropy);
    
    // 높은 확률을 가진 키워드 비율
    const highProbFactor = highProbCount / gameState.answerCount;
    
    // 종합 신뢰도
    const confidence = 0.6 * entropyFactor + 0.4 * highProbFactor;
    
    return Math.max(0, Math.min(1, confidence));
  }
}