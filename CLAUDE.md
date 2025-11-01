# CLAUDE.md
## 🚨🚨🚨 절대 필수 규칙 🚨🚨🚨

### ⚠️ 빌드 및 파일 수정 시 반드시 준수할 규칙

**1. 빌드 시 개별 서비스 통과 100% 무조건 시키고 통과 안하면 다음 단계 진행하지 말 것**
- 모든 테스트가 100% 통과해야만 다음 단계로 진행
- 테스트 실패 시 반드시 문제를 해결한 후 진행
- 테스트 스킵이나 우회 절대 금지

**2. 파일 수정할 때는 일부분만 보고 하지 말고 해당 파일 전체를 무조건 읽고 전부 이해한 다음에 수정할 것**
- 파일의 일부만 읽고 수정하는 것 절대 금지
- 반드시 전체 파일을 읽고 전체 맥락을 이해한 후 수정
- 의존성과 연관성을 파악한 후 작업 진행

**3. API 연동 기능 구현 시 반드시 실제 백엔드 응답 데이터를 먼저 확인할 것**
- 타입 정의나 인터페이스만 보고 추측하지 말 것
- 권한 체크, 데이터 매핑 등 백엔드 의존적인 기능은 **반드시 실제 API 응답 확인 후** 구현
- 예: User 타입에 `role`, `roles`, `systemRole` 모두 있을 때, 백엔드가 실제로 어떤 필드를 사용하는지 먼저 확인
- 추측으로 구현 → 실패 → 다시 수정하는 것 절대 금지


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

If the user's prompt starts with “EP:” or "ep:", then the user wants to enhance the prompt. Read the PROMPT_ENHANCER.md file and follow the guidelines to enhance the user's prompt. Show the user the enhancement and get their permission to run it before taking action on the enhanced prompt.

The enhanced prompts will follow the language of the original prompt (e.g., Korean prompt input will output Korean prompt enhancements, English prompt input will output English prompt enhancements, etc.)


### Development
```bash
npm start          # Start development server on http://localhost:3000
npm test           # Run tests with Jest in watch mode
npm run build      # Create production build in ./build directory
```

### Testing
```bash
npm test                    # Run all tests in watch mode
npm test -- --coverage      # Run tests with coverage report
npm test SomeComponent      # Run tests matching pattern
npm test -- --watchAll=false # Run tests once without watch mode
```

## Architecture

### Routing Structure
The app uses React Router v7 with lazy loading for all routes. Key points:
- Base path is `/` (configured for Vercel deployment)
- All routes are lazy-loaded for optimal bundle size
- Routes are defined in `src/router/router.tsx`
- Sub-routes use `SubContentsTemplate` layout wrapper

### React 19 Features Usage
- **Server Components**: Not yet implemented (consider for data-heavy pages)
- **Actions**: Use for form submissions and async operations
- **Document Metadata**: Use native `<title>`, `<meta>` tags in components
- **Concurrent Features**: Leverage Suspense for loading states

### Component Organization
```
src/
├── pages/          # Route components (lazy loaded)
├── components/
│   ├── layout/     # Page structure (Header, Footer, etc.)
│   ├── sections/   # Reusable page sections
│   ├── lab/        # Lab/project specific components
│   └── ui/         # Shared UI components
```

### Active Feature Development
1. **DeductionGame** (`src/components/lab/playground/DeductionGame/`):
   - Strategy pattern for AI difficulty levels
   - Factory pattern for player creation
   - TypeScript interfaces for type safety
   - Separate concerns: GameManager, Players, Strategies

2. **SpotlightArena** (`src/components/lab/utilities/spotlight-arena/`):
   - Multi-game platform with participant management
   - SnailRace game with real-time animations using Konva.js
   - Video recording feature using MediaRecorder API
   - Local storage for game history and statistics

### Styling Approach

#### CSS Module Usage (중요)
**IMPORTANT: Always use CSS Modules for component styling to prevent style conflicts**

