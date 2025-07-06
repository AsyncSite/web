import { AIStrategy } from './AIStrategy';
import { GameStateForAI, GuessHistory } from '../types/GameTypes';

export abstract class BaseStrategy implements AIStrategy {
  private previousExactGuesses: Set<string> = new Set();
  
  selectKeywords(gameState: GameStateForAI): number[] {

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
    

    // 2. 이전 추측 분석으로 추가 정보 획득
    this.analyzeAllGuesses(gameState, definiteAnswers, definiteWrongs);
    
    // 3. 선택 가능한 키워드 목록 생성
    const possibleKeywords: number[] = [];
    for (let i = 0; i < gameState.keywords.length; i++) {
      if (!definiteWrongs.has(i)) {
        possibleKeywords.push(i);
      }
    }
    
    console.log(`확실한 정답: ${definiteAnswers.size}개`);
    console.log(`확실한 오답: ${definiteWrongs.size}개`);
    console.log(`선택 가능한 키워드: ${possibleKeywords.length}개`);
    
    // 4. 이미 충분한 정답을 아는 경우
    if (definiteAnswers.size >= gameState.answerCount) {
      console.log('모든 정답을 알고 있음! 게임 종료!');
      return Array.from(definiteAnswers).slice(0, gameState.answerCount);
    }
    
    // 5. 각 키워드의 점수 계산
    const scores = this.calculateScores(gameState, possibleKeywords, definiteAnswers, definiteWrongs);
    
    // 6. 최종 추측 구성
    let finalGuess = this.buildFinalGuess(scores, definiteAnswers, gameState.answerCount);
    
    // 7. 중복 추측 방지: 이전과 동일한 조합인지 확인
    finalGuess = this.preventDuplicateGuess(finalGuess, gameState, scores);
    
    // 8. 이번 추측을 기록에 추가
    const guessKey = [...finalGuess].sort((a, b) => a - b).join(',');
    this.previousExactGuesses.add(guessKey);
    
    console.log('최종 선택:', finalGuess.map(i => gameState.keywords[i]));
    return finalGuess;
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

  // 각 키워드의 점수 계산
  private calculateScores(
    gameState: GameStateForAI, 
    possibleKeywords: number[], 
    definiteAnswers: Set<number>, 
    definiteWrongs: Set<number>
  ): Map<number, number> {
    const scores = new Map<number, number>();
    
    // 확실한 정답은 최고 점수
    definiteAnswers.forEach(idx => {
      scores.set(idx, 1000);
    });
    
    // 가능한 키워드들의 점수 계산
    possibleKeywords.forEach(idx => {
      if (!definiteAnswers.has(idx) && !definiteWrongs.has(idx)) {
        const score = this.calculateKeywordScore(idx, gameState, definiteAnswers, definiteWrongs);
        scores.set(idx, score);
      }
    });
    
    // 점수별로 정렬하여 출력
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('상위 10개 키워드 점수:');
    sorted.forEach(([idx, score]) => {
      console.log(`  ${gameState.keywords[idx]}: ${score.toFixed(2)}점`);
    });
    
    return scores;
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
  
  // 중복 추측 방지 메서드
  private preventDuplicateGuess(
    guess: number[], 
    gameState: GameStateForAI, 
    scores: Map<number, number>
  ): number[] {
    // 추측을 정렬하여 문자열로 변환 (순서 무관하게 비교)
    const guessKey = [...guess].sort((a, b) => a - b).join(',');
    
    // 모든 이전 추측들을 수집 (모든 플레이어의 추측 + 내가 이미 시도한 것들)
    const allPreviousGuesses = new Set<string>(this.previousExactGuesses);
    gameState.previousGuesses.forEach(prevGuess => {
      const prevKey = [...prevGuess.guess].sort((a, b) => a - b).join(',');
      allPreviousGuesses.add(prevKey);
    });
    
    // 디버깅: 중복 검사 상황 로그
    console.log(`[중복 검사] 현재 추측: ${guessKey}`);
    console.log(`[중복 검사] 이전 추측 수: ${allPreviousGuesses.size}`);
    console.log(`[중복 검사] 내 이전 추측들:`, Array.from(this.previousExactGuesses));
    console.log(`[중복 검사] 전체 이전 추측들:`, Array.from(allPreviousGuesses));
    
    // 현재 추측이 이전에 시도한 것인지 확인
    if (allPreviousGuesses.has(guessKey)) {
      console.log('경고: 동일한 조합 재시도 감지! 새로운 조합 생성 중...');
      console.log(`[중복 발견] 추측 키워드: ${guess.map(i => gameState.keywords[i]).join(', ')}`);
      
      // 이전 추측에서 해당 조합 찾기
      const previousGuess = gameState.previousGuesses.find(pg => {
        const pgKey = [...pg.guess].sort((a, b) => a - b).join(',');
        return pgKey === guessKey;
      });
      
      if (previousGuess) {
        console.log(`[중복 발견] 이전 결과: ${previousGuess.correctCount}/${gameState.answerCount} (플레이어 ${previousGuess.playerId})`);
        
        if (previousGuess.correctCount > 0 && previousGuess.correctCount < gameState.answerCount) {
          // 부분 정답인 경우: 반드시 다른 조합 생성
          console.log('[중복 해결] 부분 정답이므로 체계적 변형 시도');
          return this.generateSystematicVariation(guess, previousGuess, gameState, scores, allPreviousGuesses);
        } else {
          // 완전 정답이거나 완전 오답인 경우
          console.log('[중복 해결] 완전히 새로운 조합 생성');
          return this.generateNewCombination(guess, gameState, scores, allPreviousGuesses);
        }
      }
    }
    
    return guess;
  }
  
  // 부분 정답일 때 체계적으로 변형
  private generateSystematicVariation(
    originalGuess: number[],
    previousResult: GuessHistory,
    gameState: GameStateForAI,
    scores: Map<number, number>,
    allPreviousGuesses: Set<string>
  ): number[] {
    console.log(`이전 결과: ${previousResult.correctCount}/${gameState.answerCount} 정답`);
    console.log(`이전 추측: ${previousResult.guess.map(i => gameState.keywords[i]).join(', ')}`);
    
    // 공개된 정답은 무조건 포함
    const mustInclude = gameState.revealedAnswers;
    
    // 점수가 가장 낮은 키워드부터 교체 시도 (공개된 정답 제외)
    const sortedByScore = [...originalGuess]
      .filter(idx => !mustInclude.includes(idx))
      .sort((a, b) => (scores.get(a) || 0) - (scores.get(b) || 0));
    
    // 사용 가능한 대체 후보들 (점수 높은 순)
    const availableCandidates = Array.from(scores.entries())
      .filter(([idx]) => !originalGuess.includes(idx))
      .sort((a, b) => b[1] - a[1])
      .map(([idx]) => idx);
    
    console.log(`교체 가능 키워드: ${sortedByScore.length}개`);
    console.log(`대체 후보: ${availableCandidates.length}개`);
    
    // 교체할 개수 결정: 틀린 개수만큼 교체
    const wrongCount = gameState.answerCount - previousResult.correctCount;
    const toReplace = Math.min(wrongCount, sortedByScore.length);
    
    console.log(`${toReplace}개 키워드 교체 시도`);
    
    // 여러 개를 한 번에 교체
    for (let replaceCount = 1; replaceCount <= toReplace; replaceCount++) {
      // 교체할 키워드 선택
      const toReplaceIndices = sortedByScore.slice(0, replaceCount);
      
      // 가능한 모든 조합 시도
      const newGuess = [...originalGuess];
      for (let i = 0; i < toReplaceIndices.length && i < availableCandidates.length; i++) {
        const indexToReplace = newGuess.indexOf(toReplaceIndices[i]);
        if (indexToReplace !== -1) {
          newGuess[indexToReplace] = availableCandidates[i];
        }
      }
      
      // 이 조합이 시도되지 않았다면 사용
      const newKey = [...newGuess].sort((a, b) => a - b).join(',');
      if (!allPreviousGuesses.has(newKey)) {
        console.log(`체계적 변형 (${replaceCount}개 교체): ${toReplaceIndices.map(i => gameState.keywords[i]).join(', ')} → ${availableCandidates.slice(0, replaceCount).map(i => gameState.keywords[i]).join(', ')}`);
        return newGuess;
      }
    }
    
    // 모든 체계적 교체가 실패하면 완전히 새로운 조합
    return this.generateNewCombination(originalGuess, gameState, scores, allPreviousGuesses);
  }
  
  // 완전히 새로운 조합 생성
  private generateNewCombination(
    originalGuess: number[],
    gameState: GameStateForAI,
    scores: Map<number, number>,
    allPreviousGuesses: Set<string>
  ): number[] {
    // 확실한 정답은 유지
    const mustInclude = originalGuess.filter(idx => 
      gameState.revealedAnswers.includes(idx)
    );
    
    // 나머지는 점수 높은 순으로 새로 선택
    const candidates = Array.from(scores.entries())
      .filter(([idx]) => !mustInclude.includes(idx))
      .sort((a, b) => b[1] - a[1]);
    
    const newGuess = [...mustInclude];
    const needed = gameState.answerCount - newGuess.length;
    
    // 이전과 다른 조합이 나올 때까지 시도
    let attempts = 0;
    while (attempts < 10) {
      const tempGuess = [...mustInclude];
      
      // 약간의 무작위성을 추가하여 선택
      const shuffledCandidates = [...candidates.slice(0, needed * 2)]
        .sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < needed && i < shuffledCandidates.length; i++) {
        tempGuess.push(shuffledCandidates[i][0]);
      }
      
      const tempKey = [...tempGuess].sort((a, b) => a - b).join(',');
      if (!allPreviousGuesses.has(tempKey)) {
        console.log('새로운 조합 생성 성공');
        console.log(`새 조합: ${tempGuess.map(i => gameState.keywords[i]).join(', ')}`);
        return tempGuess;
      }
      
      attempts++;
    }
    
    // 최후의 수단: 완전 랜덤
    console.log('경고: 새로운 조합 생성 실패, 최선의 선택 반환');
    return originalGuess;
  }

  abstract getStrategyName(): string;
  abstract getDescription(): string;
}