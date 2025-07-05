# 🎮 Deduction Game AI 작성 가이드

## 📌 시작하기

DeductionGame에서 당신만의 AI를 만들어보세요! 이 가이드는 AI 코드를 작성하는 방법을 단계별로 설명합니다.

### 목차
1. [게임 이해하기](#-게임-이해하기)
2. [AI 코드 작성하기](#-ai-코드-작성하기)
3. [단계별 AI 작성 예제](#-단계별-ai-작성-예제)
4. [고급 전략과 알고리즘](#-고급-전략과-알고리즘)
5. [성능 최적화](#-성능-최적화)
6. [주의사항](#️-주의사항)
7. [디버깅 팁](#-디버깅-팁)
8. [FAQ](#-자주-묻는-질문-faq)
9. [실전 예제 분석](#-실전-예제-분석)

---

## 🎯 게임 이해하기

### 게임의 목표
- 주어진 키워드 중에서 **정답 키워드들을 모두 찾아내는 것**입니다
- 각 플레이어는 게임 시작 시 **힌트**(정답이 아닌 키워드들)를 받습니다
- 매 턴마다 추측을 하고, **맞춘 개수**만 공개됩니다 (어떤 것이 맞았는지는 비공개)

### 예시
```
전체 키워드: ['사자', '호랑이', '코끼리', '기린', '원숭이']
정답: [0, 2, 4] (사자, 코끼리, 원숭이)
당신의 힌트: [1] (호랑이는 정답이 아님)

턴 1: [0, 1, 2] 추측 → 2개 정답
턴 2: [0, 2, 4] 추측 → 3개 정답 (승리!)
```

### 게임의 핵심 메커니즘

1. **정보의 비대칭성**: 각 플레이어는 서로 다른 힌트를 가지고 있습니다
2. **부분 정보 공개**: 추측 후 맞춘 '개수'만 공개되며, '어떤 것'이 맞았는지는 비공개입니다
3. **논리적 추론**: 여러 추측의 결과를 조합하여 정답을 추론해야 합니다
4. **시간 압박**: 제한 시간 내에 추측을 완료해야 합니다

---

## 💻 AI 코드 작성하기

### 1. 기본 구조

모든 AI는 `makeGuess` 함수를 구현해야 합니다:

```javascript
function makeGuess(gameState) {
    // 여기에 AI 로직을 작성하세요
    
    // 반드시 숫자 배열을 반환해야 합니다
    return [0, 1, 2]; // 선택한 키워드의 인덱스
}
```

### 2. gameState 이해하기

`gameState` 객체에는 게임의 모든 정보가 담겨있습니다:

```javascript
{
    keywords: ['사자', '호랑이', '코끼리', ...],  // 전체 키워드 목록
    myHints: [1, 3],                            // 당신의 힌트 (이 인덱스들은 정답이 아님!)
    answerCount: 3,                             // 찾아야 할 정답 개수
    
    previousGuesses: [                          // 모든 플레이어의 이전 추측 기록
        {
            playerId: 1,
            guess: [0, 1, 2],                   // 추측한 인덱스들
            correctCount: 2                     // 맞춘 개수
        },
        // ...
    ],
    
    revealedAnswers: [0],                       // 공개된 정답 인덱스
    revealedWrongAnswers: [5, 7],              // 공개된 오답 인덱스
    
    currentTurn: 5,                             // 현재 턴 번호
    maxTurns: 20,                              // 최대 턴 수 (optional)
    timeLimit: 60                               // 시간 제한 (초)
}
```

---

## 🚀 단계별 AI 작성 예제

### Level 1: 초보자 AI (무작위 선택)

```javascript
function makeGuess(gameState) {
    // Step 1: 선택 가능한 키워드 찾기
    const canSelect = [];
    
    for (let i = 0; i < gameState.keywords.length; i++) {
        // 힌트와 공개된 오답은 제외
        if (!gameState.myHints.includes(i) && 
            !gameState.revealedWrongAnswers.includes(i)) {
            canSelect.push(i);
        }
    }
    
    // Step 2: 공개된 정답은 무조건 포함
    const myGuess = [...gameState.revealedAnswers];
    
    // Step 3: 나머지는 무작위로 선택
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

### Level 2: 중급자 AI (추측 분석)

```javascript
function makeGuess(gameState) {
    // 각 키워드의 점수를 계산
    const scores = new Map();
    
    // 모든 키워드를 0점으로 초기화
    for (let i = 0; i < gameState.keywords.length; i++) {
        scores.set(i, 0);
    }
    
    // 이전 추측들을 분석하여 점수 부여
    gameState.previousGuesses.forEach(guess => {
        if (guess.correctCount > 0) {
            // 정답이 포함된 추측의 키워드들에 점수 부여
            const points = guess.correctCount / guess.guess.length;
            guess.guess.forEach(idx => {
                scores.set(idx, scores.get(idx) + points);
            });
        } else {
            // 정답이 없는 추측의 키워드들은 감점
            guess.guess.forEach(idx => {
                scores.set(idx, scores.get(idx) - 1);
            });
        }
    });
    
    // 사용 불가능한 키워드 제외
    [...gameState.myHints, ...gameState.revealedWrongAnswers].forEach(idx => {
        scores.delete(idx);
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
    
    return result;
}
```

### Level 3: 고급자 AI (논리적 추론)

```javascript
function makeGuess(gameState) {
    // 추측 간 비교를 통한 논리적 추론
    const definiteAnswers = new Set(gameState.revealedAnswers);
    const definiteWrongs = new Set([...gameState.myHints, ...gameState.revealedWrongAnswers]);
    
    // 두 추측을 비교하여 확실한 정답/오답 찾기
    for (let i = 0; i < gameState.previousGuesses.length - 1; i++) {
        for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
            const guess1 = gameState.previousGuesses[i];
            const guess2 = gameState.previousGuesses[j];
            
            // 한 개만 다른 경우
            const diff1 = guess1.guess.filter(x => !guess2.guess.includes(x));
            const diff2 = guess2.guess.filter(x => !guess1.guess.includes(x));
            
            if (diff1.length === 1 && diff2.length === 1) {
                // 정답 개수 차이로 확실한 답 추론
                if (guess1.correctCount > guess2.correctCount) {
                    definiteAnswers.add(diff1[0]);
                    definiteWrongs.add(diff2[0]);
                } else if (guess2.correctCount > guess1.correctCount) {
                    definiteAnswers.add(diff2[0]);
                    definiteWrongs.add(diff1[0]);
                }
            }
        }
    }
    
    // 확실한 답들로 추측 구성
    const result = Array.from(definiteAnswers);
    
    // 부족한 부분은 다른 전략으로 채우기
    // ... (중급자 AI의 점수 방식 등 활용)
    
    return result;
}
```

---

## 🧠 고급 전략과 알고리즘

### 1. 제약 충족 문제(CSP) 접근법

```javascript
function makeGuess(gameState) {
    // 모든 제약 조건을 만족하는 가능한 정답 조합 찾기
    const possibleSolutions = [];
    
    // 백트래킹으로 가능한 조합 생성
    function findSolutions(current, startIdx) {
        if (current.length === gameState.answerCount) {
            // 모든 이전 추측과 일치하는지 검증
            if (validateSolution(current, gameState.previousGuesses)) {
                possibleSolutions.push([...current]);
            }
            return;
        }
        
        for (let i = startIdx; i < gameState.keywords.length; i++) {
            if (canUseKeyword(i, gameState)) {
                current.push(i);
                findSolutions(current, i + 1);
                current.pop();
            }
        }
    }
    
    findSolutions([], 0);
    
    // 가능한 해가 하나면 그것이 정답
    if (possibleSolutions.length === 1) {
        return possibleSolutions[0];
    }
    
    // 여러 해가 있으면 정보 이득이 최대인 추측 선택
    return selectBestGuess(possibleSolutions, gameState);
}
```

### 2. 베이지안 추론

```javascript
function makeGuess(gameState) {
    // 각 키워드의 사전 확률 초기화
    const priors = new Map();
    const totalKeywords = gameState.keywords.length;
    const baseProb = gameState.answerCount / totalKeywords;
    
    for (let i = 0; i < totalKeywords; i++) {
        if (gameState.myHints.includes(i) || gameState.revealedWrongAnswers.includes(i)) {
            priors.set(i, 0);
        } else if (gameState.revealedAnswers.includes(i)) {
            priors.set(i, 1);
        } else {
            priors.set(i, baseProb);
        }
    }
    
    // 베이지안 업데이트
    const posteriors = new Map(priors);
    
    gameState.previousGuesses.forEach(guess => {
        updateProbabilities(posteriors, guess, gameState);
    });
    
    // 확률이 높은 순으로 선택
    const sorted = Array.from(posteriors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, gameState.answerCount)
        .map(entry => entry[0]);
    
    return sorted;
}
```

### 3. 정보 이득 최대화

```javascript
function selectBestGuess(possibleSolutions, gameState) {
    let bestGuess = null;
    let maxInfoGain = -1;
    
    // 각 가능한 추측에 대해 정보 이득 계산
    const candidates = generateCandidateGuesses(gameState);
    
    candidates.forEach(guess => {
        const infoGain = calculateExpectedInfoGain(guess, possibleSolutions);
        
        if (infoGain > maxInfoGain) {
            maxInfoGain = infoGain;
            bestGuess = guess;
        }
    });
    
    return bestGuess;
}

function calculateExpectedInfoGain(guess, possibleSolutions) {
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
```

### 4. 미니맥스 전략 (상대방 고려)

```javascript
function makeGuess(gameState) {
    // 상대방이 최적으로 플레이한다고 가정
    const myTurnsLeft = estimateTurnsLeft(gameState);
    const opponentProgress = analyzeOpponentProgress(gameState);
    
    if (opponentProgress.isClose && myTurnsLeft > 2) {
        // 상대가 곧 이길 것 같으면 위험한 추측도 시도
        return makeRiskyGuess(gameState);
    } else {
        // 안전한 플레이
        return makeSafeGuess(gameState);
    }
}
```

---

## ⚡ 성능 최적화

### 1. 메모이제이션 활용

```javascript
// 전역 캐시
const cache = new Map();

function makeGuess(gameState) {
    // 게임 상태를 키로 변환
    const stateKey = generateStateKey(gameState);
    
    if (cache.has(stateKey)) {
        return cache.get(stateKey);
    }
    
    const result = computeGuess(gameState);
    cache.set(stateKey, result);
    
    return result;
}
```

### 2. 조기 종료 (Early Termination)

```javascript
function findSolutions(current, startIdx, gameState, solutions, maxSolutions = 100) {
    // 해가 충분히 많으면 조기 종료
    if (solutions.length >= maxSolutions) {
        return;
    }
    
    // 시간 초과 방지
    if (Date.now() - startTime > 1500) { // 1.5초
        return;
    }
    
    // ... 백트래킹 로직
}
```

### 3. 가지치기 (Pruning)

```javascript
function canContinue(current, remaining, gameState) {
    // 불가능한 경로 조기 차단
    if (current.length + remaining < gameState.answerCount) {
        return false;
    }
    
    // 현재까지의 선택이 제약 조건 위반
    if (!satisfiesConstraints(current, gameState)) {
        return false;
    }
    
    return true;
}
```

---

## ⚠️ 주의사항

### 1. 반드시 지켜야 할 규칙
- ✅ `makeGuess` 함수를 정의해야 합니다
- ✅ 숫자 배열을 반환해야 합니다
- ✅ 반환하는 배열의 길이는 `gameState.answerCount`와 같아야 합니다
- ✅ 실행 시간은 2초를 초과하면 안 됩니다

### 2. 금지된 코드
- ❌ `eval()`, `Function()` 사용 금지
- ❌ `setTimeout`, `setInterval` 사용 금지
- ❌ `fetch`, `XMLHttpRequest` 등 네트워크 요청 금지
- ❌ `import`, `require` 사용 금지

### 3. 사용 가능한 기능
- ✅ `console.log()` - 디버깅용 출력
- ✅ 모든 JavaScript 기본 문법
- ✅ `Math`, `Array`, `Set`, `Map` 등 기본 객체
- ✅ 일반적인 알고리즘 구현

---

## 🐛 디버깅 팁

### 1. console.log 활용
```javascript
function makeGuess(gameState) {
    console.log('현재 턴:', gameState.currentTurn);
    console.log('이전 추측 수:', gameState.previousGuesses.length);
    
    // AI 로직...
    
    console.log('최종 선택:', result);
    return result;
}
```

### 2. 일반적인 에러와 해결법

| 에러 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| `makeGuess is not defined` | 함수 이름이 잘못됨 | `function makeGuess` 로 정확히 작성 |
| `Cannot read property 'length'` | undefined 접근 | 배열 존재 여부 확인 |
| `Maximum call stack exceeded` | 무한 루프 | 반복문 조건 확인 |
| `Execution timeout` | 실행 시간 초과 | 알고리즘 최적화 필요 |

---

## 💡 전략 힌트

1. **정보 수집**: 초반에는 다양한 조합을 시도하여 정보를 모으세요
2. **패턴 분석**: 같은 플레이어의 연속된 추측을 비교하면 힌트를 얻을 수 있습니다
3. **확률 계산**: 각 키워드가 정답일 확률을 계산하여 선택하세요
4. **제외 방법**: 확실한 오답을 먼저 제외하고 나머지에서 선택하세요

---

## ❓ 자주 묻는 질문 (FAQ)

### Q1: 내 AI가 시간 초과됩니다. 어떻게 해야 하나요?
**A**: 다음을 확인하세요:
- 무한 루프가 있는지 확인
- 백트래킹 시 가지치기 적용
- 복잡한 계산은 캐싱 활용
- 조기 종료 조건 추가

### Q2: console.log가 보이지 않아요
**A**: 브라우저 개발자 도구(F12)의 콘솔 탭을 확인하세요. AI 실행 중 출력된 내용이 표시됩니다.

### Q3: 배열 인덱스 에러가 발생해요
**A**: 다음을 확인하세요:
```javascript
// 안전한 배열 접근
if (array && array.length > index) {
    return array[index];
}
```

### Q4: 다른 플레이어의 힌트를 알 수 있나요?
**A**: 아니요. 각 플레이어의 힌트는 비공개입니다. 추측 결과로만 추론해야 합니다.

### Q5: 같은 키워드를 여러 번 선택할 수 있나요?
**A**: 아니요. 한 번의 추측에서 각 키워드는 한 번만 선택할 수 있습니다.

---

## 🎯 실전 예제 분석

### 시나리오 1: 교집합으로 정답 찾기

```javascript
// 상황: 두 추측의 차이가 1개씩
previousGuesses = [
    { guess: [0, 1, 2, 3, 4], correctCount: 3 },
    { guess: [0, 1, 2, 3, 5], correctCount: 2 }  // 4 → 5로 변경
]

// 분석: 4는 정답, 5는 오답
// 이유: 4를 5로 바꿨더니 정답이 1개 줄었으므로
```

### 시나리오 2: 제외법 활용

```javascript
// 상황: 정답이 0개인 추측
previousGuesses = [
    { guess: [10, 11, 12, 13, 14], correctCount: 0 }
]

// 분석: 10, 11, 12, 13, 14는 모두 오답
// 활용: 이 키워드들을 완전히 제외하고 추측
```

### 시나리오 3: 확률적 접근

```javascript
// 상황: 여러 추측에서 자주 나타나는 패턴
previousGuesses = [
    { guess: [1, 2, 3, 4, 5], correctCount: 2 },
    { guess: [1, 2, 6, 7, 8], correctCount: 2 },
    { guess: [1, 3, 6, 9, 10], correctCount: 2 }
]

// 분석: 1이 모든 추측에 포함되고, 항상 정답이 2개
// 추론: 1은 정답일 가능성이 높음
```

---

## 🛠️ 고급 디버깅 기법

### 1. 상태 추적

```javascript
function makeGuess(gameState) {
    // 디버깅용 상태 추적
    const debug = {
        turnNumber: gameState.currentTurn,
        previousGuessCount: gameState.previousGuesses.length,
        revealedCount: gameState.revealedAnswers.length,
        startTime: Date.now()
    };
    
    console.log('Debug Info:', debug);
    
    // AI 로직...
    
    console.log('Execution time:', Date.now() - debug.startTime, 'ms');
    
    return result;
}
```

### 2. 검증 함수

```javascript
function validateGuess(guess, gameState) {
    // 추측이 유효한지 검증
    const errors = [];
    
    if (!Array.isArray(guess)) {
        errors.push('추측은 배열이어야 합니다');
    }
    
    if (guess.length !== gameState.answerCount) {
        errors.push(`추측 길이가 잘못됨: ${guess.length} !== ${gameState.answerCount}`);
    }
    
    const uniqueGuess = new Set(guess);
    if (uniqueGuess.size !== guess.length) {
        errors.push('중복된 키워드가 있습니다');
    }
    
    guess.forEach(idx => {
        if (gameState.myHints.includes(idx)) {
            errors.push(`힌트 키워드를 선택함: ${idx}`);
        }
    });
    
    if (errors.length > 0) {
        console.error('추측 검증 실패:', errors);
        return false;
    }
    
    return true;
}
```

---

## 🏆 도전 과제

### 초급 도전
1. **기본 마스터**: 10턴 이내에 정답 찾기
2. **효율성**: 평균 7턴 이내로 승리하기
3. **안정성**: 에러 없이 100게임 완주하기

### 중급 도전
1. **적응형 AI**: 상대방의 전략을 파악하여 대응하기
2. **메타 전략**: 게임 단계별로 다른 전략 사용하기
3. **확률 마스터**: 베이지안 추론으로 90% 이상 승률 달성하기

### 고급 도전
1. **완벽한 AI**: CSP로 최소 턴 수 보장하기
2. **심리전**: 상대를 혼란시키는 추측 패턴 만들기
3. **최적화의 극한**: 0.1초 이내에 최적해 찾기

---

## 💡 마지막 조언

1. **작게 시작하세요**: 복잡한 알고리즘보다 간단하고 확실한 로직부터
2. **테스트하세요**: 다양한 시나리오에서 AI를 테스트
3. **학습하세요**: 다른 AI와의 대전에서 배우기
4. **최적화는 나중에**: 먼저 작동하게 만들고, 그 다음 빠르게
5. **즐기세요**: 이것은 게임입니다. 재미있게 플레이하세요!

---

## 📚 추가 리소스

- [JavaScript 기초 문법](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide)
- [알고리즘 기초](https://www.khanacademy.org/computing/computer-science/algorithms)
- [제약 충족 문제(CSP)](https://en.wikipedia.org/wiki/Constraint_satisfaction_problem)
- [베이지안 추론](https://en.wikipedia.org/wiki/Bayesian_inference)
- [정보 이론](https://en.wikipedia.org/wiki/Information_theory)
- 예제 AI 코드는 에디터의 "예제 코드" 버튼으로 확인하세요

---

## 🎮 커뮤니티

AI를 공유하고 다른 사람들과 경쟁하고 싶으신가요?

- 당신의 AI 전략을 공유해주세요
- 다른 사람들의 AI와 대전해보세요
- 토너먼트에 참가해보세요
- 최고의 AI를 만들어 명예의 전당에 이름을 올리세요!

행운을 빕니다! 당신의 AI가 최고가 되길 바랍니다! 🎉