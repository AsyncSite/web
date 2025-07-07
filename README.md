# AsyncSite Frontend

React 기반의 모던 웹 애플리케이션으로, 인터랙티브한 UI와 다양한 실험적 기능들을 제공합니다.

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
- **Node.js**: `22.x` (권장: 22.12.0 이상)
- **npm**: `10.x` (권장: 10.9.0 이상)
- **OS**: Windows, macOS, Linux

### 브라우저 지원
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (Chromium-based)

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

배포 URL: https://web-cyan-one-95.vercel.app

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