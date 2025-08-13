# 스터디 제안 폼 검증 및 요약 UI 개선 계획

## 현재 문제점
1. **날짜 검증 오류**: 백엔드와 프론트엔드 간 날짜 검증 로직 불일치
2. **사용자 피드백 부족**: 잘못된 입력 시 구체적인 안내 부족
3. **제출 전 확인 불가**: 입력한 내용을 한눈에 검토할 수 없음

## 개선 방안

### 1. 날짜 검증 로직 통합
#### 백엔드 (완료)
- `@Future` → `@FutureOrPresent` 변경으로 오늘 날짜 허용
- 모집 마감일 ≤ 시작일 검증
- 시작일 ≤ 종료일 검증

#### 프론트엔드 (완료)
- DatePicker 컴포넌트에 `min`/`max` 속성 추가
- 실시간 날짜 검증 및 경고 메시지
- 제출 시 최종 검증

### 2. 제출 전 요약 모달 UI (TODO)

#### 구현 계획
```tsx
interface StudySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: StudyProposalRequest;
}

// 표시할 정보:
- 기본 정보
  - 스터디명
  - 유형 (참여형/교육형)
  - 반복 유형 (매주/격주/월간/1회성)
  - 기수
  - 한 줄 소개
  
- 일정 정보
  - 일정 (예: 매주 금요일 19:30-21:30)
  - 진행 기간 (8주)
  - 시작일 ~ 종료일
  
- 모집 정보
  - 모집 인원
  - 모집 마감일
  
- 검증 결과
  ✅ 모든 필수 항목 입력 완료
  ✅ 날짜 검증 통과
  ⚠️ 경고 사항 (있을 경우)
```

#### UI 디자인
```
┌─────────────────────────────────────┐
│      스터디 제안 내용 확인          │
├─────────────────────────────────────┤
│                                     │
│ 📝 기본 정보                        │
│ • 스터디명: React 심화 스터디       │
│ • 유형: 참여형                      │
│ • 반복: 매주                        │
│                                     │
│ 📅 일정 정보                        │
│ • 일정: 매주 금요일 19:30-21:30     │
│ • 기간: 2025.01.15 ~ 2025.03.15     │
│ • 진행: 8주                         │
│                                     │
│ 👥 모집 정보                        │
│ • 인원: 20명                        │
│ • 마감: 2025.01.10 23:59            │
│                                     │
│ ✅ 검증 완료                        │
│ • 모든 필수 항목이 입력되었습니다   │
│ • 날짜 범위가 올바릅니다            │
│                                     │
├─────────────────────────────────────┤
│  [수정하기]          [제출하기]     │
└─────────────────────────────────────┘
```

### 3. 검증 로직 개선 사항

#### 3.1 필수 항목 검증
- [x] 제목 필수
- [x] 일정 정보 필수 (요일/시간)
- [ ] 최소 1명 이상 모집 인원
- [ ] 모집 마감일 필수 여부 확인

#### 3.2 날짜 검증 규칙
```javascript
// 검증 순서
1. 오늘 날짜 기준 검증
   - startDate >= 오늘
   - recruitDeadline >= 오늘
   
2. 날짜 간 관계 검증
   - recruitDeadline <= startDate
   - startDate <= endDate
   
3. ONE_TIME 스터디 특별 검증
   - selectedDate >= 오늘
```

#### 3.3 사용자 경험 개선
- [ ] 각 단계별 진행률 표시
- [ ] 필수 항목 미입력 시 시각적 표시
- [ ] 날짜 자동 계산 기능 (진행 기간 → 종료일)
- [ ] 스마트 기본값 (예: 모집 마감일 = 시작일 - 7일)

### 4. 구현 파일 구조

```
/src/pages/StudyProposalPageV2.tsx (기존)
/src/components/study/
  ├── StudyProposalSummaryModal.tsx (신규)
  ├── StudyProposalSummaryModal.css (신규)
  └── StudyProposalValidation.ts (신규 - 검증 로직 분리)
```

### 5. 검증 함수 모듈화

```typescript
// StudyProposalValidation.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateStudyProposal(data: FormData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 필수 항목 검증
  if (!data.title.trim()) {
    errors.push('스터디명은 필수입니다');
  }
  
  // 날짜 검증
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (data.startDate) {
    const start = new Date(data.startDate);
    if (start < today) {
      errors.push('시작일은 오늘 이후여야 합니다');
    }
  }
  
  // ... 추가 검증 로직
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### 6. 단계별 구현 계획

#### Phase 1: 검증 로직 모듈화 (1일)
- [ ] StudyProposalValidation.ts 생성
- [ ] 기존 검증 로직 이동
- [ ] 단위 테스트 작성

#### Phase 2: 요약 모달 UI (2일)
- [ ] StudyProposalSummaryModal 컴포넌트 개발
- [ ] 스타일링 적용
- [ ] 애니메이션 추가

#### Phase 3: 통합 및 테스트 (1일)
- [ ] StudyProposalPageV2에 모달 연결
- [ ] E2E 테스트
- [ ] 사용자 피드백 반영

### 7. 예상 효과
1. **오류 감소**: 제출 전 검증으로 400 에러 방지
2. **사용성 향상**: 명확한 피드백과 안내
3. **신뢰도 증가**: 입력 내용 확인 과정으로 실수 방지

### 8. 추가 고려사항
- [ ] 모바일 반응형 디자인
- [ ] 접근성 (A11y) 지원
- [ ] 다국어 지원 준비
- [ ] 입력 내용 임시 저장 (localStorage)

## 참고 자료
- 현재 구현 파일: `/src/pages/StudyProposalPageV2.tsx`
- 날짜 선택 컴포넌트: `/src/components/study/DatePickerCustom.tsx`
- API 타입 정의: `/src/api/studyService.ts`

## 관련 이슈
- 백엔드 날짜 검증: `@Future` vs `@FutureOrPresent`
- 프론트엔드 날짜 포맷: `YYYY-MM-DD` vs `YYYY-MM-DDTHH:mm:ss`
- 타임존 이슈: 로컬 시간 vs UTC

---

작성일: 2025-08-13
작성자: Development Team
상태: TODO