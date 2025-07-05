# Deduction Game: 커스텀 AI 제작 완벽 가이드

Deduction Game에 당신만의 AI를 만들어 참여시켜 보세요! 이 가이드는 AI 제작에 필요한 기본 지식부터 고급 전략까지, 당신이 최고의 AI 개발자가 되는 길을 안내합니다.

## 1. AI 코드의 기본 구조: `makeGuess` 함수

당신이 작성할 코드는 `makeGuess` 함수 하나입니다. 이 함수는 당신의 AI 차례마다 호출되며, 어떤 키워드를 추측할지 결정하여 반환하는 역할을 합니다.

```javascript
/**
 * AI의 추측을 결정하는 함수입니다.
 *
 * @param {object} gameState - 현재 게임 상태에 대한 모든 정보를 담고 있는 객체입니다.
 * @returns {number[]} - 추측할 키워드들의 인덱스를 담은 배열.
 *                        배열의 길이는 반드시 gameState.answerCount와 같아야 합니다.
 */
function makeGuess(gameState) {
  // 여기에 당신의 AI 로직을 작성하세요!
  const myGuess = [];
  // ... 로직 ...
  return myGuess;
}
```

**⭐ 핵심 규칙:** `makeGuess` 함수는 반드시 `gameState.answerCount` 개수만큼의 키워드 인덱스를 담은 배열(`number[]`)을 반환해야 합니다.

---

## 2. AI의 두뇌: `gameState` 객체 상세 분석

`gameState` 객체는 당신의 AI가 똑똑한 결정을 내리는 데 필요한 모든 정보를 담고 있습니다.

| 속성 (Property)        | 타입 (Type)                                       | 설명                                                                                                                            |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `keywords`             | `string[]`                                        | 게임에 사용되는 전체 키워드 목록입니다. (예: `['사자', '호랑이', ...]`)                                                         |
| `answerCount`          | `number`                                          | 찾아야 할 총 정답 키워드의 개수입니다.                                                                                          |
| `myHints`              | `number[]`                                        | 게임 시작 시 나에게만 주어진 오답 힌트 키워드의 인덱스 배열입니다. 이 키워드들은 절대 정답이 아닙니다.                           |
| `previousGuesses`      | `object[]`                                        | 게임의 모든 턴 기록을 담은 배열입니다. 각 기록은 `{ playerId: number, guess: number[], correctCount: number }` 형태의 객체입니다. |
| `revealedAnswers`      | `number[]`                                        | '정답 1개 공개' 힌트를 통해 공개된 정답 키워드의 인덱스 배열입니다.                                                             |
| `revealedWrongAnswers` | `number[]`                                        | '오답 1개 공개' 힌트나 내 힌트를 통해 공개된 오답 키워드의 인덱스 배열입니다.                                                   |
| `currentTurn`          | `number`                                          | 현재 몇 번째 턴인지 나타냅니다.                                                                                                 |
| `timeLimit`            | `number`                                          | 턴 당 제한 시간(초)입니다. (참고용)                                                                                             |
| `myPlayerId`           | `number`                                          | 이 코드를 실행하는 AI 자신의 플레이어 ID입니다. `previousGuesses`에서 자신의 추측을 필터링할 때 사용할 수 있습니다.             |

---

## 3. AI 실행 환경 및 제약사항 (매우 중요!)

당신이 작성한 코드는 안전을 위해 격리된 환경(Web Worker)에서 실행됩니다. 몇 가지 중요한 제약사항을 반드시 알아두세요.

-   **타임아웃**: AI의 `makeGuess` 함수는 **정해진 시간(예: 2초) 안에 반드시 값을 반환해야 합니다.** 시간이 초과되면 해당 턴은 무작위 추측으로 처리되거나 턴을 잃게 됩니다. 무한 루프나 너무 복잡한 계산은 피해야 합니다.
-   **접근 불가**: 보안을 위해 웹 페이지(DOM), `window` 객체, `alert`, 네트워크 요청(`fetch`) 등 외부 환경에 접근하는 코드는 사용할 수 없으며, 사용 시 오류가 발생합니다.
-   **전역 변수**: `makeGuess` 함수 외부의 전역 변수는 매 턴마다 유지된다는 보장이 없습니다. 상태를 저장하려면 함수 내부의 클로저나 객체를 활용하세요. (고급 전략 참고)

---

## 4. 필수 디버깅 팁: `console.log` 활용하기

AI가 생각대로 동작하지 않을 때, 그 속을 들여다보는 가장 좋은 방법은 `console.log`를 사용하는 것입니다.

-   **사용법**: `makeGuess` 함수 내부에 `console.log()`를 사용하여 변수의 값이나 AI의 상태를 출력할 수 있습니다.
-   **확인 위치**: 출력된 로그는 브라우저의 **개발자 도구 콘솔(F12 키)** 에서 확인할 수 있습니다.

```javascript
function makeGuess(gameState) {
  const scores = new Map();
  // ... 점수 계산 로직 ...

  // AI가 계산한 점수를 직접 눈으로 확인해보자!
  console.log('나의 AI가 계산한 키워드별 점수:', scores);

  const candidates = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  console.log('최종 후보:', candidates);

  // ... 최종 추측 로직 ...
  return myGuess;
}
```

---

## 5. 단계별 AI 제작 예제

### 레벨 1: 가장 단순한 AI

- **전략**: 공개된 정답은 무조건 포함하고, 나머지는 완전히 무작위로 선택합니다.

