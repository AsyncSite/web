// 통계 분석 AI
// 이전 추측들을 분석하여 각 키워드가 정답일 확률을 계산합니다.

function makeGuess(gameState) {
  console.log('=== 통계 분석 AI 실행 ===');
  
  // 각 키워드의 점수를 저장할 맵
  const keywordScores = new Map();
  
  // 초기화: 모든 키워드를 0점으로 시작
  for (let i = 0; i < gameState.keywords.length; i++) {
    keywordScores.set(i, 0);
  }
  
  // 힌트와 공개된 오답은 -1000점 (절대 선택하지 않음)
  gameState.myHints.forEach(hintIndex => {
    keywordScores.set(hintIndex, -1000);
  });
  
  gameState.revealedWrongAnswers.forEach(wrongIndex => {
    keywordScores.set(wrongIndex, -1000);
  });
  
  // 공개된 정답은 +1000점 (무조건 선택)
  gameState.revealedAnswers.forEach(answerIndex => {
    keywordScores.set(answerIndex, 1000);
  });
  
  console.log('이전 추측 개수:', gameState.previousGuesses.length);
  
  // 이전 추측들 분석
  gameState.previousGuesses.forEach((guess, guessIndex) => {
    console.log(`추측 ${guessIndex + 1}: ${guess.guess} → 정답 ${guess.correctCount}개`);
    
    if (guess.correctCount > 0) {
      // 정답이 포함된 추측
      // 각 키워드가 정답일 확률 = correctCount / guess.length
      const probabilityScore = guess.correctCount / guess.guess.length;
      
      guess.guess.forEach(keywordIndex => {
        const currentScore = keywordScores.get(keywordIndex);
        if (currentScore !== -1000 && currentScore !== 1000) {
          // 점수 누적
          keywordScores.set(keywordIndex, currentScore + probabilityScore);
        }
      });
    } else {
      // 정답이 없는 추측 - 모든 키워드 감점
      guess.guess.forEach(keywordIndex => {
        const currentScore = keywordScores.get(keywordIndex);
        if (currentScore !== -1000 && currentScore !== 1000) {
          keywordScores.set(keywordIndex, currentScore - 0.5);
        }
      });
    }
  });
  
  // 교집합 분석 - 더 정교한 추론
  for (let i = 0; i < gameState.previousGuesses.length - 1; i++) {
    for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
      const guess1 = gameState.previousGuesses[i];
      const guess2 = gameState.previousGuesses[j];
      
      // 두 추측의 교집합 찾기
      const intersection = guess1.guess.filter(idx => guess2.guess.includes(idx));
      const onlyInGuess1 = guess1.guess.filter(idx => !guess2.guess.includes(idx));
      const onlyInGuess2 = guess2.guess.filter(idx => !guess1.guess.includes(idx));
      
      // 교집합이 있고, 정답 개수가 다른 경우
      if (intersection.length > 0 && guess1.correctCount !== guess2.correctCount) {
        const diff = Math.abs(guess1.correctCount - guess2.correctCount);
        
        if (guess1.correctCount > guess2.correctCount) {
          // guess1에만 있는 키워드들이 더 유력
          onlyInGuess1.forEach(idx => {
            const currentScore = keywordScores.get(idx);
            if (currentScore !== -1000 && currentScore !== 1000) {
              keywordScores.set(idx, currentScore + diff * 0.3);
            }
          });
        } else {
          // guess2에만 있는 키워드들이 더 유력
          onlyInGuess2.forEach(idx => {
            const currentScore = keywordScores.get(idx);
            if (currentScore !== -1000 && currentScore !== 1000) {
              keywordScores.set(idx, currentScore + diff * 0.3);
            }
          });
        }
      }
    }
  }
  
  // 점수 기준으로 정렬
  const sortedKeywords = Array.from(keywordScores.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(entry => entry[1] > -1000); // 선택 가능한 것만
  
  // 상위 5개 출력
  console.log('점수 상위 5개:');
  sortedKeywords.slice(0, 5).forEach(([idx, score], rank) => {
    console.log(`${rank + 1}위: ${gameState.keywords[idx]} (점수: ${score.toFixed(2)})`);
  });
  
  // 최종 선택
  const finalGuess = [];
  for (const [idx, score] of sortedKeywords) {
    if (finalGuess.length >= gameState.answerCount) break;
    finalGuess.push(idx);
  }
  
  console.log('최종 선택:', finalGuess.map(idx => gameState.keywords[idx]));
  
  return finalGuess;
}