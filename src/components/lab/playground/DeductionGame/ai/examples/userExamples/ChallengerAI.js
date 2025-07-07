const ChallengerAI = (() => {
  /**
   * @type {Set<number>} - 현재까지 논리적으로 오답으로 판명된 키워드 인덱스
   */
  let knownWrong = new Set();

  /**
   * @type {Set<number>} - 현재까지 논리적으로 정답으로 판명된 키워드 인덱스
   */
  let knownCorrect = new Set();

  /**
   * @type {number[][]} - 현재까지 유효하다고 판단되는 모든 정답 조합의 배열
   *                       각 조합은 키워드 인덱스 배열 (예: [[1, 5, 8], [2, 4, 9]])
   */
  let possibleAnswerSets = [];

  /**
   * @type {boolean} - AI가 초기화되었는지 여부
   */
  let isInitialized = false;

  /**
   * 배열에서 k개의 요소를 선택하는 모든 조합을 생성합니다.
   * @param {number[]} arr - 원본 배열
   * @param {number} k - 선택할 요소의 개수
   * @returns {number[][]} - 모든 조합의 배열
   */
  function generateCombinations(arr, k) {
    const result = [];
    const f = (prefix, arr, k) => {
      if (k === 0) {
        result.push(prefix);
        return;
      }
      if (arr.length === 0 || k > arr.length) {
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        f(prefix.concat(arr[i]), arr.slice(i + 1), k - 1);
      }
    };
    f([], arr, k);
    return result;
  }

  /**
   * 가설(정답 조합)이 주어진 추측과 일치하는지 검증합니다.
   * @param {number[]} hypothesis - 검증할 가설 (정답 조합)
   * @param {{guess: number[], correctCount: number}} singleGuess - 단일 추측 기록
   * @returns {boolean} - 일치하면 true, 아니면 false
   */
  function validateHypothesisWithGuess(hypothesis, singleGuess) {
    const hypothesisSet = new Set(hypothesis);
    const intersectionSize = singleGuess.guess.filter((g) => hypothesisSet.has(g)).length;
    return intersectionSize === singleGuess.correctCount;
  }

  /**
   * AI의 추측을 결정하는 함수입니다.
   *
   * @param {object} gameState - 현재 게임 상태에 대한 모든 정보를 담고 있는 객체입니다.
   * @returns {number[]} - 추측할 키워드들의 인덱스 배열.
   *                        배열의 길이는 반드시 gameState.answerCount와 같아야 합니다.
   */
  function makeGuess(gameState) {
    const {
      keywords,
      answerCount,
      previousGuesses,
      revealedAnswers,
      revealedWrongAnswers,
      myHints,
    } = gameState;

    // 1. knownCorrect, knownWrong 업데이트 (매 턴 최신 정보 반영)
    revealedAnswers.forEach((idx) => knownCorrect.add(idx));
    revealedWrongAnswers.forEach((idx) => knownWrong.add(idx));
    myHints.forEach((idx) => knownWrong.add(idx));

    // previousGuesses를 통해 추가적인 knownWrong, knownCorrect 추론
    previousGuesses.forEach((guess) => {
      // 정답이 0개인 추측은 모두 오답
      if (guess.correctCount === 0) {
        guess.guess.forEach((idx) => knownWrong.add(idx));
      }
      // 추측한 모든 키워드가 정답인 경우
      else if (guess.correctCount === guess.guess.length) {
        guess.guess.forEach((idx) => knownCorrect.add(idx));
      }
      // 새로운 논리적 추론 추가: 부분적으로 정답이 있는 추측으로부터 단서 찾기
      else {
        const guessSet = new Set(guess.guess);

        // Case 1: (N-1)개가 오답이면, 나머지 1개는 정답
        // 예: {A, B, C} 중 1개 정답. B, C가 knownWrong이면 A는 knownCorrect
        const knownWrongInGuess = guess.guess.filter((idx) => knownWrong.has(idx));
        if (
          guess.guess.length - knownWrongInGuess.length === guess.correctCount &&
          guess.correctCount === 1
        ) {
          const potentialCorrect = guess.guess.find((idx) => !knownWrong.has(idx));
          if (potentialCorrect !== undefined) {
            knownCorrect.add(potentialCorrect);
          }
        }

        // Case 2: (N-1)개가 정답이면, 나머지 1개는 오답
        // 예: {A, B, C} 중 2개 정답. A, B가 knownCorrect이면 C는 knownWrong
        const knownCorrectInGuess = guess.guess.filter((idx) => knownCorrect.has(idx));
        if (
          knownCorrectInGuess.length === guess.correctCount &&
          guess.correctCount === guess.guess.length - 1
        ) {
          const potentialWrong = guess.guess.find((idx) => !knownCorrect.has(idx));
          if (potentialWrong !== undefined) {
            knownWrong.add(potentialWrong);
          }
        }
      }
    });

    // knownCorrect와 knownWrong 간의 충돌 방지 (논리적 오류 방지)
    Array.from(knownCorrect).forEach((idx) => {
      if (knownWrong.has(idx)) {
        knownWrong.delete(idx); // 정답이면서 오답일 수는 없음
      }
    });

    // 2. possibleAnswerSets 초기 생성 또는 필터링
    if (!isInitialized) {
      const allKeywordIndices = keywords.map((_, i) => i);

      // knownWrong에 없는 키워드들만 후보로
      const candidatesExcludingWrong = allKeywordIndices.filter((idx) => !knownWrong.has(idx));

      // knownCorrect에 있는 키워드들은 반드시 포함되어야 하므로, 나머지 키워드만 조합 생성
      const remainingNeeded = answerCount - knownCorrect.size;

      if (remainingNeeded < 0) {
        // knownCorrect가 answerCount보다 많으면 논리적 오류
        possibleAnswerSets = [];
      } else if (remainingNeeded === 0) {
        // 모든 정답이 knownCorrect에 있으면 해당 조합만 유일한 가설
        possibleAnswerSets = [Array.from(knownCorrect).sort((a, b) => a - b)];
      } else {
        // knownCorrect를 제외한 나머지 후보들 중에서 필요한 개수만큼 조합 생성
        const candidatesForCombination = candidatesExcludingWrong.filter(
          (idx) => !knownCorrect.has(idx),
        );
        const combinations = generateCombinations(candidatesForCombination, remainingNeeded);

        // 생성된 조합에 knownCorrect를 합쳐서 완전한 가설 생성
        possibleAnswerSets = combinations.map((combo) => {
          return Array.from(knownCorrect)
            .concat(combo)
            .sort((a, b) => a - b);
        });
      }
      isInitialized = true;
    }

    // 3. 매 턴, 모든 previousGuesses에 대해 possibleAnswerSets 필터링
    // (knownWrong, knownCorrect는 이미 위에서 반영되었으므로, previousGuesses만 검증)
    possibleAnswerSets = possibleAnswerSets.filter((hypothesis) => {
      return previousGuesses.every((pg) => validateHypothesisWithGuess(hypothesis, pg));
    });

    // 4. 최종 추측 결정
    let finalGuess = [];

    if (possibleAnswerSets.length === 1) {
      // 정답을 찾았다! 게임을 끝내자.
      finalGuess = possibleAnswerSets[0];
      console.log(
        'Challenger AI: 정답을 찾았습니다!',
        finalGuess.map((idx) => keywords[idx]),
      );
    } else if (possibleAnswerSets.length > 1) {
      // 여러 가능한 정답 조합이 남아있음. 정보 이득을 최대화하는 추측을 하자.
      console.log(
        `Challenger AI: ${possibleAnswerSets.length}개의 가능한 정답 조합이 남아있습니다.`,
      );

      // 각 키워드가 남은 가설들에 얼마나 고르게 분포하는지 점수화
      // (정보 이득을 최대화하기 위해, 각 키워드가 가설에 나타나는 빈도를 측정)
      const keywordDistribution = new Map();
      keywords.forEach((_, i) => keywordDistribution.set(i, 0));

      possibleAnswerSets.forEach((hypothesis) => {
        hypothesis.forEach((idx) => {
          keywordDistribution.set(idx, (keywordDistribution.get(idx) || 0) + 1);
        });
      });

      // 점수 기반으로 후보 정렬 (knownCorrect는 이미 포함, knownWrong은 제외)
      const sortedCandidates = Array.from(keywordDistribution.entries())
        .filter(([idx]) => !knownWrong.has(idx) && !knownCorrect.has(idx))
        .sort((a, b) => b[1] - a[1]); // 빈도 높은 순

      // knownCorrect에 있는 키워드 먼저 추가
      finalGuess = Array.from(knownCorrect);

      // 나머지 필요한 키워드를 점수 높은 순으로 추가
      for (const [idx] of sortedCandidates) {
        if (finalGuess.length < answerCount) {
          finalGuess.push(idx);
        } else {
          break;
        }
      }

      // 그래도 부족하면 무작위로 채움 (방어 코드)
      if (finalGuess.length < answerCount) {
        const allIndices = keywords.map((_, i) => i);
        const remaining = allIndices.filter(
          (idx) => !finalGuess.includes(idx) && !knownWrong.has(idx) && !knownCorrect.has(idx),
        );
        const shuffled = remaining.sort(() => 0.5 - Math.random());
        finalGuess.push(...shuffled.slice(0, answerCount - finalGuess.length));
      }

      // 최종적으로 answerCount 개수에 맞게 자르고 정렬
      finalGuess = finalGuess.slice(0, answerCount).sort((a, b) => a - b);
    } else {
      // 가능한 정답 조합이 없음 (논리적 오류 또는 정보 부족). Medium AI의 폴백 전략 사용.
      console.error('Challenger AI: 가능한 정답 조합을 찾을 수 없습니다. 폴백합니다.');
      // 이 부분은 실제 MediumStrategy를 가져와서 사용해야 하지만, 여기서는 간단히 무작위로 대체
      const allIndices = keywords.map((_, i) => i);
      const available = allIndices.filter((idx) => !knownWrong.has(idx));
      const shuffled = available.sort(() => 0.5 - Math.random());
      finalGuess = shuffled.slice(0, answerCount);
    }

    return finalGuess;
  }

  // AI가 리셋될 때 호출될 함수 (게임 재시작 시)
  function reset() {
    knownWrong = new Set();
    knownCorrect = new Set();
    possibleAnswerSets = [];
    isInitialized = false;
  }

  // 외부에서 makeGuess 함수를 호출할 수 있도록 반환
  return makeGuess;
})();

// 이 코드를 Custom AI 에디터에 붙여넣을 때, makeGuess 변수에 할당해야 합니다.
// 예: makeGuess = ChallengerAI;

// 개발 환경에서 테스트를 위해 임시로 전역에 노출
// (실제 배포 시에는 제거하거나 조건부 컴파일 필요)
// @ts-ignore
window.ChallengerAI = ChallengerAI;
