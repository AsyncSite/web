# AsyncSite Frontend 

React 기반의 모던 웹 애플리케이션으로, 인터랙티브한 UI와 다양한 실험적 기능들을 제공합니다. 

## 🤖 AI 에이전트 사용자를 위한 협업 가이드 

**이 프로젝트에서 AI 코딩 어시스턴트(Claude, GitHub Copilot, Cursor, ChatGPT 등)를 사용하시는 경우:**

1. **필수로 확인해야 할 문서:**   
   - 📋 **이 README.md 파일** - 프로젝트 설정 및 실행 방법
   - 📘 **[CLAUDE.md](./CLAUDE.md)** - 코딩 규칙, 아키텍처 가이드, TypeScript 규칙 등 상세 개발 가이드라인

2. **AI 도구에 컨텍스트 제공 방법:**
   ```
   이 프로젝트의 README.md와 CLAUDE.md 파일을 참고해서 작업해주세요.
   React 19, TypeScript 5.8, strict mode를 사용합니다.
   ```

3. **핵심 규칙:**
   - ✅ Function Components만 사용 (Class Components 금지)
   - ✅ TypeScript strict mode 준수
   - ✅ ESLint/Prettier 규칙 준수
   - ✅ 모든 props와 state에 타입 정의 필수

## 🚀 기술 스택

### Core Dependencies
- **React**: `19.0.0` - 최신 React 19 사용
- **React DOM**: `19.0.0`
- **React Router DOM**: `7.6.2` - 최신 라우팅 시스템
- **TypeScript**: `5.8.3` - 엄격한 타입 체크

### UI & Animation
- **GSAP**: `3.12.5` - 고성능 애니메이션
- **React Spring**: `10.0.1` - React 애니메이션 라이브러리
- **Lottie React**: `2.4.1` - Lottie 애니메이션 지원
- **Konva & React Konva**: `9.3.20` / `19.0.7` - Canvas 기반 그래픽스

### Development Tools
- **Create React App**: `5.0.1` - 빌드 도구 (react-scripts)
- **Testing Library**: 
  - `@testing-library/react`: `16.3.0` (React 19 지원)
  - `@testing-library/user-event`: `14.6.1`
  - `@testing-library/jest-dom`: `5.14.1`

## 📋 필수 요구사항

### System Requirements
- **Node.js**: `22.12.0` (`.nvmrc` 파일 참조)
- **npm**: `10.x` (권장: 10.9.0 이상)
- **OS**: Windows, macOS, Linux

### Node 버전 관리 (nvm 사용 시)
```bash
# .nvmrc 파일의 버전 사용
nvm use

# 또는 설치 후 사용
nvm install
nvm use
```

### 브라우저 지원
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (Chromium-based)

## 🧹 코드 품질 도구

### ESLint & Prettier
프로젝트는 일관된 코드 스타일을 위해 ESLint와 Prettier를 사용합니다.

```bash
# 코드 스타일 검사
npm run lint

# 코드 스타일 자동 수정
npm run lint:fix

# Prettier 포맷팅
npm run format

# Prettier 포맷 체크 (CI용)
npm run format:check
```

### 설정 파일
- `.eslintrc.json`: ESLint 규칙 설정
- `.prettierrc`: Prettier 포맷팅 규칙

### ⚠️ 개발 전 필수 확인 사항
**모든 코드 작업 전에 반드시 ESLint와 Prettier 설정을 확인하고 준수해주세요.**

1. **커밋 전 필수 실행:**
   ```bash
   npm run lint
   npm run format
   ```

2. **자동 수정 활용:**
   - VSCode: ESLint와 Prettier 플러그인 설치 및 자동 저장 시 포맷팅 설정
   - 코드 수정 후 `npm run lint:fix`로 자동 수정

3. **주의사항:**
   - Prettier와 ESLint 규칙이 충돌하지 않도록 설정되어 있음
   - 커밋 전 반드시 lint 와 format 검사 통과 필수
   - CI/CD 파이프라인에서도 동일한 검사 수행

### 🚫 Console.log 사용 금지
**프로덕션 코드에 console.log를 사용하지 마세요.**

1. **절대 커밋하지 말아야 할 것:**
   - `console.log()`, `console.error()`, `console.warn()` 등 모든 console 메서드
   - 디버깅용 임시 코드

