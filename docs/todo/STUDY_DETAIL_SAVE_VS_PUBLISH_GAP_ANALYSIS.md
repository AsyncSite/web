# Study Detail Page: Save (Draft) vs Publish — Behavior Gap Analysis

## TL;DR
- Current behavior: Editing and saving sections while status is PUBLISHED immediately updates the live page. Publish only updates status/metadata (publishedAt/by, version+1), not content.
- User expectation: Save keeps changes private (draft), Publish makes them public atomically.
- Root cause: Backend allows editing in both DRAFT and PUBLISHED (`isEditable`), and persists edits to the single page record. No separate draft snapshot.

---

## Scope
- Frontend: `web` (editor UI, API calls)
- Backend: `study-service` (controller, service, domain model)
- Gateway: `core-platform` (routing)

---

## Current UX and Frontend Behavior

### Editor surface
- Page-level header currently shows only a "발행하기" (Publish) button; a page-level "초안 저장" button has been removed.
  - `web/src/pages/StudyManagementPage.tsx`
    - Editor actions hide draft save:
      - Note: "초안 저장 버튼 제거: 스냅샷 미도입 상태에서 혼란 방지" (comment)
- Section-level forms still present a "저장" button that triggers immediate API updates (add/update/delete/reorder), effectively persisting edits to server.
  - Example: `web/src/components/studyDetailPage/editor/forms/RichTextSectionForm.tsx` — submit handler calls `onSave`, which leads to the section update API.

### API usage from frontend
- Service: `web/src/api/studyDetailPageService.ts`
  - Public fetch: `GET /api/study-pages/slug/{slug}` (published only)
  - Draft fetch: `GET /api/study-pages/{studyId}/draft`
  - Draft save: `PUT /api/study-pages/{studyId}/draft`
  - Section ops (mutate current page):
    - `POST /api/study-pages/{studyId}/sections`
    - `PUT  /api/study-pages/{studyId}/sections/{sectionId}`
    - `DELETE /api/study-pages/{studyId}/sections/{sectionId}`
    - `PUT  /api/study-pages/{studyId}/sections/reorder`
  - Publish: `POST /api/study-pages/{studyId}/publish`
- Page management screen: `web/src/pages/StudyManagementPage.tsx`
  - On load: tries draft; if missing, tries published by slug (for initial render).
  - Section operations immediately call server; upon success, state is updated and UI reflects server data.
  - Publish shows confirm modal, then calls `publish`.

### Public rendering
- `web/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`
  - Public page fetches only the published version by slug. There's no preview of drafts in public route.

---

## Backend Behavior and Domain Rules

### Controller: `study-service`
- `study-service/src/main/java/.../StudyDetailPageController.java`
  - Public:
    - `GET /api/v1/study-pages/slug/{slug}` → returns published page
  - Authenticated (editor):
    - `GET /api/v1/study-pages/{studyId}/draft` → returns draft page
    - `PUT /api/v1/study-pages/{studyId}/draft` → save draft
    - Section ops (add/update/delete/reorder)
    - `POST /api/v1/study-pages/{studyId}/publish` → publish (Role.ADMIN)

### Service and Domain model
- Service: `StudyDetailPageService`
  - `saveDraft(...)` updates theme/sections on the same page entity and saves it, as long as `page.isEditable()` is true.
  - All section ops similarly update and save the same page record.
  - `publish(...)` calls domain `page.publish(publishedBy)` which sets status PUBLISHED, sets `publishedAt`/`publishedBy`, and increments `version`, then saves.
  - `getDraftPage(...)` fetches by status DRAFT; public fetch is by status PUBLISHED. However, storage is a single record representing the page; there is no forked draft snapshot — only the current status on that single entity.
- Domain: `StudyDetailPage`
  - `isEditable()` returns true for both DRAFT and PUBLISHED, allowing content edits in PUBLISHED.
  - `publish(...)` mutates status and metadata; no content copy/snapshotting.
  - `validateForPublish()` allows publishing from DRAFT or republishing from PUBLISHED; empty pages allowed.

### Implication
- Because PUBLISHED is editable, any section-level "저장" during PUBLISHED persists directly to the live page. There is no separation of draft versus public content at the storage level.

---

## Gateway (Routing)
- `core-platform/gateway/src/main/resources/application.yml`
  - Rewrites `/api/study-pages/**` to `/api/v1/study-pages/**`. No semantic change; routing does not differentiate draft versus public beyond the path.

---

## Why Save and Publish Feel the Same to Users
- PUBLISHED is editable; saving edits updates the single underlying page record used for public rendering.
- Publish merely updates status and metadata (and bumps version). It does not perform a content promotion from a draft snapshot.
- Result: Users perceive little to no difference between pressing "저장" on a section form and pressing "발행하기", especially when the page is already PUBLISHED.

