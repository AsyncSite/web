import { AIStrategy } from './AIStrategy';
import { GameStateForAI } from '../types/GameTypes';

export class EasyStrategy implements AIStrategy {
  selectKeywords(gameState: GameStateForAI): number[] {
    const { keywords, revealedAnswers, revealedWrongAnswers, answerCount, previousGuesses, myHints } = gameState;

    // 1. 점수 맵 초기화
    const scores = new Map<number, number>();
    for (let i = 0; i < keywords.length; i++) {
      scores.set(i, 0);
    }

    // 2. 추측 기록을 바탕으로 점수 계산
    previousGuesses.forEach(guess => {
      const { guess: guessedIndices, correctCount } = guess;
      
      if (correctCount === 0) {
        // 정답이 하나도 없는 경우, 해당 키워드들은 오답일 확률이 높음
        guessedIndices.forEach(idx => {
          scores.set(idx, (scores.get(idx) || 0) - 5); // 큰 음수 점수 부여
        });
      } else {
        // 정답이 있는 경우, 포함된 키워드들에 점수 부여
        const points = correctCount / guessedIndices.length; // 정답률에 기반한 점수
        guessedIndices.forEach(idx => {
          scores.set(idx, (scores.get(idx) || 0) + points);
        });
      }
    });

    // 3. 사용 불가능한 키워드 제외
    const excludedIndices = new Set([...revealedWrongAnswers, ...myHints]);
    excludedIndices.forEach(idx => {
      scores.delete(idx);
    });

    // 4. 최종 후보 선정
    const selected = [...revealedAnswers];
    
    // 점수가 높은 순으로 후보 정렬
    const candidates = Array.from(scores.entries())
      .filter(([idx]) => !selected.includes(idx) && !excludedIndices.has(idx))
      .sort((a, b) => b[1] - a[1]);

    // 5. 정답 개수만큼 선택
    const needed = answerCount - selected.length;
    if (needed > 0) {
      // 상위 후보 그룹에서 약간의 무작위성을 섞어 선택
      const topCandidates = candidates.slice(0, Math.max(needed * 2, 10));
      const shuffledTop = [...topCandidates].sort(() => Math.random() - 0.5);
      
      shuffledTop.slice(0, needed).forEach(candidate => {
        selected.push(candidate[0]);
      });
    }
    
    // 만약 수가 부족하면 나머지에서 랜덤으로 채움
    if (selected.length < answerCount) {
        const remainingCandidates = candidates.filter(c => !selected.includes(c[0]));
        const stillNeeded = answerCount - selected.length;
        remainingCandidates.slice(0, stillNeeded).forEach(candidate => {
            selected.push(candidate[0]);
        });
    }

    return selected;
  }

  getStrategyName(): string {
    return 'Easy AI';
  }

  getDescription(): string {
    return '과거 추측의 정답률을 기반으로 키워드 점수를 매겨 추측합니다.';
  }
}
