/**
 * 게임 단계별 전략적 계획 수립
 */

import { GameStateForAI } from '../types/GameTypes';
import { GamePhase, StrategicRecommendation } from './types';
import {
  getGamePhase,
  calculateExpectedInfoGain,
  calculateRiskLevel,
  calculateDiversityScore,
  analyzePlayerPattern,
} from './InferenceUtils';

export class StrategicPlanning {
  /**
   * 현재 게임 상태에 맞는 전략적 추천 생성
   */
  static generateRecommendation(
    gameState: GameStateForAI,
    probabilities: Map<number, number>,
  ): StrategicRecommendation {
    const phase = getGamePhase(gameState.currentTurn, gameState.maxTurns);

    switch (phase) {
      case 'early':
        return this.earlyGameStrategy(gameState, probabilities);
      case 'middle':
        return this.midGameStrategy(gameState, probabilities);
      case 'late':
        return this.lateGameStrategy(gameState, probabilities);
    }
  }

  /**
   * 초반 전략: 정보 수집 최대화
   */
  private static earlyGameStrategy(
    gameState: GameStateForAI,
    probabilities: Map<number, number>,
  ): StrategicRecommendation {
    // 불확실성이 높은 키워드 선택 (정보 이득 최대화)
    const candidates: Array<[number, number]> = [];

    probabilities.forEach((prob, keyword) => {
      if (
        !gameState.revealedWrongAnswers.includes(keyword) &&
        !gameState.myHints.includes(keyword)
      ) {
        // 0.3~0.7 범위의 확률을 가진 키워드가 정보 이득이 높음
        const uncertainty = 1 - Math.abs(prob * 2 - 1);
        candidates.push([keyword, uncertainty]);
      }
    });

    // 불확실성이 높은 순으로 정렬
    candidates.sort((a, b) => b[1] - a[1]);

    // 다양성도 고려
    const diverseGuess = this.selectDiverseKeywords(
      candidates.map((c) => c[0]),
      gameState,
      probabilities,
    );

    const expectedGain = calculateExpectedInfoGain(
      probabilities,
      diverseGuess,
      gameState.answerCount,
    );

    return {
      guess: diverseGuess,
      reason: '정보 수집을 위한 다양한 키워드 탐색',
      expectedInfoGain: expectedGain,
      riskLevel: 0.5, // 중간 리스크
    };
  }

  /**
   * 중반 전략: 균형잡힌 접근
   */
  private static midGameStrategy(
    gameState: GameStateForAI,
    probabilities: Map<number, number>,
  ): StrategicRecommendation {
    // 확률과 정보 이득의 균형
    const candidates: Array<[number, number, number]> = []; // [keyword, prob, score]

    probabilities.forEach((prob, keyword) => {
      if (
        !gameState.revealedWrongAnswers.includes(keyword) &&
        !gameState.myHints.includes(keyword) &&
        !gameState.revealedAnswers.includes(keyword)
      ) {
        // 기본 점수는 확률
        let score = prob;

        // 중간 확률(0.4~0.6)인 경우 보너스
        if (prob >= 0.4 && prob <= 0.6) {
          score += 0.1;
        }

        // 이전에 자주 나온 키워드는 약간 감점 (다양성)
        const frequency = gameState.previousGuesses.filter((g) => g.guess.includes(keyword)).length;
        score -= frequency * 0.02;

        candidates.push([keyword, prob, score]);
      }
    });

    // 점수 순으로 정렬
    candidates.sort((a, b) => b[2] - a[2]);

    // 상위 키워드 선택
    const selected: number[] = [...gameState.revealedAnswers];
    for (const [keyword] of candidates) {
      if (selected.length >= gameState.answerCount) break;
      selected.push(keyword);
    }

    const riskLevel = calculateRiskLevel(selected, probabilities);
    const expectedGain = calculateExpectedInfoGain(probabilities, selected, gameState.answerCount);

    return {
      guess: selected,
      reason: '확률과 정보 획득의 균형을 고려한 선택',
      expectedInfoGain: expectedGain,
      riskLevel,
    };
  }

