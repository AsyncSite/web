# AsyncSite 프로젝트 아키텍처 가이드

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [프론트엔드 (Web)](#프론트엔드-web)
4. [백엔드 서비스](#백엔드-서비스)
5. [주요 기능 모듈](#주요-기능-모듈)
6. [개발 환경 및 배포](#개발-환경-및-배포)
7. [기술 스택](#기술-스택)

---

## 프로젝트 개요

AsyncSite는 개발자 커뮤니티를 위한 종합 플랫폼으로, 스터디 운영, 실험적 프로젝트, 게임화된 학습 도구 등을 제공합니다.

### 핵심 가치
- **비동기적 협업**: 시간과 공간의 제약 없이 함께 성장
- **실험과 도전**: Lab을 통한 창의적인 프로젝트 실험
- **게임화된 학습**: 재미있는 방식으로 프로그래밍 개념 학습

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Web)                        │
│                     React SPA Application                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS/REST API
┌─────────────────────┴───────────────────────────────────────┐
│                         API Gateway                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────┐ ┌───▼──────┐
│Core Platform │ │   User   │ │  Study   │ │   Game   │
│   Service    │ │ Service  │ │ Service  │ │ Service  │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                            │
                    ┌───────▼────────┐
                    │    Database    │
                    │  (PostgreSQL)  │
                    └────────────────┘
```

---

## 프론트엔드 (Web)

### 프로젝트 구조

```
web/
├── src/
│   ├── pages/              # 라우트별 페이지 컴포넌트
│   │   ├── MainPage.tsx
│   │   ├── LabPage.tsx
│   │   ├── StudyPage.tsx
│   │   ├── auth/           # 인증 관련 페이지
│   │   ├── lab/            # Lab 세부 페이지
│   │   └── user/           # 사용자 프로필
│   │
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   ├── sections/       # 페이지 섹션 컴포넌트
│   │   ├── auth/           # 인증 관련 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   └── lab/            # Lab 기능 컴포넌트
│   │       ├── playground/ # 게임 컴포넌트
│   │       └── utilities/  # 유틸리티 도구
│   │
│   ├── api/                # API 클라이언트
│   ├── contexts/           # React Context
│   ├── hooks/              # Custom Hooks
│   ├── router/             # 라우팅 설정
│   ├── services/           # 비즈니스 로직
│   └── utils/              # 유틸리티 함수
```

### 주요 페이지 구조

#### 1. 메인 페이지 (/)
- Intro: 사이트 소개 및 비전
- About: AsyncSite 상세 설명
- Stats: 커뮤니티 통계
- Journey: 성장 과정
- Studies: 진행 중인 스터디
- FAQ: 자주 묻는 질문

#### 2. Lab 페이지 (/lab)
- **Playground**: 게임 형태의 학습 도구
  - Tetris: 프로그래밍으로 구현한 테트리스
  - Deduction Game: AI와 함께하는 추론 게임
- **Utilities**: 개발/모임 유틸리티
  - Team Shuffle: 팀 나누기 도구
  - Spotlight Arena: 인터랙티브 추첨 시스템

#### 3. Study 페이지 (/study)
- 스터디 목록 및 상세 정보
- 스터디별 캘린더
- 참여 신청 및 관리

### 컴포넌트 아키텍처

#### Lab 컴포넌트 구조
```
components/lab/
├── playground/
│   ├── Tetris/             # 테트리스 게임
│   └── DeductionGame/      # 추론 게임
│       ├── ai/             # AI 로직
│       ├── components/     # UI 컴포넌트
│       └── index.ts
│
└── utilities/
    ├── TeamShuffle/        # 팀 나누기
    └── spotlight-arena/    # 추첨 시스템
        ├── games/          # 미니게임들
        │   ├── SnailRace/
        │   ├── DartWheel/
        │   └── SlotCascade/
        ├── shared/         # 공통 모듈
        └── common/         # 공통 컴포넌트
```

### 상태 관리
- **Context API**: 전역 상태 관리 (인증, 게임 진행 상황)
- **Local State**: 컴포넌트별 로컬 상태
- **Custom Hooks**: 재사용 가능한 상태 로직

---

## 백엔드 서비스

### MSA (Microservice Architecture) 구성

#### 1. Core Platform Service
- **역할**: 핵심 플랫폼 기능 제공
- **주요 기능**:
  - 시스템 설정 관리
  - 공통 유틸리티 제공
  - 서비스 간 통신 조정

#### 2. User Service
- **역할**: 사용자 관리 및 인증
- **주요 기능**:
  - 회원가입/로그인
  - OAuth 인증 (Google, GitHub)
  - 프로필 관리
  - 권한 관리 (RBAC)

#### 3. Study Service
- **역할**: 스터디 관련 기능
- **주요 기능**:
  - 스터디 생성/관리
  - 참여자 관리
  - 일정 관리
  - 출석 체크

#### 4. Game Service
- **역할**: 게임 데이터 관리
- **주요 기능**:
  - 게임 세션 관리
  - 점수/랭킹 시스템
  - 게임 통계
  - 리더보드

### API 구조

```typescript
// API 엔드포인트 예시
GET    /api/v1/users/me           // 현재 사용자 정보
POST   /api/v1/auth/login         // 로그인
POST   /api/v1/auth/logout        // 로그아웃

GET    /api/v1/studies            // 스터디 목록
GET    /api/v1/studies/:id        // 스터디 상세
POST   /api/v1/studies/:id/join   // 스터디 참여

POST   /api/v1/games/sessions     // 게임 세션 생성
PUT    /api/v1/games/sessions/:id // 게임 결과 저장
GET    /api/v1/games/leaderboard  // 리더보드
```

---

## 주요 기능 모듈

### 1. 인증 시스템
```typescript
// 인증 플로우
1. 로그인 요청 → User Service
2. JWT 토큰 발급
3. 토큰 저장 (localStorage)
4. API 요청 시 토큰 포함
5. 토큰 검증 및 갱신
```

### 2. 게임 시스템
- **GameManager**: 게임 상태 관리
- **DataManager**: 로컬/서버 데이터 동기화
- **SessionRecovery**: 게임 세션 복구

### 3. Spotlight Arena
- **참가자 관리**: 동적 참가자 추가/제거
- **게임 선택**: 다양한 미니게임 제공
- **결과 기록**: 히스토리 및 통계 저장

---

## 개발 환경 및 배포

### 개발 환경
```bash
# 프론트엔드
npm start          # 개발 서버 실행 (포트 3000)
npm test           # 테스트 실행
npm run build      # 프로덕션 빌드

# 환경 변수
REACT_APP_API_URL  # API 서버 주소
REACT_APP_ENV      # 환경 (development/production)
```

### 배포 구조
- **프론트엔드**: Vercel 자동 배포
- **백엔드**: Kubernetes 클러스터
- **데이터베이스**: PostgreSQL (RDS)
- **CI/CD**: GitHub Actions

### 브랜치 전략
```
main          # 프로덕션 브랜치
├── develop   # 개발 브랜치
├── feature/* # 기능 개발
├── fix/*     # 버그 수정
└── refactor/* # 리팩토링
```

---

## 기술 스택

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Routing**: React Router v7
- **Styling**: CSS Modules
- **Animation**: GSAP, Lottie
- **Build Tool**: Create React App
- **Package Manager**: npm

### Backend
- **Language**: Java/Kotlin (Spring Boot)
- **Architecture**: MSA
- **API**: RESTful API
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ

### DevOps
- **Container**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

---

## 프로젝트 특징

### 1. 모듈화된 구조
- 각 기능이 독립적인 모듈로 구성
- 재사용 가능한 컴포넌트 설계
- 명확한 책임 분리

### 2. 확장 가능한 아키텍처
- MSA를 통한 서비스 독립성
- 새로운 게임/기능 추가 용이
- 수평적 확장 가능

### 3. 사용자 경험 중심
- 게임화된 학습 도구
- 인터랙티브한 UI/UX
- 반응형 디자인

### 4. 개발자 친화적
- TypeScript로 타입 안정성 확보
- 명확한 코드 구조
- 포괄적인 문서화

---

## 시작하기

### 필수 요구사항
- Node.js 22.0.0 이상
- npm 10.0.0 이상
- Git

### 설치 및 실행
```bash
# 저장소 클론
git clone https://github.com/AsyncSite/web.git
cd web

# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

### 환경 설정
1. `.env` 파일 생성
2. 필요한 환경 변수 설정
3. API 서버 연결 확인

---

## 추가 문서

- [API 문서](./API_DOCUMENTATION.md)
- [컴포넌트 가이드](./COMPONENT_GUIDE.md)
- [기여 가이드](./CONTRIBUTING.md)
- [보안 정책](./SECURITY.md)

---

이 문서는 AsyncSite 프로젝트의 전체적인 구조와 아키텍처를 설명합니다.