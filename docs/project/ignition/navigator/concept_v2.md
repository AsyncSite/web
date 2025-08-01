# AsyncSite Ignition - 개발자 취업 공고 크롤링 서비스 기획서

## 1. 서비스 개요 

### 1.1 서비스명

**AsyncCareer** (Async + Career의 합성어)

### 1.2 핵심 가치 제안

"단순한 채용 공고 수집을 넘어, 개발자의 성취를 위한 맞춤형 커리어 인사이트 제공"

### 1.3 서비스 포지셔닝

- **What**: AI 기반 초개인화 채용 공고 분석 및 커리어 매칭 서비스
- **How**: 실시간 크롤링 + 딥러닝 분석 + AsyncSite 생태계 연계
- **Why**: 개발자가 '성장'에서 '성취'로 나아가는 첫 번째 관문인 취업/이직을 데이터 기반으로 지원

## 2. 시장 분석 및 차별화 전략

### 2.1 기존 서비스 한계점

- **원티드/잡플래닛**: 범용적 채용 플랫폼, 개발자 특화 기능 부족
- **프로그래머스/점핏**: 기술 스택 매칭에만 집중, 커리어 성장 관점 부재
- **로켓펀치**: 스타트업 중심, 대기업/중견기업 정보 부족

### 2.2 AsyncCareer만의 차별점

### A. 성취 중심 접근

- 단순 스펙 매칭이 아닌 "이 회사에서 어떤 성취를 만들 수 있는가?"에 집중
- 각 공고별 '성취 가능성 점수' 제공 (프로젝트 규모, 기술 스택 혁신도, 성장 기회 등)

### B. AsyncSite 생태계 시너지

```
공고 발견 → 부족한 역량 분석 → AsyncSite 스터디/강의 추천 → 역량 강화 → 지원

```

### C. 커뮤니티 기반 인사이트

- 해당 기업 재직자/전직자의 익명 리뷰 및 면접 후기
- '함께 준비하는 지원자 모임' 자동 매칭

## 3. 핵심 기능 설계

### 3.1 데이터 수집 및 분석

### Phase 1: MVP (3개월)

- **타겟 기업**: 네카라쿠배당토 + IT 대기업 10곳
- **수집 방식**:
    - 1순위: RSS 피드 (있는 경우)
    - 2순위: 웹 크롤링 (robots.txt 준수)
    - 3순위: 수동 입력 (핫한 공고)

### Phase 2: 확장 (6개월)

- 중견기업, 유니콘 스타트업으로 확대
- API 파트너십 추진 (사람인, 잡코리아 등)

### 3.2 AI 기반 공고 분석 엔진

### 기술 스택 추출 및 분류

```python
# 예시: 공고 텍스트에서 기술 스택 자동 추출
입력: "Java, Spring Boot, MSA 환경에서 Kafka를 활용한..."
출력: {
  "언어": ["Java"],
  "프레임워크": ["Spring Boot"],
  "아키텍처": ["MSA"],
  "메시징": ["Kafka"],
  "필수도": {"Java": "필수", "Kafka": "우대"}
}

```

### 성장 가능성 스코어링

- **기술 혁신도**: 최신 기술 스택 사용 여부 (0~30점)
- **프로젝트 임팩트**: 대규모 트래픽, 신규 서비스 등 (0~30점)
- **팀 문화**: 코드리뷰, 기술 블로그, 컨퍼런스 지원 등 (0~20점)
- **커리어 패스**: 시니어 개발자 비율, 승진 체계 등 (0~20점)

### 3.3 개인화 매칭 시스템

### 프로필 기반 매칭

```jsx
// 사용자 프로필과 공고 매칭 알고리즘
{
  "현재_역량": ["Java", "Spring", "MySQL"],
  "목표_역량": ["Kafka", "MSA", "k8s"],
  "선호_문화": ["코드리뷰", "재택근무"],
  "경력": "2년차"
}
→ 매칭률 85% 공고 우선 노출
→ 부족 역량(Kafka) 학습 경로 제시

```

### 지능형 알림

- 단순 키워드 알림이 아닌 "성장 기회" 중심 알림
- 예: "현재 역량으로 도전 가능하면서, 목표 기술을 배울 수 있는 포지션이 열렸습니다"

### 3.4 커뮤니티 연계 기능

### 지원자 라운지

- 같은 공고에 관심 있는 사용자들의 임시 채팅방
- 정보 공유, 스터디 결성, 모의 면접 등

### 멘토 매칭

- AsyncSite Ignition 졸업생 중 해당 기업 합격자와 1:1 커피챗
- 유료 멘토링으로 자연스러운 수익 연계

## 4. 기술 아키텍처 (개요)

### 4.1 시스템 구성

```
┌─────────────────────────────────────────────────┐
│                  API Gateway                     │
└──────────┬──────────────────────┬───────────────┘
           │                      │
    ┌──────▼──────┐        ┌─────▼──────┐
    │  Crawler    │        │   Career   │
    │  Service    │        │  Service   │
    │             │        │            │
    │ • 스케줄링  │        │ • 공고분석 │
    │ • 크롤링    │        │ • 매칭     │
    │ • 파싱      │        │ • 추천     │
    └──────┬──────┘        └─────┬──────┘
           │                      │
           └──────────┬───────────┘
                      │
              ┌───────▼────────┐
              │   PostgreSQL   │
              │                │
              │ • job_postings │
              │ • user_profiles│
              │ • applications │
              └────────────────┘

```

### 4.2 핵심 기술 스택

- **크롤러**: Python (BeautifulSoup/Scrapy) + Selenium
- **분석 엔진**: Python (NLP - KoNLPy, Transformers)
- **API 서버**: Spring Boot (기존 AsyncSite 인프라 활용)
- **프론트엔드**: React (기존 AsyncSite 통합)

## 5. 수익 모델

### 5.1 직접 수익

- **프리미엄 구독**: 월 9,900원
    - 무제한 공고 분석
    - AI 이력서 최적화
    - 멘토 매칭 할인

### 5.2 간접 수익 (생태계 시너지)

- 부족 역량 → AsyncSite 스터디/강의 유입
- 면접 준비 → Async Ignition 프로그램 유입
- 커리어 컨설팅 → 1:1 멘토링 수익

## 6. 성공 지표 (KPI)

### 단기 (3개월)

- MAU 1,000명 달성
- 주요 기업 20곳 공고 커버리지 100%
- 사용자당 평균 체류 시간 10분 이상

### 중기 (6개월)

- MAU 5,000명 달성
- 유료 전환율 5% (250명)
- AsyncSite 타 서비스 전환율 20%

### 장기 (1년)

