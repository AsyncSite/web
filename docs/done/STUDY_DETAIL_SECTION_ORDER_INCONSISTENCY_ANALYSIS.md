# 스터디 상세 페이지 섹션 순서 불일치 분석 리포트

작성일: 2025-08-13
해결일: 2025-08-13
담당: asyncsite/web

## ✅ 해결 완료

### 요약
- 퍼블릭 렌더러가 저장된 순서를 그대로 사용하지 않고, 추가 정렬 규칙(특히 HERO 섹션 고정 선두, 특정 테스트 텍스트가 포함된 RICH_TEXT를 맨 뒤)으로 덮어쓰는 문제가 있었음
- 편집 화면은 초안(draft)을, 퍼블릭 화면은 발행본(published)을 사용하여 불일치 발생
- 결과적으로 "편집 화면에선 Reviews가 맨 뒤인데 퍼블릭에선 HERO 바로 아래로"와 같은 현상이 발생

## 문제 원인

### 1. 데이터 소스 불일치
- 편집(관리) 화면: 초안(draft) 데이터를 우선 사용
- 퍼블릭 화면: 항상 발행(published) 데이터를 사용

### 2. 퍼블릭 렌더러의 강제 정렬 규칙
퍼블릭 렌더러가 임의로 섹션을 재정렬:
1) HERO 섹션을 항상 최우선(맨 앞)
2) 특정 테스트 텍스트가 포함된 RICH_TEXT는 맨 뒤로 이동
3) 나머지는 `order` 오름차순

### 3. 리뷰 섹션 중복 렌더링
- 섹션으로 추가된 `SectionType.REVIEWS`와 별개로 하단에 고정 ReviewSection 추가

## 해결 방법

### 1. 퍼블릭 렌더러 정렬 로직 단순화 ✅
```javascript
// 변경 전
const sortedSections = pageData ? [...pageData.sections].sort((a, b) => {
  if (a.type === 'HERO' && b.type !== 'HERO') return -1;
  if (a.type !== 'HERO' && b.type === 'HERO') return 1;
  // 테스트 텍스트 처리 로직...
  return a.order - b.order;
}) : [];

// 변경 후 - DB order 값만 신뢰
const sortedSections = pageData ? [...pageData.sections].sort((a, b) => {
  const orderA = a.order ?? 0;
  const orderB = b.order ?? 0;
  return orderA - orderB;
}) : [];
```

### 2. 편집 화면 일관성 확보 ✅
- 미리보기와 섹션 목록 모두 동일한 order 기준 정렬 적용
- null order 값 안전 처리

### 3. 섹션 order 값 정책 명확화 ✅
- 새 섹션 추가: 최대 order + 100
- 재정렬: 전체 섹션 order 재계산 (100 단위 간격)

### 4. 발행 상태 가시성 개선 ✅
- 편집 화면에 발행 상태 배지 추가
- 마지막 발행 시간 표시

### 5. 리뷰 섹션 중복 제거 ✅
- 하드코딩된 ReviewSection 제거
- SectionType.REVIEWS만 사용

## 추가 개선 사항

### UI/UX 개선 ✅
1. **섹션 편집창 닫기 버튼 추가**
   - 우측 상단에 X 버튼 배치
   - 편집 중 언제든 닫을 수 있도록 개선

2. **드래그 앤 드롭 버그 수정**
   - 정렬된 배열 인덱스 사용하도록 수정
   - 시각적 피드백 개선

3. **단축키 안내 추가**
   - Alt + ↑↓: 섹션 이동
   - Enter: 편집
   - Delete: 삭제

### 코드 개선 ✅
- 백업 파일 생성 후 안전하게 수정
- TypeScript null safety 처리
- CSS 스타일 개선

## 영향도 평가

| 변경사항 | 영향도 | 결과 |
|---------|--------|------|
| 강제 정렬 제거 | 높음 | ✅ 완료 - 기존 페이지 레이아웃이 DB 순서대로 변경됨 |
| 발행 상태 표시 | 낮음 | ✅ 완료 - UI만 추가 |
| order 값 정책 | 중간 | ✅ 완료 - 프론트엔드에서 처리 |
| 리뷰 중복 제거 | 낮음 | ✅ 완료 - 하드코딩 제거 |

## 결과

### 달성한 목표
1. **Single Source of Truth**: DB order 값이 유일한 진실
2. **WYSIWYG**: 편집 화면과 퍼블릭 화면 완전 일치
3. **예측 가능성**: 사용자가 설정한 순서 = 보이는 순서
4. **단순성**: 복잡한 특수 규칙 모두 제거

### 핵심 원칙
- 임시방편이 아닌 근본적 해결
- 프론트엔드에서 임의 정렬 금지
- DB 데이터를 신뢰

## 변경된 파일
1. `/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`
2. `/src/pages/StudyManagementPage.tsx`
3. `/src/pages/StudyManagementPage.css`

## 테스트 완료
- [x] 섹션 순서가 편집 화면과 퍼블릭에서 일치
- [x] HERO 섹션도 다른 섹션과 동일하게 이동 가능
- [x] 새 섹션 추가 시 맨 뒤에 배치
- [x] 드래그 앤 드롭으로 정확한 위치 이동
- [x] 발행 상태 표시 정상 작동
- [x] 리뷰 섹션 중복 없음

---

**Status: RESOLVED** ✅