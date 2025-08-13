# 🔍 Slug 고유성(Uniqueness) 처리 분석 및 개선사항

> 작성일: 2025-08-13  
> 작성자: AsyncSite Development Team  
> 분석 범위: Study Service Slug 처리 메커니즘  
> 중요도: ⭐⭐⭐⭐⭐ (매우 높음 - URL 라우팅 핵심 기능)

## 📌 Executive Summary

Study Service에서 slug는 SEO 친화적인 URL을 생성하는 핵심 식별자입니다. 현재 시스템은 **애플리케이션 레벨**과 **데이터베이스 레벨**에서 이중으로 고유성을 보장하고 있으나, 동시성 처리, 한글 지원, 성능 최적화 측면에서 개선이 필요합니다.

### 핵심 발견사항
- ✅ **기본적인 고유성 보장**: DB unique constraint + 애플리케이션 레벨 검증
- ⚠️ **Race Condition 위험**: 동시 요청 시 충돌 가능성
- ❌ **한글 처리 불일치**: 프론트엔드와 백엔드의 정규식 차이
- ⚠️ **성능 이슈**: while 루프로 인한 N+1 쿼리 문제

---

## 🏗️ 현재 구현 상태 분석

### 1. 데이터베이스 레벨 (MySQL)

#### 1.1 테이블 구조
```sql
CREATE TABLE `studies` (
  ...
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ...
  UNIQUE KEY `UK23w702hvr73125eiywug7d9y8` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

**특징:**
- **컬럼 타입**: `varchar(50)` - 최대 50자 제한
- **Collation**: `utf8mb4_unicode_ci` - 이모지 및 다국어 지원
- **Unique Constraint**: 데이터베이스 레벨에서 중복 방지
- **Nullable**: NULL 허용 (slug가 없는 스터디도 가능)

#### 1.2 JPA Entity 설정
```java
// StudyJpaEntity.java:45
@Column(name = "slug", unique = true, length = 50)
private String slug;
```

**분석:**
- Hibernate가 DDL 생성 시 unique constraint 자동 생성
- 길이 제한이 명시되어 있으나 애플리케이션 레벨 검증 없음

### 2. 애플리케이션 레벨 (Spring Boot)

#### 2.1 Slug 생성 및 중복 처리 로직

**위치**: `StudyUseCaseImpl.java:208-216`

```java
private String generateAndEnsureUniqueSlug(String providedSlug, String title) {
    // 1. 기본 slug 결정 (제공된 slug 또는 title에서 생성)
    String base = (providedSlug != null && !providedSlug.isBlank()) 
        ? providedSlug 
        : slugify(title);
    
    // 2. 중복 체크 및 suffix 추가
    String candidate = base;
    int suffix = 1;
    
    // 3. Study 테이블과 StudyDetailPage 테이블 모두 체크
    while (studyService.getStudyBySlug(candidate).isPresent() || 
           studyDetailPageService.existsBySlug(candidate)) {
        candidate = base + "-" + suffix++;
    }
    
    return candidate;
}
```

**동작 방식:**
1. 사용자가 제공한 slug가 있으면 사용, 없으면 title에서 자동 생성
2. 두 개의 테이블(studies, study_detail_pages)에서 중복 검사
3. 중복 발견 시 숫자 suffix 자동 추가 (-1, -2, -3...)
4. 고유한 slug를 찾을 때까지 반복

#### 2.2 Slugify 메서드 구현

```java
private String slugify(String input) {
    String s = input == null ? "study" : input;
    s = s.trim().toLowerCase();
    s = s.replaceAll("[^a-z0-9]+", "-");  // 영문자와 숫자만 허용
    s = s.replaceAll("^-+|-+$", "");      // 앞뒤 하이픈 제거
    return s.isBlank() ? "study" : s;
}
```

**문제점:**
- 한글, 일본어, 중국어 등 비ASCII 문자 모두 제거됨
- "테스트스터디" → "" → "study" (의미 손실)
- 특수문자가 많은 제목의 경우 정보 손실 심각

### 3. 프론트엔드 구현 (React)

#### 3.1 프론트엔드 Slug 생성 로직

**위치**: `StudyProposalPage.tsx:53`, `StudyProposalPageV2.tsx:41`

```javascript
const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')  // 한글 포함!
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
```

**차이점:**
- **프론트엔드**: 한글 허용 (`가-힣` 포함)
- **백엔드**: 한글 제거 (ASCII만 허용)
- **결과**: 사용자가 보는 slug와 실제 저장되는 slug가 다름

#### 3.2 자동 Slug 생성 타이밍

```javascript
// StudyProposalPage.tsx:66
if (!slug || slug === generateSlug(title)) {
    setSlug(generateSlug(newTitle));
}
```

**동작:**
- 제목 변경 시 자동으로 slug 업데이트
- 사용자가 수동으로 slug를 수정한 경우 자동 업데이트 중지

---

## 🔬 실제 테스트 결과 분석

### 테스트 시나리오 및 결과

| 순서 | 요청 Title | 요청 Slug | 생성된 Slug | DB 저장 결과 |
|------|-----------|-----------|-------------|--------------|
| 1차 | "Test Unique Slug Study" | `test-unique-slug` | `test-unique-slug` | ✅ 성공 |
| 2차 | "Another Study With Same Slug" | `test-unique-slug` | `test-unique-slug-1` | ✅ 자동 suffix |
| 3차 | "Third Study Same Slug" | `test-unique-slug` | `test-unique-slug-2` | ✅ suffix 증가 |

### 데이터베이스 실제 데이터

```sql
SELECT id, title, slug FROM studies WHERE slug LIKE 'test-unique-slug%';