- 시장 점유율 5% (개발자 채용 정보 서비스)
- 월 매출 5,000만원
- 성공 취업 사례 100건 이상

## 7. 리스크 관리

### 7.1 기술적 리스크

- **크롤링 차단**: robots.txt 준수, 적절한 딜레이, User-Agent 설정
- **유지보수 부담**: 모니터링 자동화, 실패 알림 시스템 구축

### 7.2 법적 리스크

- 저작권 준수: 공고 원문 저장 대신 요약 및 링크만 제공
- 개인정보보호: 사용자 데이터 암호화, GDPR 준수

### 7.3 경쟁 리스크

- 대형 플랫폼 진입: AsyncSite 생태계 lock-in 효과로 대응
- 차별화 약화: 지속적인 AI 고도화 및 커뮤니티 기능 강화

## 8. 실행 로드맵

### Phase 1: MVP (1-3개월)

- [ ]  핵심 10개 기업 크롤러 개발
- [ ]  기본 공고 분석 엔진 구축
- [ ]  AsyncSite 통합 UI 개발
- [ ]  베타 테스트 (100명)

### Phase 2: 성장 (4-6개월)

- [ ]  기업 확대 (50곳)
- [ ]  AI 고도화 (개인화 매칭)
- [ ]  커뮤니티 기능 추가
- [ ]  유료 모델 출시

### Phase 3: 확장 (7-12개월)

- [ ]  API 파트너십
- [ ]  기업 서비스 (채용 광고)
- [ ]  글로벌 확장 준비

---

# AsyncSite Ignition - AsyncCareer 설계 문서

## 1. 시스템 아키텍처 설계

### 1.1 전체 아키텍처 Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Load Balancer                                │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                            API Gateway (Kong)                            │
│                    Rate Limiting / Auth / Routing                        │
└─────────┬───────────┬───────────┬────────────┬────────────┬────────────┘
          │           │           │            │            │
    ┌─────▼────┐ ┌───▼────┐ ┌───▼────┐ ┌────▼─────┐ ┌────▼─────┐
    │ Crawler  │ │ Career │ │Analytics│ │Matching  │ │Community │
    │ Service  │ │Service │ │Service  │ │Service   │ │Service   │
    │          │ │        │ │         │ │          │ │          │
    │Python    │ │Spring  │ │Python   │ │Spring    │ │Spring    │
    │FastAPI   │ │Boot    │ │FastAPI  │ │Boot      │ │Boot      │
    └─────┬────┘ └───┬────┘ └────┬────┘ └────┬─────┘ └────┬─────┘
          │           │           │            │            │
          └───────────┴───────────┴────────────┴────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      Message Queue         │
                    │    (RabbitMQ/Kafka)        │
                    └─────────────┬──────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────▼──────┐         ┌─────▼──────┐         ┌─────▼──────┐
    │ PostgreSQL │         │   Redis    │         │Elasticsearch│
    │            │         │            │         │             │
    │• Jobs      │         │• Cache     │         │• Full-text  │
    │• Users     │         │• Sessions  │         │  Search     │
    │• Analytics │         │• Rate Limit│         │• Analytics  │
    └────────────┘         └────────────┘         └─────────────┘

```

### 1.2 마이크로서비스 상세 설계

### A. Crawler Service (Python/FastAPI)

```python
# 주요 컴포넌트 구조
crawler-service/
├── app/
│   ├── core/
│   │   ├── config.py          # 환경 설정
│   │   ├── scheduler.py       # APScheduler 기반 스케줄러
│   │   └── monitoring.py      # 크롤링 상태 모니터링
│   ├── crawlers/
│   │   ├── base.py           # 추상 크롤러 클래스
│   │   ├── naver_crawler.py  # 네이버 크롤러
│   │   ├── kakao_crawler.py  # 카카오 크롤러
│   │   └── ...
│   ├── parsers/
│   │   ├── job_parser.py     # 공고 파싱 로직
│   │   └── tech_extractor.py # 기술 스택 추출
│   ├── api/
│   │   └── v1/
│   │       ├── crawler.py    # 크롤러 제어 API
│   │       └── health.py     # 헬스체크
│   └── models/
│       └── job.py            # 공고 데이터 모델

```

**핵심 설계 원칙:**

- **확장성**: 새로운 기업 추가 시 크롤러 클래스만 추가
- **안정성**: 크롤러별 독립 실행, 실패 시 다른 크롤러에 영향 없음
- **모니터링**: 각 크롤러의 성공/실패율 실시간 추적

### B. Career Service (Spring Boot)

```java
// 도메인 모델 구조
career-service/
├── domain/
│   ├── job/
│   │   ├── Job.java              // 공고 엔티티
│   │   ├── JobRepository.java
│   │   └── JobService.java
│   ├── company/
│   │   ├── Company.java          // 기업 정보
│   │   └── CompanyService.java
│   └── skill/
│       ├── Skill.java            // 기술 스택
│       └── SkillMatrix.java      // 기술 관계도
├── application/
│   ├── JobAnalysisService.java   // 공고 분석
│   └── JobSearchService.java     // 검색 서비스
└── interfaces/
    └── rest/
        └── JobController.java     // REST API

```

### C. Analytics Service (Python/FastAPI)

```python
# AI/ML 파이프라인
analytics-service/
├── ml/
│   ├── models/
│   │   ├── tech_classifier.py    # 기술 분류 모델
│   │   ├── salary_predictor.py   # 연봉 예측 모델
│   │   └── growth_scorer.py      # 성장 가능성 점수
│   ├── preprocessing/
│   │   ├── text_cleaner.py       # 텍스트 전처리
│   │   └── feature_extractor.py  # 특징 추출
│   └── training/
│       └── model_trainer.py      # 모델 학습

