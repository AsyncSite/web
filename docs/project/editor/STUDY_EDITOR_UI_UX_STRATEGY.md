# 스터디 에디터 UI/UX 배치 전략

## 1. 현황 분석

### 1.1 기존 구조 파악
- **현재 라우팅**: `/study` - 스터디 목록 페이지
- **탭 구조**: 스터디 목록 | 일정 캘린더
- **권한 체계**: `user.roles[]` 배열과 `systemRole` 필드 존재
- **에디터 구현**: `RichTextEditor` 컴포넌트 이미 구현 (ProfileEditPage에서 사용 중)

### 1.2 사용자 플로우 현황
```
StudyPage (목록) → StudyDetailPage (상세) → 참가 신청
```

### 1.3 기술적 준비사항
- ✅ RichTextEditor 컴포넌트 구현 완료
- ✅ DOMPurify 보안 처리 구현
- ✅ 권한 체계 (AuthContext) 구현
- ❌ 스터디 생성/제안 페이지 미구현

## 2. UI/UX 배치 전략

### 2.1 진입점 설계

#### Option A: Floating Action Button (FAB) ⭐ 추천
```
StudyPage
├── 기존 콘텐츠 (목록/캘린더)
└── FAB (우하단 고정)
    ├── 로그인 유저 → "스터디 제안하기"
    └── 비로그인 → 로그인 유도
```

**장점:**
- 기존 UI 방해 최소화
- 모바일 친화적
- 시각적 CTA 효과

**구현 예시:**
```typescript
// StudyPage.tsx 하단에 추가
<FloatingActionButton 
  onClick={() => navigate('/study/create')}
  icon={<PlusIcon />}
  label="스터디 제안"
  position="bottom-right"
/>
```

#### Option B: 상단 Hero 섹션 CTA
```
┌─────────────────────────────────────┐
│ STUDY                               │
│ 함께 성장하는 개발자들의 커뮤니티     │
│                                     │
│ [📚 스터디 둘러보기] [✨ 스터디 제안] │
└─────────────────────────────────────┘
```

**장점:**
- 명확한 액션 유도
- 첫 방문자에게 직관적

#### Option C: 탭 추가 방식
```
[스터디 목록] [일정 캘린더] [+ 새 스터디]
```

**장점:**
- 기존 UX 패턴 유지
- 탐색이 자연스러움

### 2.2 최종 추천: Hybrid Approach

```typescript
// 1. StudyPage에 FAB 추가 (모바일 최적화)
// 2. 데스크톱에서는 상단 CTA 버튼도 추가

const StudyPage = () => {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="study-page">
      {/* 데스크톱: 상단 CTA */}
      {!isMobile && (
        <div className="study-hero">
          <h1>STUDY</h1>
          <p>함께 성장하는 개발자들의 커뮤니티</p>
          <div className="hero-actions">
            <button onClick={() => navigate('/study/create')} 
                    className="btn-primary">
              ✨ 스터디 제안하기
            </button>
          </div>
        </div>
      )}
      
      {/* 기존 콘텐츠 */}
      <StudyTabs />
      <StudyList />
      
      {/* 모바일: FAB */}
      {isMobile && user && (
        <FAB onClick={() => navigate('/study/create')}>
          <PlusIcon />
        </FAB>
      )}
    </div>
  );
};
```

## 3. 스터디 생성/제안 페이지 UI 설계

### 3.1 라우팅 구조
```
/study/create (또는 /study/propose)
├── 권한 체크
├── 다단계 폼 (Step Wizard)
└── 미리보기
```

### 3.2 페이지 레이아웃

#### 모바일 우선 설계
```
┌─────────────────────┐
│ < 뒤로  스터디 제안  │ <- 고정 헤더
├─────────────────────┤
│ Step 1/3            │ <- 진행 표시
│ ━━━━━━━━━━━━━━━     │
├─────────────────────┤
│                     │
│ 1. 기본 정보        │
│ ┌─────────────────┐ │
│ │ 스터디 이름      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 한 줄 소개       │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ [이전] [다음 단계]   │ <- 고정 하단
└─────────────────────┘
```

