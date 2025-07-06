// 전략적 마스터 AI
// 정보 수집, 확률 계산, 전략적 선택을 모두 활용하는 최고 수준의 AI

function makeGuess(gameState) {

  // 1. 정보 수집 및 분류
  const knowledgeBase = collectKnowledge(gameState);
  
  // 2. 가능한 정답 조합 찾기 (CSP)
  const possibleSolutions = findPossibleSolutions(gameState, knowledgeBase);

  // 3. 전략 결정
  const strategy = decideStrategy(gameState, knowledgeBase, possibleSolutions);

  // 4. 전략에 따른 추측 생성
  const finalGuess = executeStrategy(strategy, gameState, knowledgeBase, possibleSolutions);
  
  return finalGuess;
}

// 지식 베이스 구축
function collectKnowledge(gameState) {
  const knowledge = {
    definiteAnswers: new Set(gameState.revealedAnswers),
    definiteWrongs: new Set([...gameState.myHints, ...gameState.revealedWrongAnswers]),
    probableAnswers: new Map(),
    probableWrongs: new Map(),
    unknowns: new Set(),
    opponentKnowledge: analyzeOpponentKnowledge(gameState)
  };
  
  // 모든 키워드 분류
  for (let i = 0; i < gameState.keywords.length; i++) {
    if (!knowledge.definiteAnswers.has(i) && !knowledge.definiteWrongs.has(i)) {
      knowledge.unknowns.add(i);
    }
  }
  
  // 추측 기록 분석으로 추가 정보 추출
  analyzeGuessHistory(gameState, knowledge);
  

  return knowledge;
}

// 추측 기록 분석
function analyzeGuessHistory(gameState, knowledge) {
  // 1. 정답이 0개인 추측에서 모든 키워드는 오답
  gameState.previousGuesses.forEach(guess => {
    if (guess.correctCount === 0) {
      guess.guess.forEach(idx => {
        if (knowledge.unknowns.has(idx)) {
          knowledge.unknowns.delete(idx);
          knowledge.definiteWrongs.add(idx);
        }
      });
    }
  });
  
  // 2. 추측 쌍 비교로 확실한 정답/오답 찾기
  for (let i = 0; i < gameState.previousGuesses.length - 1; i++) {
    for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
      const guess1 = gameState.previousGuesses[i];
      const guess2 = gameState.previousGuesses[j];
      
      // 한 개만 다른 경우
      const diff1 = guess1.guess.filter(x => !guess2.guess.includes(x));
      const diff2 = guess2.guess.filter(x => !guess1.guess.includes(x));
      
      if (diff1.length === 1 && diff2.length === 1) {
        if (guess1.correctCount > guess2.correctCount) {
          // diff1[0]은 정답, diff2[0]는 오답
          if (knowledge.unknowns.has(diff1[0])) {
            knowledge.unknowns.delete(diff1[0]);
            knowledge.definiteAnswers.add(diff1[0]);
          }
          if (knowledge.unknowns.has(diff2[0])) {
            knowledge.unknowns.delete(diff2[0]);
            knowledge.definiteWrongs.add(diff2[0]);
          }
        } else if (guess2.correctCount > guess1.correctCount) {
          if (knowledge.unknowns.has(diff2[0])) {
            knowledge.unknowns.delete(diff2[0]);
            knowledge.definiteAnswers.add(diff2[0]);
          }
          if (knowledge.unknowns.has(diff1[0])) {
            knowledge.unknowns.delete(diff1[0]);
            knowledge.definiteWrongs.add(diff1[0]);
          }
        }
      }
    }
  }
  
  // 3. 제약 조건 기반 추론
  gameState.previousGuesses.forEach(guess => {
    let knownAnswers = 0;
    let knownWrongs = 0;
    const unknownIndices = [];
    
    guess.guess.forEach(idx => {
      if (knowledge.definiteAnswers.has(idx)) knownAnswers++;
      else if (knowledge.definiteWrongs.has(idx)) knownWrongs++;
      else unknownIndices.push(idx);
    });
    
    // 나머지가 모두 정답인 경우
    if (knownAnswers + unknownIndices.length === guess.correctCount) {
      unknownIndices.forEach(idx => {
        if (knowledge.unknowns.has(idx)) {
          knowledge.unknowns.delete(idx);
          knowledge.definiteAnswers.add(idx);
        }
      });
    }
    
    // 나머지가 모두 오답인 경우
    if (knownAnswers === guess.correctCount) {
      unknownIndices.forEach(idx => {
        if (knowledge.unknowns.has(idx)) {
          knowledge.unknowns.delete(idx);
          knowledge.definiteWrongs.add(idx);
        }
      });
    }
  });
  
  // 4. 확률 계산
  knowledge.unknowns.forEach(idx => {
    const prob = calculateProbability(idx, gameState, knowledge);
    knowledge.probableAnswers.set(idx, prob);
  });
}