```

### 1.3 데이터베이스 설계

### A. 핵심 테이블 구조

```sql
-- 1. 기업 정보
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50), -- STARTUP, MIDSIZE, LARGE, ENTERPRISE
    tech_blog_url VARCHAR(500),
    career_page_url VARCHAR(500),
    culture_keywords JSONB, -- ["코드리뷰", "자율출퇴근", "컨퍼런스지원"]
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 채용 공고
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    requirements TEXT,
    preferred TEXT,
    benefits TEXT,

    -- 구조화된 데이터
    job_type VARCHAR(50), -- FULLTIME, CONTRACT, INTERN
    experience_level VARCHAR(50), -- JUNIOR, SENIOR, LEAD
    min_experience INTEGER,
    max_experience INTEGER,

    -- 기술 스택 (정규화)
    required_skills UUID[], -- skill 테이블 참조
    preferred_skills UUID[],

    -- 분석 데이터
    tech_score INTEGER, -- 0-100 기술 혁신도
    growth_score INTEGER, -- 0-100 성장 가능성
    culture_score INTEGER, -- 0-100 문화 점수

    -- 메타 정보
    source_url VARCHAR(1000) NOT NULL,
    posted_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,

    -- 크롤링 정보
    crawled_at TIMESTAMP DEFAULT NOW(),
    raw_html TEXT, -- 원본 HTML 보관 (법적 증거용)
    parse_version VARCHAR(20), -- 파서 버전

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 기술 스택
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50), -- LANGUAGE, FRAMEWORK, DATABASE, DEVOPS, etc
    parent_skill_id UUID REFERENCES skills(id), -- 계층 구조
    aliases TEXT[], -- ["JS", "자바스크립트"]
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 사용자 프로필
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- AsyncSite 사용자 ID

    -- 현재 상태
    current_position VARCHAR(200),
    years_of_experience INTEGER,
    current_skills UUID[], -- skills 테이블 참조

    -- 목표
    target_companies UUID[], -- companies 테이블 참조
    target_position VARCHAR(200),
    target_skills UUID[],

    -- 선호도
    preferred_company_size VARCHAR(50)[],
    preferred_culture JSONB,
    min_salary INTEGER,

    -- 활동 데이터
    viewed_jobs UUID[],
    applied_jobs UUID[],
    saved_jobs UUID[],

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 매칭 결과 (캐시용)
CREATE TABLE job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_id UUID REFERENCES job_postings(id),

    match_score INTEGER, -- 0-100
    skill_match_score INTEGER,
    culture_match_score INTEGER,
    growth_match_score INTEGER,

    missing_skills UUID[],
    matching_skills UUID[],

    recommendation_reason TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP -- 매칭 결과 만료 시간
);

-- 인덱스
CREATE INDEX idx_job_postings_company ON job_postings(company_id);
CREATE INDEX idx_job_postings_active ON job_postings(is_active) WHERE is_active = true;
CREATE INDEX idx_job_postings_skills ON job_postings USING GIN(required_skills);
CREATE INDEX idx_job_matches_user ON job_matches(user_id, match_score DESC);

```

### B. 시계열 데이터 (분석용)

```sql
-- 공고 트렌드 분석
CREATE TABLE job_trends (
    date DATE NOT NULL,
    skill_id UUID REFERENCES skills(id),

    posting_count INTEGER DEFAULT 0,
    company_count INTEGER DEFAULT 0,
    avg_experience_required FLOAT,

    PRIMARY KEY (date, skill_id)
);

-- 사용자 활동 로그
CREATE TABLE user_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    action_type VARCHAR(50), -- VIEW, APPLY, SAVE, SHARE
    job_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

```

### 1.4 API 설계

### A. RESTful API 명세

```yaml
# 공고 관련 API
/api/v1/jobs:
  get:
    summary: 채용 공고 목록 조회
    parameters:
      - name: company
        in: query
        type: array
      - name: skills
        in: query
        type: array
      - name: experience_level
        in: query
        type: string
      - name: sort
        in: query
        enum: [posted_date, match_score, growth_score]
      - name: page
        in: query
        type: integer
    responses:
      200:
        schema:
          type: object
          properties:
            jobs:
              type: array
              items:
                $ref: '#/definitions/JobSummary'
            pagination:
              $ref: '#/definitions/Pagination'

/api/v1/jobs/{id}:
  get:
    summary: 채용 공고 상세 조회
    responses:
      200:
        schema:
          $ref: '#/definitions/JobDetail'

/api/v1/jobs/{id}/analyze:
  post:
    summary: 공고 AI 분석 요청
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              user_profile_id:
                type: string
    responses:
      200:
        schema:
          $ref: '#/definitions/JobAnalysis'

# 매칭 관련 API
/api/v1/matching/recommendations:
  get:
    summary: 개인화 추천 공고
    parameters:
      - name: limit
        in: query
        type: integer
    responses:
      200:
        schema:
          type: array
          items:
            $ref: '#/definitions/RecommendedJob'

# 기술 트렌드 API
/api/v1/analytics/tech-trends:
  get:
    summary: 기술 스택 트렌드
    parameters:
      - name: period
        in: query
        enum: [1m, 3m, 6m, 1y]
      - name: category
        in: query
        type: string
    responses:
      200:
        schema:
          type: array
          items:
            $ref: '#/definitions/TechTrend'

```

### B. GraphQL API (선택적)

```graphql
type Query {
  # 공고 검색 (복잡한 필터링)
  searchJobs(
    filter: JobFilter!
    sort: JobSort
    pagination: Pagination
  ): JobConnection!

  # 개인 맞춤 추천
  myRecommendations(
    limit: Int = 10
  ): [RecommendedJob!]!

  # 기업 정보
  company(id: ID!): Company

  # 기술 스택 관계도
  skillGraph(
    rootSkill: String!
    depth: Int = 2
  ): SkillNode!
}

type Mutation {
  # 공고 저장/관심 표시
  saveJob(jobId: ID!): Job!

  # 지원 기록
  recordApplication(
    jobId: ID!
    appliedAt: DateTime!
  ): ApplicationRecord!

  # 프로필 업데이트
  updateProfile(
    input: ProfileInput!
  ): UserProfile!
}

type Subscription {
  # 실시간 매칭 알림
  jobMatched(
    minScore: Int = 80
  ): MatchedJob!
}

```

### 1.5 크롤링 전략 및 안정성 설계

### A. 크롤러 아키텍처

```python
# 크롤러 베이스 클래스
class BaseCrawler(ABC):
    def __init__(self, company_name: str):
        self.company_name = company_name
        self.session = self._create_session()
        self.retry_policy = RetryPolicy(
            max_attempts=3,
            backoff_factor=2,
            status_forcelist=[500, 502, 503, 504]
        )

    def _create_session(self) -> requests.Session:
        session = requests.Session()
        session.headers.update({
            'User-Agent': self._get_random_user_agent(),
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br'
        })
        return session

    @abstractmethod
    async def fetch_job_list(self) -> List[str]:
        """공고 목록 URL 수집"""
        pass

    @abstractmethod
    async def parse_job_detail(self, url: str) -> JobData:
        """공고 상세 정보 파싱"""
        pass

    async def crawl(self) -> List[JobData]:
        """메인 크롤링 로직"""
        jobs = []

        # Rate limiting
        rate_limiter = RateLimiter(
            max_requests=10,
            time_window=60  # 분당 10개 요청
        )

        # 공고 목록 수집
        job_urls = await self.fetch_job_list()

        # 각 공고 상세 크롤링
        for url in job_urls:
            try:
                await rate_limiter.acquire()
                job_data = await self.parse_job_detail(url)
                jobs.append(job_data)

                # 모니터링 메트릭 전송
                await self._send_metrics(
                    status="success",
                    company=self.company_name,
                    url=url
                )
            except Exception as e:
                logger.error(f"Failed to crawl {url}: {e}")
                await self._send_metrics(
                    status="failure",
                    company=self.company_name,
                    url=url,
                    error=str(e)
                )

        return jobs

