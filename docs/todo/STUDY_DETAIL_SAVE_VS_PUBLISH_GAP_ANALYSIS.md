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