2. **대안:**
   - 에러 처리: `try-catch` 블록 사용
   - 상태 확인: React Developer Tools 사용
   - 디버깅: 브라우저 DevTools의 breakpoint 활용

3. **개발 중 사용 시:**
   ```javascript
   // 임시로 사용 후 반드시 제거
   console.log('디버깅용'); // TODO: 커밋 전 제거
   ```

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone [repository-url]
cd asyncsite/web
```

### 2. 의존성 설치
```bash
# React 19 호환성 문제로 --legacy-peer-deps 플래그 필요
npm install --legacy-peer-deps
```

### 3. 개발 서버 실행
```bash
npm start
```
개발 서버가 http://localhost:3000 에서 실행됩니다.

### 4. 프로덕션 빌드
```bash
npm run build
```
`build` 폴더에 최적화된 프로덕션 빌드가 생성됩니다.

## 🌐 배포

### Vercel 배포
1. Vercel 프로젝트와 연결
2. 환경 변수 설정 필요 없음 (vercel.json 설정 완료)
3. Push 시 자동 배포
4. `.npmrc` 파일로 peer dependency 충돌 해결 (`legacy-peer-deps=true`)

배포 URL: https://web-cyan-one-95.vercel.app

## 🎯 주요 기능

### Job Navigator (채용공고 탐색)
- **실시간 채용공고 검색**: 디바운싱이 적용된 실시간 검색 (2025-08-02 개선)
- **검색 결과 하이라이팅**: 검색어와 일치하는 부분 강조 표시 (2025-08-02 추가)
- **필터링**: 회사, 기술 스택, 경력별 필터
- **상세 정보 모달**: 채용공고 상세 정보 표시

### Lab (실험실)
- **Playground**: 다양한 미니 게임 및 실험적 기능
- **Spotlight Arena**: 멀티 게임 플랫폼
- **Deduction Game**: AI와 대결하는 추론 게임

## 📁 프로젝트 구조

```
web/
├── public/              # 정적 파일
├── src/
│   ├── assets/         # 이미지, 폰트 등
│   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── layout/     # 레이아웃 컴포넌트
│   │   ├── sections/   # 페이지 섹션
│   │   ├── lab/        # 실험실 기능
│   │   └── ui/         # UI 컴포넌트
│   ├── pages/          # 라우트 페이지
│   ├── router/         # 라우팅 설정
│   └── utilities/      # 유틸리티 기능
├── package.json        # 의존성 및 스크립트
├── tsconfig.json       # TypeScript 설정
└── vercel.json         # Vercel 배포 설정
```

## ⚠️ 주의사항

### React 19 관련
- 일부 라이브러리에서 peer dependency 경고가 발생하지만 실제 동작에는 문제 없음
- `npm install` 시 항상 `--legacy-peer-deps` 플래그 사용

### TypeScript 5.8
- 엄격한 타입 체크가 활성화되어 있음
- `strictNullChecks` 활성화로 undefined/null 체크 필수

### 빌드 관련
- CRA 5.0.1 사용 중 (더 이상 유지보수되지 않음)
- TypeScript 5.8.3과 react-scripts 5.0.1 간의 peer dependency 충돌은 `.npmrc` 파일로 해결
- 향후 Vite로 마이그레이션 권장

## 🐛 트러블슈팅

### 1. npm install 실패
```bash
# 캐시 삭제 후 재시도
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 2. TypeScript 오류
- TypeScript 5.8의 엄격한 체크로 인한 오류
- undefined 체크 추가 필요

### 3. Chunk loading 오류 (Vercel)
- 브라우저 캐시 삭제
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### 4. 포트 충돌
```bash
# 3000 포트가 사용 중일 때
PORT=3001 npm start
```

## 🔧 환경 변수

현재 별도의 환경 변수 설정이 필요하지 않습니다.
필요 시 `.env` 파일 생성:
```
REACT_APP_API_URL=your_api_url
```

## 📝 개발 가이드

### 코드 스타일
- Functional Components 사용
- TypeScript strict mode
- React Hooks 패턴

### 커밋 메시지
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정
```

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

---

## 🆘 도움이 필요하신가요?

문제가 발생하면 다음을 확인해주세요:
1. Node.js 버전이 22.x인지 확인
2. `--legacy-peer-deps` 플래그를 사용했는지 확인
3. `node_modules` 삭제 후 재설치
4. 브라우저 캐시 삭제