---

## User Risks and UX Mismatch
- Accidental live changes: A simple "저장" immediately affects the live site when status is PUBLISHED.
- No atomic batch update: Changes cannot be staged and released together.
- No review/approval: "검토 요청" exists in API surface but is effectively no-op in domain (review phase removed).
- Limited auditability: Content changes do not record publish events unless Publish is called; frequent live saves complicate change tracking.
- Confusing affordances: Users expect Save to be private and Publish to be public; current behavior violates that mental model.

---

## Example Flows Illustrating the Gap
1) Page already PUBLISHED → user edits a section → clicks "저장"
- Backend accepts edit because PUBLISHED is editable → live site reflects change immediately.
- Publish is optional and only adjusts metadata; no further content change occurs.

2) Page in DRAFT → user edits and clicks "발행하기"
- Publish sets status to PUBLISHED and records metadata. Content is whatever is in the single page record at that moment.

---

## Recommendations

### Short-term (UX-only mitigations; no schema change)
- Clarify button labeling when status is PUBLISHED:
  - Change section "저장" label to "저장(즉시 공개 반영)" in editor contexts where the page status is PUBLISHED.
  - Add a confirm modal warning for PUBLISHED saves.
- Adjust Publish button behavior:
  - If page is already PUBLISHED and no draft divergence exists, show as "재발행(메타데이터 갱신)" or disable/hide to avoid confusion.
- Documentation and tooltips:
  - Surface inline explanations stating that edits are live when page is already published.

Pros: Low effort. Cons: Does not fix the core staging need.

### Mid-term (soft draft fork during edit)
- When editing a PUBLISHED page, create a draft fork (snapshot) at edit start:
  - Subsequent saves persist to the draft snapshot only.
  - Public page remains unchanged until Publish.
- Introduce explicit draft preview URL with secure token.
- On Publish:
  - Promote draft snapshot to public (copy/swap), update `publishedAt/by`, and optionally close the draft.
- Editor UI:
  - Display draft vs public diff, unsaved changes banner, and a clear "발행" CTA.

Pros: Aligns with user expectations. Cons: Requires schema and API changes.

### Long-term (versioned content + clear states)
- Data model:
  - Separate tables or entities for `Page` (identity, routing), `PageContentVersion` (immutable content snapshots), and pointers: `publicVersionId`, `draftVersionId`.
- API surface:
  - Section ops mutate draft version only.
  - Publish moves `publicVersionId = draftVersionId` and creates a new draft from that or clears draft pointer.
  - Provide history, rollback, and diff endpoints.
- Domain rules:
  - `isEditable()` for content becomes true only for DRAFT (or draft version). PUBLISHED content is immutable; only metadata can change.

Pros: Robust staging, audit, rollback. Cons: Higher implementation cost.

---

## Proposed API Adjustments (Conceptual)
- Continue to expose:
  - `GET /study-pages/slug/{slug}` → public content (publicVersion)
  - `GET /study-pages/{studyId}/draft` → draft content (draftVersion)
  - `PUT /study-pages/{studyId}/draft` and section ops → operate on draftVersion only
  - `POST /study-pages/{studyId}/publish` → atomically promote draftVersion to publicVersion
- Enforce domain invariants:
  - Content mutation not allowed directly on PUBLISHED publicVersion.
  - DraftVersion must exist before mutations when page is PUBLISHED. Auto-create if missing on first edit.

---

## Acceptance Criteria (for mid/long-term)
- Saving while page is PUBLISHED does NOT alter the publicly visible content.
- Publish atomically updates the publicly visible content to match the latest saved draft.
- Users can preview draft content without exposing it publicly.
- Audit trail includes who saved drafts and who published which version when.
- Optional: Version history and rollback available.

---

## Migration Considerations
- Existing pages:
  - For each page, create an initial `publicVersion` from current content. No draft by default.
  - On first edit of a PUBLISHED page, auto-create a `draftVersion` initialized from `publicVersion`.
- Backfill metadata where missing (publishedAt/by) using best-effort rules.
- Ensure slug routing continues to fetch only `publicVersion`.

---

## Open Questions
- Roles and permissions:
  - Should study leader be allowed to publish, or only admins? Current controller requires ADMIN for publish.
- Review workflow:
  - Is a review/approval step required? If yes, who can approve?
- Scheduling:
  - Need scheduled publish (timer) and embargo?
- Diff and rollback:
  - How will the UI present differences and support rollback?
- Analytics:
  - Track draft saves vs publishes; measure time-to-publish and error rates.

---