```

### B. 크롤러 모니터링 시스템

```python
# 모니터링 대시보드 메트릭
class CrawlerMonitoring:
    def __init__(self):
        self.prometheus_client = PrometheusClient()
        self.slack_client = SlackClient()

    async def track_crawl_result(
        self,
        company: str,
        success_count: int,
        failure_count: int,
        duration: float
    ):
        # Prometheus 메트릭 업데이트
        self.prometheus_client.counter(
            'crawler_success_total',
            success_count,
            labels={'company': company}
        )

        self.prometheus_client.counter(
            'crawler_failure_total',
            failure_count,
            labels={'company': company}
        )

        self.prometheus_client.histogram(
            'crawler_duration_seconds',
            duration,
            labels={'company': company}
        )

        # 실패율이 높으면 알림
        failure_rate = failure_count / (success_count + failure_count)
        if failure_rate > 0.3:  # 30% 이상 실패
            await self.slack_client.send_alert(
                f"⚠️ {company} 크롤러 실패율 높음: {failure_rate:.1%}"
            )

```

### 1.6 AI/ML 파이프라인 설계

### A. 기술 스택 추출 모델

```python
class TechStackExtractor:
    def __init__(self):
        # KoBERT 기반 NER 모델
        self.model = AutoModelForTokenClassification.from_pretrained(
            "klue/bert-base"
        )
        self.tokenizer = AutoTokenizer.from_pretrained("klue/bert-base")

        # 기술 스택 사전 (약 2,000개)
        self.tech_dict = self._load_tech_dictionary()

    def extract_skills(self, text: str) -> List[Skill]:
        # 1. 사전 기반 추출 (빠른 처리)
        dict_matches = self._dictionary_matching(text)

        # 2. NER 모델 기반 추출 (정확도 향상)
        ner_matches = self._ner_extraction(text)

        # 3. 규칙 기반 후처리
        combined = self._combine_results(dict_matches, ner_matches)

        # 4. 신뢰도 점수 계산
        return self._calculate_confidence(combined)

    def _dictionary_matching(self, text: str) -> List[str]:
        """Aho-Corasick 알고리즘으로 빠른 매칭"""
        import pyahocorasick

        A = pyahocorasick.Automaton()
        for tech in self.tech_dict:
            A.add_word(tech.lower(), tech)
        A.make_automaton()

        matches = []
        for end_index, tech in A.iter(text.lower()):
            matches.append(tech)

        return matches

```

### B. 성장 가능성 스코어링 모델

```python
class GrowthScoreCalculator:
    def __init__(self):
        self.feature_weights = {
            'tech_innovation': 0.3,
            'project_scale': 0.25,
            'team_culture': 0.25,
            'career_path': 0.2
        }

    def calculate_score(self, job: JobPosting) -> GrowthScore:
        scores = {}

        # 1. 기술 혁신도 (최신 기술 사용 여부)
        scores['tech_innovation'] = self._tech_innovation_score(
            job.required_skills,
            job.preferred_skills
        )

        # 2. 프로젝트 규모 (트래픽, 사용자 수 등)
        scores['project_scale'] = self._project_scale_score(
            job.description
        )

        # 3. 팀 문화 (코드리뷰, 기술블로그 등)
        scores['team_culture'] = self._team_culture_score(
            job.company.culture_keywords,
            job.benefits
        )

        # 4. 커리어 성장 경로
        scores['career_path'] = self._career_path_score(
            job.company,
            job.experience_level
        )

        # 가중 평균 계산
        total_score = sum(
            score * self.feature_weights[key]
            for key, score in scores.items()
        )

        return GrowthScore(
            total=int(total_score),
            breakdown=scores,
            insights=self._generate_insights(scores)
        )

    def _tech_innovation_score(
        self,
        required: List[str],
        preferred: List[str]
    ) -> float:
        """기술 스택의 최신성과 혁신성 평가"""

        # 기술별 혁신 점수 (주기적 업데이트)
        innovation_scores = {
            'kubernetes': 90,
            'kafka': 85,
            'graphql': 80,
            'rust': 85,
            'webassembly': 90,
            # ... 약 200개 기술
        }

        all_skills = required + preferred
        if not all_skills:
            return 50.0

        scores = [
            innovation_scores.get(skill.lower(), 50)
            for skill in all_skills
        ]

        return sum(scores) / len(scores)

```

### 1.7 캐싱 및 성능 최적화

### A. Redis 캐싱 전략

```python
class CacheStrategy:
    def __init__(self):
        self.redis = Redis(
            host='localhost',
            port=6379,
            decode_responses=True
        )

    # 1. 공고 목록 캐싱 (5분)
    async def cache_job_list(
        self,
        filter_key: str,
        jobs: List[JobSummary],
        ttl: int = 300
    ):
        key = f"jobs:list:{filter_key}"
        self.redis.setex(
            key,
            ttl,
            json.dumps([job.dict() for job in jobs])
        )

    # 2. 매칭 결과 캐싱 (1시간)
    async def cache_matching_result(
        self,
        user_id: str,
        matches: List[MatchedJob],
        ttl: int = 3600
    ):
        key = f"matches:user:{user_id}"
        self.redis.setex(
            key,
            ttl,
            json.dumps([match.dict() for match in matches])
        )

    # 3. 기술 트렌드 캐싱 (1일)
    async def cache_tech_trends(
        self,
        period: str,
        trends: List[TechTrend],
        ttl: int = 86400
    ):
        key = f"trends:tech:{period}"
        self.redis.setex(
            key,
            ttl,
            json.dumps([trend.dict() for trend in trends])
        )

```

### B. 데이터베이스 쿼리 최적화

```sql
-- 매칭 쿼리 최적화 (PostgreSQL)
CREATE OR REPLACE FUNCTION calculate_job_match(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
    job_id UUID,
    match_score INTEGER,
    skill_match INTEGER,
    culture_match INTEGER,
    missing_skills TEXT[]
) AS $$
DECLARE
    v_user_skills UUID[];
    v_target_skills UUID[];
    v_preferred_culture JSONB;
