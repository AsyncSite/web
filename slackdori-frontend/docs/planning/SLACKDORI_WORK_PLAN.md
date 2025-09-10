# SlackDori 프로젝트 작업 계획서

## 📊 전체 시스템 맥락 분석

### AsyncSite 현재 아키텍처 이해
```
AsyncSite 마이크로서비스 생태계:
├── 프론트엔드: React 19 SPA (CSR) - SEO 약점
├── 백엔드: Spring Boot (Java 21) + Kotlin 혼용
├── 게이트웨이: Spring Cloud Gateway (8080)
├── 서비스 디스커버리: Eureka
├── 데이터베이스: MySQL 8.0 (다중 DB)
├── 캐시/큐: Redis
├── 이벤트: Kafka + Schema Registry
├── 인프라: Docker + K8s
└── 모니터링: ELK Stack + Filebeat
```

### SlackDori의 위치와 역할
```
SlackDori 독립 서비스 구조:
├── 프론트엔드: Next.js 14 (SSR) ← SEO 최적화
│   └── slackdori.asyncsite.com (Vercel 호스팅)
├── 백엔드: slack-emoji-service (Spring Boot)
│   └── 기존 인프라 활용 (Gateway, Eureka, MySQL)
└── 스토리지: GitHub Public Repo (이미지 CDN)
```

---

## 🎯 핵심 작업 계획

### Phase 0: 사전 준비 및 분석 (2일)

#### Day 1: 시스템 통합 포인트 정의
- [ ] **오전**: 기존 Gateway 라우팅 규칙 분석
  - `/api/slack-emoji/*` 경로 예약
  - JWT 인증 통합 방식 결정
  - Rate Limiting 정책 확인
  
- [ ] **오후**: 데이터베이스 설계
  ```sql
  -- slack_emoji_service DB 스키마
  CREATE DATABASE slack_emoji_service;
  
  -- 워크스페이스 테이블
  CREATE TABLE workspaces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    team_id VARCHAR(50) NOT NULL,
    team_name VARCHAR(255),
    access_token VARCHAR(500), -- AES 암호화
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_team (user_id, team_id),
    INDEX idx_user_id (user_id)
  );
  
  -- 이모지 팩 테이블
  CREATE TABLE emoji_packs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pack_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    description TEXT,
    github_path VARCHAR(500),
    emoji_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- 설치 작업 테이블
  CREATE TABLE install_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(36) UNIQUE NOT NULL,
    user_id BIGINT,
    workspace_id BIGINT,
    pack_id BIGINT,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'),
    total_emojis INT,
    processed_emojis INT,
    failed_emojis INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
  );
  ```

#### Day 2: GitHub 이모지 저장소 구축
- [ ] **오전**: 저장소 생성 및 구조화
  ```
  AsyncSite/slack-emoji-packs/
  ├── README.md
  ├── packs.json (모든 팩 메타데이터)
  ├── packs/
  │   ├── developer-essentials/ (50개)
  │   ├── korean-reactions/ (30개)
  │   ├── project-status/ (20개)
  │   ├── team-culture/ (40개)
  │   └── startup-vibes/ (35개)
  └── scripts/
      ├── validate.js
      └── optimize.sh
  ```

- [ ] **오후**: 초기 이모지 팩 5개 준비
  - 무료 이모지 소스 수집 (OpenMoji, Twemoji 등)
  - 128KB 이하로 최적화
  - metadata.json 작성

---

### Phase 1: 백엔드 서비스 개발 (5일)

