# 11MenZ 타이포그래피 스타일 가이드

이 문서는 2025년 6월 3일 11men 시절 사용했던 Hero 섹션의 타이포그래피 낙하 애니메이션 스타일을 기록한 것입니다.

## 개요
11MenZ 로고가 위에서 아래로 떨어지면서 바운스되는 효과로, skew와 rotate를 활용한 기울어진 타이포그래피가 특징입니다.

## CSS 스타일

### 메인 타이포그래피 스타일
```css
.skew-heading-wrapper {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: visible;
    margin-top: 2rem;
    margin-bottom: 2rem;
}

.skew-heading-wrapper h1 {
    opacity: 0;
    transition: opacity 1s ease-in-out;
}

.skew-heading-wrapper.drop-bounce h1 {
    text-transform: uppercase;
    position: absolute;
    top: 35%;
    left: 50%;
    
    /* 반응형 폰트 사이즈 */
    font-size: clamp(3rem, 8vw, 6rem);
    
    margin: 0;
    font-weight: 900;
    
    /* 네온 그린 색상 */
    color: rgba(195, 232, 141, 0.5);
    
    /* 글로우 효과 */
    text-shadow: 2px 2px 5px rgba(0,0,0,0.5), 0 0 4px #8fd67a;
    
    white-space: nowrap;
    
    /* 애니메이션 */
    animation: dropBounce 5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    opacity: 1;
}
```

### 낙하 애니메이션 (Drop Bounce)
```css
@keyframes dropBounce {
    0% {
        transform: translate(-50%, -500%) skew(10deg) rotate(-10deg) scale(0.8);
        opacity: 0;
    }
    10% {
        transform: translate(-50%, -200%) skew(10deg) rotate(-10deg) scale(0.8);
        opacity: 0;
    }
    30% {
        transform: translate(-50%, -5%) skew(10deg) rotate(-10deg) scale(1.2);
        opacity: 1;
    }
    50% {
        transform: translate(-50%, 10%) skew(10deg) rotate(-10deg) scale(0.9);
    }
    70% {
        transform: translate(-50%, 0%) skew(10deg) rotate(-10deg) scale(1.05);
    }
    100% {
        transform: translate(-50%, 0%) skew(10deg) rotate(-10deg) scale(1);
    }
}
```

## 주요 특징

### 1. Transform 효과
- **skew(10deg)**: 텍스트를 10도 기울임
- **rotate(-10deg)**: 반대 방향으로 10도 회전하여 독특한 각도 생성
- **scale 변화**: 0.8 → 1.2 → 0.9 → 1.05 → 1로 바운스 효과

### 2. 색상 및 효과
- **메인 색상**: `rgba(195, 232, 141, 0.5)` - 반투명 네온 그린
- **글로우 색상**: `#8fd67a` - 밝은 초록색
- **텍스트 그림자**: 검은색 그림자 + 네온 글로우 조합

### 3. 타이밍
- **전체 애니메이션**: 5초
- **easing**: `cubic-bezier(0.19, 1, 0.22, 1)` - 자연스러운 바운스
- **주요 단계**:
  - 0-10%: 화면 밖에서 시작
  - 30%: 목표 위치 살짝 아래로 과도하게 떨어짐 (scale 1.2)
  - 50%: 살짝 아래로 더 내려감 (scale 0.9)
  - 100%: 최종 위치에 안착

### 4. 반응형 디자인
- `font-size: clamp(3rem, 8vw, 6rem)`
  - 최소: 3rem
  - 기본: 뷰포트 너비의 8%
  - 최대: 6rem

## 사용 예시

```html
<div class="skew-heading-wrapper drop-bounce">
    <h1>11MenZ</h1>
</div>
```

## React 컴포넌트에서 사용
```tsx
const [show11MenZ, setShow11MenZ] = useState(false);

// 타이밍에 맞춰 표시
setTimeout(() => {
    setShow11MenZ(true);
}, 200);

// JSX
{show11MenZ && (
    <div className="skew-heading-wrapper drop-bounce">
        <h1>11MenZ</h1>
    </div>
)}
```

## 참고사항
- 이 효과는 어두운 배경 (`#05060A`)에서 가장 효과적입니다
- 폰트는 `Source Code Pro` 또는 monospace 계열이 적합합니다
- 네온 효과를 위해 높은 font-weight (900) 사용을 권장합니다