BEGIN
    -- 사용자 정보 조회 (한 번만)
    SELECT
        current_skills,
        target_skills,
        preferred_culture
    INTO
        v_user_skills,
        v_target_skills,
        v_preferred_culture
    FROM user_profiles
    WHERE user_id = p_user_id;

    RETURN QUERY
    WITH skill_matches AS (
        SELECT
            jp.id,
            -- 보유 스킬 매칭
            ARRAY_LENGTH(
                ARRAY(
                    SELECT unnest(jp.required_skills)
                    INTERSECT
                    SELECT unnest(v_user_skills)
                ),
                1
            ) * 100.0 / NULLIF(ARRAY_LENGTH(jp.required_skills, 1), 0)
                AS skill_match_pct,
            -- 부족 스킬
            ARRAY(
                SELECT unnest(jp.required_skills)
                EXCEPT
                SELECT unnest(v_user_skills)
            ) AS missing_skills_array
        FROM job_postings jp
        WHERE jp.is_active = true
    ),
    culture_matches AS (
        SELECT
            c.id AS company_id,
            -- 문화 매칭 점수 (JSONB 비교)
            COUNT(*) * 100.0 / JSONB_ARRAY_LENGTH(v_preferred_culture)
                AS culture_match_pct
        FROM companies c,
        LATERAL JSONB_ARRAY_ELEMENTS_TEXT(c.culture_keywords) AS ck
        WHERE ck IN (
            SELECT JSONB_ARRAY_ELEMENTS_TEXT(v_preferred_culture)
        )
        GROUP BY c.id
    )
    SELECT
        jp.id,
        -- 종합 매칭 점수
        CAST(
            sm.skill_match_pct * 0.4 +
            jp.growth_score * 0.3 +
            COALESCE(cm.culture_match_pct, 50) * 0.3
            AS INTEGER
        ),
        CAST(sm.skill_match_pct AS INTEGER),
        CAST(COALESCE(cm.culture_match_pct, 50) AS INTEGER),
        sm.missing_skills_array::TEXT[]
    FROM job_postings jp
    JOIN skill_matches sm ON jp.id = sm.id
    LEFT JOIN culture_matches cm ON jp.company_id = cm.company_id
    ORDER BY 2 DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 인덱스 생성
CREATE INDEX idx_job_match_calc
ON job_postings(is_active, growth_score DESC)
WHERE is_active = true;

```

### 1.8 보안 설계

### A. API 보안

```yaml
# API Gateway 보안 설정 (Kong)
plugins:
  - name: rate-limiting
    config:
      minute: 60  # 분당 60회
      hour: 1000  # 시간당 1000회
      policy: local

  - name: jwt
    config:
      secret_is_base64: false
      claims_to_verify:
        - exp
        - nbf

  - name: cors
    config:
      origins:
        - https://asyncsite.com
        - https://api.asyncsite.com
      methods:
        - GET
        - POST
        - PUT
        - DELETE
      headers:
        - Accept
        - Content-Type
        - Authorization
      credentials: true

  - name: ip-restriction
    config:
      whitelist:
        - 10.0.0.0/8  # 내부 네트워크
      message: "Access denied"

```

### B. 데이터 보안

```python
# 민감 데이터 암호화
class DataEncryption:
    def __init__(self):
        self.cipher = Fernet(settings.ENCRYPTION_KEY)

    def encrypt_pii(self, data: dict) -> dict:
        """개인식별정보 암호화"""
        sensitive_fields = ['email', 'phone', 'name']

        encrypted_data = data.copy()
        for field in sensitive_fields:
            if field in data:
                encrypted_data[field] = self.cipher.encrypt(
                    data[field].encode()
                ).decode()

        return encrypted_data

    def decrypt_pii(self, data: dict) -> dict:
        """개인식별정보 복호화"""
        sensitive_fields = ['email', 'phone', 'name']

        decrypted_data = data.copy()
        for field in sensitive_fields:
            if field in data:
                decrypted_data[field] = self.cipher.decrypt(
                    data[field].encode()
                ).decode()

        return decrypted_data

```

### 1.9 모니터링 및 로깅

### A. 통합 모니터링 스택

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yaml:/etc/promtail/config.yml

```

### B. 애플리케이션 로깅

```python
# 구조화된 로깅
import structlog

logger = structlog.get_logger()

class JobCrawlerLogger:
    @staticmethod
    def log_crawl_start(company: str, crawler_version: str):
        logger.info(
            "crawl_started",
            company=company,
            crawler_version=crawler_version,
            timestamp=datetime.utcnow().isoformat()
        )

    @staticmethod
    def log_crawl_result(
        company: str,
        success_count: int,
        failure_count: int,
        duration: float
    ):
        logger.info(
            "crawl_completed",
            company=company,
            success_count=success_count,
            failure_count=failure_count,
            duration_seconds=duration,
            success_rate=success_count/(success_count+failure_count)
        )

    @staticmethod
    def log_parse_error(
        company: str,
        url: str,
        error: Exception
    ):
        logger.error(
            "parse_failed",
            company=company,
            url=url,
            error_type=type(error).__name__,
            error_message=str(error),
            stack_trace=traceback.format_exc()
        )

```

### 1.10 배포 전략

### A. 컨테이너화 (Docker)

```
# crawler-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성
RUN apt-get update && apt-get install -y \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드
COPY . .

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

```

### B. Kubernetes 배포

```yaml
# k8s/crawler-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crawler-service
  labels:
    app: crawler-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crawler-service
  template:
    metadata:
      labels:
        app: crawler-service
    spec:
      containers:
      - name: crawler
        image: asyncsite/crawler-service:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: crawler-service
spec:
  selector:
    app: crawler-service
  ports:
  - port: 80
    targetPort: 8000

```

### C. CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
name: Deploy AsyncCareer

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Run tests
      run: |
        docker-compose -f docker-compose.test.yml up --abort-on-container-exit

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build and push Docker images
      env:
        DOCKER_REGISTRY: ${{ secrets.DOCKER_REGISTRY }}
      run: |
        docker build -t $DOCKER_REGISTRY/crawler-service:$GITHUB_SHA ./crawler-service
        docker build -t $DOCKER_REGISTRY/career-service:$GITHUB_SHA ./career-service
        docker push $DOCKER_REGISTRY/crawler-service:$GITHUB_SHA
        docker push $DOCKER_REGISTRY/career-service:$GITHUB_SHA

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Kubernetes
      env:
        KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
      run: |
        echo "$KUBE_CONFIG" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/crawler-service crawler=$DOCKER_REGISTRY/crawler-service:$GITHUB_SHA
        kubectl set image deployment/career-service career=$DOCKER_REGISTRY/career-service:$GITHUB_SHA
        kubectl rollout status deployment/crawler-service
        kubectl rollout status deployment/career-service

```

---

# AsyncSite Ignition - AsyncCareer 화면 설계 문서

## 1. 디자인 철학 및 비주얼 아이덴티티

### 1.1 핵심 디자인 원칙

### **"From Growth to Achievement" - 성장에서 성취로의 여정을 시각화**

```
🌱 Discovery (발견) → 🎯 Focus (집중) → 🚀 Achievement (성취)