## Evidence (Key References)
- Frontend
  - `web/src/pages/StudyManagementPage.tsx`: editor actions and publish handler; draft save button removed comment.
  - `web/src/api/studyDetailPageService.ts`: endpoints for draft, sections, publish.
  - `web/src/components/studyDetailPage/editor/forms/*SectionForm*.tsx`: section-level save buttons.
  - `web/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`: public fetch by slug.
- Backend
  - Controller: `.../StudyDetailPageController.java` — endpoints and roles.
  - Service: `.../StudyDetailPageService.java` — edits and publish semantics; no snapshotting.
  - Domain: `.../StudyDetailPage.java` — `isEditable()` true for DRAFT and PUBLISHED; `publish()` updates metadata; `validateForPublish()`.
- Gateway
  - `core-platform/gateway/src/main/resources/application.yml`: rewrite rules only.

---

## Next Steps
- Decide on mitigation level (short vs mid vs long term).
- If mid/long-term approach is approved, draft data model changes and API contracts, then plan incremental rollout.

---

## 2025-08-13 Deep Dive Update — Versioned Content Approach (Author: AI)

### Executive Summary
- 문제의 본질: 단일 엔티티에 대해 `PUBLISHED` 상태에서도 편집이 허용되어, 섹션 레벨 "저장"이 즉시 라이브 콘텐츠를 덮어씀.
- 핵심 해결: 콘텐츠를 불변 스냅샷(version)으로 분리하고 `publicVersionId`/`draftVersionId` 포인터를 두어 공개본과 초안본을 엄격히 분리. 모든 편집은 초안에만 반영, 발행은 초안을 공개본으로 원자 승격.
- 효과: 안전한 스테이징, 원자적 발행, 감사/롤백/리뷰 확장성 확보. 프론트 UX가 사용자의 기대(저장=비공개, 발행=공개)와 일치.

### Evidence Snapshots (Code-level)
아래는 현 구조가 즉시 공개 반영으로 동작함을 보여주는 핵심 코드 발췌입니다.

```study-service/src/main/java/com/asyncsite/studyservice/studydetailpage/domain/model/StudyDetailPage.java
public boolean isEditable() {
    return status == PageStatus.DRAFT || status == PageStatus.PUBLISHED; // 공개본도 편집 허용
}

public StudyDetailPage publish(String publisherId) {
    validateForPublish();
    return this.toBuilder()
        .status(PageStatus.PUBLISHED)           // 상태/메타데이터만 변경
        .publishedAt(LocalDateTime.now())
        .publishedBy(publisherId)
        .version(this.version + 1)
        .build();                               // 콘텐츠 스냅샷 승격 없음
}
```

```study-service/src/main/java/com/asyncsite/studyservice/studydetailpage/application/service/StudyDetailPageService.java
public StudyDetailPage saveDraft(UUID studyId, PageTheme theme, List<PageSection> sections, String updatedBy) {
    var page = repository.findByStudyId(studyId).orElseThrow(...);
    if (!page.isEditable()) throw ...;
    var updated = page.toBuilder().theme(theme).sections(sections).build(); // 동일 엔티티 즉시 변경
    return repository.save(updated);
}
```

프론트는 공개 라우트에서 반드시 발행본만 조회합니다.

```web/src/components/studyDetailPage/StudyDetailPageRenderer.tsx
await studyDetailPageService.getPublishedPageBySlug(studyIdentifier); // 공개본만 렌더링
```

### Target Architecture — Versioned Content with Pointers
- 데이터 모델
  - `study_detail_pages` (아이덴티티)
    - id, studyId, slug, status, publishedAt, publishedBy, createdAt/by, updatedAt/by
    - publicVersionId (FK -> versions.id)
    - draftVersionId (nullable, FK -> versions.id)
  - `study_detail_page_versions` (불변 스냅샷)
    - id, pageId (FK), theme(JSON), sections(JSON), schemaVersion, createdAt, createdBy

- 도메인 불변식
  - 공개본(publicVersion)은 불변. 콘텐츠 변경 금지
  - 모든 섹션/테마 편집은 초안(draftVersion)에만 반영
  - PUBLISHED 상태에서 첫 편집 시, 초안 없으면 `publicVersion` 복제해 `draftVersion` 자동 생성
  - 발행은 트랜잭션으로 `publicVersionId = draftVersionId` 승격 + publishedAt/by 갱신
  - 낙관적 락(@Version) 또는 콘텐츠 해시로 경쟁 상태 방지 및 충돌 감지

