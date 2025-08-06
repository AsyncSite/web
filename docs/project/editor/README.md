# AsyncSite Editor Integration Project

## 프로젝트 개요

AsyncSite 플랫폼 전반에 걸쳐 리치 텍스트 에디터 기능을 통합하는 프로젝트입니다. 사용자가 자기소개(bio), 역할(role), 인용구(quote)를 작성하고 관리할 수 있는 기능을 제공합니다.

## ✅ 구현 완료 기능

### 1. TipTap 리치 텍스트 에디터 통합
- **라이브러리**: TipTap v2 (React)
- **구현 컴포넌트**:
  - `RichTextEditor.tsx`: 편집 가능한 리치 텍스트 에디터
  - `RichTextDisplay.tsx`: 읽기 전용 HTML 렌더링
- **보안**: DOMPurify를 통한 XSS 방지

### 2. 사용자 프로필 필드
- **role**: 역할/직책 (일반 텍스트, 100자 제한)
- **quote**: 인용구/좌우명 (일반 텍스트, 255자 제한)
- **bio**: 자기소개 스토리 (HTML 리치 텍스트, 2000자 제한)

### 3. Who We Are 페이지 통합
- **백엔드 연동**: Public API를 통한 관리자 프로필 조회
- **동적 렌더링**: 백엔드 관리자 + 하드코딩된 팀 멤버 결합
- **Three.js 통합**: 8개 행성으로 모든 멤버 표시
- **HTML 렌더링**: DOMPurify를 통한 안전한 bio 표시

### 4. 프로필 편집 페이지
- **위치**: `/users/me/edit`
- **구현 기능**:
  - ✅ 텍스트 포맷팅 (굵게, 이탤릭, 취소선)
  - ✅ 링크 삽입
  - ✅ 목록 (글머리, 번호)
  - ✅ 실시간 문자 수 카운트
  - ✅ 최대 글자 수 제한 (2000자)

### 2. Study Service - 스터디 상세 페이지
- **목적**: 스터디 리더가 스터디 소개, 커리큘럼, 규칙 등을 작성
- **위치**: 스터디 상세 페이지
- **기능 요구사항**:
  - 풍부한 텍스트 포맷팅
  - 테이블 삽입 (일정표, 커리큘럼)
  - 이미지/비디오 임베드
  - 체크리스트
  - 인용구 블록
  - 최대 글자 수 제한 (20000자)

## 시스템 아키텍처 (구현 완료)

### 전체 구조
```
┌─────────────────────────────────────────────────┐
│                   Frontend (Web)                 │
│  ┌──────────────────────────────────────────┐   │
│  │      TipTap Editor Components ✅         │   │
│  │  - RichTextEditor (편집용)               │   │
│  │  - RichTextDisplay (표시용)              │   │
│  │  - DOMPurify (XSS 방지)                  │   │
│  └──────────────────────────────────────────┘   │
│                        ↓                         │
│  ┌──────────────────────────────────────────┐   │
│  │     Pages & Features ✅                  │   │
│  │  - ProfileEditPage (프로필 편집)         │   │
│  │  - WhoWeArePage (팀 소개)                │   │
│  │  - Three.js Scene (3D 렌더링)            │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┴────────────────┐
        ↓                                  ↓
┌──────────────────┐           ┌──────────────────┐
│ User Service ✅  │           │  Study Service   │
│                  │           │     (예정)       │
│  - role (100자)  │           │                  │
│  - quote (255자) │           │  Study Details   │
│  - bio (HTML)    │           │  (TEXT/JSON)     │
└──────────────────┘           └──────────────────┘
        ↓                                  ↓
┌──────────────────────────────────────────────┐
│              MySQL Database ✅                │
│  - users.role (VARCHAR 100)                  │
│  - users.quote (VARCHAR 255)                 │
│  - users.bio (TEXT - HTML format)            │
│  - studies.details (TEXT) - 예정             │
└──────────────────────────────────────────────┘
```

## 관련 문서
- [에디터 라이브러리 비교 분석](./EDITOR_COMPARISON.md)
- [구현 계획](./IMPLEMENTATION_PLAN.md)
- [API 설계](./API_DESIGN.md)
- [마이그레이션 가이드](./MIGRATION_GUIDE.md)

## 구현된 주요 API

### User Service API
- `GET /api/users/me` - 사용자 프로필 조회 (role, quote, bio 포함)
- `PUT /api/users/me` - 프로필 업데이트 (role, quote, bio 수정)
- `GET /api/public/users/whoweare-members` - WhoWeAre 멤버 조회 (공개 API)

### 데이터베이스 마이그레이션
- `V1__Add_role_and_bio_fields.sql` - role, bio 필드 추가
- `V2__Add_quote_field.sql` - quote 필드 추가

## 프로젝트 진행 상태
- ✅ 요구사항 분석 완료
- ✅ 시스템 분석 완료
- ✅ 에디터 라이브러리 선정 (TipTap)
- ✅ 구현 계획 수립 완료
- ✅ User Service 프로필 기능 개발 완료
- ✅ Frontend 에디터 통합 완료
- ✅ WhoWeAre 페이지 통합 완료
- ✅ 테스트 및 버그 수정 완료
- ✅ 프로덕션 배포 완료
- ⏳ Study Service 통합 예정

## 주요 해결 과제
1. **✅ Three.js 리렌더링 문제**: useEffect cleanup 로직 개선으로 해결
2. **✅ RichTextEditor value prop 업데이트**: useEffect로 editor.commands.setContent 호출
3. **✅ API 응답 처리 불일치**: response.data.data → response.data로 수정
4. **✅ XSS 보안**: DOMPurify를 통한 HTML sanitization 적용

## 기술 스택
- **Frontend**: React, TypeScript, TipTap v2, DOMPurify, Three.js
- **Backend**: Spring Boot, Kotlin, JPA, Flyway
- **Database**: MySQL 8.0
- **인프라**: Docker, Docker Compose

*최종 업데이트: 2025년 8월 6일*