1. **CSS Module 사용 원칙**:
   - 모든 컴포넌트 스타일은 반드시 CSS Module (`.module.css`) 파일로 작성
   - 인라인 스타일 사용 금지 (동적 스타일이 필요한 경우도 클래스 조합으로 해결)
   - 예: `Component.module.css` → `styles['class-name']` 또는 `styles.className`

2. **안전한 CSS 작업 방법**:
   - 전역 스타일 충돌 방지를 위해 항상 module 방식 사용
   - 클래스명은 구체적이고 의미있게 작성 (예: `button` → `submit-button`)
   - 스타일 마이그레이션 시 모든 인라인 스타일을 CSS Module로 이동
   - 호버, 액티브 등 상태 스타일도 CSS로 처리 (`:hover`, `.active` 클래스 활용)

3. **CSS Module 작업 예시**:
   ```typescript
   // BAD - 인라인 스타일
   <button style={{ background: 'linear-gradient(...)' }}>클릭</button>
   
   // GOOD - CSS Module
   import styles from './Component.module.css';
   <button className={styles['primary-button']}>클릭</button>
   ```

4. **기존 방식 (일반 CSS)**:
   - 레거시 컴포넌트만 사용 (점진적으로 module로 마이그레이션)
   - GSAP for animations
   - React Intersection Observer for scroll-triggered effects

5. **⚠️ 전역 CSS 충돌 주의사항 (CRITICAL)**:
   ```css
   /* App.css의 전역 스타일 예시 */
   section {
     min-height: 100vh; /* 모든 section 태그에 영향! */
     padding: 40px 20px;
   }
   ```
   
   **문제 발생 사례**:
   - ActivityCarousel 컴포넌트가 `<section>` 태그 사용 시 의도치 않게 100vh 높이 차지
   - 전역 스타일이 모든 동일 태그에 적용되어 레이아웃 깨짐
   
   **해결 방법**:
   - ✅ HTML 시맨틱 태그 신중히 선택 (`section` → `div` 변경)
   - ✅ CSS Module 사용으로 스타일 스코프 격리
   - ✅ 전역 스타일 정의 시 더 구체적인 선택자 사용
   - ❌ 절대 피해야 할 것: 범용 태그(`section`, `article`, `header`)에 전역 스타일 적용

### TypeScript Configuration
- Strict mode enabled (`strict: true`)
- React JSX transform (no React import needed)
- Target: ES5 for browser compatibility
- Required type definitions for all props, state, and function parameters
- Prefer interfaces over types for component props
- Use generics for reusable components

### Deployment
- Vercel deployment (automatic on push)
- SPA routing handled in `vercel.json`
- Homepage: https://web-cyan-one-95.vercel.app
- Peer dependency conflicts resolved with `.npmrc` file (`legacy-peer-deps=true`)



---

## Problem Solving Approach

⚠️ **MANDATORY**: Follow these 5 steps for every problem-solving task.

1. **Think hard and deeply about the root cause**
   - Focus on the actual source of the problem, not just surface symptoms
   - Apply the "5 Whys" technique to analyze deeply
   - Thoroughly examine logs, browser dev tools, component state, and React error boundaries

2. **Do a global inspection to understand the full context**
   - Review all services and components that might be affected by your changes
   - Check dependencies with backend services (user-service, game-service, payment-core, etc.)
   - Understand existing codebase patterns and React/TypeScript architecture

3. **Find a stable, best-practice solution**
   - Use proven design patterns and React/TypeScript best practices
   - Implement sustainable and scalable solutions, not quick fixes
   - Always consider performance, security, and maintainability

4. **Ensure consistency with other services**
   - Reference implementation patterns from other microservices
   - Apply common patterns and coding standards consistently
   - Extract duplicate code into shared utilities or hooks

5. **Read CLAUDE.md if needed**
   - Always re-check these guidelines when uncertain
   - Review service-specific rules and constraints
   - Check the Architecture and Component Organization sections

**Failing to follow this approach may result in incomplete or inconsistent solutions.**

## Testing Guidelines