#### 데스크톱 2-Column 레이아웃
```
┌──────────────────────────────────────────┐
│ 스터디 제안하기                           │
├──────────────────────────────────────────┤
│ 왼쪽: 입력 폼        │ 오른쪽: 실시간     │
│                     │ 미리보기          │
│ Step 1: 기본 정보    │                   │
│ ─────────────────   │ ┌────────────────┐│
│                     │ │                ││
│ 스터디 이름 *        │ │ 테코테코 4기    ││
│ [_______________]   │ │                ││
│                     │ │ 알고리즘 스터디 ││
│ 한 줄 소개 *        │ │                ││
│ [_______________]   │ │ 매주 금요일     ││
│                     │ │ 19:30-21:30    ││
│                     │ └────────────────┘│
│ [다음 단계]          │                   │
└──────────────────────────────────────────┘
```

### 3.3 Multi-Step Form 설계

#### Step 1: 기본 정보
```typescript
interface Step1Data {
  name: string;           // 스터디 이름
  tagline: string;        // 한 줄 소개
  type: 'participatory' | 'educational';
  category: string;       // 알고리즘, 프론트엔드, 백엔드 등
  schedule: {
    dayOfWeek: string;    // 요일
    time: string;         // 시간
    frequency: string;    // 주기 (매주, 격주)
  };
  capacity: number;       // 정원
  duration: string;       // 기간 (3개월, 6개월)
}
```

#### Step 2: 상세 설명 (에디터)
```typescript
interface Step2Data {
  introduction: string;   // 스터디 소개 (Rich Text)
  curriculum: string;     // 커리큘럼 (Rich Text)
  requirements: string;   // 참가 조건 (Rich Text)
  benefits: string;       // 기대 효과 (Rich Text)
}

// 에디터 UI
<div className="editor-section">
  <h3>스터디 소개 *</h3>
  <p className="helper-text">
    어떤 스터디인지 자세히 소개해주세요
  </p>
  <RichTextEditor
    value={formData.introduction}
    onChange={handleIntroductionChange}
    placeholder="예: 이 스터디는 알고리즘 문제를 함께 풀며..."
    maxLength={isAdmin ? 5000 : 2000}
    features={isAdmin ? ADMIN_FEATURES : USER_FEATURES}
  />
  <CharacterCount current={introLength} max={2000} />
</div>
```

#### Step 3: 리더 정보 & 검토
```typescript
interface Step3Data {
  leaderIntro: string;    // 리더 소개
  contactMethod: string;  // 연락 방법
  additionalInfo?: string; // 추가 정보
}
```

### 3.4 권한별 UI 차이

#### 일반 유저
```typescript
const UserFeatures = {
  maxLength: 2000,
  toolbar: ['bold', 'italic', 'bulletList', 'link'],
  templates: false,
  autoSave: true,
  status: 'PENDING_REVIEW' // 검토 대기
};
```

#### 관리자
```typescript
const AdminFeatures = {
  maxLength: 5000,
  toolbar: ['heading', 'bold', 'italic', 'bulletList', 'orderedList', 'link', 'blockquote'],
  templates: true,  // 템플릿 사용 가능
  autoSave: true,
  status: 'DRAFT' | 'PUBLISHED', // 즉시 게시 가능
  scheduling: true  // 예약 게시
};
```

## 4. 모바일 최적화 전략