#### Day 3-4: slack-emoji-service 기본 구조
```java
slack-emoji-service/
├── src/main/java/com/asyncsite/slackemoji/
│   ├── SlackEmojiServiceApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java (AES 암호화)
│   │   ├── AsyncConfig.java (ThreadPool)
│   │   ├── FeignConfig.java (User Service 연동)
│   │   └── KafkaConfig.java (이벤트 발행)
│   ├── controller/
│   │   ├── OAuthController.java
│   │   ├── PackController.java
│   │   └── JobController.java
│   ├── service/
│   │   ├── SlackOAuthService.java
│   │   ├── EmojiPackService.java
│   │   ├── InstallJobService.java
│   │   └── SlackApiService.java
│   ├── repository/
│   │   ├── WorkspaceRepository.java
│   │   ├── PackRepository.java
│   │   └── JobRepository.java
│   └── dto/
│       ├── WorkspaceDto.java
│       ├── PackDto.java
│       └── JobDto.java
└── src/main/resources/
    └── application.yml
```

**핵심 구현 사항:**
- [ ] Eureka 클라이언트 설정
- [ ] Gateway 라우팅 등록
- [ ] MySQL 연결 (HikariCP)
- [ ] Redis 연동 (작업 상태 캐싱)
- [ ] Kafka 이벤트 발행 (설치 완료 시)

#### Day 5-6: Slack API 통합
- [ ] OAuth 2.0 플로우 구현
  - Authorization URL 생성
  - Token 교환 로직
  - Token 암호화/복호화
  
- [ ] Admin API 연동
  ```java
  @Service
  public class SlackApiService {
      private static final int RATE_LIMIT_DELAY_MS = 1000;
      
      public CompletableFuture<EmojiAddResult> addEmoji(
          String token, String name, String imageUrl) {
          // Rate Limiting 적용
          return CompletableFuture
              .supplyAsync(() -> {
                  Thread.sleep(RATE_LIMIT_DELAY_MS);
                  return callSlackApi(token, name, imageUrl);
              }, taskExecutor);
      }
  }
  ```

#### Day 7: 비동기 작업 처리
- [ ] Spring @Async 설정
- [ ] ThreadPoolTaskExecutor 구성
- [ ] 작업 큐 관리 로직
- [ ] 진행률 추적 시스템

---

### Phase 2: 프론트엔드 개발 (7일)

#### Day 8-9: Next.js 프로젝트 초기화
- [ ] **프로젝트 생성**
  ```bash
  npx create-next-app@latest slackdori-web \
    --typescript --tailwind --app --src-dir
  ```

- [ ] **기본 구조 설정**
  ```
  slackdori-web/
  ├── src/
  │   ├── app/
  │   │   ├── layout.tsx (RootLayout + SEO)
  │   │   ├── page.tsx (메인 랜딩)
  │   │   ├── packs/
  │   │   │   ├── page.tsx (팩 목록)
  │   │   │   └── [id]/
  │   │   │       └── page.tsx (팩 상세)
  │   │   ├── auth/
  │   │   │   └── callback/page.tsx
  │   │   └── api/
  │   │       └── revalidate/route.ts
  │   ├── components/
  │   │   ├── PackCard.tsx
  │   │   ├── InstallButton.tsx
  │   │   ├── ProgressModal.tsx
  │   │   └── AdSlot.tsx
  │   └── lib/
  │       ├── api.ts
  │       └── seo.ts
  └── public/
      └── og/ (Open Graph 이미지)
  ```