### Component Testing
* Use React Testing Library for component tests
* Focus on user behavior, not implementation details
* Mock external dependencies appropriately
* Aim for high coverage on critical paths

### TypeScript Testing
* Ensure type safety in tests
* Use proper type assertions
* Test edge cases and error scenarios

### Verification Workflow

**MANDATORY: Run before every commit**

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Run tests
npm test -- --watchAll=false

# 3. Check for console errors (manual)
# Open browser console and verify no errors

# 4. Verify affected features (manual)
# Test the specific user flows you modified
```

### Cross-Component Impact Testing

When modifying shared components or utilities:

1. **Identify Consumers**:
   ```bash
   # Find all files using the component
   grep -r "ComponentName" src/ --include="*.tsx" --include="*.ts"
   ```

2. **Test Each Consumer**:
   - Navigate to each page using the component
   - Verify functionality still works
   - Check for console errors
   - Test on mobile viewport

3. **Regression Prevention**:
   - If same bug appears in multiple places, create shared test
   - Document the testing steps in PR description

---

## Code Quality Standards

### Pre-commit Checklist
1. All TypeScript errors resolved (`npx tsc --noEmit`)
2. Tests passing (`npm test`)
3. No console.log statements in production code
4. All imports are used
5. No any types unless absolutely necessary
6. **Impact Analysis**: Search for all usages before modifying shared components (`grep -r "ComponentName"`)
7. **Related Components Check**: Verify all dependent components still work
8. **Console Errors**: Check browser console for runtime errors
9. **Mobile Responsiveness**: Test on mobile viewport (< 768px)
10. **Network Requests**: Verify API calls are working correctly

### 🔄 Work Continuity & Collaboration

**CRITICAL: Maintain work continuity across sessions and collaborators**

#### Task Management
1. **Use TodoWrite for Complex Tasks**: Any multi-step work MUST be tracked
2. **Document Breakpoints**: When stopping work, document:
   - Current state
   - Next steps needed
   - Any blockers or decisions pending
3. **Git Stash for WIP**: Use `git stash save "WIP: description"` for incomplete work

#### Knowledge Sharing
1. **Decision Documentation**: Record WHY decisions were made, not just WHAT
   ```typescript
   // ❌ Bad
   const TIMEOUT = 5000;
   
   // ✅ Good  
   // Using 5s timeout based on P95 response time from monitoring
   const TIMEOUT = 5000;
   ```

2. **Trap Documentation**: Document discovered issues immediately
   ```typescript
   // ⚠️ TRAP: Don't use study.deadline directly - it might be an array
   // Always use: deadline instanceof Date ? deadline.toISOString() : deadline
   ```

#### Collaboration Protocol
1. **Before Major Changes**:
   - Search for all usages of the component/function
   - Check if similar logic exists elsewhere
   - Consider creating a shared utility

2. **After Completing Work**:
   - Update related components for consistency
   - Run full TypeScript check
   - Test affected user flows

### 🚨 Code Health Indicators

**Red Flags requiring immediate action:**
- Same code duplicated in 3+ places → Extract to utility
- Component managing 5+ state variables → Split into smaller components
- Inline styles exceeding 10 lines → Migrate to CSS Module
- File exceeding 500 lines → Consider refactoring
- Any `any` type usage → Define proper types
- Console.log in committed code → Remove immediately

### 🛑 Problem Resolution Guidelines

**CRITICAL: 절대 임시 해결책(temporary fix)을 사용하지 마세요**

1. **문제 해결 원칙**:
   - ❌ **금지**: 임시 해결책, 핫픽스, 워크어라운드
   - ✅ **필수**: 본질적인 문제 파악 및 근본적인 해결
   - ✅ **필수**: 모든 관련 시스템 일관성 유지

2. **문제 발생 시 접근 방법**:
   - 문제의 근본 원인 파악
   - 영향 받는 모든 시스템 확인 (프론트엔드, 백엔드, DB 등)
   - 일관성 있는 해결책 적용
   - 불확실한 경우 반드시 사용자에게 문의

3. **예시**:
   ```typescript
   // ❌ BAD - 임시 해결책
   // 백엔드가 지원하지 않으니 임시로 다른 타입 사용
   const type = backendSupports ? 'LEADER_INTRO' : 'CUSTOM_HTML';
   
   // ✅ GOOD - 본질적 해결
   // 백엔드에도 LEADER_INTRO 타입 추가하여 일관성 유지
   // 프론트엔드와 백엔드 모두 동일한 타입 사용
   ```

4. **의사결정 프로세스**:
   - 해결책이 확실한가? → 본질적 해결 진행
   - 불확실한가? → 사용자에게 옵션 제시 및 문의
   - 임시 해결이 유일한 방법인가? → 절대 진행하지 말고 사용자와 상의

### 📝 Git Commit Message Guidelines

**IMPORTANT: Do not mention AI agents in commit messages**

1. **Never include references to**:
   - Claude, ChatGPT, or any AI assistant names
   - "AI-generated", "AI-assisted", or similar terms
   - Any indication that code was written with AI help
2. **Write commit messages as if you personally wrote all the code**
3. **Focus on what changed and why**, not how it was created
4. **Use conventional commit format**:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code restructuring
   - `test:` for test additions/changes
   - `chore:` for maintenance tasks

#### 🔄 Incremental Commit Practice (작업 중 커밋 습관)
**CRITICAL: Commit frequently during work to prevent code loss**

1. **One Sentence, One Commit 원칙**:
   - 작은 단위로 자주 커밋 (기능 하나, 버그 하나, 리팩토링 하나)
   - 완료된 작업이 아니어도 의미있는 변경 단위로 커밋
   - 예: "fix: scroll position bug in modal", "refactor: extract filter logic"

2. **커밋 타이밍**:
   - TypeScript 컴파일 에러 해결 후
   - 하나의 컴포넌트 수정 완료 후
   - CSS Module 마이그레이션 완료 후
   - 중요한 로직 변경 후

3. **주의사항**:
   - Push는 신중하게 (완전히 테스트된 후에만)
   - WIP(Work In Progress) 커밋도 괜찮음 (나중에 squash 가능)
   - 커밋 메시지는 구체적으로 ("update files" ❌ → "fix: update StudyPage filter logic" ✅)

### ⚠️ Console.log Usage Guidelines

**IMPORTANT: Avoid using console.log in production code**

1. **Remove all console.log statements** before committing code
2. **Use proper error handling** instead of console.log for debugging
3. **For debugging during development**:
   - Use breakpoints in the browser DevTools
   - Use React Developer Tools
   - Consider using a proper logging library if logging is necessary
4. **If temporary debugging is needed**:
   - Add console.log temporarily
   - Remove it before committing
   - Never commit code with console.log statements
5. **Alternative approaches**:
   - Use `try-catch` blocks for error handling
   - Return error states in hooks and components
   - Use TypeScript's type system to catch errors at compile time

---



## Coding Principles and Design Guidelines

The code in this repository aims for the highest standards of readability, maintainability, and scalability. The following principles and guidelines should be followed to ensure a consistent and high-quality codebase.

### General Readability Principles

* **Clear Naming**: Use clear and descriptive names for variables, functions, and components. Avoid abbreviations and use names that provide context and reveal intent.
* **구체적이고 상세한 도메인 특화 명명 (Detailed Domain-Specific Naming)**: 기존 소스 코드에 영향을 미치는 범위가 넓기 때문에, 변수나 함수명을 모호하게 지으면 이름 충돌로 인해 의도치 않은 결과가 발생할 수 있습니다. 이를 방지하기 위해, **반드시 변수명을 매우 상세하고 구체적으로 구성해야 합니다.** 단순히 조금 더 자세히 적는 수준을 넘어, 해당 변수나 함수가 사용되는 **도메인의 특성, 기능, 맥락을 모두 녹여낸 이름**을 사용해야 합니다.
  * **나쁜 예시**: `data`, `isLoading`, `handleSave`, `user`
  * **좋은 예시**: `isLoading` → `isSnailGameProductListLoading`, `user` → `deductionGameLoggedInUser`, `handleSave` → `shuffleGameSaveUserSettings`
* **기존 코드의 점진적 개선 (Incremental Improvement of Existing Code)**: 기능을 개선하거나 리팩토링할 때, 기존 클래스를 복사하여 `MyClass-enhanced` 와 같이 `-enhanced` 접미사를 붙인 새 클래스를 만드는 방식을 **엄격히 금지합니다.** 개선 작업은 기존 코드베이스 위에서 직접 이루어져야 합니다. 이는 코드의 중복을 막고, 히스토리 추적을 용이하게 하며, 시스템의 복잡성을 낮추기 위함입니다.
* **Single Responsibility Principle (SRP)**: Keep functions and components concise and focused on a single responsibility. If a component or function handles multiple tasks, actively consider refactoring it into smaller, more specialized units.
* **File Length and Refactoring** 📏: As a practical extension of SRP, pay close attention to file length.
  * If a file exceeds **500 lines**, review for potential splitting opportunities
  * If a file exceeds **1,000 lines**, it should be reviewed as a strong indicator that it has multiple responsibilities and should be considered for refactoring.
  * If a file exceeds **1,500 lines**, its refactoring **must be treated as a top-priority task**.
* **Consistent Style**: Maintain a consistent coding style and formatting across the entire project. This helps other developers read and understand the code more easily.
* **Purposeful Comments**: Code should be as self-documenting as possible. However, add clear comments to explain complex business logic or the reasoning behind specific implementation choices (the "why," not just the "what").

### DRY (Don't Repeat Yourself) 원칙

**CRITICAL: 같은 로직은 한 곳에서만 관리**

1. **Utility Functions 중앙화**:
   ```typescript
   // ❌ Bad: Header.tsx와 StudyPage.tsx에 각각 parseDate 함수 중복
   
   // ✅ Good: utils/dateUtils.ts
   export const parseDate = (date: Date | string | number[] | null): Date | null => {
     // 공통 구현
   };
   ```

2. **Business Logic 분리**:
   - 필터링 로직, 상태 판단 로직은 utils로 분리
   - 예: `getStudyDisplayInfo`, `parseDate` → utils 폴더
   - UI 컴포넌트는 로직을 import해서 사용

3. **검증 방법**:
   - 새 기능 구현 전: 유사 기능 검색 (`grep -r "similar_function"`)
   - 복사-붙여넣기 전: 공통 함수로 추출 고려
   - 3회 이상 반복: 즉시 리팩토링


### Object-Oriented and Component-Based Design

While not every language or project requires a strict object-oriented paradigm, the following design principles are to be actively applied when working with these specific technologies to ensure high-quality, reusable, and maintainable code:
* **TypeScript**
* **React**

#### Core Principles

* **Separation of Concerns (SoC)**
  Clearly separate concerns, such as logic, data, and presentation. For example, business logic should reside in custom hooks or service files, data types in interfaces, and UI in components. This ensures that each part can be modified and tested independently.

* **Favor Composition over Inheritance**
  While inheritance is a powerful tool, it can lead to tight coupling. To build flexible and reusable structures, prioritize composition—combining components and hooks—over extending them through inheritance. This is an especially critical principle in React's functional paradigm.

* **Design by Contract with Interfaces**
  Define clear "contracts" between objects using TypeScript's `interface`. This practice hides implementation details (encapsulation) and exposes a clear specification of an object's capabilities, leading to more predictable and stable code.

* **Use of Appropriate Design Patterns**
  We encourage the application of well-known React patterns:
  - **Custom Hooks**: For reusable stateful logic
  - **Compound Components**: For flexible component APIs
  - **Provider Pattern**: For dependency injection
  - **HOC (sparingly)**: Only when hooks cannot solve the problem




## Architecture and Code Organization

A well-defined architecture is crucial for building scalable and maintainable applications. All code must be organized into logical layers and features, avoiding the practice of placing all functionality into a single file (e.g., a single large component).

### Frontend (TypeScript, React)

Frontend development **must follow a scalable, feature-based architecture** to ensure clear separation of concerns and reusability. The goal is to avoid creating massive "god components" that handle excessive state, logic, and rendering.

#### Component Guidelines

* **Function Components Only**: Use function components with hooks. Class components are deprecated.
* **Component Structure**: Adhere to the established component organization (e.g., `pages`, `components/ui`, `components/sections`). Group components, hooks, and related logic by feature or domain.
* **TypeScript Props**: Define all component props with interfaces:
  ```typescript
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }
  ```
* **Return Type**: Use explicit return types instead of `React.FC`:
  ```typescript
  function Button({ label, onClick }: ButtonProps): React.ReactNode {
    return <button onClick={onClick}>{label}</button>;
  }
  ```

#### Component Scalability Guidelines

1. **Component Size Limits**:
   - **Soft limit**: 200 lines → Consider splitting
   - **Hard limit**: 500 lines → Must split
   - Extract sub-components, custom hooks, or utilities

2. **State Management Scalability**:
   - 1-3 state variables: useState is fine
   - 4-6 state variables: Consider useReducer
   - 7+ state variables: Split component or use state management library

3. **Props Drilling Prevention**:
   - Max 2 levels of prop passing
   - Use Context or composition for deeper needs
   - Consider state management library for complex cases

4. **Performance Monitoring**:
   ```typescript
   // Add performance marks for critical components
   useEffect(() => {
     performance.mark('StudyPage-mount');
     return () => performance.mark('StudyPage-unmount');
   }, []);
   ```

#### Custom Hooks Best Practices

* **Naming Convention**: Always start with `use` (e.g., `useAuth`, `useFetch`)
* **Single Responsibility**: Each hook should have one clear purpose
* **Type Safety**: Define return types explicitly
* **Error Handling**: Include error states in hook returns
* **Example Structure**:
  ```typescript
  function useGameData<T>(gameId: string): {
    data: T | null;
    loading: boolean;
    error: Error | null;
  } {
    // Implementation
  }
  ```

#### State Management

* **Local State First**: Use `useState` for component-specific state
* **Context for Shared State**: Use Context API for cross-component state
* **External Libraries**: Use Zustand or Redux Toolkit for complex global state
* **Server State**: Consider React Query or SWR for server data caching

#### Performance Optimization

* **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` appropriately
* **Code Splitting**: Implement lazy loading with `React.lazy()` and Suspense
* **Virtual Lists**: Use virtualization for long lists
* **Bundle Size**: Monitor and optimize bundle size regularly