// 키워드가 정답일 확률 계산
function calculateProbability(keywordIdx, gameState, knowledge) {
  let totalWeight = 0;
  let positiveWeight = 0;
  
  gameState.previousGuesses.forEach(guess => {
    if (guess.guess.includes(keywordIdx)) {
      const knownAnswers = guess.guess.filter(idx => knowledge.definiteAnswers.has(idx)).length;
      const knownWrongs = guess.guess.filter(idx => knowledge.definiteWrongs.has(idx)).length;
      const unknownCount = guess.guess.length - knownAnswers - knownWrongs;
      
      if (unknownCount > 0) {
        const remainingCorrect = Math.max(0, guess.correctCount - knownAnswers);
        const weight = 1 / unknownCount;
        totalWeight += weight;
        positiveWeight += weight * (remainingCorrect / unknownCount);
      }
    }
  });
  
  return totalWeight > 0 ? positiveWeight / totalWeight : 0.5;
}

// 가능한 정답 조합 찾기 (CSP)
function findPossibleSolutions(gameState, knowledge) {
  const solutions = [];
  const candidates = Array.from(knowledge.unknowns);
  const neededCount = gameState.answerCount - knowledge.definiteAnswers.size;
  
  // 이미 모든 정답을 아는 경우
  if (neededCount <= 0) {
    return [Array.from(knowledge.definiteAnswers)];
  }
  
  // 백트래킹으로 가능한 조합 찾기 (최대 100개)
  function backtrack(current, startIdx) {
    if (solutions.length >= 100) return;
    
    if (current.length === neededCount) {
      const fullSolution = [...knowledge.definiteAnswers, ...current];
      if (validateSolution(fullSolution, gameState, knowledge)) {
        solutions.push(fullSolution);
      }
      return;
    }
    
    for (let i = startIdx; i < candidates.length; i++) {
      current.push(candidates[i]);
      backtrack(current, i + 1);
      current.pop();
    }
  }
  
  backtrack([], 0);
  
  // 해가 너무 많으면 확률 기반으로 필터링
  if (solutions.length > 50) {
    return solutions.slice(0, 50);
  }
  
  return solutions;
}

// 해가 유효한지 검증
function validateSolution(solution, gameState, knowledge) {
  return gameState.previousGuesses.every(guess => {
    const correctInGuess = guess.guess.filter(idx => solution.includes(idx)).length;
    return correctInGuess === guess.correctCount;
  });
}

// 상대방의 지식 수준 분석
function analyzeOpponentKnowledge(gameState) {
  const opponentInfo = new Map();
  
  // 각 플레이어별 추측 패턴 분석
  const playerGuesses = new Map();
  gameState.previousGuesses.forEach(guess => {
    if (!playerGuesses.has(guess.playerId)) {
      playerGuesses.set(guess.playerId, []);
    }
    playerGuesses.get(guess.playerId).push(guess);
  });
  
  playerGuesses.forEach((guesses, playerId) => {
    const info = {
      totalGuesses: guesses.length,
      averageCorrect: guesses.reduce((sum, g) => sum + g.correctCount, 0) / guesses.length,
      improving: false,
      closeToWin: false
    };
    
    // 성과 향상 여부
    if (guesses.length >= 2) {
      const recent = guesses.slice(-2);
      info.improving = recent[1].correctCount > recent[0].correctCount;
    }
    
    // 승리에 가까운지
    const lastGuess = guesses[guesses.length - 1];
    if (lastGuess) {
      info.closeToWin = lastGuess.correctCount >= gameState.answerCount - 1;
    }
    
    opponentInfo.set(playerId, info);
  });
  
  return opponentInfo;
}