```

- **Progressive Disclosure**: 사용자의 여정에 따라 점진적으로 깊이 있는 정보 제공
- **Data-Driven Visual**: 추상적인 '기회'를 구체적인 '데이터'로 시각화
- **Emotional Connection**: 차가운 채용 정보가 아닌, 따뜻한 성장 스토리로 전달

### 1.2 비주얼 테마

### **"Digital Aurora" - 디지털 오로라**

```
색상 팔레트:
- Primary: #6366F1 (Electric Indigo) - 혁신과 기술
- Secondary: #14B8A6 (Teal) - 성장과 기회
- Accent: #F59E0B (Amber) - 성취와 하이라이트
- Gradient: Indigo → Teal → Amber (여정의 진행)

다크모드:
- Background: #0F172A (Deep Space)
- Surface: #1E293B (Midnight)
- 오로라 효과로 공간감 연출

```

### **모션 디자인 언어**

- **Flow Motion**: 데이터가 흐르듯 자연스러운 전환
- **Pulse Effect**: 새로운 기회가 맥박처럼 뛰는 효과
- **Particle System**: 기술 스택이 별처럼 흩어지고 모이는 애니메이션

## 2. 정보 아키텍처 (IA)

### 2.1 전체 사이트맵

```
AsyncCareer/
├── 홈 (Dashboard)
│   ├── 오늘의 매칭
│   ├── 트렌딩 기회
│   └── 내 성장 지표
│
├── 탐색 (Explore)
│   ├── 기업별 보기
│   ├── 기술별 보기
│   ├── 성장 기회별 보기
│   └── 지도 뷰
│
├── 분석 (Insights)
│   ├── 시장 트렌드
│   ├── 기술 수요 예측
│   ├── 연봉 인사이트
│   └── 커리어 패스 분석
│
├── 내 여정 (My Journey)
│   ├── 프로필 & 스킬
│   ├── 관심 기업
│   ├── 지원 히스토리
│   └── 성장 로드맵
│
└── 커뮤니티 (Community)
    ├── 지원자 라운지
    ├── 멘토 매칭
    ├── 성공 스토리
    └── AsyncSite 연계

```

### 2.2 핵심 사용자 플로우

### **A. First-Time User Journey**

```
1. 랜딩 → "당신의 다음 성취는?" (감성적 시작)
     ↓
2. 간단한 온보딩 (3단계)
   - 현재 위치: "지금 어디에 있나요?"
   - 목표 설정: "어디로 가고 싶나요?"
   - 기술 스택: "무엇을 할 수 있나요?"
     ↓
3. 첫 매칭 결과 (WOW 모먼트)
   "당신을 위한 3개의 특별한 기회를 찾았습니다"
     ↓
4. 상세 분석 제공
   "이 기회에서 당신이 얻을 수 있는 것들"

```

### **B. Returning User Flow**

```
1. 대시보드 진입
   "지난 방문 이후 새로운 기회 12개"
     ↓
2. 개인화된 피드
   - 매칭률 상승한 공고
   - 관심 기업 새 포지션
   - 트렌드 변화 알림
     ↓
3. 심화 탐색
   - 기업 딥다이브
   - 기술 관계도 탐색
   - 커뮤니티 인사이트

```

## 3. 주요 화면 설계

### 3.1 홈 대시보드

### **레이아웃 구조**

```
┌─────────────────────────────────────────────────────────┐
│  🌅 Good morning, Rene                                  │
│  "오늘도 한 걸음 더 성취를 향해"                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   TODAY'S MATCH     │  │   TRENDING NOW      │      │
│  │                     │  │                     │      │
│  │   [95%] 네이버      │  │  🔥 Kafka 수요 급증  │      │
│  │   백엔드 개발자      │  │  📈 평균 연봉 15%↑  │      │
│  │                     │  │                     │      │
│  │   → 당신의 성장     │  │  💡 지금이 기회      │      │
│  │     가능성 분석     │  │                     │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            YOUR GROWTH RADAR                     │   │
│  │         (인터랙티브 스킬 레이더 차트)              │   │
│  │                                                  │   │
│  │    현재 ●━━━━━○ 목표    갭: Kafka, k8s         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          ACHIEVEMENT TIMELINE                    │   │
│  │     (당신의 커리어 여정 시각화)                   │   │
│  │                                                  │   │
│  │  2023 ────●──────●────── 2025 ────○──── 2026   │   │
│  │        입사    승진예상         목표달성          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

```

### **인터랙션 디자인**

1. **Morning Briefing Animation**
    - 접속 시간대별 인사말 변경
    - 부드러운 페이드인 효과로 하루 시작
2. **Match Card Interaction**
    
    ```
    Hover → 카드 살짝 부상 + 광채 효과
    Click → 카드 뒤집기 애니메이션 → 상세 분석 표시
    
    ```
    
3. **Growth Radar**
    - 실시간 애니메이션으로 현재→목표 transition
    - 각 스킬 포인트 클릭 시 관련 학습 경로 제시

### 3.2 채용 공고 탐색 화면

### **혁신적인 3-View 시스템**

```
┌─────────────────────────────────────────────────────────┐
│  [리스트 뷰] [갤러리 뷰] [🗺️ 지도 뷰]   필터 ▼  정렬 ▼ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║              🗺️ OPPORTUNITY MAP                   ║ │
│  ║                                                   ║ │
│  ║   [판교]          [강남]          [상암]         ║ │
│  ║     ●               ●               ●           ║ │
│  ║    12개            28개            8개          ║ │
│  ║                                                   ║ │
│  ║         [여의도]          [성수]                 ║ │
│  ║            ●               ●                     ║ │
│  ║           15개            6개                    ║ │
│  ║                                                   ║ │
│  ║  (지도 위 버블 크기 = 기회의 수)                  ║ │
│  ║  (버블 색상 = 매칭률)                            ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  실시간 인사이트: "판교 지역 백엔드 수요 급증 중 📈"      │
└─────────────────────────────────────────────────────────┘

```

### **갤러리 뷰 - 비주얼 스토리텔링**

```
┌─────────────────┬─────────────────┬─────────────────┐
│   🏢 NAVER      │   🚀 COUPANG    │   🎮 NEXON      │
│                 │                 │                 │
│  [매칭률 95%]   │  [매칭률 87%]   │  [매칭률 82%]   │
│                 │                 │                 │
│  "실시간 검색   │  "물류 혁신의   │  "글로벌 게임   │
│   10억 쿼리"    │   최전선"       │   5억 유저"     │
│                 │                 │                 │
│  Tech: Java,    │  Tech: Go,      │  Tech: C++,     │
│  Kafka, k8s     │  Python, AWS    │  Unity, Redis   │
│                 │                 │                 │
│  💎 성장점수 92 │  💎 성장점수 88 │  💎 성장점수 85 │
│                 │                 │                 │
│  [빠른 분석]    │  [빠른 분석]    │  [빠른 분석]    │
└─────────────────┴─────────────────┴─────────────────┘

