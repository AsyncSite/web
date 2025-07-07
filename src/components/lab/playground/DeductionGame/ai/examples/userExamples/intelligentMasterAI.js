// 지능형 마스터 AI
// 오답을 완벽하게 피하고 논리적 추론을 통해 정답을 찾는 AI

function makeGuess(gameState) {
  console.log('=== 지능형 마스터 AI 실행 ===');
  console.log(
    `턴 ${gameState.currentTurn}: 키워드 ${gameState.keywords.length}개 중 정답 ${gameState.answerCount}개 찾기`,
  );

  // 1. 확실한 정답과 오답 수집
  const definiteAnswers = new Set(gameState.revealedAnswers);
  const definiteWrongs = new Set();

  // 내 힌트는 모두 오답
  gameState.myHints.forEach((hint) => definiteWrongs.add(hint));

  // 공개된 오답 추가
  gameState.revealedWrongAnswers.forEach((wrong) => definiteWrongs.add(wrong));

  console.log(`내 힌트 (오답): ${gameState.myHints.map((i) => gameState.keywords[i])}`);
  console.log(`공개된 오답: ${gameState.revealedWrongAnswers.map((i) => gameState.keywords[i])}`);
  console.log(`공개된 정답: ${gameState.revealedAnswers.map((i) => gameState.keywords[i])}`);

  // 2. 이전 추측 분석으로 추가 정보 획득
  analyzeAllGuesses(gameState, definiteAnswers, definiteWrongs);

  // 3. 선택 가능한 키워드 목록 생성
  const possibleKeywords = [];
  for (let i = 0; i < gameState.keywords.length; i++) {
    if (!definiteWrongs.has(i)) {
      possibleKeywords.push(i);
    }
  }

  // 4. 이미 충분한 정답을 아는 경우
  if (definiteAnswers.size >= gameState.answerCount) {
    console.log('모든 정답을 알고 있음! 게임 종료!');
    return Array.from(definiteAnswers).slice(0, gameState.answerCount);
  }

  // 5. 각 키워드의 점수 계산
  const scores = calculateScores(gameState, possibleKeywords, definiteAnswers, definiteWrongs);

  // 6. 최종 추측 구성
  const finalGuess = buildFinalGuess(scores, definiteAnswers, gameState.answerCount);

  console.log(
    '최종 선택:',
    finalGuess.map((i) => gameState.keywords[i]),
  );
  return finalGuess;
}

// 모든 추측 분석
function analyzeAllGuesses(gameState, definiteAnswers, definiteWrongs) {
  // 1. 정답이 0개인 추측 - 모든 키워드가 오답
  gameState.previousGuesses.forEach((guess) => {
    if (guess.correctCount === 0) {
      guess.guess.forEach((idx) => {
        definiteWrongs.add(idx);
      });
      console.log(`정답 0개 추측에서 오답 발견: ${guess.guess.map((i) => gameState.keywords[i])}`);
    }
  });

  // 2. 추측 간 비교로 확실한 정답/오답 찾기
  for (let i = 0; i < gameState.previousGuesses.length - 1; i++) {
    for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
      compareGuesses(
        gameState.previousGuesses[i],
        gameState.previousGuesses[j],
        definiteAnswers,
        definiteWrongs,
        gameState,
      );
    }
  }

  // 3. 제약 조건 확인
  gameState.previousGuesses.forEach((guess) => {
    checkConstraints(guess, definiteAnswers, definiteWrongs, gameState);
  });
}

// 두 추측 비교
function compareGuesses(guess1, guess2, definiteAnswers, definiteWrongs, gameState) {
  // 두 추측의 차이 계산
  const onlyIn1 = guess1.guess.filter((x) => !guess2.guess.includes(x));
  const onlyIn2 = guess2.guess.filter((x) => !guess1.guess.includes(x));

  // 정확히 하나씩만 다른 경우
  if (onlyIn1.length === 1 && onlyIn2.length === 1) {
    const idx1 = onlyIn1[0];
    const idx2 = onlyIn2[0];

    if (guess1.correctCount > guess2.correctCount) {
      // idx1은 정답, idx2는 오답
      if (!definiteAnswers.has(idx1) && !definiteWrongs.has(idx1)) {
        definiteAnswers.add(idx1);
      }
      if (!definiteWrongs.has(idx2) && !definiteAnswers.has(idx2)) {
        definiteWrongs.add(idx2);
      }
    } else if (guess2.correctCount > guess1.correctCount) {
      // idx2는 정답, idx1은 오답
      if (!definiteAnswers.has(idx2) && !definiteWrongs.has(idx2)) {
        definiteAnswers.add(idx2);
      }
      if (!definiteWrongs.has(idx1) && !definiteAnswers.has(idx1)) {
        definiteWrongs.add(idx1);
      }
    }
  }
}

// 제약 조건 확인
function checkConstraints(guess, definiteAnswers, definiteWrongs, gameState) {
  let knownAnswers = 0;
  let knownWrongs = 0;
  const unknownIndices = [];

  guess.guess.forEach((idx) => {
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
    unknownIndices.forEach((idx) => {
      if (!definiteWrongs.has(idx)) {
        definiteWrongs.add(idx);
      }
    });
  }

  // unknown과 known answers의 합이 정확히 correctCount인 경우
  if (knownAnswers + unknownIndices.length === guess.correctCount && unknownIndices.length > 0) {
    // 모든 unknown이 정답
    unknownIndices.forEach((idx) => {
      if (!definiteAnswers.has(idx)) {
        definiteAnswers.add(idx);
      }
    });
  }
}

// 각 키워드의 점수 계산
function calculateScores(gameState, possibleKeywords, definiteAnswers, definiteWrongs) {
  const scores = new Map();

  // 확실한 정답은 최고 점수
  definiteAnswers.forEach((idx) => {
    scores.set(idx, 1000);
  });

  // 가능한 키워드들의 점수 계산
  possibleKeywords.forEach((idx) => {
    if (!definiteAnswers.has(idx) && !definiteWrongs.has(idx)) {
      const score = calculateKeywordScore(idx, gameState, definiteAnswers, definiteWrongs);
      scores.set(idx, score);
    }
  });

  // 점수별로 정렬하여 출력
  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sorted.forEach(([idx, score]) => {});

  return scores;
}

// 개별 키워드 점수 계산
function calculateKeywordScore(keywordIdx, gameState, definiteAnswers, definiteWrongs) {
  let totalAppearances = 0;
  let weightedCorrect = 0;

  gameState.previousGuesses.forEach((guess) => {
    if (guess.guess.includes(keywordIdx)) {
      totalAppearances++;

      // 이 추측에서 알려진 정답/오답 개수
      let knownAnswers = 0;
      let knownWrongs = 0;
      let unknownCount = 0;

      guess.guess.forEach((idx) => {
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
function buildFinalGuess(scores, definiteAnswers, answerCount) {
  // 점수 순으로 정렬
  const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);

  const finalGuess = [];

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
