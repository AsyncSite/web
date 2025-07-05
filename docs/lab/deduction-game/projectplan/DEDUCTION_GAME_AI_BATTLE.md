# 🏆 추론 게임 AI 배틀

## 문제 설명

**추론 게임 AI 배틀**에 오신 것을 환영합니다. 이 도전에서는 전략적 추측과 논리적 추론을 통해 숨겨진 정답 키워드를 찾아내는 AI 에이전트를 구현하게 됩니다.

### 개요

추론 게임은 더 큰 키워드 풀에서 정답 키워드 세트를 찾아내야 하는 멀티플레이어 논리 퍼즐입니다. 각 플레이어는 고유한 힌트(정답이 아닌 키워드들)를 받으며, 모든 플레이어의 추측 결과를 바탕으로 연역적 추론을 사용하여 정답을 찾아야 합니다.

**핵심 도전**: 추측에서 몇 개의 키워드가 맞았는지만 알 수 있고, 어떤 것이 맞았는지는 알 수 없습니다.

### 게임 규칙

1. **설정 단계**
   - 키워드 풀이 제공됩니다 (예: 50개 단어)
   - 일부가 비밀리에 정답으로 선택됩니다 (예: 5개 정답)
   - 각 플레이어는 고유한 힌트를 받습니다 (정답이 아닌 키워드들)

2. **게임 진행**
   - 플레이어들이 차례대로 추측을 합니다
   - 각 추측은 정확히 `answerCount`개의 키워드를 포함해야 합니다
   - 각 추측 후, 맞춘 키워드의 개수만 공개됩니다
   - 한 플레이어가 모든 정답을 맞추면 게임이 종료됩니다

3. **승리 조건**
   - 모든 정답을 먼저 맞춘 플레이어가 승리합니다
   - 최대 턴에 도달하면, 가장 많은 정보를 가진 플레이어가 승리합니다
   - 턴당 시간 제한으로 빠른 의사결정이 필요합니다

### 입력 형식

당신의 AI는 다음을 포함하는 `gameState` 객체를 받습니다:

```javascript
{
    keywords: string[],              // 사용 가능한 모든 키워드
    myHints: number[],              // 정답이 아닌 키워드의 인덱스
    answerCount: number,            // 찾아야 할 정답 개수
    previousGuesses: GuessHistory[], // 모든 이전 추측과 결과
    revealedAnswers: number[],      // 확인된 정답
    revealedWrongAnswers: number[], // 확인된 오답
    currentTurn: number,            // 현재 턴 번호
    timeLimit: number               // 시간 제한 (초)
}
```

`GuessHistory`는 다음과 같습니다:
```javascript
{
    playerId: number,
    guess: number[],      // 추측한 키워드 인덱스
    correctCount: number  // 맞춘 개수
}
```

### 출력 형식

당신의 추측을 나타내는 키워드 인덱스 배열을 반환하세요:

```javascript
[0, 2, 5, 8, 11]  // 예시: 이 인덱스들의 키워드를 추측
```

### 제약사항

- **시간 제한**: 턴당 2초
- **메모리 제한**: 128 MB
- **코드 크기**: 최대 10,000자
- **유효한 추측**: 정확히 `answerCount`개의 고유한 인덱스를 포함해야 함
- **외부 리소스 금지**: 네트워크 요청이나 파일 I/O 금지
- **결정론적**: 같은 입력은 같은 출력을 생성해야 함

### 평가 기준

당신의 AI는 다음 기준으로 평가됩니다:

1. **승률** (40%): 승리한 게임의 비율
2. **효율성** (30%): 승리까지의 평균 턴 수
3. **속도** (20%): 의사결정당 평균 시간
4. **안정성** (10%): 다양한 전략에 대한 성능

---

## 알고리즘 튜토리얼

### 1. 문제 공간 이해하기

추론 게임은 근본적으로 부분 정보를 가진 **제약 만족 문제(CSP)**입니다. 각 추측은 제약 조건을 제공하며, 목표는 모든 제약 조건을 만족하는 키워드 할당을 찾는 것입니다.