- API 계약(개념)
  - Public: `GET /study-pages/slug/{slug}` → publicVersion 반환
  - Draft 조회: `GET /study-pages/{studyId}/draft` → draftVersion 반환(없으면 서버가 자동 생성 또는 404 정책 결정)
  - Draft 저장: `PUT /study-pages/{studyId}/draft` → draftVersion만 변경
  - 섹션 조작: `POST/PUT/DELETE /study-pages/{studyId}/sections[...]` → draftVersion만 변경
  - 발행: `POST /study-pages/{studyId}/publish` → draftVersion을 publicVersion으로 원자 승격
  - 이력/롤백(선택): `GET /study-pages/{studyId}/versions`, `POST /study-pages/{studyId}/rollback/{versionId}`

### Frontend UX/Flow
- 에디터는 항상 Draft를 로드하고 편집. PUBLISHED 상태에서 초안 없으면 "공개본으로부터 초안 생성" 워크플로우 제공(서버 자동 생성이면 UI 알림만)
- 섹션 폼 버튼 명확화: "초안 저장"으로 표기. "즉시 공개" 아님을 상시 안내
- 발행 CTA는 배치 승격(원자 반영) 의미로 유지. 발행 후 공개 링크/미리보기 제공
- 초안 미리보기(private): 토큰 기반 프리뷰 링크 또는 내부 미리보기 라우트 지원
- 분기 표시: 공개본과 초안이 달라졌을 때 divergence 배지/배너 표시, diff 뷰 제공(선택)

### Migration Plan (Zero-downtime 지향)
1) 스키마 추가
   - `study_detail_page_versions` 생성
   - `study_detail_pages`에 `publicVersionId`, `draftVersionId` 컬럼 추가(NULL 허용), 인덱스/FK 추가
2) 백필(batch)
   - 기존 각 페이지의 현 콘텐츠를 1회 스냅샷으로 저장 → 이를 `publicVersionId`로 연결
   - `draftVersionId`는 비워둠
3) 점진적 라우팅 스위치
   - 읽기 경로: 공개 라우트는 `publicVersion`만 반환
   - 쓰기 경로: 모든 섹션/테마 조작은 draft 전용으로 변경. 초안 미존재 시 서버에서 자동 생성
4) 발행 경로 전환
   - `publish`에서 포인터 승격 트랜잭션 적용
5) 제거/정리(후속)
   - 도메인의 `isEditable()`에서 PUBLISHED 편집 허용 제거
   - 단일 엔티티에 직접 sections/theme를 덮는 경로 폐기

### Rollout & Compatibility
- 단계적 기능 플래그로 서버/클라이언트 전환 제어
- 구버전 클라이언트 요청은 서버가 draft 자동 생성으로 최대한 수용(일시적 호환)
- 관측/로그로 오류율 모니터링, 스위치백 경로 준비

### Test Plan
- 단위 테스트(도메인)
  - PUBLISHED 상태에서 섹션 조작 시 예외 또는 draft 자동 생성 후 변경
  - publish 시 `publicVersionId`가 `draftVersionId`로 교체되는지, 타임스탬프/사용자 기록 검증
- 통합 테스트(서비스/리포지토리)
  - 드래프트 최초 생성/저장/발행/재발행 플로우
  - 동시 편집 충돌(낙관적 락) 검증
- E2E/컨트랙트
  - 프론트 에디터에서 "저장→발행" 시 공개 페이지가 원자적으로 바뀌는지
  - PUBLISHED에서 저장해도 공개 페이지가 변하지 않는지
  - 드래프트 프리뷰와 공개 뷰의 차이/동기화 검증

### Observability & Audit
- 이벤트 로깅: draftCreated, draftSaved, published, archived
- 감사 필드: version row에 createdBy/At 저장, publish 이벤트에 publishedBy/At 저장
- 메트릭: 초안 저장 대비 발행 비율, 평균 소요 시간, 충돌 빈도

### Risks & Mitigations
- 마이그레이션 중 일관성 리스크 → 포인터 스위치 원자화, 읽기 경로는 항상 publicVersion 고정
- 동시 편집 충돌 → 낙관적 락 도입 및 UI 재시도/머지 UX 제공
- 스토리지 증가 → 버전체한/가비지 컬렉션 정책(예: 최신 N개 유지 + 수동 핀)

### Decision Log
- 채택: 버전 스냅샷 + 포인터(public/draft) 모델
- 보류: 리뷰 승인 워크플로우(추가 요구시 확장), 예약 발행(후속), 히스토리 UI(2단계)

### Acceptance Criteria (Refined)
- PUBLISHED 상태에서의 저장은 공개 페이지에 영향 없음(초안만 변경)
- 발행은 초안→공개 포인터 승격을 원자적으로 수행하며, 공개 페이지가 즉시 초안과 동일해짐
- 초안 프리뷰 가능, 감사 이력/롤백 최소 1단계 제공

