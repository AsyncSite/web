# Performance Optimization Guide - UI/UX 유지

## 개요
현재의 시각적 효과를 모두 유지하면서 성능을 개선하는 실용적인 가이드입니다.

## 🚀 즉시 적용 가능한 최적화 기법

### 1. **CSS 최적화 (Intro 250개 별 유지)**

#### GPU 가속 활용
```css
/* 기존 코드 */
.star {
  position: absolute;
  animation: twinkle 3s infinite;
}

/* 최적화 코드 */
.star {
  position: absolute;
  transform: translateZ(0); /* GPU 레이어 생성 */
  will-change: opacity, transform;
  animation: twinkle-gpu 3s infinite;
}

@keyframes twinkle-gpu {
  /* position 대신 transform 사용 */
  0% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); }
  50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); }
  100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); }
}
```

#### 레이아웃 격리
```css
.starfield {
  contain: layout style paint; /* 리플로우 범위 제한 */
  transform: translateZ(0);
}
```

### 2. **애니메이션 배치 처리**

```javascript
// 기존: 250개를 한 번에 생성
for (let i = 0; i < 250; i++) {
  starfield.appendChild(star);
}

// 최적화: requestAnimationFrame으로 분산
const createStars = (count: number) => {
  const batchSize = 25;
  let created = 0;
  
  const createBatch = () => {
    const fragment = document.createDocumentFragment();
    const end = Math.min(created + batchSize, count);
    
    for (let i = created; i < end; i++) {
      const star = createStar();
      fragment.appendChild(star);
    }
    
    starfield.appendChild(fragment);
    created = end;
    
    if (created < count) {
      requestAnimationFrame(createBatch);
    }
  };
  
  requestAnimationFrame(createBatch);
};
```

### 3. **Canvas 최적화 (Stats 섹션)**

#### 더블 버퍼링과 오프스크린 캔버스
```javascript
// 오프스크린 캔버스 생성
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

// 정적 요소는 오프스크린에 미리 그리기
const drawStaticElements = () => {
  offscreenCtx.clearRect(0, 0, width, height);
  // 정적 요소 그리기
  drawBackground(offscreenCtx);
  drawStaticThreads(offscreenCtx);
};

// 메인 애니메이션 루프
const animate = () => {
  // 오프스크린 캔버스를 메인 캔버스로 복사 (빠름)
  ctx.drawImage(offscreenCanvas, 0, 0);
  
  // 동적 요소만 그리기
  drawDynamicElements(ctx);
  
  requestAnimationFrame(animate);
};
```

#### 프레임 스킵 구현
```javascript
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

const animate = (currentTime: number) => {
  const deltaTime = currentTime - lastTime;
  
  if (deltaTime > frameInterval) {
    // 실제 렌더링
    render();
    lastTime = currentTime - (deltaTime % frameInterval);
  }
  
  requestAnimationFrame(animate);
};
```

### 4. **타이머 최적화**

```javascript
// 기존: 여러 setInterval
setInterval(updateTimer, 1000);
setInterval(updateLabels, 3000);

// 최적화: 단일 RAF 기반 타이머
const useOptimizedTimer = () => {
  const timers = useRef({
    timer: { lastUpdate: 0, interval: 1000 },
    labels: { lastUpdate: 0, interval: 3000 }
  });
  
  useEffect(() => {
    let rafId: number;
    
    const update = (timestamp: number) => {
      const { timer, labels } = timers.current;
      
      // 1초마다 타이머 업데이트
      if (timestamp - timer.lastUpdate > timer.interval) {
        updateTimer();
        timer.lastUpdate = timestamp;
      }
      
      // 3초마다 라벨 업데이트
      if (timestamp - labels.lastUpdate > labels.interval) {
        updateLabels();
        labels.lastUpdate = timestamp;
      }
      
      rafId = requestAnimationFrame(update);
    };
    
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);
};
```

### 5. **GSAP 최적화**

```javascript
// 기존: 복잡한 타임라인
gsap.timeline({
  scrollTrigger: {
    trigger: element,
    start: 'top center',
    end: 'bottom center',
    scrub: true
  }
});

// 최적화: 단순화 및 will-change 활용
// CSS
.gsap-element {
  will-change: transform, opacity;
}

// JS
gsap.set(element, {
  force3D: true, // GPU 가속 강제
  rotation: 0.01 // 3D 레이어 생성
});

// 가벼운 애니메이션만 스크럽
gsap.to(element, {
  y: 100,
  opacity: 1,
  scrollTrigger: {
    trigger: element,
    start: 'top bottom',
    end: 'top center',
    scrub: 0.5, // 부드러운 스크럽
    fastScrollEnd: true,
    preventOverlaps: true
  }
});
```

### 6. **이미지 및 리소스 최적화**

```javascript
// 이미지 지연 로딩
const LazyImage = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState('placeholder.jpg');
  const imgRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) observer.observe(imgRef.current);
    
    return () => observer.disconnect();
  }, [src]);
  
  return <img ref={imgRef} src={imageSrc} alt={alt} {...props} />;
};
```

### 7. **React 최적화**

```javascript
// 메모이제이션 활용
const Stars = React.memo(({ count }) => {
  const stars = useMemo(() => 
    generateStars(count), [count]
  );
  
  return (
    <div className="starfield">
      {stars.map(star => (
        <Star key={star.id} {...star} />
      ))}
    </div>
  );
});

// 상태 업데이트 배치
import { unstable_batchedUpdates } from 'react-dom';

const updateMultipleStates = () => {
  unstable_batchedUpdates(() => {
    setState1(value1);
    setState2(value2);
    setState3(value3);
  });
};
```

## 📊 성능 측정 및 모니터링

```javascript
// 커스텀 성능 모니터
const usePerformanceMonitor = () => {
  useEffect(() => {
    // FPS 모니터
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
    
    // 메모리 사용량 체크
    if (performance.memory) {
      setInterval(() => {
        console.log(`Memory: ${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB`);
      }, 5000);
    }
  }, []);
};
```

## 🎯 구현 우선순위

### Phase 1 (즉시 - 1일)
1. **CSS GPU 가속 적용**
   - 모든 애니메이션 요소에 `transform: translateZ(0)`
   - `will-change` 속성 추가
   - `contain` 속성으로 리플로우 격리

2. **타이머 통합**
   - 모든 `setInterval`을 단일 RAF로 통합
   - 프레임 기반 타이밍 구현

### Phase 2 (단기 - 3일)
1. **애니메이션 배치 처리**
   - 별 생성을 RAF로 분산
   - 초기 로딩 부하 감소

2. **Canvas 최적화**
   - 오프스크린 캔버스 활용
   - 정적/동적 요소 분리

### Phase 3 (중기 - 1주)
1. **GSAP 최적화**
   - 불필요한 타임라인 제거
   - ScrollTrigger 단순화

2. **React 최적화**
   - 메모이제이션 적용
   - 상태 업데이트 최적화

## 📈 예상 성능 향상

- **초기 로딩**: 30-40% 개선 (시각적 차이 없음)
- **런타임 FPS**: 45fps → 58-60fps
- **CPU 사용률**: 20% → 10-12%
- **메모리 사용**: 20-30% 감소

## 💡 핵심 포인트

1. **시각적 변화 없음**: 모든 애니메이션과 효과 유지
2. **점진적 개선**: 한 번에 모두 바꾸지 않고 단계적 적용
3. **측정 기반**: 각 최적화 후 성능 측정
4. **롤백 가능**: 문제 발생 시 즉시 되돌릴 수 있는 구조

---

작성일: 2025-07-30
작성자: AsyncSite Team