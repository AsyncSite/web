# RichText 시스템 설계 문서

## 작업 일자: 2025-08-10

## 1. 문제 정의

### 현재 시스템의 문제점
1. **보안 위험**: HTML 직접 입력 및 `dangerouslySetInnerHTML` 사용으로 XSS 공격 가능
2. **사용성 문제**: 일반 사용자가 HTML 태그(`<br/>`, `<span class="highlight">`)를 직접 입력해야 함
3. **일관성 부족**: 각 섹션마다 다른 방식으로 텍스트 포맷팅 처리
4. **유지보수 어려움**: HTML 문자열로 저장되어 구조 변경이 어려움

### 영향받는 섹션
- **Hero Section**: title, subtitle, infoBox items
- **RichText Section**: content
- **IntroSection**: 제목, 단락, 하이라이트
- **FAQ Section**: questions/answers
- **Reviews Section**: review content
- **Members Section**: member bio
- **Timeline Section**: event descriptions

## 2. 해결 방안: 구조화된 RichText 시스템

### 핵심 아이디어
"한 번 만들고 모든 곳에서 재사용" - 공통 RichText 컴포넌트로 모든 텍스트 입력 문제 해결

### 데이터 구조 설계

```typescript
// 메인 RichText 데이터 구조
interface RichTextData {
  type: 'richtext';
  version: '1.0';
  content: Block[];
  theme?: StudyTheme;  // 스터디별 테마
}

// 블록 레벨 요소
interface Block {
  type: 'paragraph' | 'heading' | 'list' | 'quote';
  content: Inline[];
  props?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6;  // for heading
    listType?: 'bullet' | 'number';   // for list
  };
}

// 인라인 요소
interface Inline {
  type: 'text' | 'link' | 'break';
  text?: string;
  marks?: Mark[];
  href?: string;  // for link
}

// 텍스트 장식
interface Mark {
  type: 'bold' | 'italic' | 'highlight' | 'subtle-highlight' | 'custom';
  color?: string;           // 커스텀 색상
  backgroundColor?: string;  // 배경색
  className?: string;        // 커스텀 클래스
}

// 스터디 테마
interface StudyTheme {
  colors: {
    primary: string;
    secondary: string;
    highlight: string;
    subtleHighlight: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
}
```

## 3. 구현 계획

### 3.1 컴포넌트 구조

```
/components/common/richtext/
├── RichTextEditor.tsx       # 에디터 UI 컴포넌트
├── RichTextRenderer.tsx     # 안전한 렌더링 컴포넌트
├── RichTextToolbar.tsx      # 편집 도구모음
├── RichTextConverter.ts     # HTML ↔ RichText 변환 유틸
├── RichTextTypes.ts         # TypeScript 타입 정의
└── RichTextStyles.css       # 공통 스타일
```

### 3.2 에디터 UI/UX

#### 기본 에디터
```
┌─────────────────────────────────────┐
│ [B] [I] [🔆] [🎨] [🔗] [⏎]         │ ← 툴바
├─────────────────────────────────────┤
│ 텍스트를 입력하세요...              │ ← 에디터
│                                     │
└─────────────────────────────────────┘
```

#### 텍스트 선택 시 플로팅 툴바
```
┌──────────────┐
│ [🔆 하이라이트] │
│ [B 굵게]      │
│ [I 기울임]    │
│ [🎨 색상]     │
└──────────────┘
```

#### 색상 선택기
```
┌─────────────────┐
│ 테마 색상:      │
│ ● 주 강조       │ #c3e88d
│ ○ 부 강조       │ #82aaff
│ ─────────────── │
│ 커스텀:         │
│ [#______] [선택]│
└─────────────────┘
```

### 3.3 Hero Section 적용 예시

#### 현재 방식 (위험)
```javascript
{
  title: "💯 코테 스터디<br/>테코테코",
  subtitle: "변화 속에서<br/><span class=\"highlight\">변치 않는 ____를 찾다</span>"
}
```