-- 결과:
-- test-unique-slug    | Test Unique Slug Study
-- test-unique-slug-1  | Another Study With Same Slug  
-- test-unique-slug-2  | Third Study Same Slug
```

---

## ⚠️ 발견된 문제점 및 위험 요소

### 1. 🔴 Critical: Race Condition 문제

#### 시나리오
```
시간 T1: User A가 slug "tech-study" 요청
시간 T2: User B가 slug "tech-study" 요청 (동시)
시간 T3: 두 요청 모두 while 루프에서 "tech-study" 사용 가능 확인
시간 T4: User A 저장 성공
시간 T5: User B 저장 시도 → DataIntegrityViolationException 발생
```

#### 영향
- 사용자 경험 저하 (500 에러)
- 데이터 일관성 위험
- 트랜잭션 롤백으로 인한 성능 저하

#### 현재 상황에서의 예외 처리
```java
// 현재 코드에는 예외 처리 없음
// DataIntegrityViolationException이 그대로 클라이언트에 전파됨
```

### 2. 🟡 Major: 프론트엔드-백엔드 Slug 생성 불일치

#### 문제 상황 예시

| 사용자 입력 | 프론트엔드 생성 | 백엔드 처리 | 최종 결과 |
|------------|----------------|------------|----------|
| "한글스터디" | `한글스터디` | `-` → `study` | `study` |
| "2025년 스터디" | `2025년-스터디` | `2025-` → `2025` | `2025` |
| "AI&ML 연구" | `ai-ml-연구` | `ai-ml-` → `ai-ml` | `ai-ml` |

#### 사용자 혼란 시나리오
1. 사용자가 "알고리즘 스터디" 입력
2. 프론트엔드 표시: `알고리즘-스터디`
3. 실제 저장: `study` 또는 `study-1`
4. URL 공유 시: `/study/study-1` (의미 없는 URL)

### 3. 🟡 Major: N+1 쿼리 문제

#### 현재 로직의 성능 이슈
```java
while (studyService.getStudyBySlug(candidate).isPresent() || 
       studyDetailPageService.existsBySlug(candidate)) {
    candidate = base + "-" + suffix++;
    // 매 반복마다 2개의 SELECT 쿼리 실행
}
```

#### 최악의 시나리오
- "study"라는 slug로 100개의 스터디가 이미 존재
- 101번째 생성 시: 200개의 SELECT 쿼리 실행
- 응답 시간: ~2-3초 (네트워크 지연 포함)

### 4. 🟡 Major: Slug 길이 초과 문제

#### 문제 시나리오
```java
// 긴 제목: "2025년 상반기 대학생 및 취업준비생을 위한 알고리즘 문제해결 능력 향상 집중 스터디"
// slugify 결과: "2025-...-" (50자 초과)
// DB 저장 시: 자동 truncate 또는 에러 발생
```

#### 현재 검증 부재
- 애플리케이션 레벨에서 길이 검증 없음
- DB 레벨에서만 50자 제한
- 사용자에게 명확한 에러 메시지 없음

### 5. 🟠 Minor: SEO 최적화 미흡

#### 현재 문제
- 한글 제목 → 의미 없는 slug 변환
- "머신러닝 스터디" → `study-23` (SEO 가치 없음)
- 검색 엔진 최적화 기회 상실

### 6. 🟠 Minor: Slug 수정 기능 부재

#### 현재 제한사항
- 스터디 생성 후 slug 변경 불가
- 오타 수정이나 브랜딩 변경 시 대응 불가
- 마케팅 요구사항 변경 시 유연성 부족

---

## 💡 개선 방안 (우선순위별)

### 🔴 P0: Critical - 즉시 수정 필요

#### 1. Race Condition 해결

**Option A: Pessimistic Locking (추천)**
```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public String generateAndEnsureUniqueSlug(String providedSlug, String title) {
    // 트랜잭션 격리 수준을 높여 동시성 문제 해결
    // ...existing code...
}
```

**Option B: Optimistic Locking with Retry**
```java
@Retryable(
    value = {DataIntegrityViolationException.class},
    maxAttempts = 3,
    backoff = @Backoff(delay = 100)
)
public Study createStudyWithUniqueSlug(StudyCreateRequest request) {
    try {
        String slug = generateAndEnsureUniqueSlug(request.getSlug(), request.getTitle());
        return studyRepository.save(study);
    } catch (DataIntegrityViolationException e) {
        // slug 충돌 시 재시도
        log.warn("Slug collision detected, retrying with new suffix");
        throw e;
    }
}
```

**Option C: Database Sequence 활용**
```sql
-- slug_sequence 테이블 생성
CREATE TABLE slug_sequences (
    base_slug VARCHAR(45) PRIMARY KEY,
    next_suffix INT DEFAULT 1
);

