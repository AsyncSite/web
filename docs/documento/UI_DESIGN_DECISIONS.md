# Documento UI 디자인 결정사항

## Studio UI 컨셉

### 독립적인 서비스 경험
YouTube Studio, Facebook Creator Studio와 같이 메인 서비스와 분리된 독립적인 UI/UX 제공

### 구현 방식
- **StudioLayout**: 별도 레이아웃 시스템
- **CSS Modules**: 스타일 격리
- **독립 라우팅**: `/studio/*` 경로

## 색상 팔레트

### 메인 그라디언트
1. **Pink-Orange**: `#fd79a8` → `#fdcb6e`
   - 주요 CTA 버튼
   - 강조 요소
   
2. **Purple-Violet**: `#667eea` → `#764ba2`
   - 브랜드 아이덴티티
   - AI 관련 요소

### 배경색
- **메인 배경**: `linear-gradient(180deg, #fff5f5 0%, #fff0e1 100%)`
- **카드 배경**: `white`
- **서브 배경**: `#f5f6fa`

### 텍스트 색상
- **주요 텍스트**: `#2d3436`
- **보조 텍스트**: `#636e72`
- **비활성 텍스트**: `#b2bec3`

## 헤더 디자인

### 브랜드 계층 구조
```
AsyncSite / 도큐멘토
```
- AsyncSite: 메인 브랜드 (클릭 시 홈으로)
- 도큐멘토: 현재 서비스 표시

### 변경 히스토리
1. 초기: "도큐멘토 AI Studio"
2. 수정: "AI Studio" (도큐멘토 이용 중)
3. 최종: "AsyncSite / 도큐멘토"

## 컴포넌트 스타일링

### 카드 디자인
```css
background: white;
border-radius: 20px;
box-shadow: 0 10px 30px rgba(253, 121, 168, 0.1);
```

### 버튼 스타일
```css
/* Primary */
background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%);
color: white;

/* Secondary */
background: #f5f6fa;
border: 2px solid transparent;

/* Hover */
transform: translateY(-2px);
box-shadow: 0 10px 30px rgba(253, 121, 168, 0.3);
```

### 입력 필드
```css
background: #f5f6fa;
border: 3px solid #f5f6fa;
border-radius: 15px;

/* Focus */
border-color: #667eea;
background: white;
box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
```

## 애니메이션

### 기본 트랜지션
- Duration: `0.3s`
- Easing: `ease` or `ease-out`
- Transform: `translateY(-2px)` on hover

### 로딩 애니메이션
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

## 반응형 디자인

### 브레이크포인트
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### 모바일 최적화
- 터치 타겟: 최소 44x44px
- 폰트 크기: 최소 14px
- 패딩/마진: 적응형 조정

## 접근성

### ARIA 레이블
- 모든 인터랙티브 요소에 적용
- 스크린 리더 지원

### 키보드 네비게이션
- Tab 순서 최적화
- Focus 스타일 명확히 표시

### 색상 대비
- WCAG AA 기준 충족
- 최소 4.5:1 대비율

## 성능 최적화

### CSS Modules
- 스타일 격리로 충돌 방지
- 빌드 시 최적화
- 트리 쉐이킹 지원

### 이미지 최적화
- Lazy loading 적용
- WebP 포맷 우선 사용
- 적절한 크기 제공

## 향후 개선 계획

### Dark Mode
- CSS 변수 기반 테마 시스템
- 시스템 설정 연동
- 사용자 선호 저장

### 마이크로 인터랙션
- 버튼 클릭 피드백
- 성공/실패 애니메이션
- 프로그레스 인디케이터

### 컴포넌트 라이브러리
- Storybook 도입
- 디자인 시스템 문서화
- 재사용 가능한 컴포넌트 확대