#### Error Handling Patterns

* **Error Boundaries**: Implement error boundaries for component trees
* **Custom Error Hook**: Create `useErrorHandler` for consistent error handling
* **Async Errors**: Always handle promises and async operations
* **User Feedback**: Provide clear error messages to users

#### Rich Text Editor Integration (TipTap)

* **Editor Component**: `components/common/RichTextEditor.tsx` - Full-featured editor with toolbar
* **Display Component**: `components/common/RichTextDisplay.tsx` - Safe HTML rendering
* **Security**: Always use DOMPurify to sanitize HTML before rendering
* **CSS Prefix**: Use `tiptap-` prefix for all editor styles to avoid conflicts
* **Usage Pattern**:
  ```typescript
  // In forms
  <RichTextEditor
    value={bio}
    onChange={setBio}
    placeholder="Tell your story..."
    maxLength={2000}
  />
  
  // For display
  <RichTextDisplay content={user.bio} />
  ```
* **Key Features**:
  - Bold, italic, underline formatting
  - Headings (H1-H3)
  - Bullet and numbered lists
  - Links with URL validation
  - Character count with max length
  - Accessibility support
* **Profile Fields**:
  - `role`: Plain text field for position/title
  - `bio`: HTML-formatted rich text for biography

#### API/Service Layer

