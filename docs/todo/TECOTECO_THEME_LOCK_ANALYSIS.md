# TecoTeco UI Theme Lock: Analysis, Risks, and Remediation Plan

## TL;DR
- The study detail page renderer and several section components are currently hard‑wired to render using the TecoTeco visual style, regardless of page data.
- Concretely, `FAQSection`, `RichTextSection`, and `MembersSection` always emit `tecoteco-*` DOM/class structures; the renderer no longer passes or honors `theme`.
- This achieves consistent, single-style rendering for all studies (desired short-term), but removes any future variability. It also tightly couples DOM/class and content defaults to TecoTeco assumptions.
- This doc enumerates current behavior, risks, options to evolve, a remediation plan, tests, and rollout guidance.

---

## Scope
- Covers "TecoTeco hard lock" in study detail rendering:
  - `web/src/components/studyDetailPage/sections/FAQSection.tsx`
  - `web/src/components/studyDetailPage/sections/RichTextSection.tsx`
  - `web/src/components/studyDetailPage/sections/MembersSection.tsx`
  - `web/src/components/studyDetailPage/StudyDetailPageRenderer.tsx` mapping behavior
- Excludes slug generation policy details (tracked in separate slug docs); briefly references where linked.

---

## Current Implementation Snapshot

### Renderer mapping
- File: `web/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`
- Theme is not passed into sections anymore. For MEMBERS props, the previous `pageData.slug === 'tecoteco'` branch was removed and replaced by unconditional normalization (e.g., deriving `weeklyMvp` if missing, normalizing `stats.popularAlgorithms`).
- Implication: sections receive props that are already minimally normalized but not themed.

### FAQSection (TecoTeco-only)
- File: `web/src/components/studyDetailPage/sections/FAQSection.tsx`
- Behavior: Always renders the TecoTeco FAQ/Join variant and classes.
  - Classes include: `tecoteco-faq-join-section`, `tecoteco-faq-items`, `tecoteco-faq-item`, `tecoteco-faq-question`, `tecoteco-faq-answer`, `tecoteco-faq-icon`, etc.
  - CTA block defaults reference TecoTeco-specific copy (e.g., `joinTitle`, `joinButtonText`).
- Snippet:
  - Conditional is hard-coded true and theme default is `'tecoteco'`.

### RichTextSection (TecoTeco-only)
- File: `web/src/components/studyDetailPage/sections/RichTextSection.tsx`
- Behavior: Always renders with `tecoteco-theme` wrapper and `tecoteco-content` for inner content; title appears as a TecoTeco tag header.
- Style behaviors hard-coded for TecoTeco (padding, background, text widths, and highlights matching TecoTeco design language).

### MembersSection (TecoTeco-only)
- File: `web/src/components/studyDetailPage/sections/MembersSection.tsx`
- Behavior: Always uses TecoTeco-specific CSS and class names for the card grid and interaction model.
  - Imports `MembersSection.css` and `MembersSection-tecoteco.css`.
  - Card class: `tecoteco-contributor-card`
  - Wrapper class: `tecoteco-members-section`
  - Profile classes: `tecoteco-profile-wrapper`, `tecoteco-profile-img`
  - Typography: `tecoteco-contributor-name`, `tecoteco-contributor-duration`, `tecoteco-contributor-contribution`
  - Interactions: MVP badge, center-fixed hover overlay, streak, connection lines, stats container labels, etc.
- Behavior does not depend on `theme` prop anymore; the TecoTeco experience is always on.

---

## Affected User Flows
- Any study detail page—regardless of study type or intended brand/visual—renders the TecoTeco design.
- Editor UX: If/when editors inject props assuming other themes, UI still renders TecoTeco markup and CSS.
- SEO/branding consistency: Consistent look site-wide (good short-term), no variability possible (risk long-term).

---

## Risks / Trade-offs
- **No theming extensibility**: Additional themes, seasonal styling, or per-study branding cannot be expressed without re-introducing theme-aware code.
- **Tight DOM/Class Coupling**: CSS and interactions currently tailored to TecoTeco. Introducing a new theme later will require a broader refactor (split styles and structures per theme or make them configurable).
- **Content Defaults Tied to TecoTeco**: Some copy defaults e.g., join CTA texts are TecoTeco-specific, which can be inappropriate for other studies.
- **Editor/Data Mismatch**: `theme` in page data is effectively ignored; powering an editor to author different styles would be misleading without code support.

---

## Non-Goals
- We are not proposing immediate re-introduction of a theming system if the current product intent is a single, unified TecoTeco style.
- We are not changing data schemas at this moment; merely documenting impact and options.