// 전략 결정
function decideStrategy(gameState, knowledge, possibleSolutions) {
  // 모든 정답을 아는 경우
  if (knowledge.definiteAnswers.size === gameState.answerCount) {
    // 상대방이 거의 다 맞추려고 하면 즉시 종료
    const hasCloseOpponent = Array.from(knowledge.opponentKnowledge.values())
      .some(info => info.closeToWin);
    
    if (hasCloseOpponent || gameState.currentTurn > 10) {
      return 'WIN_NOW';
    }
    
    // 아직 여유가 있으면 전략적으로 숨기기
    return 'STRATEGIC_HIDE';
  }
  
  // 가능한 해가 하나뿐인 경우
  if (possibleSolutions.length === 1) {
    return 'UNIQUE_SOLUTION';
  }
  
  // 초반 (정보 수집)
  if (gameState.currentTurn <= 3) {
    return 'EXPLORE';
  }
  
  // 중반 (균형)
  if (gameState.currentTurn <= 7) {
    return 'BALANCED';
  }
  
  // 후반 (공격적)
  return 'AGGRESSIVE';
}

// 전략 실행
function executeStrategy(strategy, gameState, knowledge, possibleSolutions) {
  switch (strategy) {
    case 'WIN_NOW':
      // 모든 정답으로 즉시 승리
      return Array.from(knowledge.definiteAnswers);
    
    case 'STRATEGIC_HIDE':
      // 일부 정답을 숨기고 탐색 계속
      return strategicHide(gameState, knowledge);
    
    case 'UNIQUE_SOLUTION':
      // 유일한 해로 추측
      return possibleSolutions[0];
    
    case 'EXPLORE':
      // 정보 수집 최대화
      return maximizeInformation(gameState, knowledge, possibleSolutions);
    
    case 'BALANCED':
      // 확률과 정보 균형
      return balancedApproach(gameState, knowledge, possibleSolutions);
    
    case 'AGGRESSIVE':
      // 가장 가능성 높은 조합
      return aggressiveApproach(gameState, knowledge, possibleSolutions);
    
    default:
      // 폴백: 확률 기반
      return probabilityBased(gameState, knowledge);
  }
}

