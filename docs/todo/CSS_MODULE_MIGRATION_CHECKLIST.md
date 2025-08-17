# CSS 모듈 마이그레이션 체크리스트

> 작업 시작일: 2025년 08월 16일  
> 작업자: AsyncSite Team  
> 진행 상태: [ ] 시작 전 [X] 진행 중 [ ] 완료  
> 전략: 페이지 단위 마이그레이션 (Unit 5 Layout부터 시작)

---

## 🚀 현재 상황: 스터디 제안 플로우 분석 완료 (2025-08-16)

### 완료된 작업
| 컴포넌트 | 상태 | 실제 시간 | 주요 이슈 |
|---------|------|----------|----------|
| Footer.css | ✅ 완료 | 30분 | 미사용 클래스 4개 제거, 36% 크기 감소 |
| LoadingSpinner.css | ✅ 완료 | 40분 | fullscreen 클래스 수정, 6곳 사용 확인 |
| ErrorMessage | ❌ 삭제 | 10분 | 완전 미사용 컴포넌트 (145줄 제거) |

### ~~다음 우선순위: 스터디 제안 플로우 (총 1,455줄)~~ ✅ 완료 (2025-08-17)
| 컴포넌트 | CSS 크기 | 우선순위 | 사용처 |
|---------|---------|---------|--------|
| GenerationSelector | 94줄 | 1 | Step 1 |
| TimePickerCustom | 174줄 | 2 | Step 2 |
| DatePickerCustom | 231줄 | 3 | Step 2 |
| DurationSelector | 302줄 | 4 | Step 2 |
| StudyProposalPageV2 | 654줄 | 5 | ✅ 완료 |

### 전략 변경 사유
- 스터디 제안 플로우가 더 독립적이고 영향 범위가 명확함
- 1,455줄의 대규모 작업이지만 기능이 명확히 구분됨
- 하위 컴포넌트부터 작업하면 점진적 마이그레이션 가능

---

## 🎯 Phase 1: 준비 단계 (우선순위: Critical)

### 환경 설정
- [ ] VS Code Extension 설치: CSS Modules
- [ ] TypeScript CSS Modules Plugin 설치
- [ ] clsx 라이브러리 설치 확인 (`npm list clsx`)
- [ ] ESLint 규칙 업데이트
- [ ] 팀 합의 및 킥오프 미팅

### 테스트 환경
- [ ] 개발 서버 정상 작동 확인
- [ ] 빌드 스크립트 테스트
- [ ] 스테이징 배포 파이프라인 확인

---

## 🔥 Phase 2: Critical - 스타일 충돌 해결 (우선순위: Critical)

### Common 컴포넌트 (11개) - **즉시 작업 필요**
- [ ] `ConfirmModal.css` → `.module.css`
- ~[ ] `ErrorMessage.css` → `.module.css`~ ❌ 삭제됨 (2025-08-16)
- [ ] `InputModal.css` → `.module.css`
- [X] `LoadingSpinner.css` → `.module.css` ✅ 2025-08-16 완료
- [ ] `Modal/Modal.css` → `.module.css`
- [ ] `RichTextDisplay.css` → `.module.css`
- [ ] `RichTextEditor.css` → `.module.css`
- [ ] `Toast.css` → `.module.css`
- [ ] `validation/PasswordStrengthMeter.css` → `.module.css`
- [ ] `validation/ValidationFeedback.css` → `.module.css`
- [ ] `richtext/` 하위 파일들 확인

---

## 🚀 Phase 3: Core Components (우선순위: High)

### Auth 컴포넌트 (7개) - **Critical**
- [ ] `GameAuthWrapper.css` → `.module.css`
- [ ] `LogoutConfirmModal.css` → `.module.css`
- [ ] `PasskeyPromptModal.css` → `.module.css`
- [ ] `PasswordChangeModal.css` → `.module.css`
- [ ] `ProfileOnboardingModal.css` → `.module.css`
- [ ] Auth 페이지 2개 추가 확인

### Layout 컴포넌트 (6개)
- [X] `Footer/Footer.css` → `.module.css` ✅ 2025-08-16 완료
- [ ] `Header.css` → `.module.css`
- [ ] `ScrollNavigation/NavigationLayout.css` → `.module.css`
- [ ] `ScrollNavigation/ScrollNavigation.css` → `.module.css`
- [ ] `SubContentsTemplate.css` → `.module.css`
- [ ] `TemplateHeader.css` → `.module.css`

---

## 📄 Phase 4: Pages (우선순위: High)

