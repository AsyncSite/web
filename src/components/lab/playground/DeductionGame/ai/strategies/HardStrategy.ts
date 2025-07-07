import { BaseStrategy } from './BaseStrategy';
import { GameStateForAI, GuessHistory } from '../types/GameTypes';

export class HardStrategy extends BaseStrategy {
  selectKeywords(gameState: GameStateForAI): number[] {
    // 기본 전략 실행
    const baseResult = super.selectKeywords(gameState);

    // Hard AI 전용: 고급 추론 모드
    const optimizedResult = this.advancedReasoning(gameState, baseResult);

    return optimizedResult;
  }

  private advancedReasoning(gameState: GameStateForAI, baseGuess: number[]): number[] {
    const { keywords, answerCount, previousGuesses, revealedAnswers } = gameState;

    // 이미 충분한 정답을 알고 있으면 그대로 반환
    if (revealedAnswers.length >= answerCount) {
      return baseGuess;
    }

    // 남은 정답 개수가 적을 때 특별 알고리즘 발동
    const remainingAnswers = answerCount - revealedAnswers.length;
    if (remainingAnswers <= 3) {
      // 가능한 모든 조합을 시뮬레이션
      const optimizedGuess = this.findOptimalCombination(gameState);
      if (optimizedGuess.length > 0) {
        return optimizedGuess;
      }
    }

    // 추가 교집합/차집합 분석
    const refinedGuess = this.refineWithSetAnalysis(gameState, baseGuess);

    return refinedGuess;
  }

  private findOptimalCombination(gameState: GameStateForAI): number[] {
    const {
      keywords,
      answerCount,
      previousGuesses,
      revealedAnswers,
      revealedWrongAnswers,
      myHints,
      revealedOtherHints,
    } = gameState;

    // 확실한 오답 수집
    const definiteWrongs = new Set<number>([...revealedWrongAnswers, ...myHints]);

    // 공개된 다른 플레이어의 힌트도 오답
    if (revealedOtherHints) {
      revealedOtherHints.forEach(({ hints }) => {
        hints.forEach((h) => definiteWrongs.add(h));
      });
    }

    // 과거 추측에서 확실한 오답 추가
    previousGuesses.forEach((guess) => {
      if (guess.correctCount === 0) {
        guess.guess.forEach((idx) => definiteWrongs.add(idx));
      }
    });

    // 가능한 후보들
    const possibleIndices: number[] = [];
    for (let i = 0; i < keywords.length; i++) {
      if (!definiteWrongs.has(i) && !revealedAnswers.includes(i)) {
        possibleIndices.push(i);
      }
    }

    // 가능한 조합이 적으면 모든 조합 검증
    const remainingSlots = answerCount - revealedAnswers.length;
    if (possibleIndices.length <= 15 && remainingSlots <= 3) {
      // 모든 조합 생성 및 검증
      const validCombinations = this.findValidCombinations(
        possibleIndices,
        remainingSlots,
        revealedAnswers,
        previousGuesses,
      );

      if (validCombinations.length === 1) {
        // 유일한 해를 찾음!
        console.log('[Hard AI] 유일한 정답 조합 발견!');
        return [...revealedAnswers, ...validCombinations[0]];
      } else if (validCombinations.length > 1) {
        // 여러 가능성이 있을 때 가장 확률 높은 것 선택
        console.log(`[Hard AI] ${validCombinations.length}개의 가능한 조합 중 최적 선택`);
        return [...revealedAnswers, ...validCombinations[0]];
      }
    }

    return [];
  }

  private findValidCombinations(
    candidates: number[],
    slots: number,
    knownAnswers: number[],
    previousGuesses: GuessHistory[],
  ): number[][] {
    const validCombinations: number[][] = [];

    // 조합 생성 함수
    const generateCombinations = (start: number, current: number[]): void => {
      if (current.length === slots) {
        // 이 조합이 모든 과거 추측과 일치하는지 검증
        const testAnswer = [...knownAnswers, ...current];
        if (this.isValidHypothesis(testAnswer, previousGuesses)) {
          validCombinations.push([...current]);
        }
        return;
      }

      for (let i = start; i < candidates.length; i++) {
        current.push(candidates[i]);
        generateCombinations(i + 1, current);
        current.pop();
      }
    };

    generateCombinations(0, []);
    return validCombinations;
  }

  private isValidHypothesis(hypothesis: number[], guesses: GuessHistory[]): boolean {
    const hypothesisSet = new Set(hypothesis);

    for (const guess of guesses) {
      const correctInGuess = guess.guess.filter((g) => hypothesisSet.has(g)).length;
      if (correctInGuess !== guess.correctCount) {
        return false;
      }
    }

    return true;
  }

  private refineWithSetAnalysis(gameState: GameStateForAI, currentGuess: number[]): number[] {
    const { previousGuesses, answerCount } = gameState;

    // 이전 추측들의 교집합/차집합 분석으로 확실한 정답 찾기
    const confirmedAnswers = new Set<number>();

    // 높은 정답률을 가진 추측들의 교집합 분석
    const highScoreGuesses = previousGuesses.filter((g) => g.correctCount >= answerCount * 0.6);

    if (highScoreGuesses.length >= 2) {
      // 교집합에서 공통으로 나타나는 키워드 찾기
      const firstGuessSet = new Set(highScoreGuesses[0].guess);
      let intersection = [...firstGuessSet];

      for (let i = 1; i < highScoreGuesses.length; i++) {
        intersection = intersection.filter((idx) => highScoreGuesses[i].guess.includes(idx));
      }

      // 교집합 크기가 적절하면 신뢰
      if (intersection.length > 0 && intersection.length <= answerCount) {
        intersection.forEach((idx) => confirmedAnswers.add(idx));
        console.log(`[Hard AI] 교집합 분석으로 ${intersection.length}개 정답 후보 발견`);
      }
    }

    // 확실한 정답을 우선 포함
    const refinedGuess = [...confirmedAnswers];

    // 나머지는 기존 추측에서 채움
    for (const idx of currentGuess) {
      if (refinedGuess.length >= answerCount) break;
      if (!refinedGuess.includes(idx)) {
        refinedGuess.push(idx);
      }
    }

    return refinedGuess;
  }

  getStrategyName(): string {
    return 'Hard AI';
  }

  getDescription(): string {
    return '고급 추론과 완전 탐색을 통해 최적의 답을 찾습니다.';
  }
}