-- 스토어드 프로시저
DELIMITER //
CREATE PROCEDURE GetUniqueSlug(IN base_slug VARCHAR(45))
BEGIN
    DECLARE suffix INT;
    
    START TRANSACTION;
    
    -- 존재하지 않으면 삽입
    INSERT IGNORE INTO slug_sequences (base_slug) VALUES (base_slug);
    
    -- suffix 가져오고 증가
    SELECT next_suffix INTO suffix 
    FROM slug_sequences 
    WHERE base_slug = base_slug 
    FOR UPDATE;
    
    UPDATE slug_sequences 
    SET next_suffix = next_suffix + 1 
    WHERE base_slug = base_slug;
    
    COMMIT;
    
    -- 결과 반환
    IF suffix = 1 THEN
        SELECT base_slug AS unique_slug;
    ELSE
        SELECT CONCAT(base_slug, '-', suffix - 1) AS unique_slug;
    END IF;
END//
DELIMITER ;
```

### 🟡 P1: Major - 다음 스프린트

#### 2. 프론트엔드-백엔드 Slug 생성 통일

**통합 정규식 (한글 지원)**
```java
// Backend - 한글 지원 추가
private String slugify(String input) {
    String s = input == null ? "study" : input;
    s = s.trim().toLowerCase();
    
    // Unicode 범위 사용하여 한글 보존
    s = s.replaceAll("[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+", "-");
    s = s.replaceAll("-+", "-");
    s = s.replaceAll("^-+|-+$", "");
    
    // 빈 문자열 처리
    if (s.isBlank()) {
        s = "study-" + System.currentTimeMillis();
    }
    
    // 길이 제한
    if (s.length() > 45) {
        s = s.substring(0, 45);
        // 마지막 단어가 잘리지 않도록
        int lastDash = s.lastIndexOf('-');
        if (lastDash > 35) {
            s = s.substring(0, lastDash);
        }
    }
    
    return s;
}
```

**공통 라이브러리 생성**
```typescript
// shared/slugUtils.ts
export const slugifyRules = {
    maxLength: 45,
    allowedChars: /[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/g,
    defaultPrefix: 'study'
};

export function generateSlug(input: string): string {
    let slug = input
        .trim()
        .toLowerCase()
        .replace(slugifyRules.allowedChars, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    if (!slug) {
        slug = `${slugifyRules.defaultPrefix}-${Date.now()}`;
    }
    
    if (slug.length > slugifyRules.maxLength) {
        slug = slug.substring(0, slugifyRules.maxLength);
        const lastDash = slug.lastIndexOf('-');
        if (lastDash > 35) {
            slug = slug.substring(0, lastDash);
        }
    }
    
    return slug;
}
```

#### 3. 성능 최적화 - Batch 조회

**현재 N+1 문제 해결**
```java
public String generateAndEnsureUniqueSlug(String providedSlug, String title) {
    String base = (providedSlug != null && !providedSlug.isBlank()) 
        ? providedSlug : slugify(title);
    
    // 한 번의 쿼리로 기존 slugs 조회
    List<String> existingSlugs = studyRepository.findSlugsByPattern(base + "%");
    Set<String> slugSet = new HashSet<>(existingSlugs);
    
    // StudyDetailPage slugs도 한 번에 조회
    slugSet.addAll(studyDetailPageRepository.findSlugsByPattern(base + "%"));
    
    // 메모리에서 체크
    String candidate = base;
    int suffix = 1;
    while (slugSet.contains(candidate)) {
        candidate = base + "-" + suffix++;
    }
    
    return candidate;
}

// Repository 메서드 추가
@Query("SELECT s.slug FROM StudyJpaEntity s WHERE s.slug LIKE :pattern")
List<String> findSlugsByPattern(@Param("pattern") String pattern);
```

### 🟠 P2: Minor - 백로그

#### 4. Slug 변경 기능 추가

**API 엔드포인트**
```java
@PatchMapping("/{studyId}/slug")
@RequireAuth(roles = {Role.ADMIN})
public ApiResponse<StudyResponse> updateSlug(
    @PathVariable UUID studyId,
    @RequestBody @Valid SlugUpdateRequest request
) {
    // 기존 스터디 조회
    Study study = studyService.findById(studyId);
    
    // 권한 체크 (관리자 또는 스터디 생성자)
    if (!isAdmin() && !study.getProposerId().equals(getCurrentUserId())) {
        throw new ForbiddenException("Slug 변경 권한이 없습니다");
    }
    
    // 새 slug 생성 및 고유성 확인
    String newSlug = generateAndEnsureUniqueSlug(request.getSlug(), null);
    
    // 리다이렉트 설정 (SEO 유지)
    slugRedirectService.createRedirect(study.getSlug(), newSlug);
    
    // 업데이트
    study.updateSlug(newSlug);
    return ApiResponse.success(studyWebMapper.toResponse(study));
}
```

**리다이렉트 테이블**
```sql
CREATE TABLE slug_redirects (
    old_slug VARCHAR(50) PRIMARY KEY,
    new_slug VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_new_slug (new_slug)
);
```

#### 5. Slug 검증 강화

**Validation 어노테이션 생성**
```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SlugValidator.class)
public @interface ValidSlug {
    String message() default "올바르지 않은 slug 형식입니다";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    
    int maxLength() default 50;
    boolean allowKorean() default true;
}

public class SlugValidator implements ConstraintValidator<ValidSlug, String> {
    private int maxLength;
    private boolean allowKorean;
    
    @Override
    public void initialize(ValidSlug constraintAnnotation) {
        this.maxLength = constraintAnnotation.maxLength();
        this.allowKorean = constraintAnnotation.allowKorean();
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;
        
        if (value.length() > maxLength) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                String.format("Slug는 %d자를 초과할 수 없습니다", maxLength)
            ).addConstraintViolation();
            return false;
        }
        
        String pattern = allowKorean 
            ? "^[a-z0-9가-힣][a-z0-9가-힣-]*[a-z0-9가-힣]$"
            : "^[a-z0-9][a-z0-9-]*[a-z0-9]$";
            
        if (!value.matches(pattern)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Slug는 영문 소문자, 숫자" + 
                (allowKorean ? ", 한글" : "") + 
                "와 하이픈(-)만 사용 가능합니다"
            ).addConstraintViolation();
            return false;
        }
        
        return true;
    }
}
```

**DTO에 적용**
```java
public record StudyCreateRequest(
    @NotBlank String title,
    @ValidSlug(maxLength = 45, allowKorean = true)
    String slug,
    // ... other fields
) {}
```

#### 6. SEO 최적화

**메타데이터 자동 생성**
```java
@Component
public class SlugMetadataGenerator {
    
