# 의존성 상세 정보

이 문서는 프로젝트의 모든 의존성을 정확한 버전과 함께 명시합니다.

## 🔧 package.json 전체 복사용

```json
{
  "name": "asyncsite-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@react-spring/web": "^10.0.1",
    "@testing-library/jest-dom": "^5.14.1",
    "@types/jest": "^27.0.1",
    "gsap": "^3.12.5",
    "konva": "^9.3.20",
    "lottie-react": "^2.4.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-intersection-observer": "^9.16.0",
    "react-konva": "^19.0.7",
    "react-router-dom": "^7.6.2",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.0"
  },
  "homepage": "/",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.16.0",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "typescript": "^5.8.3"
  }
}
```

## 🔄 설치 명령어

### 전체 설치 (권장)
```bash
npm install --legacy-peer-deps
```

### 개별 설치 (문제 발생 시)
```bash
# Core
npm install react@19.0.0 react-dom@19.0.0 --legacy-peer-deps
npm install react-router-dom@7.6.2 --legacy-peer-deps

# UI Libraries
npm install @react-spring/web@10.0.1 --legacy-peer-deps
npm install gsap@3.12.5 --legacy-peer-deps
npm install lottie-react@2.4.1 --legacy-peer-deps
npm install konva@9.3.20 react-konva@19.0.7 --legacy-peer-deps
npm install react-intersection-observer@9.16.0 --legacy-peer-deps

# Build Tools
npm install react-scripts@5.0.1 --legacy-peer-deps

# Dev Dependencies
npm install --save-dev typescript@5.8.3 --legacy-peer-deps
npm install --save-dev @types/react@18.3.23 @types/react-dom@18.3.7 --legacy-peer-deps
npm install --save-dev @types/node@22.16.0 --legacy-peer-deps
npm install --save-dev @testing-library/react@16.3.0 --legacy-peer-deps
npm install --save-dev @testing-library/user-event@14.6.1 --legacy-peer-deps
# gh-pages는 더 이상 사용하지 않음 (Vercel 배포로 대체)
```

## 📦 의존성 트리

### React 생태계
```
react@19.0.0
├── react-dom@19.0.0
├── react-router-dom@7.6.2
│   └── react-router@7.6.2
└── @types/react@18.3.23
    └── @types/react-dom@18.3.7
```

### UI/Animation
```
@react-spring/web@10.0.1
├── @react-spring/animated@10.0.1
├── @react-spring/core@10.0.1
└── @react-spring/shared@10.0.1

gsap@3.12.5

lottie-react@2.4.1
└── lottie-web

konva@9.3.20
└── react-konva@19.0.7
    └── react-reconciler@0.32.0
```

### Testing
```
@testing-library/react@16.3.0
├── @testing-library/dom
└── @testing-library/user-event@14.6.1

@testing-library/jest-dom@5.14.1
```

### Build & Development
```
react-scripts@5.0.1
├── webpack@5.x
├── babel@7.x
├── eslint@8.x
└── jest@27.x

typescript@5.8.3
├── @types/node@22.16.0
└── tslib
```

## ⚠️ 버전 고정 이유

### React 19.0.0
- 최신 기능 활용
- Concurrent 기능 지원
- 성능 개선

### TypeScript 5.8.3
- 최신 타입 기능
- 더 엄격한 타입 체크
- React 19와의 호환성

### react-scripts 5.0.1
- CRA의 마지막 안정 버전
- 향후 Vite 마이그레이션 예정

## 🔍 호환성 매트릭스

| 패키지 | 최소 Node 버전 | React 버전 | TypeScript 버전 |
|--------|---------------|-----------|----------------|
| react@19 | 18.0.0 | - | 4.7+ |
| typescript@5.8 | 14.17.0 | any | - |
| react-scripts@5 | 14.0.0 | 16.14+ | 3.2+ |
| @testing-library/react@16 | 14.0.0 | 18.0+ | 4.5+ |

## 🚨 알려진 이슈

1. **Peer Dependency 경고**
   - 많은 라이브러리가 아직 React 19를 공식 지원하지 않음
   - `--legacy-peer-deps` 플래그로 해결

2. **CRA Deprecation**
   - react-scripts는 더 이상 유지보수되지 않음
   - 향후 Vite로 마이그레이션 권장

3. **TypeScript Strict Mode**
   - undefined/null 체크 필수
   - 기존 코드 수정 필요할 수 있음