### Auth 페이지 (5개)
- [ ] `auth/auth-common.css` → `.module.css`
- [ ] `auth/ForgotPasswordPage.css` → `.module.css`
- [ ] `auth/LoginPage.css` → `.module.css`
- [ ] `auth/ResetPasswordPage.css` → `.module.css`
- [ ] `auth/SignupPage.css` → `.module.css`

### User 페이지 (2개)
- [ ] `user/ProfileEditPage.css` → `.module.css`
- [ ] `user/ProfilePage.css` → `.module.css` (이미 모듈)

### 기타 페이지 (15개+)
- [ ] `StudyApplicationPage.css` → `.module.css`
- [X] `StudyProposalPageV2.css` → `.module.css` ✅ 2025-08-17 완료
- [ ] `ReviewWritePage.css` → `.module.css`
- [ ] `PolicyPage.css` → `.module.css`
- [ ] `LabPage.css` → `.module.css`
- [ ] `TabPage.css` → `.module.css`
- [ ] `CalendarPage` 관련 확인
- [ ] WhoWeAre 시리즈 (8개)
  - [ ] `WhoWeArePage.css`
  - [ ] `WhoWeAreEnhancedPage.css`
  - [ ] `WhoWeArePlanetsIntuitivePage.css`
  - [ ] `WhoWeArePlanetsRandomPage.css`
  - [ ] `WhoWeAreProfileCardsPage.css`
  - [ ] `WhoWeAreProfilePage.css`
  - [ ] `WhoWeAreV2Page.css`
  - [ ] `WhoWeAreV4Page.css`
  - [ ] `WhoWeAreV5Page.css`

### ⚠️ 마이그레이션 제외 대상
- **TecoTecoPage 및 하위 섹션들** (하드코딩된 샘플, 격리 유지)

---

## 🎮 Phase 5: Lab Components (우선순위: Medium)

### Playground (5개)
- [ ] `DeductionGame/AIGuideModal.css`
- [ ] `DeductionGame/DeductionGame.css`
- [ ] `DeductionGame/components/DeductionLeaderboard.css`
- [ ] `Tetris/Tetris.css`
- [ ] `Tetris/TetrisGame.css`

### Spotlight Arena - Core (10개)
- [ ] `common/GameCard/GameCard.css`
- [ ] `common/ParticipantInput/ParticipantInput.css`
- [ ] `common/ResultDisplay/ResultDisplay.css`
- [ ] `history/GameHistoryViewer.css`
- [ ] `stats/StatsDashboard.css`
- [ ] `stats/components/StatsComponents.css`
- [ ] `shared/components/Tooltip.css`
- [ ] `shared/styles/common.css`
- [ ] `shared/styles/variables.css`
- [ ] 메인 페이지 CSS

### Spotlight Arena - Games (20개+)
- [ ] DartWheel 게임 (10개)
- [ ] SlotCascade 게임 (11개)
- [ ] SnailRace 게임 (6개)

### Team Shuffle (5개)
- [ ] `components/EditableTeamName.css`
- [ ] `components/ShuffleButton.css`
- [ ] `components/TeamCard.css`
- [ ] `components/TeamNameTemplateSelector.css`
- [ ] `styles/TeamShuffle.css`

---

## 🧹 Phase 6: Cleanup (우선순위: Low)

### 미사용 파일 삭제
- [ ] `TabPage.module.css` (미사용 확인됨)
- [ ] `styles/typography.css` (미사용 확인됨)
- [ ] `styles/spacing.css` (미사용 확인됨)
- [ ] `styles/animations.css` (미사용 확인됨)
- [ ] `styles/design-tokens.css` (미사용 확인됨)
- [ ] `components/sections/Intro/IntroOptimized.css` (미사용 확인됨)

### 글로벌 스타일 정리
- [ ] `index.css` - 필수 글로벌만 유지
- [ ] `App.css` - 앱 레벨 스타일 검토
- [ ] `styles/common.css` - 공통 스타일 모듈화 검토
- [ ] `styles/common-landing.css` - 랜딩 페이지 검토

### 문서 업데이트
- [ ] CLAUDE.md에 CSS 모듈 가이드라인 추가
- [ ] README.md 업데이트
- [ ] 컴포넌트 작성 가이드 업데이트

---

## ✅ Phase 7: QA & 검증

### 기능 테스트
- [ ] 모든 페이지 라우팅 확인
- [ ] 반응형 디자인 테스트 (mobile/tablet/desktop)
- [ ] 다크모드/라이트모드 전환 테스트
- [ ] 애니메이션 및 트랜지션 확인

### 크로스 브라우저
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

### 성능 측정
- [ ] 번들 사이즈 비교 (before/after)
- [ ] Lighthouse 점수 확인
- [ ] 빌드 시간 측정

### 배포
- [ ] 스테이징 환경 배포
- [ ] 프로덕션 배포 전 최종 확인
- [ ] 롤백 계획 수립

