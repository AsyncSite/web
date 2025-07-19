# 추론 게임 AI 작성 가이드

## 개요
추론 게임에서 사용자는 자신만의 AI를 작성하여 게임에 참여시킬 수 있습니다. AI는 `makeGuess` 함수를 구현하여 게임 상태를 분석하고 정답을 추론해야 합니다.

## 함수 시그니처

```javascript
function makeGuess(gameState) {
    // AI 로직 구현
    return [0, 1, 2]; // 추측한 키워드의 인덱스 배열 반환
}
```

## 입력: gameState 객체

`makeGuess` 함수는 현재 게임 상태를 담은 `gameState` 객체를 매개변수로 받습니다:

```javascript
{
    keywords: ['사자', '호랑이', '코끼리', ...],  // 게임의 모든 키워드 배열
    myHints: [1, 3],                            // 정답이 아닌 키워드 인덱스 (나만 아는 힌트)
    answerCount: 3,                             // 찾아야 할 정답 개수
    
    previousGuesses: [                          // 모든 플레이어의 이전 추측 기록
        {
            playerId: 1,                        // 플레이어 ID
            guess: [0, 1, 2],                   // 추측한 키워드 인덱스 배열
            correctCount: 2                     // 맞춘 개수
        },
        // ... 더 많은 추측 기록
    ],
    
    revealedAnswers: [0],                       // 공개된 정답 인덱스
    revealedWrongAnswers: [5, 7],              // 공개된 오답 인덱스
    
    currentTurn: 5,                             // 현재 턴 번호
    maxTurns: 20,                              // 최대 턴 수 (선택사항)
    timeLimit: 60                               // 제한 시간(초)
}
```

## 출력 요구사항

- **반드시** 숫자 배열을 반환해야 합니다 (키워드 인덱스)
- 배열의 길이는 **반드시** `gameState.answerCount`와 같아야 합니다
- `myHints`나 `revealedWrongAnswers`에 포함된 인덱스는 사용할 수 없습니다
- `revealedAnswers`에 있는 모든 인덱스는 반드시 포함되어야 합니다

## 실행 환경 및 제약사항

### 실행 환경
- Web Worker에서 격리된 환경으로 실행됩니다
- 함수는 **2초 이내**에 결과를 반환해야 합니다

### 사용 금지 항목
- `eval()`, `Function()` - 동적 코드 실행
- `setTimeout`, `setInterval` - 타이머 함수
- `fetch`, `XMLHttpRequest` - 네트워크 요청
- `import`, `require` - 모듈 로딩
- DOM 접근, `window` 객체

### 사용 가능 항목
- `console.log()` - 디버깅용
- 모든 JavaScript 기본 기능 (Math, Array, Set, Map 등)
- 커스텀 알고리즘 및 자료구조

## 예제 코드

### 1. 기본 랜덤 AI

```javascript
function makeGuess(gameState) {
    const canSelect = [];
    
    // 선택 가능한 키워드 찾기
    for (let i = 0; i < gameState.keywords.length; i++) {
        if (!gameState.myHints.includes(i) && 
            !gameState.revealedWrongAnswers.includes(i)) {
            canSelect.push(i);
        }
    }
    
    // 공개된 정답 포함
    const myGuess = [...gameState.revealedAnswers];
    
    // 나머지를 랜덤하게 선택
    while (myGuess.length < gameState.answerCount && canSelect.length > 0) {
        const randomIndex = Math.floor(Math.random() * canSelect.length);
        const selected = canSelect[randomIndex];
        
        if (!myGuess.includes(selected)) {
            myGuess.push(selected);
            canSelect.splice(randomIndex, 1);
        }
    }
    
    return myGuess;
}
```

### 2. 점수 기반 고급 AI

```javascript
function makeGuess(gameState) {
    const scores = new Map();
    
    // 모든 키워드에 점수 초기화
    for (let i = 0; i < gameState.keywords.length; i++) {
        scores.set(i, 0);
    }
    
    // 이전 추측 분석
    gameState.previousGuesses.forEach(guess => {
        if (guess.correctCount > 0) {
            // 맞춘 개수가 있으면 해당 키워드들에 점수 부여
            const points = guess.correctCount / guess.guess.length;
            guess.guess.forEach(idx => {
                scores.set(idx, scores.get(idx) + points);
            });
        } else {
            // 하나도 못 맞췄으면 감점
            guess.guess.forEach(idx => {
                scores.set(idx, scores.get(idx) - 1);
            });
        }
    });
    
    // 사용 불가능한 키워드 제거
    [...gameState.myHints, ...gameState.revealedWrongAnswers].forEach(idx => {
        scores.delete(idx);
    });
    
    // 점수 순으로 정렬하여 상위 후보 선택
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
```

## 전략 수준별 가이드

### 🥉 브론즈 (Bronze)
- 기본 제약사항을 지키며 랜덤 선택
- 공개된 정답 포함, 힌트와 오답 제외

### 🥈 실버 (Silver)
- 이전 추측 결과를 점수화하여 분석
- 맞춘 개수가 많은 그룹의 키워드에 가중치 부여

### 🥇 골드 (Gold)
- 추측 간의 차이를 비교하여 논리적 추론
- 교집합/차집합 분석으로 정답 후보 좁히기

### 💎 플래티넘 (Platinum)
- 제약 조건 충족 알고리즘 구현
- 가설 설정 및 검증 시스템

### 🏆 챌린저 (Challenger)
- 정보 이론 활용한 최적 추측
- 상대 플레이어 모델링 및 예측

## 디버깅 팁

1. `console.log()`를 활용하여 게임 상태 확인
2. 먼저 간단한 로직으로 시작한 후 점진적으로 개선
3. 엣지 케이스 고려 (예: 선택 가능한 키워드가 부족한 경우)
4. 실행 시간을 주의하여 복잡한 계산은 최적화

## 주의사항

- 코드는 안전한 샌드박스 환경에서 실행되므로 외부 리소스에 접근할 수 없습니다
- 무한 루프나 과도한 연산은 타임아웃으로 실행이 중단됩니다
- 잘못된 형식의 반환값은 게임에서 실격 처리될 수 있습니다

## 시작하기

1. 위의 예제 코드 중 하나를 복사하여 시작하세요
2. 게임 화면의 "AI 코드 입력" 섹션에 코드를 붙여넣으세요
3. "AI 추가" 버튼을 클릭하여 게임에 참여시키세요
4. 게임을 시작하고 AI의 성능을 확인하세요

행운을 빕니다! 🎮