    public StudyMetadata generateMetadata(Study study) {
        return StudyMetadata.builder()
            .canonicalUrl("/study/" + study.getSlug())
            .title(study.getTitle() + " | AsyncSite")
            .description(study.getTagline())
            .keywords(extractKeywords(study))
            .ogImage(generateOgImage(study))
            .structuredData(generateJsonLd(study))
            .build();
    }
    
    private List<String> extractKeywords(Study study) {
        // title과 tagline에서 키워드 추출
        Set<String> keywords = new HashSet<>();
        
        // 한글 형태소 분석
        if (containsKorean(study.getTitle())) {
            keywords.addAll(koreanAnalyzer.analyze(study.getTitle()));
        }
        
        // 영문 단어 추출
        keywords.addAll(Arrays.asList(
            study.getTitle().toLowerCase().split("\\s+")
        ));
        
        // 스터디 타입 추가
        keywords.add(study.getType().toString().toLowerCase());
        
        return new ArrayList<>(keywords);
    }
    
    private String generateJsonLd(Study study) {
        return """
            {
              "@context": "https://schema.org",
              "@type": "Course",
              "name": "%s",
              "description": "%s",
              "provider": {
                "@type": "Organization",
                "name": "AsyncSite"
              },
              "url": "https://asyncsite.com/study/%s"
            }
            """.formatted(
                study.getTitle(),
                study.getTagline(),
                study.getSlug()
            );
    }
}
```

---

## 📊 영향도 분석 및 리스크 평가

### 변경 영향 범위

| 컴포넌트 | 영향도 | 변경 필요 사항 | 리스크 |
|---------|--------|---------------|---------|
| Study Service | 높음 | Slug 생성 로직 개선 | 기존 데이터 마이그레이션 |
| StudyDetailPage Service | 중간 | Slug 참조 로직 수정 | 페이지 URL 변경 |
| Frontend (React) | 높음 | Slug 생성 통일 | 사용자 경험 변화 |
| Gateway | 낮음 | 리다이렉트 처리 추가 | 라우팅 복잡도 증가 |
| Database | 중간 | 인덱스 최적화 | 성능 영향 |
| SEO | 높음 | URL 구조 변경 | 검색 순위 영향 |

### 마이그레이션 전략

#### Phase 1: 하위 호환성 유지 (1주)
```sql
-- 기존 slug 백업
ALTER TABLE studies ADD COLUMN legacy_slug VARCHAR(50);
UPDATE studies SET legacy_slug = slug WHERE slug IS NOT NULL;