* **Separation**: Keep API calls in separate service files
* **Type Safety**: Define request/response types
* **Error Handling**: Centralized error handling
* **Example**:
  ```typescript
  // services/gameService.ts
  export interface GameData {
    id: string;
    name: string;
    // ... other fields
  }
  
  export const gameService = {
    async getGame(id: string): Promise<GameData> {
      // Implementation
    }
  };
  ```
---

## 문서 관리 가이드라인 (Documentation Management Guidelines)

* **기존 문서에 통합 (Consolidate into Existing Documents)**: 새로운 가이드라인이나 개발 규칙이 필요할 때, 무분별하게 새 문서를 만들기보다 **기존에 있는 관련 문서에 내용을 추가하고 통합하는 것을 원칙으로 합니다.** 예를 들어, 코딩 스타일에 관한 내용은 이 `CLAUDE.md` 파일에 추가하고, 배포 관련 내용은 `DOCKER_DEPLOYMENT_GUIDE.md` 에 추가하는 방식입니다. 문서를 중앙에서 관리하여 정보가 분산되는 것을 막고, 모든 팀원이 최신 정보를 쉽게 찾을 수 있도록 하기 위함입니다. 새 문서는 기존 문서들과 주제가 명확히 구분될 때만 생성해야 합니다.

## 🚨 CRITICAL: AGENTS.md - Essential Development Rules