---

## Options Going Forward

### Option A: Keep TecoTeco as the One-and-Only Theme (Short-to-Mid Term)
- Pros: Simplicity; consistency across pages; less surface area.
- Cons: No flexibility; future brand/partners require rework.
- Suggested guardrails:
  - Strip theme controls from editors (or hide) to avoid confusion.
  - Keep TecoTeco classes documented as the canonical DOM contract.
  - Document style tokens and palette as brand variables for future extraction.

### Option B: Make Theme a PageData-controlled Switch Again (Mid Term)
- Re-introduce `pageData.theme` as the sole source of truth. Supported values could start with `tecoteco` and `default`.
- Keep renderer mapping simple but allow selective overrides:
  - `FAQSection`: switch class roots between `tecoteco-*` and `study-detail-*`.
  - `RichTextSection`: toggle wrapper class, tag header vs. regular title behavior.
  - `MembersSection`: toggle class set and interactions.
- Pros: Controlled flexibility; ability to pilot new themes.
- Cons: Slightly more complexity and QA matrix.

### Option C: Theme System (Design Tokens + Variants) (Long Term)
- Introduce design tokens (colors, spacing, typography), component variants, and light composition rules.
- Allow per-section or per-page theming with constraints.
- Pros: Scalable, decoupled styling and JS logic.
- Cons: Larger investment, requires design/FE alignment and robust QA.

---

## Data Model Considerations
- Today: Page data likely contains `theme` (still present in DTOs and editor forms), but it is not used.
- If we adopt Option B or C:
  - `theme` should be reintroduced as respected input; defaults must be explicit.
  - Editor validation and defaults should align with runtime behavior.
  - Consider per-section theme override vs. page-level theme only (avoid combinatorial explosion).

---

## Frontend Change Plan (If/When Needed)
- Renderer: Respect `pageData.theme` with a minimal switch (`'tecoteco'` | `'default'`).
- Sections:
  - Refactor to accept `variant` prop derived from theme; map to class roots (`tecoteco-*` vs `study-detail-*`).
  - Extract TecoTeco copy defaults to constants; provide neutral defaults for `'default'`.
- CSS:
  - Co-locate variant-specific styles and avoid mixing variant classes in the same rule chains.
  - Use CSS variables for palette if useful.

---

## Backend Cross-Dependencies (FYI)
- Not required to change backend for theme lock itself.
- However, keep in mind ongoing slug policy work:
  - Server must guarantee `StudyResponse.slug` for reliable links.
  - `StudyDetailPage.createPage` currently requires slug in request. If frontend should not provide one, backend must derive from `study.slug`.

References:
- `study-service`: `StudyUseCaseImpl.generateAndEnsureUniqueSlug(...)` (slug generation logic)
- `StudyCreateRequest` and `CreatePageRequest` (validation of slug)

---

## QA / Test Plan
- Unit tests:
  - Verify sections render TecoTeco class roots regardless of theme in input data.
  - Verify renderer mapping does not pass `theme` downstream and the visible DOM matches expected TecoTeco structure.
- Visual regression (optional):
  - Screenshot tests for representative pages to lock in TecoTeco visuals.
- E2E checks:
  - Ensure editor changes do not impact front-end rendering of theme.

---

## Rollout & Risk Mitigation
- Current state is already live (hard-locked TecoTeco). If moving to Option B/C:
  - Stage behind a feature flag (e.g., `enableMultiTheme`), default off.
  - Dual-render QA on staging to validate that legacy and new variants match acceptance criteria.

---

## Acceptance Criteria (for any future un-locking work)
- Page renders identically for `theme='tecoteco'` as today (pixel/DOM parity) on a golden sample (e.g., backend-deep-dive).
- For `theme='default'`, renders a neutral variant with no TecoTeco copy/classes.
- No runtime errors when `theme` is missing; explicit default is applied.

---

## Open Questions
- Do we foresee non-TecoTeco studies in the near term with different branding needs?
- Should we allow per-section overrides or page-level theme only?
- Should TecoTeco copy defaults (CTA texts) be detached into content config rather than code defaults?

---

## Appendix: File Pointers
- Renderer: `web/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`
- Sections:
  - FAQ: `web/src/components/studyDetailPage/sections/FAQSection.tsx` (+ `FAQSection.css`)
  - RichText: `web/src/components/studyDetailPage/sections/RichTextSection.tsx` (+ `RichTextSection.css`)
  - Members: `web/src/components/studyDetailPage/sections/MembersSection.tsx` (+ `MembersSection.css`, `MembersSection-tecoteco.css`)

