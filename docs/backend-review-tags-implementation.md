# 백엔드 리뷰 태그 시스템 구현 가이드

## 🎯 구현 요구사항

리뷰 시스템에 태그 기능을 추가하여 사용자가 리뷰 작성 시 미리 정의된 태그를 선택할 수 있도록 구현합니다.

## 📋 데이터베이스 설계

### 1. 이모지 지원을 위한 DB 설정

#### MySQL의 경우:
```sql
-- 데이터베이스 문자셋 설정
ALTER DATABASE your_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 테이블 문자셋 설정
ALTER TABLE review_tags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### PostgreSQL의 경우:
- 기본적으로 UTF-8 지원, 별도 설정 불필요

### 2. 테이블 구조

```sql
-- 태그 정의 테이블
CREATE TABLE review_tags (
    id VARCHAR(50) PRIMARY KEY,  -- 예: COMFORTABLE_ATMOSPHERE
    category VARCHAR(30) NOT NULL,
    label VARCHAR(50) NOT NULL,
    emoji VARCHAR(10),  -- 이모지 저장
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 리뷰-태그 매핑 테이블
CREATE TABLE review_tag_mappings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id),
    FOREIGN KEY (tag_id) REFERENCES review_tags(id),
    UNIQUE KEY unique_review_tag (review_id, tag_id)
);

-- 태그 사용 통계 테이블 (선택적)
CREATE TABLE tag_statistics (
    tag_id VARCHAR(50) PRIMARY KEY,
    usage_count BIGINT DEFAULT 0,
    last_used_at TIMESTAMP,
    FOREIGN KEY (tag_id) REFERENCES review_tags(id)
);
```

## 💻 Java/Spring Boot 구현

### 1. Enum 정의

```java
package com.asyncsite.review.domain;

public enum ReviewTagCategory {
    ATMOSPHERE("분위기"),
    LEARNING("학습 효과"),
    MENTORING("멘토링"),
    COMMUNITY("커뮤니티"),
    GROWTH("성장"),
    PRACTICAL("실무"),
    DIFFICULTY("난이도"),
    ORGANIZATION("운영");

    private final String koreanLabel;

    ReviewTagCategory(String koreanLabel) {
        this.koreanLabel = koreanLabel;
    }

    public String getKoreanLabel() {
        return koreanLabel;
    }
}
```

### 2. Entity 클래스

```java
package com.asyncsite.review.domain;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "review_tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewTag {
    
    @Id
    @Column(length = 50)
    private String id;  // COMFORTABLE_ATMOSPHERE
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReviewTagCategory category;
    
    @Column(nullable = false, length = 50)
    private String label;  // "편안한 분위기"
    
    @Column(length = 10)
    private String emoji;  // "😌"
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### 3. 태그 초기화 서비스

```java
package com.asyncsite.review.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewTagInitializer implements CommandLineRunner {
    
    private final ReviewTagRepository tagRepository;
    
    @Override
    public void run(String... args) {
        initializeTags();
    }
    
    private void initializeTags() {
        // 태그가 이미 존재하는지 확인
        if (tagRepository.count() > 0) {
            return;
        }
        
        // ATMOSPHERE 카테고리
        saveTag("COMFORTABLE_ATMOSPHERE", ReviewTagCategory.ATMOSPHERE, 
                "편안한 분위기", "😌", "부담 없이 편안하게 참여할 수 있어요", 1);
        saveTag("EXCITING_ATMOSPHERE", ReviewTagCategory.ATMOSPHERE, 
                "활기찬 분위기", "🎉", "에너지 넘치고 즐거운 분위기예요", 2);
        saveTag("WARM_ATMOSPHERE", ReviewTagCategory.ATMOSPHERE, 
                "따뜻한 분위기", "🤗", "서로 배려하고 존중하는 분위기예요", 3);
        
        // LEARNING 카테고리
        saveTag("DEEP_LEARNING", ReviewTagCategory.LEARNING, 
                "깊이 있는 학습", "🧠", "개념을 깊이 있게 이해할 수 있어요", 1);
        saveTag("PRACTICAL_LEARNING", ReviewTagCategory.LEARNING, 
                "실전적인 학습", "💪", "실무에 바로 적용 가능한 내용이에요", 2);
        
        // ... 나머지 태그들도 동일하게 추가
    }
    
    private void saveTag(String id, ReviewTagCategory category, 
                        String label, String emoji, String description, int order) {
        ReviewTag tag = ReviewTag.builder()
            .id(id)
            .category(category)
            .label(label)
            .emoji(emoji)
            .description(description)
            .displayOrder(order)
            .isActive(true)
            .createdAt(LocalDateTime.now())
            .build();
        
        tagRepository.save(tag);
    }
}
```

### 4. Review Entity 수정

```java
@Entity
@Table(name = "reviews")
public class Review {
    // ... 기존 필드들
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "review_tag_mappings",
        joinColumns = @JoinColumn(name = "review_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<ReviewTag> tags = new HashSet<>();
    
    // 태그 추가/제거 메서드
    public void addTag(ReviewTag tag) {
        this.tags.add(tag);
    }
    
    public void removeTag(ReviewTag tag) {
        this.tags.remove(tag);
    }
    
    public void setTags(Set<ReviewTag> tags) {
        this.tags.clear();
        this.tags.addAll(tags);
    }
}
```

### 5. DTO 클래스

```java
package com.asyncsite.review.dto;

import lombok.Data;
import lombok.Builder;
import java.util.List;

@Data
@Builder
public class ReviewTagDto {
    private String id;
    private String category;
    private String label;
    private String emoji;
    private String description;
}

@Data
@Builder
public class ReviewCreateRequest {
    private String studyId;
    private String title;
    private String content;
    private Integer rating;
    private List<String> tagIds;  // 선택한 태그 ID 목록
}

@Data
@Builder
public class ReviewResponse {
    // ... 기존 필드들
    private List<ReviewTagDto> tags;  // 태그 정보 포함
}
```

