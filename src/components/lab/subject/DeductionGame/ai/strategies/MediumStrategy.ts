import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';

export class MediumStrategy implements AIStrategy {
  selectKeywords(gameState: GameStateForAI): number[] {
    const { keywords, revealedAnswers, revealedWrongAnswers, answerCount, previousGuesses, myHints } = gameState;

    const scores = new Map<number, number>();
    for (let i = 0; i < keywords.length; i++) {
      scores.set(i, 0);
    }

    // 1. 기본 점수 계산
    previousGuesses.forEach(guess => {
      const { guess: guessedIndices, correctCount } = guess;
      const points = correctCount > 0 ? correctCount / guessedIndices.length : -1;
      guessedIndices.forEach(idx => {
        scores.set(idx, (scores.get(idx) || 0) + points);
      });
    });

    // 2. 추측 비교를 통한 고급 추론
    for (let i = 0; i < previousGuesses.length; i++) {
      for (let j = i + 1; j < previousGuesses.length; j++) {
        const guessA = previousGuesses[i];
        const guessB = previousGuesses[j];

        const setA = new Set(guessA.guess);
        const setB = new Set(guessB.guess);

        const diffA = guessA.guess.filter(x => !setB.has(x));
        const diffB = guessB.guess.filter(x => !setA.has(x));
        const correctDiff = guessA.correctCount - guessB.correctCount;

        // Case 1: 결정적 단서 (1:1 차이)
        if (diffA.length === 1 && diffB.length === 1) {
          const keywordA = diffA[0];
          const keywordB = diffB[0];
          if (correctDiff === 1) {
            scores.set(keywordA, (scores.get(keywordA) || 0) + 10); // A는 정답 확정
            scores.set(keywordB, (scores.get(keywordB) || 0) - 10); // B는 오답 확정
          } else if (correctDiff === -1) {
            scores.set(keywordB, (scores.get(keywordB) || 0) + 10);
            scores.set(keywordA, (scores.get(keywordA) || 0) - 10);
          }
        }
        // Case 2: 강력한 힌트 (N:M 차이)
        else if (diffA.length > 0 && diffB.length > 0 && Math.abs(correctDiff) > 0) {
            // {D, E} 그룹이 {F, G} 그룹보다 정답이 N개 더 많다.
            // 이 정보의 신뢰도 = 정답 차이 / 키워드 차이의 합
            const hintStrength = Math.abs(correctDiff) / (diffA.length + diffB.length);
            const bonusPoints = 3 * hintStrength; // 신뢰도에 비례한 보너스

            if (correctDiff > 0) { // diffA 그룹이 더 정답에 가까움
                diffA.forEach(idx => scores.set(idx, (scores.get(idx) || 0) + bonusPoints));
                diffB.forEach(idx => scores.set(idx, (scores.get(idx) || 0) - bonusPoints));
            } else { // diffB 그룹이 더 정답에 가까움
                diffB.forEach(idx => scores.set(idx, (scores.get(idx) || 0) + bonusPoints));
                diffA.forEach(idx => scores.set(idx, (scores.get(idx) || 0) - bonusPoints));
            }
        }
      }
    }

    const excludedIndices = new Set([...revealedWrongAnswers, ...myHints, ...revealedAnswers]);
    excludedIndices.forEach(idx => {
      scores.delete(idx);
    });

    const candidates = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);

    const selected = [...revealedAnswers];
    const needed = answerCount - selected.length;

    if (needed > 0) {
        const finalCandidates = candidates.map(c => c[0]).filter(idx => !selected.includes(idx));
        selected.push(...finalCandidates.slice(0, needed));
    }

    // 최종 선택지가 부족할 경우, 제외되지 않은 키워드 중에서 무작위로 추가
    if (selected.length < answerCount) {
        const allIndices = Array.from({length: keywords.length}, (_, i) => i);
        const remainingCandidates = allIndices.filter(idx => !excludedIndices.has(idx) && !selected.includes(idx));
        const shuffled = remainingCandidates.sort(() => Math.random() - 0.5);
        const stillNeeded = answerCount - selected.length;
        selected.push(...shuffled.slice(0, stillNeeded));
    }

    return selected;
  }

  getStrategyName(): string {
    return 'Medium AI';
  }

  getDescription(): string {
    return '추측들을 정교하게 비교하여 논리적인 단서를 찾고, 이를 기반으로 추측합니다.';
  }
}
