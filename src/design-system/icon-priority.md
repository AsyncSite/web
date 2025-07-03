# 아이콘 우선순위 디자인 규약

## 개요
Async Site에서는 일관된 사용자 경험을 위해 아이콘 사용에 우선순위를 두고 있습니다.

## 🎯 아이콘 우선순위 시스템

### 1순위: Lucide React 아이콘
모든 UI 요소에서 **Lucide React** 아이콘을 우선적으로 사용합니다.

**이유:**
- 일관된 선화 스타일
- 높은 가독성
- 확장성과 유지보수성
- 접근성 준수

### 2순위: 이모지
Lucide React에 적절한 아이콘이 없는 경우에만 이모지를 사용합니다.

**사용 조건:**
- 브랜딩 요소 (🧪 Lab)
- 감정 표현
- 특수한 의미 전달

## 🧪 섹션별 우선 아이콘

### Lab 섹션
```tsx
import { FlaskRound } from 'lucide-react';

// 모든 Lab 관련 UI에 우선 적용
<FlaskRound className="w-6 h-6 text-[#10B981]" strokeWidth={1.5} />
```

### Wave 섹션
```tsx
import { Waves } from 'lucide-react';

<Waves className="w-6 h-6 text-[#6366F1]" strokeWidth={1.5} />
```

### Calendar 섹션
```tsx
import { Calendar } from 'lucide-react';

<Calendar className="w-6 h-6 text-[#06B6D4]" strokeWidth={1.5} />
```

### Ranking 섹션
```tsx
import { Trophy } from 'lucide-react';

<Trophy className="w-6 h-6 text-[#F59E0B]" strokeWidth={1.5} />
```

### FAQ 섹션
```tsx
import { HelpCircle } from 'lucide-react';

<HelpCircle className="w-6 h-6 text-[#A855F7]" strokeWidth={1.5} />
```

## 📐 아이콘 스타일 규약

### 기본 스타일
```tsx
// 표준 크기와 두께
className="w-6 h-6"
strokeWidth={1.5}

// 색상은 섹션별 브랜드 컬러 사용
text-[#10B981] // Lab
text-[#6366F1] // Wave
text-[#06B6D4] // Calendar
text-[#F59E0B] // Ranking
text-[#A855F7] // FAQ
```

### 크기 변형
```tsx
// 소형 (16px)
className="w-4 h-4"

// 표준 (24px)
className="w-6 h-6"

// 대형 (32px)
className="w-8 h-8"

// 특대형 (40px)
className="w-10 h-10"
```

## 🎨 적용 가이드라인

### DO (권장)
✅ Lucide React 아이콘 우선 사용
✅ 섹션별 지정 아이콘 사용
✅ 일관된 strokeWidth (1.5) 적용
✅ 브랜드 컬러와 매칭

### DON'T (비권장)
❌ 여러 아이콘 라이브러리 혼용
❌ 임의의 strokeWidth 사용
❌ 섹션과 맞지 않는 아이콘
❌ 일관성 없는 크기 적용

## 🔄 마이그레이션 가이드

### 기존 이모지 → Lucide 아이콘
```tsx
// Before
<div>🧪</div>

// After
<FlaskRound className="w-6 h-6 text-[#10B981]" strokeWidth={1.5} />
```

### 다른 아이콘 라이브러리 → Lucide
```tsx
// Before
<SomeIcon />

// After
import { FlaskRound } from 'lucide-react';
<FlaskRound className="w-6 h-6" strokeWidth={1.5} />
```

## 📱 반응형 고려사항

### 모바일 최적화
```tsx
// 모바일에서는 터치하기 쉬운 크기 사용
className="w-6 h-6 md:w-8 md:w-8"
```

### 접근성
```tsx
// 스크린 리더를 위한 aria-label 추가
<FlaskRound 
  className="w-6 h-6" 
  strokeWidth={1.5}
  aria-label="Lab 실험실"
/>
```

이 규약을 통해 Async Site 전체에서 일관되고 직관적인 아이콘 시스템을 구축합니다.
