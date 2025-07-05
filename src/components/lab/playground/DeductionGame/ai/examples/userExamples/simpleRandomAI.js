// 간단한 무작위 선택 AI
// 이 AI는 가능한 키워드 중에서 무작위로 선택합니다.

function makeGuess(gameState) {
  console.log('=== 간단한 무작위 AI 실행 ===');
  console.log('전체 키워드 개수:', gameState.keywords.length);
  console.log('찾아야 할 정답 개수:', gameState.answerCount);
  console.log('현재 턴:', gameState.currentTurn);
  
  // 선택 가능한 키워드 인덱스 찾기
  const availableIndices = [];
  
  for (let i = 0; i < gameState.keywords.length; i++) {
    // 내 힌트가 아니고, 공개된 오답도 아닌 키워드만 선택 가능
    if (!gameState.myHints.includes(i) && 
        !gameState.revealedWrongAnswers.includes(i)) {
      availableIndices.push(i);
    }
  }
  
  console.log('선택 가능한 키워드 개수:', availableIndices.length);
  
  // 이미 공개된 정답은 무조건 포함
  const myGuess = [];
  
  // 공개된 정답 추가
  for (let i = 0; i < gameState.revealedAnswers.length; i++) {
    myGuess.push(gameState.revealedAnswers[i]);
  }
  
  console.log('공개된 정답 개수:', gameState.revealedAnswers.length);
  
  // 나머지는 무작위로 선택
  while (myGuess.length < gameState.answerCount && availableIndices.length > 0) {
    // 무작위 인덱스 선택
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const selectedKeywordIndex = availableIndices[randomIndex];
    
    // 중복 확인
    if (!myGuess.includes(selectedKeywordIndex)) {
      myGuess.push(selectedKeywordIndex);
      // 선택된 것은 available에서 제거
      availableIndices.splice(randomIndex, 1);
    }
  }
  
  // 선택한 키워드 출력
  console.log('선택한 키워드 인덱스:', myGuess);
  console.log('선택한 키워드:', myGuess.map(idx => gameState.keywords[idx]));
  
  return myGuess;
}