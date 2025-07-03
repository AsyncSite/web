import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';
import { MediumStrategy } from './MediumStrategy'; // 폴백 전략으로 사용

export class HardStrategy implements AIStrategy {
  private fallbackStrategy: AIStrategy;

  constructor() {
    // Hard 전략 실패 시 Medium 전략을 사용
    this.fallbackStrategy = new MediumStrategy();
  }

  selectKeywords(gameState: GameStateForAI): number[] {
    const { keywords, answerCount, previousGuesses, revealedAnswers, revealedWrongAnswers, myHints } = gameState;

    // 1. 모든 제약조건을 만족하는 정답 후보(가설) 찾기
    const validHypotheses = this.findValidHypotheses(gameState);

    // 2. 상황에 따른 최종 추측 결정
    if (validHypotheses.length === 1) {
      // 정답을 찾은 경우: 유일한 후보를 제출
      console.log('Hard AI: 정답을 찾았습니다!', validHypotheses[0]);
      return validHypotheses[0];
    } else if (validHypotheses.length > 1) {
      // 여러 후보가 있는 경우: 정보 이득이 가장 큰 추측을 선택 (여기서는 첫번째 후보 선택으로 단순화)
      console.log(`Hard AI: ${validHypotheses.length}개의 후보를 찾았습니다.`, validHypotheses);
      return validHypotheses[0];
    } else {
      // 후보를 찾지 못한 경우: Medium 전략으로 폴백
      console.log('Hard AI: 후보를 찾지 못해 Medium 전략으로 전환합니다.');
      return this.fallbackStrategy.selectKeywords(gameState);
    }
  }

  private findValidHypotheses(gameState: GameStateForAI): number[][] {
    const { keywords, answerCount, previousGuesses, revealedAnswers, revealedWrongAnswers, myHints } = gameState;
    const startTime = Date.now();

    // CSP(제약 만족 문제)의 변수 도메인 설정
    const mustBeAnswers = new Set(revealedAnswers);
    const mustBeWrongs = new Set([...revealedWrongAnswers, ...myHints]);

    // Medium 전략을 사용하여 가능성 높은 후보군 추리기 (계산량 감소)
    const mediumStrategy = new MediumStrategy();
    const mediumGuess = mediumStrategy.selectKeywords(gameState);
    const combinedArray = Array.from(mustBeAnswers).concat(mediumGuess);
    const potentialCandidates = new Set(combinedArray);
    
    const searchSpace = Array.from(potentialCandidates).filter(idx => !mustBeWrongs.has(idx));

    const validHypotheses: number[][] = [];

    // 조합 생성 및 검증 함수
    const findCombinations = (startIndex: number, currentCombo: number[]) => {
      // 시간 초과 방지
      if (Date.now() - startTime > 500) return;
      if (validHypotheses.length > 10) return; // 너무 많은 후보가 나오면 탐색 중지

      if (currentCombo.length === answerCount) {
        // 가설이 생성되면 모든 제약조건(과거 추측)을 만족하는지 검증
        if (this.validateHypothesis(currentCombo, previousGuesses)) {
          validHypotheses.push([...currentCombo]);
        }
        return;
      }

      if (startIndex >= searchSpace.length) return;

      // 현재 키워드를 포함하는 경우
      currentCombo.push(searchSpace[startIndex]);
      findCombinations(startIndex + 1, currentCombo);
      currentCombo.pop();

      // 현재 키워드를 포함하지 않는 경우
      // 남은 키워드 수로 정답을 채울 수 있는지 확인 (가지치기)
      if (searchSpace.length - (startIndex + 1) >= answerCount - currentCombo.length) {
        findCombinations(startIndex + 1, currentCombo);
      }
    };

    findCombinations(0, []);
    return validHypotheses;
  }

  /**
   * 주어진 가설이 모든 과거 추측(제약조건)과 일치하는지 검증
   * @param hypothesis - 검증할 정답 후보 배열 (예: [1, 5, 8, 12, 15])
   * @param guesses - 과거 모든 추측 기록
   */
  private validateHypothesis(hypothesis: number[], guesses: GameStateForAI['previousGuesses']): boolean {
    const hypothesisSet = new Set(hypothesis);

    for (const guess of guesses) {
      const intersectionSize = guess.guess.filter(g => hypothesisSet.has(g)).length;
      if (intersectionSize !== guess.correctCount) {
        // 단 하나의 추측이라도 모순되면, 이 가설은 유효하지 않음
        return false;
      }
    }
    // 모든 추측과 일치하면 유효한 가설
    return true;
  }

  getStrategyName(): string {
    return 'Hard AI';
  }

  getDescription(): string {
    return '과거의 모든 추측을 논리적 제약조건으로 사용하여, 이를 만족하는 정답 후보를 찾아냅니다.';
  }
}