Problem definition → small, safe change → change review → refactor — repeat the loop.

### Mandatory Rules

- Before changing anything, read the relevant files end to end, including all call/reference paths.
- Keep tasks, commits, and PRs small.
- If you make assumptions, record them in the Issue/PR/ADR.
- Never commit or log secrets; validate all inputs and encode/normalize outputs.
- Avoid premature abstraction and use intention-revealing names.
- Compare at least two options before deciding.

### Mindset

- Think like a senior engineer.
- Don't jump in on guesses or rush to conclusions.
- Always evaluate multiple approaches; write one line each for pros/cons/risks, then choose the simplest solution.

### Code & File Reference Rules

- Read files thoroughly from start to finish (no partial reads).
- Before changing code, locate and read definitions, references, call sites, related tests, docs/config/flags.
- Do not change code without having read the entire file.
- Before modifying a symbol, run a global search to understand pre/postconditions and leave a 1–3 line impact note.

### Required Coding Rules

- Before coding, write a Problem 1-Pager: Context / Problem / Goal / Non-Goals / Constraints.
- Enforce limits: file ≤ 300 LOC, function ≤ 50 LOC, parameters ≤ 5, cyclomatic complexity ≤ 10. If exceeded, split/refactor.
- Prefer explicit code; no hidden "magic."
- Follow DRY, but avoid premature abstraction.
- Isolate side effects (I/O, network, global state) at the boundary layer.
- Catch only specific exceptions and present clear user-facing messages.
- Use structured logging and do not log sensitive data (propagate request/correlation IDs when possible).
- Account for time zones and DST.

### Testing Rules

- New code requires new tests; bug fixes must include a regression test (write it to fail first).
- Tests must be deterministic and independent; replace external systems with fakes/contract tests.
- Include ≥1 happy path and ≥1 failure path in e2e tests.
- Proactively assess risks from concurrency/locks/retries (duplication, deadlocks, etc.).

### Security Rules

- Never leave secrets in code/logs/tickets.
- Validate, normalize, and encode inputs; use parameterized operations.
- Apply the Principle of Least Privilege.

### Clean Code Rules

- Use intention-revealing names.
- Each function should do one thing.
- Keep side effects at the boundary.
- Prefer guard clauses first.
- Symbolize constants (no hardcoding).
- Structure code as Input → Process → Return.
- Report failures with specific errors/messages.
- Make tests serve as usage examples; include boundary and failure cases.

### Anti-Pattern Rules

- Don't modify code without reading the whole context.
- Don't expose secrets.
- Don't ignore failures or warnings.
- Don't introduce unjustified optimization or abstraction.
- Don't overuse broad exceptions.
 