```

### 3.3 공고 상세 분석 화면

### **스토리텔링 방식의 정보 전달**

```
┌─────────────────────────────────────────────────────────┐
│  « 목록으로                              ★ 저장  📤 공유 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  네이버 검색플랫폼 백엔드 개발자                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       │
│                                                         │
│  🎯 당신과의 매칭률: 95%                                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          "이 포지션에서의 당신의 성취 스토리"      │   │
│  │                                                  │   │
│  │  Chapter 1: 현재의 당신                          │   │
│  │  ✓ Java, Spring 숙련도 우수                     │   │
│  │  ✓ 대용량 처리 경험 보유                        │   │
│  │                                                  │   │
│  │  Chapter 2: 도전과 성장                          │   │
│  │  🎯 Kafka 실전 경험 획득 (3개월)                │   │
│  │  🎯 k8s 운영 스킬 습득 (6개월)                  │   │
│  │                                                  │   │
│  │  Chapter 3: 1년 후 예상 성취                     │   │
│  │  🏆 일 10억 쿼리 처리 시스템 운영               │   │
│  │  🏆 마이크로서비스 설계 역량 확보               │   │
│  │  🏆 네이버 기술 블로그 저자                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              💡 GROWTH INSIGHTS                  │   │
│  │                                                  │   │
│  │  기술 혁신도:  ████████░░  85/100              │   │
│  │  팀 문화:      █████████░  92/100              │   │
│  │  커리어 성장:  ████████░░  88/100              │   │
│  │  워라밸:      ███████░░░  75/100              │   │
│  │                                                  │   │
│  │  "코드리뷰 문화가 체계적이며, 기술 컨퍼런스     │   │
│  │   참여를 적극 지원하는 환경입니다."              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          🤝 COMMUNITY INSIGHTS                   │   │
│  │                                                  │   │
│  │  "이 공고에 관심 있는 12명이 함께 준비 중"       │   │
│  │                                                  │   │
│  │  [지원자 라운지 참여] [멘토 찾기]               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [🚀 지원 준비 시작]                                    │
└─────────────────────────────────────────────────────────┘

```

### 3.4 시장 인사이트 대시보드

### **데이터 비주얼라이제이션의 정수**

```
┌─────────────────────────────────────────────────────────┐
│              🔮 MARKET INSIGHTS 2024                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │        TECH DEMAND HEATMAP                       │   │
│  │                                                  │   │
│  │  언어      프레임워크    인프라      신기술      │   │
│  │  ████      ████████     ██████      ████       │   │
│  │  Java      Spring       k8s         AI/ML      │   │
│  │  ███       ██████       █████       ██████     │   │
│  │  Python    React        Docker      Blockchain │   │
│  │  ██        █████        ████        ██         │   │
│  │  Go        Vue          Kafka       Web3       │   │
│  │                                                  │   │
│  │  (Heat intensity = 수요 증가율)                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────┬────────────────────────────┐   │
│  │  SALARY TRENDS     │   OPPORTUNITY FORECAST     │   │
│  │                    │                            │   │
│  │  📈 +15% ▲         │   🚀 핫한 포지션           │   │
│  │  Kafka 전문가      │   • DevOps Engineer       │   │
│  │                    │   • ML Engineer           │   │
│  │  📈 +12% ▲         │   • Cloud Architect      │   │
│  │  k8s 엔지니어      │                            │   │
│  │                    │   📊 공급 < 수요           │   │
│  │  📈 +10% ▲         │   최적의 협상 타이밍!      │   │
│  │  React 개발자      │                            │   │
│  └────────────────────┴────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

```

### 3.5 개인 여정 관리

### **커리어를 게임처럼 - Gamification**

```
┌─────────────────────────────────────────────────────────┐
│                 🎮 MY CAREER JOURNEY                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Level 23: Senior Backend Developer in Progress        │
│  ████████████████░░░░  82% (18% to Level 24)          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              SKILL CONSTELLATION                 │   │
│  │          (인터랙티브 스킬 성좌도)                │   │
│  │                                                  │   │
│  │         ✦ Spring                                 │   │
│  │        ╱ ╲                                      │   │
│  │    Java   JPA     ✧ Kafka (목표)               │   │
│  │      ╲ ╱         ╱                             │   │
│  │      MySQL ─── Redis                            │   │
│  │                                                  │   │
│  │  [빛나는 별 = 보유 스킬]                        │   │
│  │  [희미한 별 = 목표 스킬]                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🏆 최근 성취                                           │
│  • "Spring Boot 마스터" 뱃지 획득                      │
│  • 코드리뷰 100회 달성                                 │
│  • 첫 오픈소스 컨트리뷰션                              │
│                                                         │
│  🎯 다음 목표                                           │
│  • Kafka 실전 프로젝트 완수 (AsyncSite 스터디 연계)    │
│  • 네이버 검색팀 합류                                  │
│                                                         │
│  [📊 상세 분석] [🗺️ 로드맵 수정] [👥 멘토 찾기]       │
└─────────────────────────────────────────────────────────┘

```

## 4. 인터랙션 디자인 패턴

### 4.1 마이크로 인터랙션

### **"Pulse of Opportunity" - 기회의 맥박**

```
새로운 매칭 발견 시:
1. 아이콘에 맥박 애니메이션
2. 부드러운 진동 효과 (모바일)
3. 숫자 카운트업 애니메이션

```

### **"Skill Galaxy" - 스킬 은하계**

```
스킬 관계도 인터랙션:
- 마우스 이동 → 별자리 연결선 표시
- 클릭 → 해당 스킬 중심으로 재배열
- 드래그 → 3D 회전 효과

```

### 4.2 트랜지션 & 애니메이션

```css
/* 페이지 전환 효과 */
.page-transition {
  /* Aurora Fade - 오로라 페이드 */
  background: linear-gradient(
    135deg,
    transparent,
    rgba(99, 102, 241, 0.1),
    transparent
  );
  animation: aurora-sweep 0.6s ease-out;
}

/* 카드 호버 효과 */
.opportunity-card:hover {
  /* Levitation - 부상 효과 */
  transform: translateY(-4px);
  box-shadow:
    0 10px 40px rgba(99, 102, 241, 0.2),
    0 0 60px rgba(99, 102, 241, 0.1);
}