// 전략적 숨기기
function strategicHide(gameState, knowledge) {
  const allAnswers = Array.from(knowledge.definiteAnswers);
  const toShow = gameState.answerCount - 1; // 하나만 숨기기
  
  // 가장 최근에 발견한 정답을 숨기기
  const shown = allAnswers.slice(0, toShow);
  
  // 나머지는 높은 확률의 unknown으로 채우기
  const candidates = Array.from(knowledge.probableAnswers.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  for (const idx of candidates) {
    if (shown.length >= gameState.answerCount) break;
    if (!shown.includes(idx)) {
      shown.push(idx);
    }
  }
  
  return shown;
}

// 정보 수집 최대화
function maximizeInformation(gameState, knowledge, possibleSolutions) {
  let bestGuess = null;
  let maxInfoGain = -1;
  
  // 후보 추측 생성
  const candidates = generateCandidates(gameState, knowledge, possibleSolutions);
  
  candidates.forEach(candidate => {
    const infoGain = calculateInfoGain(candidate, possibleSolutions);
    if (infoGain > maxInfoGain) {
      maxInfoGain = infoGain;
      bestGuess = candidate;
    }
  });
  
  return bestGuess || probabilityBased(gameState, knowledge);
}

// 정보 이득 계산
function calculateInfoGain(guess, possibleSolutions) {
  const outcomes = new Map();
  
  possibleSolutions.forEach(solution => {
    const correct = guess.filter(g => solution.includes(g)).length;
    outcomes.set(correct, (outcomes.get(correct) || 0) + 1);
  });
  
  // 엔트로피 계산
  let entropy = 0;
  const total = possibleSolutions.length;
  
  outcomes.forEach(count => {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  });
  
  return entropy;
}

// 균형잡힌 접근
function balancedApproach(gameState, knowledge, possibleSolutions) {
  // 확실한 정답 포함
  const guess = Array.from(knowledge.definiteAnswers);
  
  // 높은 확률의 unknown 추가
  const candidates = Array.from(knowledge.probableAnswers.entries())
    .sort((a, b) => b[1] - a[1]);
  
  // 가능한 해에서 자주 나타나는 키워드 우선
  const frequency = new Map();
  possibleSolutions.forEach(solution => {
    solution.forEach(idx => {
      if (!knowledge.definiteAnswers.has(idx)) {
        frequency.set(idx, (frequency.get(idx) || 0) + 1);
      }
    });
  });
  
  // 확률과 빈도를 결합
  candidates.forEach(([idx, prob]) => {
    const freq = frequency.get(idx) || 0;
    const score = prob * 0.6 + (freq / possibleSolutions.length) * 0.4;
    knowledge.probableAnswers.set(idx, score);
  });
  
  // 점수 순으로 선택
  const sorted = Array.from(knowledge.probableAnswers.entries())
    .sort((a, b) => b[1] - a[1]);
  
  for (const [idx] of sorted) {
    if (guess.length >= gameState.answerCount) break;
    if (!guess.includes(idx)) {
      guess.push(idx);
    }
  }
  
  return guess;
}

// 공격적 접근
function aggressiveApproach(gameState, knowledge, possibleSolutions) {
  // 가장 가능성 높은 해 선택
  if (possibleSolutions.length > 0) {
    // 각 해의 점수 계산
    let bestSolution = possibleSolutions[0];
    let bestScore = -1;
    
    possibleSolutions.forEach(solution => {
      let score = 0;
      solution.forEach(idx => {
        if (knowledge.definiteAnswers.has(idx)) {
          score += 1;
        } else if (knowledge.probableAnswers.has(idx)) {
          score += knowledge.probableAnswers.get(idx);
        }
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestSolution = solution;
      }
    });
    
    return bestSolution;
  }
  
  return probabilityBased(gameState, knowledge);
}

// 확률 기반 선택
function probabilityBased(gameState, knowledge) {
  const guess = Array.from(knowledge.definiteAnswers);
  
  const sorted = Array.from(knowledge.probableAnswers.entries())
    .sort((a, b) => b[1] - a[1]);
  
  for (const [idx] of sorted) {
    if (guess.length >= gameState.answerCount) break;
    if (!guess.includes(idx)) {
      guess.push(idx);
    }
  }
  
  // 부족하면 무작위 채우기
  if (guess.length < gameState.answerCount) {
    const available = Array.from(knowledge.unknowns).filter(idx => !guess.includes(idx));
    while (guess.length < gameState.answerCount && available.length > 0) {
      const randomIdx = Math.floor(Math.random() * available.length);
      guess.push(available.splice(randomIdx, 1)[0]);
    }
  }
  
  return guess;
}

// 후보 추측 생성
function generateCandidates(gameState, knowledge, possibleSolutions) {
  const candidates = new Set();
  
  // 1. 가능한 해들
  possibleSolutions.slice(0, 10).forEach(sol => {
    candidates.add(JSON.stringify(sol));
  });
  
  // 2. 확실한 정답 + 높은 확률 조합
  const base = Array.from(knowledge.definiteAnswers);
  const highProb = Array.from(knowledge.probableAnswers.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(e => e[0]);
  
  // 여러 조합 생성
  for (let i = 0; i < 5; i++) {
    const shuffled = [...highProb].sort(() => Math.random() - 0.5);
    const candidate = [...base];
    
    for (const idx of shuffled) {
      if (candidate.length >= gameState.answerCount) break;
      if (!candidate.includes(idx)) {
        candidate.push(idx);
      }
    }
    
    if (candidate.length === gameState.answerCount) {
      candidates.add(JSON.stringify(candidate));
    }
  }
  
  return Array.from(candidates).map(s => JSON.parse(s));
}