#### 개선된 방식 (안전)
```javascript
{
  title: {
    type: 'richtext',
    version: '1.0',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '💯 코테 스터디' },
          { type: 'break' },
          { type: 'text', text: '테코테코' }
        ]
      }
    ]
  },
  subtitle: {
    type: 'richtext',
    version: '1.0',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '변화 속에서' },
          { type: 'break' },
          { 
            type: 'text', 
            text: '변치 않는 ____를 찾다',
            marks: [{ type: 'highlight' }]
          }
        ]
      }
    ]
  }
}
```

## 4. 마이그레이션 전략

### 4.1 자동 변환
기존 HTML 문자열 데이터를 자동으로 RichText 형식으로 변환

```typescript
class RichTextConverter {
  // HTML → RichText
  static fromHTML(html: string): RichTextData {
    // <br/> → { type: 'break' }
    // <span class="highlight">text</span> → { type: 'text', text, marks: [{type: 'highlight'}] }
    // <b>text</b> → { type: 'text', text, marks: [{type: 'bold'}] }
    // ...
  }
  
  // RichText → HTML (필요시)
  static toHTML(data: RichTextData): string {
    // 역변환 로직
  }
}
```

### 4.2 점진적 적용
1. Phase 1: Hero Section
2. Phase 2: RichText Section  
3. Phase 3: FAQ, Reviews, Members
4. Phase 4: 나머지 섹션

## 5. 보안 및 성능

### 보안
- ✅ **XSS 완벽 차단**: HTML 파싱 없이 React 컴포넌트로 직접 렌더링
- ✅ **입력 검증**: 모든 입력값 TypeScript 타입 체크
- ✅ **안전한 렌더링**: dangerouslySetInnerHTML 사용 안 함

### 성능
- ✅ **작은 번들 크기**: 외부 라이브러리 의존 없음
- ✅ **메모이제이션**: React.memo 활용
- ✅ **SSR 지원**: 서버 사이드 렌더링 가능

## 6. 확장성

### 새로운 마크 타입 추가
```typescript
// 예: 밑줄, 취소선 추가
type MarkType = 'bold' | 'italic' | 'highlight' | 'subtle-highlight' | 
                 'underline' | 'strikethrough' | 'code';
```

### 새로운 블록 타입 추가
```typescript
// 예: 코드 블록, 테이블 추가
type BlockType = 'paragraph' | 'heading' | 'list' | 'quote' | 
                 'code' | 'table' | 'image';
```

## 7. 테스트 계획

### 단위 테스트
- RichTextConverter 변환 로직
- RichTextRenderer 렌더링 결과
- RichTextEditor 사용자 입력 처리

### 통합 테스트
- Hero Section 전체 플로우
- 데이터 저장/불러오기
- 마이그레이션 시나리오

### E2E 테스트
- 관리 페이지에서 Hero Section 생성
- 상세 페이지에서 렌더링 확인
- 다양한 포맷팅 조합 테스트

## 8. 예상 효과

### 사용자 경험
- 📈 **70% 사용성 향상**: HTML 지식 불필요
- 🎨 **직관적 UI**: WYSIWYG 스타일 에디터
- 🎯 **실시간 미리보기**: 즉각적인 피드백

### 개발자 경험
- 🔒 **100% 보안 향상**: XSS 공격 원천 차단
- ♻️ **코드 재사용성**: 모든 섹션에서 동일 컴포넌트 사용
- 🧪 **테스트 용이성**: 구조화된 데이터로 테스트 간편

### 유지보수
- 📦 **확장 용이**: 새로운 포맷 쉽게 추가
- 🔄 **마이그레이션 간편**: 자동 변환 지원
- 📊 **데이터 분석 가능**: 구조화된 데이터

## 9. 구현 우선순위

1. **Phase 1 (즉시)**: Hero Section
   - RichText 기본 컴포넌트 구현
   - Hero Section 에디터 적용
   - Hero Section 렌더러 적용
   - 기존 데이터 마이그레이션

2. **Phase 2 (다음)**: 확장
   - 다른 섹션 적용
   - 고급 기능 추가
   - 성능 최적화

## 10. 참고 사항

- 기존 TecoTeco 페이지의 디자인과 100% 일치 유지
- 사용자가 HTML을 몰라도 동일한 결과 생성 가능
- 점진적 마이그레이션으로 서비스 중단 없음