#### 예시 시나리오

```
키워드: ['고양이', '개', '새', '물고기', '사자']
정답: [0, 2, 4] (고양이, 새, 사자) - 플레이어에게 숨겨짐
당신의 힌트: [1] (개는 정답이 아님)

턴 1: 추측 [0, 1, 2] → 결과: 2개 정답
분석: 개(1)는 힌트이므로, 고양이(0)와 새(2)가 2개의 정답이어야 함
```

### 2. 핵심 알고리즘 접근법

#### 접근법 1: 제약 만족 문제 (CSP)

```javascript
function solveCSP(gameState) {
    const constraints = extractConstraints(gameState.previousGuesses);
    const domains = initializeDomains(gameState);
    
    // 제약 전파를 통한 백트래킹
    function backtrack(assignment, remaining) {
        if (remaining.length === 0) {
            return assignment;
        }
        
        const variable = selectUnassignedVariable(remaining);
        
        for (const value of orderDomainValues(variable, domains)) {
            if (isConsistent(value, assignment, constraints)) {
                assignment.add(value);
                
                // 전방 검사
                const inference = makeInference(value, domains, constraints);
                if (inference !== null) {
                    const result = backtrack(assignment, remaining.filter(v => v !== variable));
                    if (result !== null) return result;
                }
                
                assignment.delete(value);
                undoInference(inference, domains);
            }
        }
        
        return null;
    }
    
    return backtrack(new Set(), getAllVariables(gameState));
}
```

#### 접근법 2: 확률적 추론 (베이지안)

```javascript
function bayesianInference(gameState) {
    // 사전 확률 초기화
    const priors = initializePriors(gameState);
    
    // 각 추측에 기반하여 신념 업데이트
    for (const guess of gameState.previousGuesses) {
        updateBeliefs(priors, guess, gameState);
    }
    
    // 가장 높은 사후 확률을 가진 키워드 선택
    return selectTopK(priors, gameState.answerCount);
}

function updateBeliefs(beliefs, guess, gameState) {
    const likelihood = calculateLikelihood(guess, gameState);
    
    // 베이즈 정리: P(정답|증거) ∝ P(증거|정답) * P(정답)
    for (const [keyword, prior] of beliefs) {
        const posterior = likelihood.get(keyword) * prior;
        beliefs.set(keyword, normalize(posterior));
    }
}
```

#### 접근법 3: 정보 이론

```javascript
function maximizeInformationGain(gameState) {
    const possibleSolutions = generatePossibleSolutions(gameState);
    
    let bestGuess = null;
    let maxInfoGain = -Infinity;
    
    for (const candidate of generateCandidates(gameState)) {
        const infoGain = calculateExpectedInfoGain(candidate, possibleSolutions);
        
        if (infoGain > maxInfoGain) {
            maxInfoGain = infoGain;
            bestGuess = candidate;
        }
    }
    
    return bestGuess;
}

function calculateExpectedInfoGain(guess, possibleSolutions) {
    const outcomeDistribution = new Map();
    
    // 결과 확률 계산
    for (const solution of possibleSolutions) {
        const correctCount = countCorrect(guess, solution);
        outcomeDistribution.set(correctCount, 
            (outcomeDistribution.get(correctCount) || 0) + 1
        );
    }
    
    // 엔트로피 계산
    return calculateEntropy(outcomeDistribution, possibleSolutions.length);
}
```

### 3. 고급 전략

#### 전략 1: 제거 집합

확실하게 분류할 수 있는 키워드 그룹 식별:

