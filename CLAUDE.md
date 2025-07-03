# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

If the user's prompt starts with “EP:”, then the user wants to enhance the prompt. Read the PROMPT_ENHANCER.md file and follow the guidelines to enhance the user's prompt. Show the user the enhancement and get their permission to run it before taking action on the enhanced prompt.

The enhanced prompts will follow the language of the original prompt (e.g., Korean prompt input will output Korean prompt enhancements, English prompt input will output English prompt enhancements, etc.)


### Development
```bash
npm start          # Start development server on http://localhost:3000
npm test           # Run tests with Jest in watch mode
npm run build      # Create production build in ./build directory
npm run deploy     # Build and deploy to GitHub Pages
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
- Base path is `/web` (configured for GitHub Pages deployment)
- All routes are lazy-loaded for optimal bundle size
- Routes are defined in `src/router/router.tsx`
- Sub-routes use `SubContentsTemplate` layout wrapper

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
The DeductionGame feature (`src/components/lab/subject/DeductionGame/`) uses:
- Strategy pattern for AI difficulty levels
- Factory pattern for player creation
- TypeScript interfaces for type safety
- Separate concerns: GameManager, Players, Strategies

### Styling Approach
- Component-specific CSS files (e.g., `Component.css`)
- GSAP for animations
- React Intersection Observer for scroll-triggered effects

### TypeScript Configuration
- Strict mode enabled
- React JSX transform (no React import needed)
- Target: ES5 for browser compatibility

### Deployment
- GitHub Pages deployment via `gh-pages` package
- SPA routing handled in `public/index.html`
- Homepage: https://11men.github.io/web