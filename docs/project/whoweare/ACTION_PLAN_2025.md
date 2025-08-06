# WhoWeAre 실행 계획서 2025

## 🚨 즉시 수정 필요 (Hot Fix)

### 1. WebGL Context 임시 패치 (오늘 바로!)
```typescript
// src/components/whoweare/ThreeSceneFloatingStory.tsx
// Line 95 근처에 추가

const [zoomCount, setZoomCount] = useState(0);
const MAX_ZOOM_COUNT = 5;

// handleClick 함수 내 수정 (Line 839)
if (zoomCount >= MAX_ZOOM_COUNT) {
  alert('페이지를 새로고침 해주세요. 메모리 최적화 작업 중입니다.');
  return;
}

// 줌 실행 시
setZoomCount(prev => prev + 1);
```

### 2. 메모리 정리 강화 (1시간 작업)
```typescript
// cleanup 함수 개선 (Line 1320 근처)
return () => {
  // 1. 이벤트 리스너 제거
  mountRef.current?.removeEventListener('mousedown', handleMouseDown);
  mountRef.current?.removeEventListener('mouseup', handleMouseUp);
  mountRef.current?.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('resetCamera', handleResetCamera);
  
  // 2. Three.js 리소스 정리
  scene?.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
  
  // 3. 텍스처 정리
  storyPanels.forEach(panel => {
    // 텍스처 dispose 로직
  });
  
  // 4. 렌더러 정리
  renderer?.dispose();
  renderer?.forceContextLoss();
  renderer?.domElement?.remove();
  
  // 5. 씬 정리
  scene?.clear();
  
  // 6. 애니메이션 중지
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
  }
};
```

## 📋 1주차 작업 (1/6 - 1/12)

### Day 1-2: 데이터 정리
```bash
# 실제 팀 멤버 정보 수집
1. 각 멤버 프로필 사진 (정사각형, 최소 500x500px)
2. GitHub 프로필 URL
3. 개인 블로그/포트폴리오 URL
4. LinkedIn URL (선택)

# 파일 업데이트
- [ ] public/images/face/에 실제 사진 추가
- [ ] src/data/whoweareTeamMembers.ts 업데이트
```

### Day 3-4: 버그 수정
```typescript
// 행성 회전 방향 수정
// src/components/whoweare/ThreeSceneFloatingStory.tsx

// 줌인 시 방향 저장 (Line 943 근처)
const zoomDirection = {
  startAngle: Math.atan2(camera.position.x, camera.position.z),
  rotationDirection: camera.position.x > 0 ? 1 : -1
};

// 줌아웃 시 동일 방향 유지 (Line 1067 근처)
const continuousAngle = zoomDirection.startAngle + 
  (progress * Math.PI * zoomDirection.rotationDirection);
```

### Day 5: 성능 모니터링
```javascript
// 개발 환경에 Stats.js 추가
import Stats from 'three/examples/jsm/libs/stats.module';

const stats = new Stats();
document.body.appendChild(stats.dom);

// animate 함수에 추가
function animate() {
  stats.begin();
  // ... 렌더링 로직
  stats.end();
}
```

## 📅 2-3주차 계획 (1/13 - 1/26)

### React Three Fiber 마이그레이션 준비
```bash
# 패키지 설치
npm install @react-three/fiber @react-three/drei

# 새 컴포넌트 생성
src/components/whoweare/ThreeSceneR3F.tsx

# 점진적 마이그레이션
1. 기본 씬 설정
2. 카메라 컨트롤
3. 멤버 오브젝트
4. 인터랙션
5. 애니메이션
```

### 접근성 개선
```typescript
// 키보드 네비게이션 추가
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    switch(e.key) {
      case 'Tab':
        // 다음 멤버로 포커스
        break;
      case 'Enter':
        // 선택된 멤버 상세 보기
        break;
      case 'Escape':
        // 패널 닫기
        break;
      case 'ArrowKeys':
        // 카메라 회전
        break;
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## 🔍 테스트 체크리스트

### 기능 테스트
- [ ] 줌인/아웃 5회 이상 안정성
- [ ] 모든 멤버 카드 정상 표시
- [ ] 스토리 패널 정상 동작
- [ ] 드래그 회전 부드러움
- [ ] 2D 폴백 모드 전환

### 성능 테스트
- [ ] Chrome: 60fps 유지
- [ ] Firefox: 50fps 이상
- [ ] Safari: 45fps 이상
- [ ] 모바일: 2D 모드 자동 전환

### 접근성 테스트
- [ ] 키보드만으로 모든 기능 사용
- [ ] 스크린 리더 호환성
- [ ] 고대비 모드 가시성
- [ ] 포커스 인디케이터 명확성

## 💰 리소스 예산

### 시간
- 긴급 패치: 2-4시간
- 1주차 작업: 20시간
- 2-3주차: 40시간
- 총 예상: 64시간

### 외부 라이브러리
- React Three Fiber: 필수
- GSAP (선택): $99/year (상업용)
- Howler.js (사운드): 무료

## 📝 체크포인트

### 1주차 완료 기준
- [ ] WebGL 버그 임시 해결
- [ ] 팀 멤버 실제 데이터 50% 이상
- [ ] 회전 방향 버그 수정

### 2주차 완료 기준
- [ ] WebGL 버그 완전 해결
- [ ] 모든 팀 멤버 데이터 완성
- [ ] 기본 접근성 구현

### 3주차 완료 기준
- [ ] React Three Fiber 마이그레이션 50%
- [ ] 성능 목표 달성 (60fps)
- [ ] 사용자 테스트 완료

## 🎯 성공 지표

| 지표 | 현재 | 1주차 목표 | 최종 목표 |
|------|------|-----------|----------|
| 안정성 | 5회 후 크래시 | 10회 안정 | 무제한 |
| 성능 | 45-55fps | 50-60fps | 60fps 고정 |
| 데이터 완성도 | 30% | 60% | 100% |
| 접근성 | 0% | 30% | WCAG AA |

---

*작성일: 2025년 1월 6일*
*다음 리뷰: 2025년 1월 13일*

**긴급 연락**: WebGL 버그 발생 시 즉시 리포트
**진행 상황**: 매주 월요일 업데이트