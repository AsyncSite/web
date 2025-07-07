/**
 * 추론 관련 유틸리티 함수
 */

import { GuessHistory } from '../types/GameTypes';
import { GamePhase } from './types';

/**
 * 게임 진행 단계 판단
 */
export function getGamePhase(currentTurn: number, maxTurns?: number): GamePhase {
  if (!maxTurns) {
    // 최대 턴이 없는 경우 턴 수로 판단
    if (currentTurn <= 3) return 'early';
    if (currentTurn <= 10) return 'middle';
    return 'late';
  }

  const progress = currentTurn / maxTurns;
  if (progress <= 0.3) return 'early';
  if (progress <= 0.7) return 'middle';
  return 'late';
}

/**
 * 두 추측 간의 교집합 계산
 */
export function getIntersection(guess1: number[], guess2: number[]): number[] {
  const set1 = new Set(guess1);
  return guess2.filter((k) => set1.has(k));
}

/**
 * 두 추측 간의 차집합 계산 (guess1 - guess2)
 */
export function getDifference(guess1: number[], guess2: number[]): number[] {
  const set2 = new Set(guess2);
  return guess1.filter((k) => !set2.has(k));
}

/**
 * 추측 기록에서 특정 키워드가 포함된 추측들 찾기
 */
export function findGuessesWithKeyword(guesses: GuessHistory[], keyword: number): GuessHistory[] {
  return guesses.filter((g) => g.guess.includes(keyword));
}

/**
 * 추측 기록에서 특정 정답 개수를 가진 추측들 찾기
 */
export function findGuessesWithCorrectCount(
  guesses: GuessHistory[],
  correctCount: number,
): GuessHistory[] {
  return guesses.filter((g) => g.correctCount === correctCount);
}

/**
 * 키워드 조합의 정보 엔트로피 계산
 */
export function calculateEntropy(probabilities: Map<number, number>): number {
  let entropy = 0;

  probabilities.forEach((prob) => {
    if (prob > 0 && prob < 1) {
      entropy -= prob * Math.log2(prob) + (1 - prob) * Math.log2(1 - prob);
    }
  });

  return entropy;
}

/**
 * 예상 정보 이득 계산
 */
export function calculateExpectedInfoGain(
  currentProbabilities: Map<number, number>,
  proposedGuess: number[],
  answerCount: number,
): number {
  // 추측에 포함된 키워드들의 확률 합
  let guessProb = 0;
  proposedGuess.forEach((k) => {
    guessProb += currentProbabilities.get(k) || 0;
  });

  // 가능한 정답 개수별 확률 분포 계산
  const outcomes = new Map<number, number>();

  // 간단한 근사: 이항분포 사용
  for (let correct = 0; correct <= Math.min(proposedGuess.length, answerCount); correct++) {
    const prob = binomialProbability(
      proposedGuess.length,
      correct,
      guessProb / proposedGuess.length,
    );
    outcomes.set(correct, prob);
  }

  // 각 결과에 대한 엔트로피 감소 계산
  let expectedGain = 0;
  outcomes.forEach((prob, correctCount) => {
    if (prob > 0) {
      // 이 결과가 나왔을 때의 정보 이득 추정
      const infoGain =
        Math.log2(proposedGuess.length) -
        Math.log2(Math.max(1, proposedGuess.length - correctCount));
      expectedGain += prob * infoGain;
    }
  });

  return expectedGain;
}

/**
 * 이항분포 확률 계산
 */
function binomialProbability(n: number, k: number, p: number): number {
  const coefficient = binomialCoefficient(n, k);
  return coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

/**
 * 이항계수 계산
 */
function binomialCoefficient(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - k + i)) / i;
  }
  return result;
}

/**
 * 추측 조합의 다양성 점수 계산
 */
export function calculateDiversityScore(
  proposedGuess: number[],
  previousGuesses: GuessHistory[],
): number {
  if (previousGuesses.length === 0) return 1;

  let totalOverlap = 0;
  let count = 0;

  previousGuesses.forEach((prev) => {
    const overlap = getIntersection(proposedGuess, prev.guess).length;
    const maxSize = Math.max(proposedGuess.length, prev.guess.length);
    totalOverlap += overlap / maxSize;
    count++;
  });

  // 평균 중복도가 낮을수록 다양성이 높음
  const avgOverlap = totalOverlap / count;
  return 1 - avgOverlap;
}

/**
 * 추측의 위험도 계산
 */
export function calculateRiskLevel(
  proposedGuess: number[],
  probabilities: Map<number, number>,
): number {
  // 낮은 확률의 키워드가 많을수록 위험도가 높음
  let totalRisk = 0;

  proposedGuess.forEach((keyword) => {
    const prob = probabilities.get(keyword) || 0;
    // 확률이 낮을수록 위험도가 높음
    const risk = 1 - prob;
    totalRisk += risk;
  });

  return totalRisk / proposedGuess.length;
}

/**
 * 플레이어별 추측 패턴 분석
 */
export function analyzePlayerPattern(playerGuesses: GuessHistory[]): {
  avgCorrectRate: number;
  consistency: number;
  improvementRate: number;
} {
  if (playerGuesses.length === 0) {
    return { avgCorrectRate: 0, consistency: 0, improvementRate: 0 };
  }

  // 평균 정답률
  const correctRates = playerGuesses.map((g) => g.correctCount / g.guess.length);
  const avgCorrectRate = correctRates.reduce((a, b) => a + b, 0) / correctRates.length;

  // 일관성 (정답률의 표준편차가 낮을수록 일관성이 높음)
  const variance =
    correctRates.reduce((sum, rate) => {
      const diff = rate - avgCorrectRate;
      return sum + diff * diff;
    }, 0) / correctRates.length;
  const stdDev = Math.sqrt(variance);
  const consistency = 1 - Math.min(1, stdDev);

  // 개선율 (시간에 따른 정답률 향상)
  let improvementRate = 0;
  if (playerGuesses.length >= 2) {
    const firstHalf = correctRates.slice(0, Math.floor(correctRates.length / 2));
    const secondHalf = correctRates.slice(Math.floor(correctRates.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    improvementRate = Math.max(0, secondAvg - firstAvg);
  }

  return { avgCorrectRate, consistency, improvementRate };
}

/**
 * 최적 추측 조합 생성 (그리디 알고리즘)
 */
export function generateOptimalGuess(
  probabilities: Map<number, number>,
  answerCount: number,
  constraints: {
    mustInclude: number[];
    mustExclude: number[];
    previousGuesses: GuessHistory[];
  },
): number[] {
  const candidates: Array<[number, number]> = [];

  // 후보 키워드 수집
  probabilities.forEach((prob, keyword) => {
    if (!constraints.mustExclude.includes(keyword)) {
      candidates.push([keyword, prob]);
    }
  });

  // 확률 순으로 정렬
  candidates.sort((a, b) => b[1] - a[1]);

  const selected: number[] = [...constraints.mustInclude];

  // 정보 이득과 확률을 고려한 선택
  for (const [keyword, prob] of candidates) {
    if (selected.length >= answerCount) break;
    if (selected.includes(keyword)) continue;

    // 다양성 점수 계산
    const tempGuess = [...selected, keyword];
    const diversity = calculateDiversityScore(tempGuess, constraints.previousGuesses);

    // 종합 점수 (확률 70%, 다양성 30%)
    const score = 0.7 * prob + 0.3 * diversity;

    // 점수가 임계값 이상이면 선택
    if (score >= 0.5 || selected.length < answerCount - candidates.length + 1) {
      selected.push(keyword);
    }
  }

  return selected;
}
