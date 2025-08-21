# 스터디 기수별 상세 페이지 템플릿 문제 분석

## 문제 정의

스터디는 기수(generation)로 관리되며, 동일한 스터디가 여러 기수를 운영할 수 있다. 그러나 현재 시스템은 각 기수의 상세 페이지를 완전히 독립적으로 관리하여, 대부분 동일한 내용을 매 기수마다 처음부터 다시 작성해야 하는 심각한 UX 문제가 있다.

## 현재 시스템 분석

### 시스템 구조

현재 상세 페이지 시스템은 두 가지 방식으로 운영된다:

1. **하드코딩 페이지** (테코테코 전용)
   - 경로: `/study/1-tecoteco`
   - 파일: `/src/pages/TecoTecoPage/TecoTecoPage.tsx`
   - 데이터: `/src/pages/TecoTecoPage/utils/constants.ts`에 하드코딩

2. **동적 렌더링 페이지** (범용)
   - 경로: `/study/:studyIdentifier`
   - 파일: `/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`
   - 데이터: API (`/api/study-pages/slug/{slug}`)

### 핵심 문제점

```
테코테코 1기 상세 페이지
├── Hero: "테코테코 1기 모집합니다!" 
├── 소개: "알고리즘 스터디입니다..." (500자)
├── 커리큘럼: "12주 과정..." (상세 내용)
├── FAQ: 10개 질문답변
└── 일정: "2024.09 ~ 2024.12"

↓ 2기 생성 시

테코테코 2기 상세 페이지 
├── Hero: "테코테코 2기 모집합니다!" (1→2만 변경)
├── 소개: "알고리즘 스터디입니다..." (95% 동일)
├── 커리큘럼: "12주 과정..." (95% 동일)
├── FAQ: 10개 질문답변 (95% 동일)
└── 일정: "2025.01 ~ 2025.03" (날짜만 변경)

⚠️ 95% 동일한 내용을 처음부터 다시 작성해야 함
```

## 사용자 관점 문제

### 실제 사용 시나리오

1. **1기 운영자**: 상세 페이지 작성 완료 (2-3시간 소요)
2. **2기 준비**: 1기 내용을 복사하려 하지만 방법이 없음
3. **수동 복사**: 섹션별로 복사 → 붙여넣기 → 수정 (1-2시간 소요)
4. **실수 발생**: 기수 번호나 날짜 수정 누락
5. **사용자 불만**: "왜 복제 기능이 없지?"

### 주요 불편사항

- **시간 낭비**: 동일한 내용 반복 작성
- **실수 유발**: 수동 복사 과정에서 누락/오류
- **일관성 부재**: 기수별로 미묘한 차이 발생
- **관리 어려움**: 공통 내용 수정 시 모든 기수 개별 수정 필요

## 해결 방안

### 단기 해결책: 복제 기능

```javascript
// "이전 기수에서 복제" 버튼
const cloneFromPreviousGeneration = async (studyId, fromGeneration, toGeneration) => {
  const previousPageData = await getStudyPage(studyId, fromGeneration);
  const clonedData = {
    ...previousPageData,
    generation: toGeneration,
    // 자동 변경 필드
    title: previousPageData.title.replace(fromGeneration, toGeneration),
    slug: previousPageData.slug.replace(fromGeneration, toGeneration),
    // 수정 필요 필드 표시
    needsUpdate: ['startDate', 'endDate', 'recruitDeadline']
  };
  return createStudyPage(clonedData);
};
```

### 중기 해결책: 템플릿 시스템

```javascript
// 스터디 템플릿 (공통 내용)
const studyTemplate = {
  type: 'TECOTECO',
  baseContent: {
    introduction: "알고리즘 스터디입니다...",
    curriculum: "12주 과정...",
    faq: [/* 공통 FAQ */],
    requirements: "기본 프로그래밍 지식..."
  },
  variables: {
    generation: "{{generation}}",
    period: "{{startDate}} ~ {{endDate}}",
    leader: "{{leaderName}}"
  }
};

// 기수별 인스턴스
const tecoteco2 = {
  templateId: 'TECOTECO',
  generation: 2,
  variables: {
    startDate: "2025.01",
    endDate: "2025.03",
    leaderName: "김철수"
  },
  overrides: {
    // 2기만의 특별 내용
    specialNote: "이번 기수는 AI 도구 활용 추가!"
  }
};
```

### 장기 해결책: 스터디 시리즈 관리

```javascript
// 스터디 시리즈 개념
const studySeries = {
  id: 'tecoteco',
  name: '테코테코',
  masterTemplate: {
    // 모든 기수 공통 콘텐츠
    core: { /* ... */ },
    // 기수별 변수
    generationVariables: [ /* ... */ ]
  },
  generations: [
    { number: 1, status: 'completed', customizations: {} },
    { number: 2, status: 'active', customizations: {} },
    { number: 3, status: 'planned', customizations: {} }
  ]
};
```

## 구현 우선순위

### Phase 1: 즉시 구현 가능 (1-2주)
- [ ] "이전 기수 복제" 버튼 추가
- [ ] 복제 시 자동 필드 변경 (기수 번호, slug)
- [ ] 수정 필요 필드 하이라이트

### Phase 2: 단기 개선 (1개월)
- [ ] 템플릿 저장/불러오기 기능
- [ ] 변수 시스템 구현 ({{generation}}, {{date}} 등)
- [ ] 섹션별 재사용 라이브러리

### Phase 3: 장기 개선 (3개월)
- [ ] 스터디 시리즈 관리 시스템
- [ ] 마스터 템플릿 + 기수별 오버라이드
- [ ] 버전 관리 및 변경 이력 추적

## 기대 효과

### 정량적 효과
- **시간 절감**: 새 기수 생성 시간 80% 감소 (2시간 → 20분)
- **오류 감소**: 수동 복사 실수 90% 감소
- **관리 효율**: 공통 내용 수정 시간 95% 감소

### 정성적 효과
- **사용자 만족도**: 반복 작업 스트레스 해소
- **콘텐츠 일관성**: 기수별 통일된 품질 유지
- **확장성**: 새로운 스터디 시리즈 쉽게 추가 가능

## 기술적 고려사항

### 현재 코드베이스 영향
```javascript
// StudyDetailPageRenderer.tsx 수정 필요
// 현재: 각 스터디가 완전히 독립적
const pageData = await studyDetailPageService.getPublishedPageBySlug(studyIdentifier);

// 개선: 템플릿/이전 기수 참조 가능
const pageData = await studyDetailPageService.getPageWithTemplate(studyIdentifier, {
  useTemplate: true,
  inheritFrom: previousGeneration
});
```

### 데이터베이스 스키마 고려
- 템플릿 테이블 추가 필요
- 스터디 페이지에 templateId, parentPageId 필드 추가
- 변수 치환을 위한 메타데이터 저장 구조

## 결론

현재 시스템은 "같은 스터디의 다음 기수 생성"을 "완전히 새로운 스터디 생성"으로 취급하여 심각한 UX 문제를 야기하고 있다. 이는 명백한 설계 결함으로, 사용자의 시간 낭비와 실수를 유발한다.

**핵심 인사이트: "기수 생성은 '편집'이지 '새로 작성'이 아니다"**

템플릿 시스템 도입을 통해 이 문제를 해결하면, 스터디 운영자의 작업 효율을 크게 개선하고 플랫폼의 확장성을 높일 수 있다.

## 관련 문서
- `/docs/completed/TECOTECO_HARDCODED_VS_DYNAMIC_PARITY_TODO.md`
- `/docs/project/editor/STUDY_DETAIL_EDITOR_STRATEGY.md`