/* 매칭 발견 효과 */
@keyframes match-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(245, 158, 11, 0);
  }
}

```

## 5. 모바일 경험 설계

### 5.1 모바일 우선 접근

### **Thumb-Friendly Navigation**

```
┌─────────────────────┐
│  AsyncCareer        │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │   콘텐츠      │  │
│  │   영역        │  │
│  │               │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  ┌───┬───┬───┬───┐ │
│  │홈 │탐색│인사│나 │ │
│  └───┴───┴───┴───┘ │
│  (하단 네비게이션)   │
└─────────────────────┘

엄지 도달 범위 내
주요 액션 배치

```

### 5.2 제스처 기반 인터랙션

```
스와이프 제스처:
← → : 공고 간 이동
↑   : 상세 정보 확장
↓   : 빠른 저장

핀치 제스처:
Pinch In/Out : 지도 뷰 확대/축소
Two-Finger Rotate : 스킬 성좌도 회전

```

## 6. 접근성 설계

### 6.1 시각적 접근성

- **고대비 모드**: WCAG AAA 기준 충족
- **색맹 친화적**: 색상만으로 정보 구분 않음
- **텍스트 크기 조절**: 최대 200%까지 확대

### 6.2 스크린 리더 최적화

```html
<!-- 의미 있는 ARIA 레이블 -->
<div role="article" aria-label="네이버 백엔드 개발자 채용">
  <h2 id="job-title">네이버 검색플랫폼 백엔드 개발자</h2>
  <div aria-describedby="job-title">
    <span role="meter"
          aria-label="매칭률"
          aria-valuenow="95"
          aria-valuemin="0"
          aria-valuemax="100">
      95% 매칭
    </span>
  </div>
</div>

```

## 7. 감성적 터치포인트

### 7.1 첫 방문자를 위한 온보딩

```
단계별 감성 메시지:

1. "안녕하세요! 당신의 다음 도전을 찾아드릴게요 🚀"
2. "먼저, 지금 어디쯤 계신가요?"
3. "멋지네요! 이제 어디로 가고 싶으신가요?"
4. "좋아요! 당신만을 위한 기회를 찾는 중..."
5. "짜잔! 🎉 당신의 성장 가능성을 발견했어요!"

```

### 7.2 성취 순간의 축하

```
주요 마일스톤 달성 시:

- 첫 매칭 95% 이상: "완벽한 매칭이네요! 🎯"
- 10개 공고 분석 완료: "탐험가 배지 획득! 🗺️"
- 첫 지원 완료: "첫 발걸음을 내디뎠네요! 👏"
- 커뮤니티 첫 참여: "함께라서 더 멀리! 🤝"

```

### 7.3 동기부여 시스템

```
Daily Motivation:
- 월: "새로운 한 주, 새로운 기회"
- 화: "어제보다 나은 오늘"
- 수: "반환점을 돌았어요!"
- 목: "거의 다 왔어요"
- 금: "이번 주도 수고했어요"
- 주말: "재충전의 시간 ⚡"

개인화 메시지:
"3개월 전보다 Kafka 검색 결과가
 40% 더 많아졌어요. 성장하고 있네요!"

```

## 8. AsyncSite 생태계 연동 UI

### 8.1 자연스러운 연계 포인트

```
┌─────────────────────────────────────────────────────┐
│  💡 이 스킬이 부족하신가요?                          │
│                                                     │
│  Kafka를 마스터하는 가장 빠른 방법                  │
│                                                     │
│  ┌─────────────────┬─────────────────┐             │
│  │ AsyncSite 스터디 │ Async Academy   │             │
│  │                 │                 │             │
│  │ "실전 Kafka     │ "Kafka 완전정복 │             │
│  │  스터디"        │  8주 과정"      │             │
│  │                 │                 │             │
│  │ 👥 12명 참여중  │ 🎓 98% 수료율   │             │
│  │ 🗓️ 매주 목요일  │ 💰 월 15만원    │             │
│  └─────────────────┴─────────────────┘             │
│                                                     │
│  또는 [1:1 멘토링 받기] (Async Ignition)            │
└─────────────────────────────────────────────────────┘

```

### 8.2 통합 프로필 시스템

```
AsyncSite 통합 프로필:
- AsyncCareer: 커리어 목표 & 스킬
- AsyncStudy: 학습 이력 & 성과
- AsyncLab: 프로젝트 포트폴리오
→ 하나의 프로필로 모든 서비스 이용

```

## 9. 성능을 위한 UI 최적화

### 9.1 Progressive Loading

```
1단계: 스켈레톤 UI 표시 (0-100ms)
2단계: 핵심 콘텐츠 로드 (100-300ms)
3단계: 인터랙티브 요소 활성화 (300-500ms)
4단계: 부가 애니메이션 적용 (500ms+)

```

### 9.2 Optimistic UI

```jsx
// 사용자 액션 즉시 반영
onSaveJob() {
  // 1. UI 즉시 업데이트
  updateUI({ saved: true });

  // 2. 백그라운드 API 호출
  api.saveJob()
    .catch(() => {
      // 3. 실패 시 롤백
      updateUI({ saved: false });
      showError("저장 실패");
    });
}

```

## 10. 미래 확장성을 위한 디자인 시스템

### 10.1 컴포넌트 라이브러리

```
AsyncCareer Design System:

Atoms:
- Button (Primary, Secondary, Ghost)
- Badge (Skill, Achievement, Status)
- Icon (Custom icon set)

Molecules:
- JobCard
- SkillTag
- MatchScore
- GrowthMeter

Organisms:
- JobList
- SkillConstellation
- InsightDashboard
- CommunityHub

```

### 10.2 디자인 토큰

```json
{
  "color": {
    "primary": {
      "50": "#EEF2FF",
      "500": "#6366F1",
      "900": "#312E81"
    },
    "semantic": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "animation": {
    "duration": {
      "fast": "200ms",
      "normal": "300ms",
      "slow": "600ms"
    },
    "easing": {
      "smooth": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}

```

---

이 화면 설계 문서는 AsyncCareer가 단순한 채용 정보 서비스를 넘어, **개발자의 커리어 여정을 함께하는 감성적이고 직관적인 플랫폼**으로 자리매김할 수 있도록 설계되었습니다.

데이터 기반의 인사이트를 아름답고 이해하기 쉬운 비주얼로 전달하며, 사용자의 성장 과정을 게임처럼 즐겁게 만들어 지속적인 참여를 유도합니다.

무엇보다 AsyncSite 생태계와의 자연스러운 연결을 통해, 단순히 기회를 '보여주는' 것을 넘어 실제로 그 기회를 '잡을 수 있도록' 돕는 진정한 커리어 파트너가 될 것입니다.