---

## 📊 진행 상황 추적

| Phase | 전체 | 완료 | 진행률 | 담당자 | 메모 |
|-------|------|------|--------|--------|------|
| Phase 1 (준비) | 5 | 0 | 0% | | |
| Phase 2 (Common) | 10 | 1 | 10% | | Critical |
| Phase 3 (Auth/Layout) | 13 | 1 | 7.7% | | Critical/High |
| Phase 4 (Pages) | 22+ | 1 | 4.5% | | StudyProposalPageV2 완료 |
| Phase 5 (Lab) | 50+ | 0 | 0% | | |
| Phase 6 (Cleanup) | 10 | 0 | 0% | | |
| Phase 7 (QA) | 12 | 0 | 0% | | |
| **총계** | **167** | **3** | **1.8%** | | 실제 CSS 파일 수 확인됨 |

---

## 📝 작업 로그

### 날짜: 2025/08/16
- 작업자: AsyncSite Team
- 완료 항목: Footer.css → Footer.module.css 마이그레이션
- 이슈/블로커: 
  - .container 클래스 충돌 → .footerContainer로 변경
  - React.FC 패턴 → 함수형 컴포넌트로 변경
  - 미사용 클래스 4개 제거 (footerLogo, logoText, socialLinks, socialLink)
  - 파일 크기 36% 감소 (102줄 → 65줄)
- 다음 작업: SubContentsTemplate.css (예상 30분)

### 날짜: 2025/08/16 (오후)
- 작업자: AsyncSite Team
- 완료 항목: 
  - LoadingSpinner.css → LoadingSpinner.module.css
  - ErrorMessage 컴포넌트 삭제 (미사용 - 145줄 제거)
  - LoadingSpinner import 실수 복구 (6곳 실제 사용 확인)
- 이슈/블로커: 
  - .fullscreen 클래스에 display 속성 추가 필요 (해결됨)
  - 미사용 import 제거 시 실제 사용처 확인 필수
- 실제 사용처: PrivateRoute, ReviewList, StudyManagementPage(2곳), StudyDetailPageRenderer, sections/index
- 다음 작업: 스터디 제안 플로우 관련 컴포넌트

### 날짜: 2025/08/16 (저녁)
- 작업자: AsyncSite Team
- 분석 항목:
  - 스터디 제안 플로우 CSS 현황 파악
  - StudyProposalPageV2.css (654줄) + 하위 컴포넌트 (801줄) = 총 1,455줄
  - Study 관련 컴포넌트 8개 중 7개가 일반 CSS
- 발견 사항:
  - StudyPage, StudyManagementPage는 이미 CSS Module
  - StudyProposalPageV2, StudyApplicationPage, ReviewWritePage는 일반 CSS
  - DatePicker, TimePicker, DurationSelector 등 하위 컴포넌트도 마이그레이션 필요
- 권장 순서: 하위 컴포넌트 먼저 → 메인 페이지 나중

### 날짜: 2025/08/17
- 작업자: AsyncSite Team
- 완료 항목: StudyProposalPageV2.css → StudyProposalPageV2.module.css 완전 마이그레이션
- 작업 내용:
  - Step 1: 전역 CSS 충돌 클래스명 리네이밍 (btn-primary → proposal-primary-btn 등)
  - Step 2: CSS Module 변환 (71개 className, 동적 클래스 2개 처리)
  - 누락된 독립 클래스 추가 (active, completed, selected, placeholder-*, notice-*, disabled-text)
  - 중첩 선택자 처리 및 CSS Module 규칙 준수
- 이슈/해결:
  - 전역 CSS(common.css, App.css)와 충돌하던 btn-primary, btn-secondary 해결
  - 동적 클래스(active, completed, selected) 독립 정의 추가
  - 모든 케밥케이스 클래스명 bracket notation 사용
- 검증 완료:
  - TypeScript 컴파일 에러 없음
  - 모든 사용 클래스가 CSS에 정의됨
  - Build 성공
- 다음 작업: 하위 컴포넌트들 (DatePickerCustom, TimePickerCustom 등) Module 전환 고려

### 날짜: ____/__/__
- 작업자:
- 완료 항목:
- 이슈/블로커:
- 다음 작업:

---

## 🚨 이슈 트래킹

| 날짜 | 이슈 | 해결 방법 | 담당자 |
|------|------|-----------|--------|
| | | | |
| | | | |

---

## 💡 개선 제안

작업 중 발견한 개선점을 기록:
1. 
2. 
3. 

---

*이 체크리스트는 작업 진행에 따라 지속적으로 업데이트됩니다.*  
*최종 업데이트: 2025년 08월 16일*