-- 리다이렉트 설정
INSERT INTO slug_redirects (old_slug, new_slug)
SELECT legacy_slug, slug FROM studies 
WHERE legacy_slug != slug;
```

#### Phase 2: 점진적 마이그레이션 (2-3주)
```java
@Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시
public void migrateOldSlugs() {
    Pageable pageable = PageRequest.of(0, 100);
    Page<Study> studies;
    
    do {
        studies = studyRepository.findBySlugPattern("study-%", pageable);
        
        for (Study study : studies) {
            try {
                String newSlug = generateMeaningfulSlug(study);
                study.updateSlug(newSlug);
                studyRepository.save(study);
                
                // 리다이렉트 설정
                redirectService.createRedirect(study.getLegacySlug(), newSlug);
                
                log.info("Migrated slug: {} -> {}", study.getLegacySlug(), newSlug);
            } catch (Exception e) {
                log.error("Failed to migrate study {}: {}", study.getId(), e.getMessage());
            }
        }
        
        pageable = pageable.next();
    } while (studies.hasNext());
}
```

#### Phase 3: 정리 (1주 후)
```sql
-- legacy_slug 컬럼 제거
ALTER TABLE studies DROP COLUMN legacy_slug;

-- 오래된 리다이렉트 정리 (6개월 이상)
DELETE FROM slug_redirects 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

---

## 📈 모니터링 및 메트릭

### 추가해야 할 메트릭

```java
@Component
public class SlugMetrics {
    private final MeterRegistry meterRegistry;
    
    // Slug 생성 시도 횟수
    public void recordSlugGenerationAttempt(String baseSlug, int suffixUsed) {
        meterRegistry.counter("slug.generation.attempts",
            "base", baseSlug,
            "suffix", String.valueOf(suffixUsed)
        ).increment();
    }
    
    // Slug 충돌 발생 횟수
    public void recordSlugCollision(String slug) {
        meterRegistry.counter("slug.collisions",
            "slug", slug
        ).increment();
    }
    
    // Slug 생성 소요 시간
    public void recordSlugGenerationTime(long milliseconds) {
        meterRegistry.timer("slug.generation.time")
            .record(milliseconds, TimeUnit.MILLISECONDS);
    }
    
    // 한글 slug 사용 비율
    public void recordKoreanSlugUsage(boolean hasKorean) {
        meterRegistry.counter("slug.korean.usage",
            "has_korean", String.valueOf(hasKorean)
        ).increment();
    }
}
```

### 알람 설정

