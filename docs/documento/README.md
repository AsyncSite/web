# Documento (도큐멘토) - AI 콘텐츠 리뷰 서비스

## 📝 서비스 개요

도큐멘토는 AI를 활용하여 사용자가 작성한 콘텐츠(블로그, SNS 글 등)의 품질을 분석하고 개선 방안을 제시하는 서비스입니다.

### 핵심 기능
- 🔍 URL 기반 콘텐츠 자동 수집
- 📊 AI 기반 콘텐츠 품질 분석
- 💡 맞춤형 개선 제안
- 📈 점수 및 상세 피드백 제공

## 🏗 프로젝트 구조

```
web/
├── src/
│   └── components/
│       └── lab/
│           └── ai-studio/
│               └── documentor/       # 프론트엔드 컴포넌트
│                   ├── DocuMentor.tsx
│                   ├── DocuMentor.module.css
│                   └── types.ts
├── docs/
│   └── documento/                    # 프로젝트 문서
│       ├── README.md
│       ├── SERVICE_ARCHITECTURE.md
│       ├── UI_DESIGN_DECISIONS.md
│       └── AUTHENTICATION_STRATEGY.md

documento-content-service/            # 백엔드 서비스 (별도 레포)
├── src/main/java/
└── ...
```

## 🚀 Quick Start

### 프론트엔드 실행
```bash
cd web
npm install
npm start
# http://localhost:3000/studio/documentor
```

### 백엔드 실행
```bash
cd documento-content-service
./gradlew bootRun
# http://localhost:8090
```

## 📚 상세 문서

- [서비스 아키텍처](./SERVICE_ARCHITECTURE.md) - 시스템 구성 및 기술 스택
- [UI 디자인 결정사항](./UI_DESIGN_DECISIONS.md) - 디자인 시스템 및 컴포넌트 가이드
- [인증 전략](./AUTHENTICATION_STRATEGY.md) - 사용자 인증 및 접근 제어

## 🎯 주요 사용자 시나리오

### 1. 무료 체험 (비로그인)
1. 도큐멘토 페이지 접속
2. URL 입력
3. 이메일 입력
4. 1회 무료 분석 결과 확인

### 2. 정회원 사용 (로그인)
1. AsyncSite 계정으로 로그인
2. URL 입력 및 옵션 선택
3. AI 분석 대기
4. 상세 결과 확인
5. 히스토리 저장 (예정)

## 🔧 기술 스택

### Frontend
- React 19
- TypeScript
- CSS Modules
- React Router v6

### Backend
- Spring Boot 3.0
- Python (Workers)
- Kafka (Event Streaming)
- Redis (Cache & Rate Limiting)
- PostgreSQL (Database)

### AI/ML
- OpenAI GPT-4
- Custom Prompt Engineering

## 📊 현재 상태 (2025-08-31 업데이트)

### 구현 완료 ✅
- Studio UI 레이아웃 (독립 서비스 느낌)
- 기본 폼 인터페이스
- CSS Module 기반 스타일링
- 라우팅 설정
- **✨ Trial/Login 조건부 UI (NEW)**
  - 비로그인 사용자 이메일 입력 필드
  - Trial 사용 여부 추적 (localStorage)
  - 회원가입 CTA
- **⭐ 별점 평가 시스템 (NEW)**
  - 5점 만점 카테고리별 평가
  - 친근한 피드백 메시지
- **💬 사용자 후기 섹션 (NEW)**
  - 실제 사용자 리뷰 표시
  - 카카오톡 커뮤니티 CTA

### 백엔드 요청 중 📝
- Trial 엔드포인트 구현 (`/api/documento/contents/trial`)
- Redis 기반 이메일별 1회 제한
- Gateway 인증 bypass 설정
- [요청서 문서](../../documento-content-service/docs/trial-endpoint-requirements.md)

### 진행 중 🚧
- 백엔드 API 연동 대기
- 실시간 처리 상태 표시 (Mock 구현 완료)
- 결과 화면 구현 (디자인 완료)

### 예정 📅
- 히스토리 기능
- 템플릿 저장
- 팀 협업 기능
- API 제공

## 🤝 기여 방법

1. 이슈 등록
2. 브랜치 생성 (`feature/your-feature`)
3. 커밋 및 푸시
4. PR 생성

## 📄 라이선스

AsyncSite 내부 프로젝트

## 📞 문의

- 프로젝트 관리자: AsyncSite Team
- 이메일: support@asyncsite.com