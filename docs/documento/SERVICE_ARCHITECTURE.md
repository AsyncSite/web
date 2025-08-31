# Documento 서비스 아키텍처

## 개요
AI 기반 콘텐츠 리뷰 서비스로, 사용자가 작성한 콘텐츠의 품질을 분석하고 개선 방안을 제시하는 서비스

## 시스템 구성

### 프론트엔드 (React)
- **위치**: `/src/components/lab/ai-studio/documentor/`
- **주요 컴포넌트**: DocuMentor.tsx
- **스타일링**: CSS Modules (DocuMentor.module.css)
- **라우팅**: `/studio/documentor`

### 백엔드 마이크로서비스

#### 1. documento-content-service (Spring Boot)
- **역할**: 메인 API 서버
- **포트**: 8090
- **주요 기능**:
  - URL 수집 요청 접수
  - 이벤트 발행 (Kafka)
  - 결과 조회 API
  - Rate limiting (Redis)

#### 2. documento-crawler-worker (Python)
- **역할**: 웹 크롤링
- **기술스택**: Selenium, BeautifulSoup
- **주요 기능**:
  - URL 콘텐츠 수집
  - 플랫폼별 파싱 최적화
  - 이미지/텍스트 추출

#### 3. documento-parser-worker (Python)
- **역할**: AI 분석
- **기술스택**: OpenAI API
- **주요 기능**:
  - 콘텐츠 품질 분석
  - 점수 산정
  - 개선 제안 생성

## 이벤트 기반 아키텍처

### Kafka 토픽 구조
```
documento.submit -> documento.crawl -> documento.parse -> documento.complete
```

### 이벤트 플로우
1. **submit 이벤트**: URL 제출 시 발행
2. **crawl 이벤트**: 크롤링 완료 후 발행
3. **parse 이벤트**: 파싱 요청
4. **complete 이벤트**: 분석 완료

## 데이터베이스 스키마

### documento_contents 테이블
```sql
CREATE TABLE documento_contents (
    id UUID PRIMARY KEY,
    user_id BIGINT,
    url VARCHAR(500),
    status VARCHAR(50),
    crawled_title VARCHAR(500),
    crawled_content TEXT,
    error_message TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### documento_analyses 테이블
```sql
CREATE TABLE documento_analyses (
    id UUID PRIMARY KEY,
    content_id UUID,
    overall_score INT,
    strengths JSON,
    improvements JSON,
    suggestions JSON,
    metadata JSON,
    created_at TIMESTAMP
);
```

## API 엔드포인트

### 콘텐츠 제출
```
POST /api/documento/submit
{
    "url": "https://blog.naver.com/...",
    "platform": "네이버 블로그",
    "tone": "friendly"
}
```

### 결과 조회
```
GET /api/documento/result/{id}
```

### 사용량 조회
```
GET /api/documento/usage
```

## 보안 및 제한

### Rate Limiting
- 로그인 사용자: 일일 5회
- 무료 체험: 세션당 1회
- Redis 기반 추적

### 인증
- JWT 토큰 기반
- Spring Security 적용
- Optional authentication for trial

## 모니터링

### 메트릭
- 일일 사용량
- 평균 처리 시간
- 성공/실패율
- 플랫폼별 통계

### 로깅
- ELK Stack 연동
- 에러 추적
- 사용자 행동 분석

## 확장 계획

### Phase 1 (현재)
- 기본 리뷰 기능
- 5가지 플랫폼 지원

### Phase 2
- 히스토리 기능
- 템플릿 저장
- 비교 분석

### Phase 3
- API 제공
- 팀 협업 기능
- 자동 개선 제안