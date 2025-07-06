// 논리적 추론 AI
// 추측들 간의 관계를 분석하여 확실한 정답과 오답을 찾아냅니다.

function makeGuess(gameState) {

  // 확실한 정답과 오답을 저장할 Set
  const definiteAnswers = new Set(gameState.revealedAnswers);
  const definiteWrongs = new Set([...gameState.myHints, ...gameState.revealedWrongAnswers]);
  
  // 각 키워드의 상태: 'answer', 'wrong', 'unknown'
  const keywordStatus = new Map();
  
  // 초기 상태 설정
  for (let i = 0; i < gameState.keywords.length; i++) {
    if (definiteAnswers.has(i)) {
      keywordStatus.set(i, 'answer');
    } else if (definiteWrongs.has(i)) {
      keywordStatus.set(i, 'wrong');
    } else {
      keywordStatus.set(i, 'unknown');
    }
  }
  
  // 논리적 추론 1: 정답이 0개인 추측
  gameState.previousGuesses.forEach(guess => {
    if (guess.correctCount === 0) {
      // 이 추측의 모든 키워드는 오답
      guess.guess.forEach(idx => {
        if (keywordStatus.get(idx) === 'unknown') {
          keywordStatus.set(idx, 'wrong');
          definiteWrongs.add(idx);
          console.log(`추론: ${gameState.keywords[idx]}는 오답 (정답 0개인 추측에 포함)`);
        }
      });
    }
  });
  
  // 논리적 추론 2: 모든 키워드가 정답인 추측
  gameState.previousGuesses.forEach(guess => {
    if (guess.correctCount === guess.guess.length) {
      // 이 추측의 모든 키워드는 정답
      guess.guess.forEach(idx => {
        if (keywordStatus.get(idx) === 'unknown') {
          keywordStatus.set(idx, 'answer');
          definiteAnswers.add(idx);
        }
      });
    }
  });
  
  // 논리적 추론 3: 두 추측의 차이 분석
  for (let i = 0; i < gameState.previousGuesses.length - 1; i++) {
    for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
      const guess1 = gameState.previousGuesses[i];
      const guess2 = gameState.previousGuesses[j];
      
      // 두 추측에서 다른 부분 찾기
      const onlyIn1 = guess1.guess.filter(x => !guess2.guess.includes(x));
      const onlyIn2 = guess2.guess.filter(x => !guess1.guess.includes(x));
      
      // 정확히 하나씩만 다른 경우
      if (onlyIn1.length === 1 && onlyIn2.length === 1) {
        const idx1 = onlyIn1[0];
        const idx2 = onlyIn2[0];
        
        if (guess1.correctCount > guess2.correctCount) {
          // idx1은 정답, idx2는 오답
          if (keywordStatus.get(idx1) === 'unknown') {
            keywordStatus.set(idx1, 'answer');
            definiteAnswers.add(idx1);
          }
          if (keywordStatus.get(idx2) === 'unknown') {
            keywordStatus.set(idx2, 'wrong');
            definiteWrongs.add(idx2);
          }
        } else if (guess2.correctCount > guess1.correctCount) {
          // idx2는 정답, idx1은 오답
          if (keywordStatus.get(idx2) === 'unknown') {
            keywordStatus.set(idx2, 'answer');
            definiteAnswers.add(idx2);
          }
          if (keywordStatus.get(idx1) === 'unknown') {
            keywordStatus.set(idx1, 'wrong');
            definiteWrongs.add(idx1);
          }
        }
      }
    }
  }
  
  // 논리적 추론 4: 제약 조건 활용
  gameState.previousGuesses.forEach(guess => {
    // 이미 확정된 정답/오답 개수 계산
    let knownAnswers = 0;
    let knownWrongs = 0;
    let unknownIndices = [];
    
    guess.guess.forEach(idx => {
      if (keywordStatus.get(idx) === 'answer') {
        knownAnswers++;
      } else if (keywordStatus.get(idx) === 'wrong') {
        knownWrongs++;
      } else {
        unknownIndices.push(idx);
      }
    });
    
    // 나머지가 모두 정답인 경우
    if (knownAnswers + unknownIndices.length === guess.correctCount) {
      unknownIndices.forEach(idx => {
        keywordStatus.set(idx, 'answer');
        definiteAnswers.add(idx);
      });
    }
    
    // 나머지가 모두 오답인 경우
    if (knownAnswers === guess.correctCount) {
      unknownIndices.forEach(idx => {
        keywordStatus.set(idx, 'wrong');
        definiteWrongs.add(idx);
      });
    }
  });
  

  // 최종 추측 구성
  const finalGuess = Array.from(definiteAnswers);
  
  // 부족한 경우 확률 계산
  if (finalGuess.length < gameState.answerCount) {
    const probabilities = new Map();
    
    // unknown 키워드들의 확률 계산
    for (let i = 0; i < gameState.keywords.length; i++) {
      if (keywordStatus.get(i) === 'unknown') {
        probabilities.set(i, calculateProbability(i, gameState, definiteAnswers, definiteWrongs));
      }
    }
    
    // 확률 높은 순으로 추가
    const sortedUnknowns = Array.from(probabilities.entries())
      .sort((a, b) => b[1] - a[1]);
    
    for (const [idx, prob] of sortedUnknowns) {
      if (finalGuess.length >= gameState.answerCount) break;
      finalGuess.push(idx);
    }
  }
  
  return finalGuess;
}

// 키워드가 정답일 확률 계산
function calculateProbability(keywordIndex, gameState, definiteAnswers, definiteWrongs) {
  let probability = 0.5; // 기본 확률
  let weight = 0;
  
  gameState.previousGuesses.forEach(guess => {
    if (guess.guess.includes(keywordIndex)) {
      // 이 키워드가 포함된 추측에서
      const knownAnswers = guess.guess.filter(idx => definiteAnswers.has(idx)).length;
      const knownWrongs = guess.guess.filter(idx => definiteWrongs.has(idx)).length;
      const unknownCount = guess.guess.length - knownAnswers - knownWrongs;
      
      if (unknownCount > 0) {
        const remainingCorrect = guess.correctCount - knownAnswers;
        const thisProbability = remainingCorrect / unknownCount;
        
        // 가중 평균
        probability = (probability * weight + thisProbability) / (weight + 1);
        weight++;
      }
    }
  });
  
  return probability;
}