export const exampleAICodes = {
  beginner: {
    name: '초급 AI - 무작위 선택',
    description: '가능한 키워드 중에서 무작위로 선택하는 간단한 AI입니다.',
    code: `function makeGuess(gameState) {
  // 선택 가능한 키워드 찾기
  const canSelect = [];
  
  for (let i = 0; i < gameState.keywords.length; i++) {
    // 힌트와 공개된 오답은 제외
    if (!gameState.myHints.includes(i) && 
        !gameState.revealedWrongAnswers.includes(i)) {
      canSelect.push(i);
    }
  }
  
  // 공개된 정답은 무조건 포함
  const myGuess = [...gameState.revealedAnswers];
  
  // 나머지는 무작위로 선택
  while (myGuess.length < gameState.answerCount && canSelect.length > 0) {
    const randomIndex = Math.floor(Math.random() * canSelect.length);
    const selected = canSelect[randomIndex];
    
    if (!myGuess.includes(selected)) {
      myGuess.push(selected);
      canSelect.splice(randomIndex, 1);
    }
  }
  
  console.log('내 추측:', myGuess);
  return myGuess;
}`
  },
  
  intermediate: {
    name: '중급 AI - 빈도 분석',
    description: '이전 추측들을 분석하여 정답일 가능성이 높은 키워드를 선택합니다.',
    code: `function makeGuess(gameState) {
  // 각 키워드의 점수를 계산
  const scores = new Map();
  
  // 모든 키워드를 0점으로 초기화
  for (let i = 0; i < gameState.keywords.length; i++) {
    if (!gameState.myHints.includes(i) && 
        !gameState.revealedWrongAnswers.includes(i)) {
      scores.set(i, 0);
    }
  }
  
  // 이전 추측들을 분석하여 점수 부여
  gameState.previousGuesses.forEach(guess => {
    if (guess.correctCount > 0) {
      // 정답이 포함된 추측의 키워드들에 점수 부여
      const points = guess.correctCount / guess.guess.length;
      guess.guess.forEach(idx => {
        if (scores.has(idx)) {
          scores.set(idx, scores.get(idx) + points);
        }
      });
    } else {
      // 정답이 없는 추측의 키워드들은 감점
      guess.guess.forEach(idx => {
        if (scores.has(idx)) {
          scores.set(idx, scores.get(idx) - 1);
        }
      });
    }
  });
  
  // 점수가 높은 순으로 정렬
  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // 공개된 정답 + 높은 점수 키워드 선택
  const result = [...gameState.revealedAnswers];
  for (const idx of sorted) {
    if (result.length >= gameState.answerCount) break;
    if (!result.includes(idx)) {
      result.push(idx);
    }
  }
  
  console.log('점수 분석 결과:', sorted.slice(0, 5));
  console.log('최종 선택:', result);
  return result;
}`
  },
  
  advanced: {
    name: '고급 AI - 논리적 추론',
    description: '추측 간 비교를 통해 확실한 정답을 찾아내는 논리적 AI입니다.',
    code: `function makeGuess(gameState) {
  // 확실한 정답과 오답을 찾기
  const definiteAnswers = new Set(gameState.revealedAnswers);
  const definiteWrongs = new Set([...gameState.myHints, ...gameState.revealedWrongAnswers]);
  
  // 두 추측을 비교하여 확실한 정답/오답 찾기
  for (let i = 0; i < gameState.previousGuesses.length - 1; i++) {
    for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
      const guess1 = gameState.previousGuesses[i];
      const guess2 = gameState.previousGuesses[j];
      
      // 두 추측의 차이 찾기
      const diff1 = guess1.guess.filter(x => !guess2.guess.includes(x));
      const diff2 = guess2.guess.filter(x => !guess1.guess.includes(x));
      
      // 한 개만 다른 경우
      if (diff1.length === 1 && diff2.length === 1) {
        // 정답 개수 차이로 확실한 답 추론
        if (guess1.correctCount > guess2.correctCount) {
          definiteAnswers.add(diff1[0]);
          definiteWrongs.add(diff2[0]);
          console.log('논리적 추론: ' + diff1[0] + '은(는) 정답, ' + diff2[0] + '은(는) 오답');
        } else if (guess2.correctCount > guess1.correctCount) {
          definiteAnswers.add(diff2[0]);
          definiteWrongs.add(diff1[0]);
          console.log('논리적 추론: ' + diff2[0] + '은(는) 정답, ' + diff1[0] + '은(는) 오답');
        }
      }
    }
  }
  
  // 확률 계산
  const probabilities = new Map();
  
  for (let i = 0; i < gameState.keywords.length; i++) {
    if (definiteAnswers.has(i)) {
      probabilities.set(i, 1);
    } else if (definiteWrongs.has(i) || gameState.myHints.includes(i)) {
      probabilities.set(i, 0);
    } else {
      probabilities.set(i, 0.5); // 기본 확률
    }
  }
  
  // 이전 추측 기반 확률 업데이트
  gameState.previousGuesses.forEach(guess => {
    const unknownInGuess = guess.guess.filter(idx => 
      !definiteAnswers.has(idx) && !definiteWrongs.has(idx)
    );
    
    if (unknownInGuess.length > 0) {
      const unknownCorrect = guess.correctCount - 
        guess.guess.filter(idx => definiteAnswers.has(idx)).length;
      
      const probPerUnknown = unknownCorrect / unknownInGuess.length;
      
      unknownInGuess.forEach(idx => {
        const current = probabilities.get(idx) || 0.5;
        probabilities.set(idx, (current + probPerUnknown) / 2);
      });
    }
  });
  
  // 확률이 높은 순으로 선택
  const sorted = Array.from(probabilities.entries())
    .filter(([idx, prob]) => prob > 0)
    .sort((a, b) => b[1] - a[1]);
  
  const result = [];
  for (const [idx, prob] of sorted) {
    if (result.length >= gameState.answerCount) break;
    result.push(idx);
  }
  
  console.log('확실한 정답:', Array.from(definiteAnswers));
  console.log('확률 상위 5개:', sorted.slice(0, 5).map(([idx, prob]) => 
    gameState.keywords[idx] + ' (' + Math.round(prob * 100) + '%)'
  ));
  console.log('최종 선택:', result.map(idx => gameState.keywords[idx]));
  
  return result;
}`
  },
  
  expert: {
    name: '전문가 AI - 정보 이론',
    description: '정보 이득을 최대화하는 추측을 선택하는 고도화된 AI입니다.',
    code: `function makeGuess(gameState) {
  // 가능한 정답 조합 찾기
  const possibleSolutions = [];
  
  // 백트래킹으로 가능한 조합 생성 (최대 100개)
  function findSolutions(current, startIdx, depth) {
    if (possibleSolutions.length >= 100 || depth > 10) return;
    
    if (current.length === gameState.answerCount) {
      // 모든 이전 추측과 일치하는지 검증
      if (validateSolution(current)) {
        possibleSolutions.push([...current]);
      }
      return;
    }
    
    for (let i = startIdx; i < gameState.keywords.length; i++) {
      if (!gameState.myHints.includes(i) && 
          !gameState.revealedWrongAnswers.includes(i)) {
        current.push(i);
        findSolutions(current, i + 1, depth + 1);
        current.pop();
      }
    }
  }
  
  function validateSolution(solution) {
    return gameState.previousGuesses.every(guess => {
      const correctInGuess = guess.guess.filter(idx => solution.includes(idx)).length;
      return correctInGuess === guess.correctCount;
    });
  }
  
  // 공개된 정답부터 시작
  findSolutions([...gameState.revealedAnswers], 0, 0);
  
  console.log('가능한 해의 개수:', possibleSolutions.length);
  
  // 해가 하나면 그것이 정답
  if (possibleSolutions.length === 1) {
    console.log('유일한 해 발견!');
    return possibleSolutions[0];
  }
  
  // 여러 해가 있으면 정보 이득이 최대인 추측 선택
  if (possibleSolutions.length > 0) {
    const candidates = generateCandidates();
    let bestGuess = null;
    let maxInfoGain = -1;
    
    candidates.forEach(candidate => {
      const infoGain = calculateInfoGain(candidate);
      if (infoGain > maxInfoGain) {
        maxInfoGain = infoGain;
        bestGuess = candidate;
      }
    });
    
    if (bestGuess) {
      console.log('정보 이득 최대화 추측 선택');
      return bestGuess;
    }
  }
  
  // 폴백: 빈도 기반 선택
  console.log('폴백 전략 사용');
  return frequencyBasedGuess();
  
  function generateCandidates() {
    // 가능한 해들과 빈도 높은 조합들을 후보로 생성
    const candidates = [...possibleSolutions];
    
    // 빈도 분석
    const frequency = new Map();
    possibleSolutions.forEach(solution => {
      solution.forEach(idx => {
        frequency.set(idx, (frequency.get(idx) || 0) + 1);
      });
    });
    
    // 빈도 높은 키워드들의 조합 추가
    const frequent = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, gameState.answerCount * 2)
      .map(entry => entry[0]);
    
    for (let i = 0; i < Math.min(10, frequent.length); i++) {
      const randomCandidate = [];
      const shuffled = [...frequent].sort(() => Math.random() - 0.5);
      for (let j = 0; j < gameState.answerCount; j++) {
        if (shuffled[j] !== undefined) {
          randomCandidate.push(shuffled[j]);
        }
      }
      if (randomCandidate.length === gameState.answerCount) {
        candidates.push(randomCandidate);
      }
    }
    
    return candidates;
  }
  
  function calculateInfoGain(guess) {
    // 이 추측으로 얻을 수 있는 정보량 계산
    const outcomes = new Map();
    
    possibleSolutions.forEach(solution => {
      const correctCount = guess.filter(g => solution.includes(g)).length;
      const key = correctCount.toString();
      outcomes.set(key, (outcomes.get(key) || 0) + 1);
    });
    
    // 엔트로피 계산
    let entropy = 0;
    const total = possibleSolutions.length;
    
    outcomes.forEach(count => {
      const prob = count / total;
      if (prob > 0) {
        entropy -= prob * Math.log2(prob);
      }
    });
    
    return entropy;
  }
  
  function frequencyBasedGuess() {
    const scores = new Map();
    
    for (let i = 0; i < gameState.keywords.length; i++) {
      if (!gameState.myHints.includes(i) && 
          !gameState.revealedWrongAnswers.includes(i)) {
        scores.set(i, 0);
      }
    }
    
    gameState.previousGuesses.forEach(guess => {
      if (guess.correctCount > 0) {
        const points = guess.correctCount / guess.guess.length;
        guess.guess.forEach(idx => {
          if (scores.has(idx)) {
            scores.set(idx, scores.get(idx) + points);
          }
        });
      }
    });
    
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    const result = [...gameState.revealedAnswers];
    for (const idx of sorted) {
      if (result.length >= gameState.answerCount) break;
      if (!result.includes(idx)) {
        result.push(idx);
      }
    }
    
    return result;
  }
}`
  }
};

// 테스트용 간단한 AI 코드
export const testAICode = `
function makeGuess(gameState) {
  console.log('게임 상태:', {
    키워드수: gameState.keywords.length,
    정답개수: gameState.answerCount,
    현재턴: gameState.currentTurn,
    내힌트: gameState.myHints
  });
  
  // 사용 가능한 인덱스 찾기
  const available = [];
  for (let i = 0; i < gameState.keywords.length; i++) {
    if (!gameState.myHints.includes(i) && 
        !gameState.revealedWrongAnswers.includes(i)) {
      available.push(i);
    }
  }
  
  // 무작위로 선택
  const guess = [...gameState.revealedAnswers];
  while (guess.length < gameState.answerCount && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    const selected = available.splice(idx, 1)[0];
    if (!guess.includes(selected)) {
      guess.push(selected);
    }
  }
  
  console.log('선택한 키워드:', guess.map(i => gameState.keywords[i]));
  return guess;
}
`;