```javascript
function findEliminationSets(gameState) {
    const definiteAnswers = new Set();
    const definiteWrongs = new Set();
    
    // 1개 차이를 가진 추측 쌍 비교
    for (let i = 0; i < gameState.previousGuesses.length; i++) {
        for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
            const [diff1, diff2] = compareGuesses(
                gameState.previousGuesses[i],
                gameState.previousGuesses[j]
            );
            
            if (diff1.length === 1 && diff2.length === 1) {
                // correctCount 차이를 기반으로 추론
                inferFromDifference(diff1[0], diff2[0], 
                    gameState.previousGuesses[i].correctCount,
                    gameState.previousGuesses[j].correctCount,
                    definiteAnswers, definiteWrongs
                );
            }
        }
    }
    
    return { definiteAnswers, definiteWrongs };
}
```

#### 전략 2: 가설 검증

키워드 조합에 대한 특정 가설 테스트:

```javascript
function hypothesisTesting(gameState) {
    // 가설 생성
    const hypotheses = generateHypotheses(gameState);
    
    // 각 가설을 과거 데이터로 검증
    const validHypotheses = hypotheses.filter(h => 
        validateHypothesis(h, gameState.previousGuesses)
    );
    
    // 남은 가설들을 가장 잘 구분하는 추측 선택
    return selectDiscriminatingGuess(validHypotheses, gameState);
}
```

#### 전략 3: 적응형 전략 선택

게임 단계에 따라 전략 선택:

```javascript
function adaptiveStrategy(gameState) {
    const phase = determineGamePhase(gameState);
    
    switch (phase) {
        case 'early':
            // 정보 수집 최대화
            return exploratoryStrategy(gameState);
            
        case 'middle':
            // 탐색과 활용의 균형
            return balancedStrategy(gameState);
            
        case 'late':
            // 남은 정답 찾기에 집중
            return exploitationStrategy(gameState);
            
        default:
            return defaultStrategy(gameState);
    }
}
```

### 4. 구현 가이드라인

#### 메모리 관리

```javascript
// 효율적인 데이터 구조 사용
const keywordCache = new Map();
const solutionSpace = new Set();

// 각 턴 후 정리
function cleanupMemory() {
    // 무효화된 해 제거
    for (const solution of solutionSpace) {
        if (!isValid(solution)) {
            solutionSpace.delete(solution);
        }
    }
    
    // 캐시 크기 제한
    if (keywordCache.size > 1000) {
        pruneCache(keywordCache);
    }
}
```

#### 성능 최적화

```javascript
// 조기 종료
function findSolutionsOptimized(gameState, maxSolutions = 100) {
    const solutions = [];
    const startTime = Date.now();
    
    function search(current, index) {
        // 시간 제한 검사
        if (Date.now() - startTime > 1500) return;
        
        // 해 개수 제한 검사
        if (solutions.length >= maxSolutions) return;
        
        // ... 검색 로직
    }
    
    search([], 0);
    return solutions;
}

// 메모이제이션
const memo = new Map();

function memoizedCalculation(key, computeFn) {
    if (memo.has(key)) {
        return memo.get(key);
    }
    
    const result = computeFn();
    memo.set(key, result);
    return result;
}
```

### 5. 일반적인 함정과 해결책

#### 함정 1: 타임아웃 문제

**문제**: 복잡한 알고리즘이 시간 제한 초과

**해결책**:
```javascript
function makeGuess(gameState) {
    const startTime = Date.now();
    const timeLimit = 1800; // 200ms 버퍼 남김
    
    // 먼저 고급 전략 시도
    try {
        const result = advancedStrategy(gameState, timeLimit);
        if (Date.now() - startTime < timeLimit && result) {
            return result;
        }
    } catch (e) {
        console.error('고급 전략 실패:', e);
    }
    
    // 간단한 전략으로 폴백
    return simpleStrategy(gameState);
}
```

#### 함정 2: 유효하지 않은 추측

**문제**: 중복된 인덱스나 잘못된 개수 반환