### 6. 태그 관련 API 엔드포인트

```java
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    private final ReviewTagService tagService;
    
    // 사용 가능한 모든 태그 조회
    @GetMapping("/tags")
    public ResponseEntity<Map<String, List<ReviewTagDto>>> getAvailableTags() {
        Map<String, List<ReviewTagDto>> tagsByCategory = tagService.getTagsGroupedByCategory();
        return ResponseEntity.ok(tagsByCategory);
    }
    
    // 인기 태그 조회
    @GetMapping("/tags/popular")
    public ResponseEntity<List<ReviewTagDto>> getPopularTags(
            @RequestParam(defaultValue = "10") int limit) {
        List<ReviewTagDto> popularTags = tagService.getPopularTags(limit);
        return ResponseEntity.ok(popularTags);
    }
    
    // 리뷰 생성 (태그 포함)
    @PostMapping("/studies/{studyId}")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable String studyId,
            @RequestBody @Valid ReviewCreateRequest request) {
        
        // 태그 유효성 검증
        if (request.getTagIds() != null && request.getTagIds().size() > 5) {
            throw new BadRequestException("최대 5개의 태그만 선택할 수 있습니다.");
        }
        
        ReviewResponse response = reviewService.createReview(studyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // 특정 스터디의 태그 통계
    @GetMapping("/studies/{studyId}/tag-statistics")
    public ResponseEntity<Map<String, Integer>> getTagStatistics(
            @PathVariable String studyId) {
        Map<String, Integer> statistics = tagService.getTagStatisticsForStudy(studyId);
        return ResponseEntity.ok(statistics);
    }
}
```

### 7. 태그 서비스 구현

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewTagService {
    
    private final ReviewTagRepository tagRepository;
    private final TagStatisticsRepository statisticsRepository;
    
    public Map<String, List<ReviewTagDto>> getTagsGroupedByCategory() {
        List<ReviewTag> allTags = tagRepository.findAllByIsActiveTrue();
        
        return allTags.stream()
            .collect(Collectors.groupingBy(
                tag -> tag.getCategory().name(),
                Collectors.mapping(this::toDto, Collectors.toList())
            ));
    }
    
    public List<ReviewTagDto> getPopularTags(int limit) {
        return statisticsRepository.findTopByOrderByUsageCountDesc(PageRequest.of(0, limit))
            .stream()
            .map(stat -> toDto(stat.getTag()))
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void incrementTagUsage(String tagId) {
        TagStatistics stats = statisticsRepository.findById(tagId)
            .orElseGet(() -> TagStatistics.builder()
                .tagId(tagId)
                .usageCount(0L)
                .build());
        
        stats.setUsageCount(stats.getUsageCount() + 1);
        stats.setLastUsedAt(LocalDateTime.now());
        statisticsRepository.save(stats);
    }
    
    private ReviewTagDto toDto(ReviewTag tag) {
        return ReviewTagDto.builder()
            .id(tag.getId())
            .category(tag.getCategory().name())
            .label(tag.getLabel())
            .emoji(tag.getEmoji())
            .description(tag.getDescription())
            .build();
    }
}
```

## 🔧 Spring Boot 설정

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/asyncsite?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Seoul
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      connection-init-sql: "SET NAMES utf8mb4"
  
  jpa:
    properties:
      hibernate:
        connection:
          charset: utf8mb4
          characterEncoding: utf8mb4
          useUnicode: true
```

## 📊 태그 통계 및 분석

```java
@Repository
public interface ReviewTagStatisticsRepository extends JpaRepository<TagStatistics, String> {
    
    // 스터디별 태그 사용 통계
    @Query("""
        SELECT rt.id as tagId, rt.label as tagLabel, COUNT(r.id) as count
        FROM Review r
        JOIN r.tags rt
        WHERE r.studyId = :studyId
        GROUP BY rt.id, rt.label
        ORDER BY COUNT(r.id) DESC
    """)
    List<TagStatisticsProjection> getTagStatisticsByStudy(@Param("studyId") String studyId);
    
    // 카테고리별 인기 태그
    @Query("""
        SELECT rt
        FROM ReviewTag rt
        LEFT JOIN TagStatistics ts ON rt.id = ts.tagId
        WHERE rt.category = :category AND rt.isActive = true
        ORDER BY COALESCE(ts.usageCount, 0) DESC
    """)
    List<ReviewTag> findPopularTagsByCategory(@Param("category") ReviewTagCategory category, Pageable pageable);
}
```

## ✅ 구현 체크리스트

- [ ] 데이터베이스 UTF-8mb4 설정
- [ ] 태그 정의 테이블 생성
- [ ] ReviewTag Entity 구현
- [ ] 태그 초기 데이터 입력
- [ ] Review Entity에 태그 관계 추가
- [ ] 태그 선택 API 구현
- [ ] 태그 통계 API 구현
- [ ] 태그 유효성 검증 (최대 5개, 카테고리당 2개)
- [ ] 인기 태그 집계 스케줄러
- [ ] 태그 기반 리뷰 필터링 API

## 🎨 프론트엔드 연동

프론트엔드는 `/src/types/reviewTags.ts`에 정의된 구조를 사용하여:
1. 리뷰 작성 시 태그 선택 UI 제공
2. 카테고리별 그룹핑된 태그 표시
3. 선택된 태그를 이모지와 함께 표시
4. 태그 클라우드 또는 인기 태그 표시