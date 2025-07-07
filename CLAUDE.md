# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

If the user's prompt starts with “EP:” or "ep:", then the user wants to enhance the prompt. Read the PROMPT_ENHANCER.md file and follow the guidelines to enhance the user's prompt. Show the user the enhancement and get their permission to run it before taking action on the enhanced prompt.

The enhanced prompts will follow the language of the original prompt (e.g., Korean prompt input will output Korean prompt enhancements, English prompt input will output English prompt enhancements, etc.)


### Development
```bash
npm start          # Start development server on http://localhost:3000
npm test           # Run tests with Jest in watch mode
npm run build      # Create production build in ./build directory
npm run lint       # Run ESLint to check code quality
npm run lint:fix   # Fix ESLint issues automatically
npm run format     # Format code with Prettier
npm run format:check # Check code formatting
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
- Component-specific CSS files (e.g., `Component.css`)
- GSAP for animations
- React Intersection Observer for scroll-triggered effects

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

---

## Code Quality Standards

### Linting and Formatting
* ESLint configuration is enforced (see `.eslintrc.json`)
* Prettier formatting is required (see `.prettierrc`)
* Run `npm run lint` before committing
* Use `npm run format` to auto-format code

### Pre-commit Checklist
1. All TypeScript errors resolved
2. ESLint warnings addressed
3. Code formatted with Prettier
4. Tests passing
5. No console.log statements in production code

---



## Coding Principles and Design Guidelines

The code in this repository aims for the highest standards of readability, maintainability, and scalability. The following principles and guidelines should be followed to ensure a consistent and high-quality codebase.

### General Readability Principles

* **Clear Naming**: Use clear and descriptive names for variables, functions, and components. Avoid abbreviations and use names that provide context and reveal intent.
* **도메인 특화 명명 (Domain-Specific Naming)**: 코드의 규모가 커질수록 변수나 함수의 이름이 다른 기능과 충돌하거나 모호해질 수 있습니다. 이를 방지하기 위해, 단순히 일반적인 이름(e.g., `data`, `isLoading`, `handleSave`)을 사용하는 대신, 해당 변수나 함수가 속한 **도메인이나 기능의 맥락을 이름에 명확히 포함**시켜야 합니다.
  * **좋은 예시**: `isLoading` → `isSnailGameProductListLoading`, `user` → `dudctionGameloggedInUser`, `handleSave` → `shuffleGameSaveUserSettings`
* **Single Responsibility Principle (SRP)**: Keep functions and components concise and focused on a single responsibility. If a component or function handles multiple tasks, actively consider refactoring it into smaller, more specialized units.
* **File Length and Refactoring** 📏: As a practical extension of SRP, pay close attention to file length.
  * If a file exceeds **1,000 lines**, it should be reviewed as a strong indicator that it has multiple responsibilities and should be considered for refactoring.
  * If a file exceeds **1,500 lines**, its refactoring **must be treated as a top-priority task**.
* **Consistent Style**: Maintain a consistent coding style and formatting across the entire project. This helps other developers read and understand the code more easily.
* **Purposeful Comments**: Code should be as self-documenting as possible. However, add clear comments to explain complex business logic or the reasoning behind specific implementation choices (the "why," not just the "what").


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