**해결책**:
```javascript
function validateGuess(guess, gameState) {
    // 길이 검사
    if (guess.length !== gameState.answerCount) {
        throw new Error(`잘못된 길이: ${guess.length}`);
    }
    
    // 중복 검사
    if (new Set(guess).size !== guess.length) {
        throw new Error('중복된 인덱스');
    }
    
    // 범위 검사
    for (const idx of guess) {
        if (idx < 0 || idx >= gameState.keywords.length) {
            throw new Error(`잘못된 인덱스: ${idx}`);
        }
    }
    
    // 힌트 검사
    for (const hint of gameState.myHints) {
        if (guess.includes(hint)) {
            throw new Error(`추측에 힌트 포함: ${hint}`);
        }
    }
    
    return true;
}
```

### 6. AI 테스트하기

#### 단위 테스트

```javascript
// 제약 만족 테스트
function testCSP() {
    const testState = {
        keywords: ['a', 'b', 'c', 'd', 'e'],
        myHints: [1],
        answerCount: 3,
        previousGuesses: [
            { guess: [0, 1, 2], correctCount: 2 },
            { guess: [0, 2, 3], correctCount: 3 }
        ]
    };
    
    const result = solveCSP(testState);
    assert(result.includes(0) && result.includes(2) && result.includes(3));
}

// 엣지 케이스 테스트
function testEdgeCases() {
    // 빈 추측 기록
    // 모든 힌트
    // 하나의 가능한 해
    // 가능한 해 없음
}
```

#### 성능 벤치마크

```javascript
function benchmark() {
    const scenarios = generateTestScenarios();
    const results = [];
    
    for (const scenario of scenarios) {
        const startTime = performance.now();
        const guess = makeGuess(scenario);
        const endTime = performance.now();
        
        results.push({
            scenario: scenario.name,
            time: endTime - startTime,
            valid: validateGuess(guess, scenario)
        });
    }
    
    return results;
}
```

### 7. 예제 솔루션

#### 초급 솔루션 (점수: 60-70)

```javascript
function makeGuess(gameState) {
    // 간단한 빈도 기반 접근법
    const scores = new Map();
    
    // 점수 초기화
    for (let i = 0; i < gameState.keywords.length; i++) {
        if (!gameState.myHints.includes(i) && 
            !gameState.revealedWrongAnswers.includes(i)) {
            scores.set(i, 0);
        }
    }
    
    // 추측 기록에 기반한 점수 부여
    for (const guess of gameState.previousGuesses) {
        const scorePerKeyword = guess.correctCount / guess.guess.length;
        
        for (const idx of guess.guess) {
            if (scores.has(idx)) {
                scores.set(idx, scores.get(idx) + scorePerKeyword);
            }
        }
    }
    
    // 상위 점수 키워드 선택
    const sorted = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
    
    // 공개된 정답 포함
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

#### 중급 솔루션 (점수: 75-85)

```javascript
function makeGuess(gameState) {
    // 확실한 정보 추출
    const { definiteAnswers, definiteWrongs } = analyzeGuesses(gameState);
    
    // 확률 맵 구축
    const probabilities = buildProbabilityMap(gameState, definiteAnswers, definiteWrongs);
    
    // 충분한 확실한 정답이 있으면 사용
    if (definiteAnswers.size >= gameState.answerCount) {
        return Array.from(definiteAnswers).slice(0, gameState.answerCount);
    }
    
    // 그렇지 않으면 확실한 정답과 가장 높은 확률 후보 결합
    const guess = Array.from(definiteAnswers);
    const candidates = Array.from(probabilities.entries())
        .filter(([idx, _]) => !definiteAnswers.has(idx))
        .sort((a, b) => b[1] - a[1]);
    
    for (const [idx, _] of candidates) {
        if (guess.length >= gameState.answerCount) break;
        guess.push(idx);
    }
    
    return guess;
}