  /**
   * 후반 전략: 확실한 정답 추구
   */
  private static lateGameStrategy(
    gameState: GameStateForAI,
    probabilities: Map<number, number>,
  ): StrategicRecommendation {
    // 높은 확률 위주로 안전하게
    const candidates: Array<[number, number]> = [];

    probabilities.forEach((prob, keyword) => {
      if (
        !gameState.revealedWrongAnswers.includes(keyword) &&
        !gameState.myHints.includes(keyword)
      ) {
        candidates.push([keyword, prob]);
      }
    });

    // 확률 높은 순으로 정렬
    candidates.sort((a, b) => b[1] - a[1]);

    // 확실한 것부터 선택
    const selected: number[] = [...gameState.revealedAnswers];
    const threshold = this.calculateDynamicThreshold(gameState);

    // 임계값 이상의 확률을 가진 키워드 우선 선택
    for (const [keyword, prob] of candidates) {
      if (selected.length >= gameState.answerCount) break;
      if (prob >= threshold) {
        selected.push(keyword);
      }
    }

    // 부족하면 차선책
    if (selected.length < gameState.answerCount) {
      for (const [keyword] of candidates) {
        if (selected.length >= gameState.answerCount) break;
        if (!selected.includes(keyword)) {
          selected.push(keyword);
        }
      }
    }

    const riskLevel = calculateRiskLevel(selected, probabilities);

    return {
      guess: selected,
      reason: '높은 확률의 안전한 선택',
      expectedInfoGain: 0, // 후반에는 정보 이득보다 정확도가 중요
      riskLevel,
    };
  }

  /**
   * 다양성을 고려한 키워드 선택
   */
  private static selectDiverseKeywords(
    candidates: number[],
    gameState: GameStateForAI,
    probabilities: Map<number, number>,
  ): number[] {
    const selected: number[] = [...gameState.revealedAnswers];
    const targetCount = gameState.answerCount;

    // 첫 번째는 최고 점수
    if (candidates.length > 0 && selected.length < targetCount) {
      selected.push(candidates[0]);
    }

    // 나머지는 다양성 고려
    for (let i = 1; i < candidates.length && selected.length < targetCount; i++) {
      const candidate = candidates[i];
      const tempGuess = [...selected, candidate];

      const diversity = calculateDiversityScore(tempGuess, gameState.previousGuesses);

      // 다양성이 일정 수준 이상이면 선택
      if (diversity >= 0.3) {
        selected.push(candidate);
      }
    }

    // 부족하면 나머지 채우기
    for (const candidate of candidates) {
      if (selected.length >= targetCount) break;
      if (!selected.includes(candidate)) {
        selected.push(candidate);
      }
    }

    return selected;
  }

  /**
   * 동적 임계값 계산 (게임 상황에 따라 조정)
   */
  private static calculateDynamicThreshold(gameState: GameStateForAI): number {
    const remainingTurns = gameState.maxTurns ? gameState.maxTurns - gameState.currentTurn : 10; // 기본값

    const foundAnswers = gameState.revealedAnswers.length;
    const remainingAnswers = gameState.answerCount - foundAnswers;

    // 남은 턴이 적거나 찾아야 할 정답이 많으면 임계값 낮춤
    if (remainingTurns <= 3 || remainingAnswers >= 3) {
      return 0.5;
    } else if (remainingTurns <= 5) {
      return 0.6;
    } else {
      return 0.7;
    }
  }

  /**
   * 상대 플레이어 분석 기반 전략 조정
   */
  static adjustStrategyForOpponents(
    recommendation: StrategicRecommendation,
    gameState: GameStateForAI,
  ): StrategicRecommendation {
    // 플레이어별 패턴 분석
    const playerPatterns = new Map<number, ReturnType<typeof analyzePlayerPattern>>();

    const guessesByPlayer = new Map<number, typeof gameState.previousGuesses>();
    gameState.previousGuesses.forEach((guess) => {
      if (!guessesByPlayer.has(guess.playerId)) {
        guessesByPlayer.set(guess.playerId, []);
      }
      guessesByPlayer.get(guess.playerId)!.push(guess);
    });

    guessesByPlayer.forEach((guesses, playerId) => {
      playerPatterns.set(playerId, analyzePlayerPattern(guesses));
    });

    // 다른 플레이어들의 평균 성공률
    let avgOpponentSuccess = 0;
    let opponentCount = 0;

    playerPatterns.forEach((pattern, playerId) => {
      // 자신이 아닌 플레이어만 고려
      if (playerId !== 0) {
        // 0은 보통 자신의 ID
        avgOpponentSuccess += pattern.avgCorrectRate;
        opponentCount++;
      }
    });

    if (opponentCount > 0) {
      avgOpponentSuccess /= opponentCount;

      // 상대가 잘하고 있으면 더 공격적으로
      if (avgOpponentSuccess > 0.6) {
        return {
          ...recommendation,
          reason: recommendation.reason + ' (경쟁 상황 고려)',
          riskLevel: Math.min(1, recommendation.riskLevel * 1.2),
        };
      }
    }

    return recommendation;
  }
}