#### Day 10-11: SSR/SSG 최적화
- [ ] **동적 메타데이터 구현**
  ```typescript
  // app/packs/[id]/page.tsx
  export async function generateMetadata({ params }): Promise<Metadata> {
    const pack = await getPackData(params.id);
    return {
      title: `${pack.name} - ${pack.emojiCount}개 슬랙 이모지 팩`,
      description: pack.description,
      openGraph: {
        images: [`/og/${pack.id}.png`],
      },
      alternates: {
        canonical: `https://slackdori.asyncsite.com/packs/${pack.id}`,
      },
    };
  }
  ```

- [ ] **정적 생성 경로**
  ```typescript
  export async function generateStaticParams() {
    const packs = await getAllPacks();
    return packs.map(pack => ({ id: pack.id }));
  }
  ```

#### Day 12-13: 핵심 기능 구현
- [ ] Slack OAuth 연동
- [ ] 팩 설치 플로우
- [ ] Polling 기반 진행률 확인
- [ ] 에러 처리 및 재시도

#### Day 14: SEO 및 성능 최적화
- [ ] robots.txt / sitemap.xml 생성
- [ ] JSON-LD 구조화된 데이터
- [ ] Core Web Vitals 최적화
- [ ] 이미지 최적화 (next/image)

---

### Phase 3: 통합 및 배포 (3일)

#### Day 15: 서비스 통합
- [ ] **백엔드 배포**
  ```yaml
  # k8s/slack-emoji-service.yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: slack-emoji-service
  spec:
    replicas: 2
    selector:
      matchLabels:
        app: slack-emoji-service
    template:
      metadata:
        labels:
          app: slack-emoji-service
      spec:
        containers:
        - name: slack-emoji-service
          image: asyncsite/slack-emoji-service:latest
          ports:
          - containerPort: 8090
          env:
          - name: EUREKA_SERVER
            value: "http://eureka-server:8761/eureka"
  ```

- [ ] **Gateway 라우팅 추가**
  ```yaml
  spring:
    cloud:
      gateway:
        routes:
        - id: slack-emoji-service
          uri: lb://SLACK-EMOJI-SERVICE
          predicates:
          - Path=/api/slack-emoji/**
  ```

#### Day 16: 프론트엔드 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경변수 설정
- [ ] 도메인 연결 (slackdori.asyncsite.com)
- [ ] 자동 배포 파이프라인

#### Day 17: 모니터링 및 분석
- [ ] Google Analytics 4 설정
- [ ] Search Console 등록
- [ ] Vercel Analytics 활성화
- [ ] 에러 트래킹 (Sentry)

---

### Phase 4: AdSense 및 마케팅 (5일)

#### Day 18-19: AdSense 준비
- [ ] 콘텐츠 페이지 추가
  - /blog (슬랙 팁 블로그)
  - /guides (사용 가이드)
  - /about (서비스 소개)
- [ ] AdSense 승인 신청
- [ ] 광고 슬롯 최적화

#### Day 20-21: 콘텐츠 마케팅
- [ ] 초기 블로그 포스트 5개
  - "슬랙 이모지로 팀 문화 만들기"
  - "개발팀 필수 이모지 50선"
  - "원격 근무 팀을 위한 이모지 활용법"
  - "스타트업이 사랑하는 이모지 팩"
  - "프로젝트 상태를 이모지로 표현하기"

#### Day 22: 출시 준비
- [ ] 베타 테스트 (내부 팀)
- [ ] 버그 수정
- [ ] 성능 최종 점검
- [ ] 백업 및 롤백 계획

---

## 🚨 리스크 관리

### 기술적 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| Slack API Rate Limiting | 높음 | 1초 딜레이 + 재시도 로직 |
| SEO 실패 | 치명적 | Next.js SSR + 구조화된 데이터 |
| 이미지 로딩 실패 | 중간 | GitHub CDN + Fallback 이미지 |
| OAuth 토큰 만료 | 중간 | 자동 갱신 로직 |

### 비즈니스 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| AdSense 승인 거절 | 높음 | 양질의 콘텐츠 먼저 준비 |
| 낮은 검색 순위 | 높음 | 백링크 구축 + 콘텐츠 마케팅 |
| Slack 정책 변경 | 중간 | API 버전 관리 + 대안 준비 |

---

## 📊 성공 지표 (KPI)

### 기술 지표
- [ ] Lighthouse 점수 90+ (모든 카테고리)
- [ ] Core Web Vitals 통과
- [ ] 페이지 로드 시간 < 2초
- [ ] API 응답 시간 < 500ms

### 비즈니스 지표 (6개월)
- [ ] Google 검색 "slack emoji pack" 1페이지
- [ ] 월간 활성 사용자 1,000명
- [ ] 설치 성공률 95% 이상
- [ ] AdSense 월 수익 $500

### SEO 지표
- [ ] 인덱싱된 페이지 50개 이상
- [ ] 평균 검색 순위 10위 이내
- [ ] 클릭률(CTR) 5% 이상
- [ ] 체류 시간 3분 이상

---

## 🔄 일일 체크리스트

### 개발 단계 (Day 1-17)
- [ ] 오전: 코드 리뷰 및 PR 머지
- [ ] 오전: 당일 작업 계획 수립
- [ ] 오후: 구현 및 테스트
- [ ] 저녁: 진행 상황 문서화
- [ ] 저녁: 다음날 준비

### 운영 단계 (Day 18+)
- [ ] 오전: 모니터링 대시보드 확인
- [ ] 오전: SEO 순위 체크
- [ ] 오후: 사용자 피드백 대응
- [ ] 저녁: 일일 리포트 작성

---

## 💡 핵심 원칙

1. **SEO First**: 모든 결정에서 SEO를 최우선 고려
2. **빠른 MVP**: 완벽보다 빠른 출시 후 개선
3. **데이터 기반**: 추측 없이 측정 가능한 지표로 판단
4. **사용자 중심**: 복잡한 기술보다 간단한 UX
5. **점진적 개선**: 작은 개선을 지속적으로

---

## 📝 주간 마일스톤

| 주차 | 목표 | 완료 기준 |
|------|------|-----------|
| Week 1 | 백엔드 MVP | API 엔드포인트 작동 |
| Week 2 | 프론트엔드 MVP | SSR 페이지 렌더링 |
| Week 3 | 통합 및 배포 | slackdori.asyncsite.com 접속 가능 |
| Week 4 | 콘텐츠 및 SEO | Google 인덱싱 시작 |

---

## 🚀 즉시 실행 항목 (Day 0)

1. **저장소 생성** (30분)
   ```bash
   gh repo create AsyncSite/slack-emoji-service --public --clone
   gh repo create AsyncSite/slackdori-web --public --clone
   gh repo create AsyncSite/slack-emoji-packs --public --clone
   ```

2. **개발 환경 설정** (1시간)
   - IntelliJ IDEA: Spring Boot 프로젝트
   - VS Code: Next.js 프로젝트
   - Docker Desktop: 로컬 테스트

3. **초기 이모지 수집** (2시간)
   - OpenMoji 다운로드
   - 카테고리별 분류
   - 메타데이터 작성

4. **Slack App 생성** (30분)
   - api.slack.com에서 앱 생성
   - OAuth 스코프 설정
   - 개발용 워크스페이스 준비

---

## 📚 참고 자료

### 기술 문서
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Slack API - Admin.emoji](https://api.slack.com/methods/admin.emoji.add)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Vercel SEO Guide](https://vercel.com/docs/concepts/seo)

### AsyncSite 내부 문서
- `/ASYNCSITE_ARCHITECTURE.md` - 전체 아키텍처
- `/web/CLAUDE.md` - 프론트엔드 가이드
- `/docs/slackdori/slack-emoji-factory-proposal.md` - 프로젝트 제안서

---

## 🔥 결론

SlackDori는 AsyncSite의 첫 번째 **SEO 중심 서비스**입니다. 
documento의 실패에서 배운 교훈을 바탕으로, 처음부터 **검색 엔진 최적화**를 
핵심으로 설계했습니다. 

성공의 열쇠는:
1. **Next.js SSR**로 완벽한 SEO
2. **독립적인 서브도메인**으로 빠른 실험
3. **기존 인프라 활용**으로 안정성 확보
4. **GitHub CDN**으로 비용 최소화

**22일 안에 MVP 출시, 6개월 안에 수익화**가 목표입니다.