function analyzeGuesses(gameState) {
    const definiteAnswers = new Set(gameState.revealedAnswers);
    const definiteWrongs = new Set([
        ...gameState.myHints,
        ...gameState.revealedWrongAnswers
    ]);
    
    // 쌍별 비교 로직
    for (let i = 0; i < gameState.previousGuesses.length - 1; i++) {
        for (let j = i + 1; j < gameState.previousGuesses.length; j++) {
            inferFromPair(
                gameState.previousGuesses[i],
                gameState.previousGuesses[j],
                definiteAnswers,
                definiteWrongs
            );
        }
    }
    
    return { definiteAnswers, definiteWrongs };
}
```

#### 고급 솔루션 (점수: 90+)

```javascript
function makeGuess(gameState) {
    // 단계 기반 전략 선택
    const strategy = selectStrategy(gameState);
    
    switch (strategy) {
        case 'CSP_SOLVER':
            return cspSolver(gameState);
        case 'BAYESIAN':
            return bayesianSolver(gameState);
        case 'INFO_THEORY':
            return infoTheorySolver(gameState);
        default:
            return hybridSolver(gameState);
    }
}

function hybridSolver(gameState) {
    // 여러 접근법 결합
    const cspSolutions = findValidSolutions(gameState, 50);
    
    if (cspSolutions.length === 0) {
        // 확률적 접근법으로 폴백
        return bayesianSolver(gameState);
    }
    
    if (cspSolutions.length === 1) {
        // 고유한 해 발견
        return cspSolutions[0];
    }
    
    // 여러 유효한 해 - 정보 이론 사용
    return selectBestGuess(cspSolutions, gameState);
}

function findValidSolutions(gameState, limit) {
    const solutions = [];
    const candidates = generateCandidateSets(gameState);
    
    for (const candidate of candidates) {
        if (solutions.length >= limit) break;
        
        if (satisfiesAllConstraints(candidate, gameState)) {
            solutions.push(candidate);
        }
    }
    
    return solutions;
}

function selectBestGuess(solutions, gameState) {
    // 정보 이론적 접근
    let bestGuess = null;
    let maxInfoGain = -Infinity;
    
    // 다양한 추측 생성
    const guesses = generateDiverseGuesses(solutions, gameState);
    
    for (const guess of guesses) {
        const infoGain = calculateInfoGain(guess, solutions);
        
        if (infoGain > maxInfoGain) {
            maxInfoGain = infoGain;
            bestGuess = guess;
        }
    }
    
    return bestGuess || solutions[0];
}
```

---

## 대회 규칙

### 제출 가이드라인

1. **코드 형식**
   - `makeGuess`라는 이름의 단일 JavaScript 함수
   - 전역 변수 금지 (필요시 클로저 사용)
   - 최대 10,000자

2. **테스트 과정**
   - 샘플 상대에 대한 예비 테스트
   - 예선 라운드 (상위 50% 진출)
   - 다양한 상대와의 토너먼트 대진

3. **랭킹 시스템**
   - ELO 기반 레이팅 시스템
   - 지역별 및 글로벌 리더보드
   - 상금이 있는 월간 챔피언십

### 공정 플레이 정책

- 코드 난독화 금지
- 타이밍 공격이나 악용 금지
- 인스턴스 간 통신 금지
- 위반 시 실격 처리

### 리소스

- **스타터 키트**: 기본 AI 구현
- **테스트 프레임워크**: 로컬 테스트 환경
- **리플레이 뷰어**: 게임 분석
- **커뮤니티 포럼**: 전략 토론 (코드 공유 금지)

---

## FAQ

**Q: Can I use machine learning libraries?**
A: No, only vanilla JavaScript is allowed. Implement algorithms from scratch.

**Q: How are ties broken?**
A: By efficiency (fewer turns), then by average decision time.

**Q: Can I store state between turns?**
A: No, each turn must be stateless. Use only the provided gameState.

**Q: What happens if my code crashes?**
A: A random valid guess will be made, and you receive a penalty.

**Q: How often can I submit?**
A: Maximum 10 submissions per day, best score counts.

---

## Get Started

1. Read the complete rules and tutorial
2. Download the starter kit
3. Implement your `makeGuess` function
4. Test locally with the provided framework
5. Submit your solution
6. Watch your AI compete!

Good luck, and may the best algorithm win! 🎯