```yaml
# prometheus-rules.yml
groups:
  - name: slug_alerts
    rules:
      - alert: HighSlugCollisionRate
        expr: rate(slug_collisions_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "높은 Slug 충돌률 감지"
          description: "5분간 Slug 충돌률이 10%를 초과했습니다."
      
      - alert: SlowSlugGeneration
        expr: slug_generation_time_seconds{quantile="0.99"} > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slug 생성 지연"
          description: "Slug 생성이 1초 이상 소요되고 있습니다."
```

---

## ✅ 구현 체크리스트

### 즉시 수정 (P0)
- [ ] Race condition 해결을 위한 트랜잭션 격리 수준 조정
- [ ] DataIntegrityViolationException 예외 처리 추가
- [ ] Slug 길이 검증 로직 추가

### 1차 스프린트 (P1)
- [ ] 프론트엔드-백엔드 slug 생성 로직 통일
- [ ] 한글 지원 추가
- [ ] 성능 최적화 (batch 조회)
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성

### 2차 스프린트 (P2)
- [ ] Slug 변경 API 구현
- [ ] 리다이렉트 시스템 구축
- [ ] SEO 메타데이터 자동 생성
- [ ] 모니터링 메트릭 추가
- [ ] 문서화 업데이트

### 3차 스프린트 (P3)
- [ ] 기존 데이터 마이그레이션
- [ ] A/B 테스트 실행
- [ ] 성능 벤치마크
- [ ] 사용자 피드백 수집

---

## 📚 참고 자료

### 관련 파일
- **Backend**
  - `/study-service/src/main/java/com/asyncsite/studyservice/study/application/service/StudyUseCaseImpl.java`
  - `/study-service/src/main/java/com/asyncsite/studyservice/study/adapter/out/persistence/entity/StudyJpaEntity.java`
  - `/study-service/src/main/java/com/asyncsite/studyservice/study/domain/port/out/StudyRepository.java`

- **Frontend**
  - `/web/src/pages/StudyProposalPage.tsx`
  - `/web/src/pages/StudyProposalPageV2.tsx`
  - `/web/src/api/studyService.ts`

### 외부 참고
- [Slug 생성 Best Practices](https://stackoverflow.com/questions/19335215/what-is-a-slug)
- [Unicode 정규화 in Java](https://docs.oracle.com/javase/tutorial/i18n/text/normalizerapi.html)
- [SEO-friendly URLs](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [MySQL Collation 가이드](https://dev.mysql.com/doc/refman/8.0/en/charset-unicode-sets.html)

### 벤치마크
- **GitHub**: `username/repository-name` 형식
- **Medium**: 제목 + 랜덤 해시 (e.g., `title-here-3b4c5d6e`)
- **Dev.to**: 제목 + 사용자ID + 랜덤 (e.g., `title-username-4a3b`)
- **WordPress**: 자동 생성 + 수동 편집 가능

---

## 🎯 예상 효과

### 정량적 효과
- **성능 개선**: Slug 생성 시간 80% 단축 (2초 → 0.4초)
- **에러율 감소**: DataIntegrityViolation 에러 100% 제거
- **SEO 향상**: 의미있는 URL로 CTR 15-20% 증가 예상

### 정성적 효과
- **사용자 경험**: 예측 가능한 URL 생성
- **개발자 경험**: 명확한 에러 메시지와 로깅
- **유지보수성**: 체계적인 slug 관리 시스템

---

## 📝 결론 및 다음 단계

### 핵심 요약
1. **현재 시스템은 기본적인 고유성은 보장**하나 여러 개선점 존재
2. **Race condition은 즉시 수정**이 필요한 critical 이슈
3. **한글 지원과 성능 최적화**는 사용자 경험 향상에 필수

### 즉시 조치 사항
1. **오늘**: Race condition 수정 PR 작성
2. **이번 주**: 한글 지원 논의 및 결정
3. **다음 주**: 성능 최적화 구현

### 장기 로드맵
- **Q3 2025**: 완전한 다국어 slug 지원
- **Q4 2025**: AI 기반 slug 추천 시스템
- **Q1 2026**: 사용자 커스텀 slug 규칙 설정

---

**문서 작성**: AsyncSite Development Team  
**최종 검토**: 2025-08-13  
**다음 리뷰**: 2025-09-01

> 💡 **Note**: 이 문서는 지속적으로 업데이트되며, 구현 진행 상황에 따라 내용이 변경될 수 있습니다.