### 4.1 터치 친화적 UI
```css
/* 최소 터치 영역 44x44px */
.form-input {
  min-height: 48px;
  font-size: 16px; /* iOS 줌 방지 */
}

.toolbar-button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

### 4.2 스크롤 최적화
```typescript
// 키보드 등장 시 자동 스크롤
useEffect(() => {
  const handleFocus = (e: FocusEvent) => {
    if (e.target instanceof HTMLElement) {
      setTimeout(() => {
        e.target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  };
  
  document.addEventListener('focusin', handleFocus);
  return () => document.removeEventListener('focusin', handleFocus);
}, []);
```

### 4.3 하단 툴바 고정
```css
@media (max-width: 768px) {
  .editor-toolbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

## 5. 성능 최적화

### 5.1 코드 스플리팅
```typescript
// 에디터 Lazy Loading
const StudyCreatePage = lazy(() => import('./pages/study/StudyCreatePage'));

// 라우터에 추가
{
  path: 'study/create',
  element: (
    <RequireAuth>
      <Suspense fallback={<LoadingSkeleton />}>
        <StudyCreatePage />
      </Suspense>
    </RequireAuth>
  )
}
```

### 5.2 자동 저장 (Debounced)
```typescript
const useAutoSave = (data: any, userId: string) => {
  const debouncedSave = useMemo(
    () => debounce((value) => {
      localStorage.setItem(`study_draft_${userId}`, JSON.stringify(value));
      showSaveIndicator();
    }, 1000),
    [userId]
  );
  
  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);
};
```

## 6. 접근성 고려사항

### 6.1 키보드 네비게이션
```typescript
const keyboardShortcuts = {
  'Ctrl+Enter': 'submitForm',
  'Ctrl+S': 'saveDraft',
  'Tab': 'nextField',
  'Shift+Tab': 'previousField'
};
```

### 6.2 스크린 리더 지원
```html
<form role="form" aria-label="스터디 제안 양식">
  <div role="group" aria-labelledby="basic-info-heading">
    <h2 id="basic-info-heading">기본 정보</h2>
    <label for="study-name">
      스터디 이름 <span aria-label="필수">*</span>
    </label>
    <input 
      id="study-name"
      aria-required="true"
      aria-invalid={!!errors.name}
      aria-describedby={errors.name ? "name-error" : undefined}
    />
    {errors.name && (
      <span id="name-error" role="alert">{errors.name}</span>
    )}
  </div>
</form>
```

## 7. 에러 처리 & 피드백

### 7.1 실시간 유효성 검사
```typescript
const validateField = (name: string, value: any): string | null => {
  switch(name) {
    case 'name':
      if (!value) return '스터디 이름을 입력해주세요';
      if (value.length < 2) return '2자 이상 입력해주세요';
      if (value.length > 50) return '50자 이내로 입력해주세요';
      return null;
    
    case 'introduction':
      const plainText = stripHtml(value);
      if (!plainText) return '스터디 소개를 입력해주세요';
      if (plainText.length < 50) return '50자 이상 자세히 작성해주세요';
      return null;
    
    default:
      return null;
  }
};
```

### 7.2 제출 상태 피드백
```typescript
const SubmitButton = ({ isSubmitting, canSubmit }) => {
  if (isSubmitting) {
    return (
      <button disabled className="btn-loading">
        <Spinner /> 제출 중...
      </button>
    );
  }
  
  return (
    <button 
      disabled={!canSubmit}
      className={canSubmit ? 'btn-primary' : 'btn-disabled'}
    >
      {isAdmin ? '스터디 생성' : '제안서 제출'}
    </button>
  );
};
```

## 8. 구현 로드맵

### Phase 1: 기본 구조 (3일)
- [ ] `/study/create` 라우트 추가
- [ ] StudyCreatePage 컴포넌트 생성
- [ ] Multi-step form 구조 구현
- [ ] 기본 정보 입력 폼

### Phase 2: 에디터 통합 (2일)
- [ ] RichTextEditor 통합
- [ ] 권한별 기능 차이 구현
- [ ] 자동 저장 기능
- [ ] 미리보기 기능

### Phase 3: UI 완성 (2일)
- [ ] StudyPage에 진입점 추가 (FAB/CTA)
- [ ] 모바일 최적화
- [ ] 접근성 개선
- [ ] 에러 처리 및 피드백

### Phase 4: 백엔드 연동 (3일)
- [ ] API 엔드포인트 연결
- [ ] 제출 로직 구현
- [ ] 성공/실패 처리
- [ ] 제출 후 리디렉션

## 9. 측정 지표

### 사용성 지표
- 폼 완성률 (목표: > 60%)
- 평균 작성 시간 (목표: < 10분)
- 이탈률 (목표: < 30%)

### 기술 지표
- 페이지 로드 시간 (목표: < 2초)
- 에디터 입력 지연 (목표: < 50ms)
- 자동 저장 성공률 (목표: > 99%)

## 10. 결론

**핵심 전략:**
1. **진입점**: StudyPage에 FAB(모바일) + Hero CTA(데스크톱)
2. **경로**: `/study/create` 단일 경로 (권한별 차이는 내부 처리)
3. **UX**: Multi-step form + 실시간 미리보기
4. **에디터**: Step 2에서 RichTextEditor 사용
5. **최적화**: 모바일 우선, 자동 저장, 접근성

이 전략을 통해 사용자와 관리자 모두가 쉽게 스터디를 제안/생성할 수 있는 통합된 경험을 제공합니다.

*작성일: 2025년 8월 7일*
*작성자: AsyncSite Platform Team*