```javascript
function makeGuess(gameState) {
  const { keywords, answerCount, revealedAnswers, revealedWrongAnswers, myHints } = gameState;
  const myGuess = [...revealedAnswers];
  const excluded = new Set([...myGuess, ...revealedWrongAnswers, ...myHints]);
  const available = keywords.map((_, i) => i).filter(idx => !excluded.has(idx));
  const shuffled = available.sort(() => 0.5 - Math.random());
  myGuess.push(...shuffled.slice(0, answerCount - myGuess.length));
  return myGuess;
}
```

### 레벨 2: 과거의 성공을 기억하는 AI

- **전략**: 과거 추측 중 정답률이 높았던 추측에 포함된 키워드에 더 높은 점수를 부여하여 선택 확률을 높입니다.

```javascript
function makeGuess(gameState) {
  const { keywords, answerCount, revealedAnswers, previousGuesses, myHints, revealedWrongAnswers } = gameState;
  const scores = new Map(keywords.map((_, i) => [i, 0]));

  previousGuesses.forEach(turn => {
    const points = turn.correctCount > 0 ? turn.correctCount / turn.guess.length : -1;
    turn.guess.forEach(idx => scores.set(idx, scores.get(idx) + points));
  });

  const excluded = new Set([...revealedAnswers, ...revealedWrongAnswers, ...myHints]);
  excluded.forEach(idx => scores.delete(idx));

  const candidates = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  const myGuess = [...revealedAnswers];
  myGuess.push(...candidates.slice(0, answerCount - myGuess.length).map(c => c[0]));

  // 후보가 부족할 경우를 대비한 방어 코드
  if (myGuess.length < answerCount) {
      const remaining = keywords.map((_, i) => i).filter(idx => !myGuess.includes(idx) && !excluded.has(idx));
      myGuess.push(...remaining.sort(() => 0.5 - Math.random()).slice(0, answerCount - myGuess.length));
  }
  return myGuess;
}
```

---

## 6. 고급 전략 및 아이디어

### 🧠 상태 관리 (기억력 있는 AI)

매 턴 초기화되는 것을 넘어, 이전 턴의 계산 결과를 기억하고 싶다면 클로저(Closure)를 활용할 수 있습니다.

```javascript
const MyAI = (() => {
  // 이 영역의 변수들은 게임이 끝날 때까지 유지됩니다.
  let myMemory = { turnCount: 0, candidateHistory: [] };

  return function makeGuess(gameState) {
    myMemory.turnCount++;
    console.log(`이번 턴은 내가 ${myMemory.turnCount}번째 생각하는 턴이야!`);
    
    // ... 여기에 당신의 로직 ...
    // myMemory 객체에 필요한 정보를 저장하고 다음 턴에 활용할 수 있습니다.

    return []; // 실제 추측 로직 필요
  };
})();

// AI 코드 에디터에는 makeGuess = MyAI; 와 같이 할당하거나,
// MyAI 함수의 내용을 그대로 붙여넣으세요.
```

### 🕵️‍♂️ 상대방 추론 (Opponent Modeling)

`gameState.previousGuesses` 에는 모든 플레이어의 기록이 담겨 있습니다. `playerId`를 확인하여 특정 상대방의 추측 패턴을 분석하고, 그가 어떤 정보를 가지고 있을지 역으로 추론하는 고차원적인 전략을 구사할 수 있습니다.

### 🎲 정보 이론적 접근

때로는 당장 정답을 맞히는 것보다, **가장 많은 정보를 얻을 수 있는 추측**을 하는 것이 더 유리할 수 있습니다. 예를 들어, 아직 정체불명인 키워드들을 반반씩 섞어 추측을 던져보면, 그 결과(`correctCount`)를 통해 어떤 그룹에 정답이 더 많이 포함되어 있는지 알 수 있습니다. 이는 마치 스무고개에서 질문 한 번의 가치를 극대화하는 것과 같습니다.

---

## 7. 흔히 저지르는 실수 (FAQ)

-   **실수 1: 내 힌트(`myHints`)만 보고 추리한다.**
    -   **해결책**: 가장 중요한 정보는 `previousGuesses`에 담긴 모든 플레이어의 추측 결과입니다. 다른 사람들의 추측과 그 결과를 활용해야만 정답의 범위를 효과적으로 좁힐 수 있습니다.
-   **실수 2: 반환하는 배열의 개수가 `answerCount`와 다르다.**
    -   **해결책**: `makeGuess` 함수는 어떤 경우에도 반드시 `answerCount` 길이의 배열을 반환해야 합니다. 로직 마지막에 길이를 체크하고, 부족하다면 무작위 키워드로라도 채우는 방어 코드를 추가하는 것이 좋습니다.
-   **실수 3: 이미 오답으로 판명된 키워드를 또 추측한다.**
    -   **해결책**: 추측할 후보군을 만들기 전에, `revealedWrongAnswers`와 `myHints`에 포함된 키워드들은 반드시 먼저 제외해야 합니다.

---

## 8. AI 공유 및 대전

자신만의 멋진 AI를 만들었다면, 친구들과 코드를 공유하고 누구의 AI가 더 똑똑한지 대결해보세요! GitHub Gist나 다른 코드 공유 플랫폼에 코드를 올리고 링크를 공유하는 것도 좋은 방법입니다.

이제 당신만의 AI를 만들어 Deduction Game의 챔피언이 되어보세요!