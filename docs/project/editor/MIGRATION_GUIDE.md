# Editor Integration 마이그레이션 가이드

## 1. 개요

기존 Plain Text 기반의 콘텐츠를 Rich Text Editor 형식으로 마이그레이션하는 가이드입니다.

## 2. 마이그레이션 대상

### 2.1 User Service
- `users.bio` - 사용자 자기소개 (현재: VARCHAR/TEXT)
- 예상 레코드 수: ~1,000개

### 2.2 Study Service
- `studies.description` - 스터디 간단 설명 (현재: VARCHAR)
- `studies.details` - 스터디 상세 설명 (신규 필드)
- `studies.rules` - 스터디 규칙 (현재: TEXT)
- 예상 레코드 수: ~500개

## 3. 마이그레이션 전략

### 3.1 단계별 접근
```
Phase 1: 스키마 확장 (비파괴적)
  ↓
Phase 2: 듀얼 라이팅 (신규 + 기존)
  ↓
Phase 3: 데이터 마이그레이션
  ↓
Phase 4: 읽기 전환
  ↓
Phase 5: 기존 필드 제거
```

## 4. 상세 구현 가이드

### Phase 1: 스키마 확장 (Day 1)

#### User Service
```sql
-- 새로운 컬럼 추가 (기존 데이터 영향 없음)
ALTER TABLE users 
ADD COLUMN bio_rich TEXT,
ADD COLUMN bio_format VARCHAR(20) DEFAULT 'plain',
ADD COLUMN bio_updated_at TIMESTAMP NULL;

-- 인덱스 추가
CREATE INDEX idx_bio_format ON users(bio_format);
```

#### Study Service
```sql
-- 새로운 컬럼 추가
ALTER TABLE studies
ADD COLUMN details TEXT,
ADD COLUMN details_format VARCHAR(20) DEFAULT 'plain',
ADD COLUMN curriculum TEXT,
ADD COLUMN curriculum_format VARCHAR(20) DEFAULT 'plain',
ADD COLUMN content_updated_at TIMESTAMP NULL;

-- 인덱스 추가
CREATE INDEX idx_details_format ON studies(details_format);
```

### Phase 2: 듀얼 라이팅 (Day 2-7)

#### 애플리케이션 코드 수정
```java
// UserService.java
@Transactional
public void updateUserProfile(String userId, ProfileUpdateRequest request) {
    User user = userRepository.findById(userId);
    
    // 듀얼 라이팅: 기존 필드와 새 필드 모두 업데이트
    if (request.hasBio()) {
        user.setBio(extractPlainText(request.getBio())); // 기존 필드
        user.setBioRich(request.getBio().toJson());      // 새 필드
        user.setBioFormat(request.getBio().getFormat());
        user.setBioUpdatedAt(Instant.now());
    }
    
    userRepository.save(user);
}

private String extractPlainText(RichContent content) {
    // Rich content에서 plain text 추출
    return content.toPlainText();
}
```

### Phase 3: 데이터 마이그레이션 (Day 8-9)

#### 마이그레이션 스크립트
```python
# migrate_content.py
import json
import mysql.connector
from datetime import datetime

def migrate_users_bio(connection):
    cursor = connection.cursor(dictionary=True)
    
    # Plain text 데이터만 선택
    cursor.execute("""
        SELECT email, bio 
        FROM users 
        WHERE bio IS NOT NULL 
        AND bio_format = 'plain'
        LIMIT 100
    """)
    
    for user in cursor:
        # Plain text를 Editor.js 형식으로 변환
        rich_content = convert_to_editorjs(user['bio'])
        
        # 업데이트
        update_cursor = connection.cursor()
        update_cursor.execute("""
            UPDATE users 
            SET bio_rich = %s, 
                bio_format = 'editorjs',
                bio_updated_at = %s
            WHERE email = %s
        """, (json.dumps(rich_content), datetime.now(), user['email']))
    
    connection.commit()

def convert_to_editorjs(plain_text):
    """Plain text를 Editor.js 형식으로 변환"""
    # 줄바꿈 기준으로 paragraph 블록 생성
    paragraphs = plain_text.split('\n\n')
    blocks = []
    
    for para in paragraphs:
        if para.strip():
            blocks.append({
                "type": "paragraph",
                "data": {
                    "text": para.strip()
                }
            })
    
    return {
        "time": int(datetime.now().timestamp() * 1000),
        "blocks": blocks,
        "version": "2.22.2"
    }

def convert_to_tiptap(plain_text):
    """Plain text를 TipTap 형식으로 변환"""
    paragraphs = plain_text.split('\n\n')
    content = []
    
    for para in paragraphs:
        if para.strip():
            content.append({
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": para.strip()
                    }
                ]
            })
    
    return {
        "type": "doc",
        "content": content
    }
```

#### 배치 마이그레이션 작업
```bash
#!/bin/bash
# batch_migration.sh

# 1. 백업 생성
mysqldump -u root -p asyncsite users studies > backup_$(date +%Y%m%d).sql

# 2. 마이그레이션 실행 (배치 단위)
python migrate_content.py --batch-size=100 --dry-run
python migrate_content.py --batch-size=100 --execute

# 3. 검증
mysql -u root -p asyncsite -e "
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN bio_format = 'editorjs' THEN 1 ELSE 0 END) as migrated
    FROM users
    WHERE bio IS NOT NULL;
"
```

### Phase 4: 읽기 전환 (Day 10-14)

#### Feature Flag 적용
```java
// UserController.java
@GetMapping("/api/users/{userId}/profile")
public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String userId) {
    User user = userService.findById(userId);
    
    UserProfileResponse response = new UserProfileResponse();
    response.setUserId(user.getId());
    response.setName(user.getName());
    
    // Feature Flag로 점진적 전환
    if (featureFlags.isEnabled("USE_RICH_TEXT_BIO", userId)) {
        response.setBio(user.getBioRich());
        response.setBioFormat(user.getBioFormat());
    } else {
        response.setBio(user.getBio());
        response.setBioFormat("plain");
    }
    
    return ResponseEntity.ok(response);
}
```

#### Frontend 호환성 레이어
```typescript
// bioRenderer.tsx
interface BioContent {
  format: 'plain' | 'editorjs' | 'tiptap';
  content: string | EditorJSData | TipTapData;
}

export function BioRenderer({ bio }: { bio: BioContent }) {
  switch (bio.format) {
    case 'plain':
      return <PlainTextViewer text={bio.content as string} />;
    case 'editorjs':
      return <EditorJSViewer data={bio.content as EditorJSData} />;
    case 'tiptap':
      return <TipTapViewer data={bio.content as TipTapData} />;
    default:
      return <div>Unsupported format</div>;
  }
}
```

### Phase 5: 기존 필드 제거 (Day 15+)

#### 최종 정리
```sql
-- 1. 모든 데이터가 마이그레이션되었는지 확인
SELECT COUNT(*) FROM users WHERE bio_format = 'plain';
SELECT COUNT(*) FROM studies WHERE details_format = 'plain';

-- 2. 기존 컬럼을 deprecated로 표시
ALTER TABLE users RENAME COLUMN bio TO bio_deprecated;
ALTER TABLE studies RENAME COLUMN description TO description_deprecated;

-- 3. 새 컬럼을 기본 컬럼으로 변경
ALTER TABLE users RENAME COLUMN bio_rich TO bio;

-- 4. 일정 기간 후 deprecated 컬럼 삭제
-- (30일 후 실행)
ALTER TABLE users DROP COLUMN bio_deprecated;
ALTER TABLE studies DROP COLUMN description_deprecated;
```

## 5. 롤백 계획

### 즉시 롤백 (Phase 1-2)
```sql
-- 새로 추가한 컬럼 제거
ALTER TABLE users 
DROP COLUMN bio_rich,
DROP COLUMN bio_format,
DROP COLUMN bio_updated_at;
```

### 데이터 복구 롤백 (Phase 3-4)
```bash
# 백업에서 복구
mysql -u root -p asyncsite < backup_20250106.sql

# 또는 역마이그레이션
python rollback_migration.py --target=plain
```

## 6. 모니터링 및 검증

### 모니터링 메트릭
```sql
-- 마이그레이션 진행 상황
SELECT 
    bio_format,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM users
WHERE bio IS NOT NULL OR bio_rich IS NOT NULL
GROUP BY bio_format;

-- 에러 추적
SELECT 
    DATE(created_at) as date,
    COUNT(*) as error_count
FROM migration_errors
WHERE type = 'CONTENT_CONVERSION'
GROUP BY DATE(created_at);
```

### 데이터 검증
```java
@Component
public class MigrationValidator {
    
    @Scheduled(fixedDelay = 3600000) // 1시간마다
    public void validateMigration() {
        // 1. 데이터 일관성 검증
        List<User> users = userRepository.findUsersWithInconsistentBio();
        if (!users.isEmpty()) {
            log.error("Inconsistent bio data found: {}", users.size());
            alertService.sendAlert("Data inconsistency detected");
        }
        
        // 2. 형식 검증
        List<User> invalidFormat = userRepository.findUsersWithInvalidFormat();
        if (!invalidFormat.isEmpty()) {
            log.error("Invalid format found: {}", invalidFormat.size());
        }
        
        // 3. 성능 메트릭
        double avgLoadTime = performanceMonitor.getAverageLoadTime("bio_render");
        if (avgLoadTime > 2000) { // 2초 이상
            log.warn("Bio rendering performance degradation: {}ms", avgLoadTime);
        }
    }
}
```

## 7. 트러블슈팅

### 일반적인 문제와 해결책

| 문제 | 원인 | 해결책 |
|------|------|--------|
| 마이그레이션 중 데이터 손실 | 변환 로직 오류 | 백업에서 복구 후 재실행 |
| 성능 저하 | 대용량 Rich Text 렌더링 | 페이지네이션, 지연 로딩 적용 |
| 형식 호환성 문제 | 버전 차이 | 버전별 파서 구현 |
| XSS 취약점 | 불충분한 sanitization | DOMPurify 강화 |

### 긴급 대응 절차
1. Feature Flag 즉시 비활성화
2. 캐시 무효화
3. 이전 버전으로 롤백
4. 원인 분석 및 수정
5. 단계별 재배포

## 8. 체크리스트

### 마이그레이션 전
- [ ] 전체 데이터베이스 백업
- [ ] 마이그레이션 스크립트 테스트 (개발 환경)
- [ ] 롤백 절차 문서화
- [ ] 모니터링 대시보드 준비
- [ ] 관련 팀 공지

### 마이그레이션 중
- [ ] 실시간 모니터링
- [ ] 에러 로그 확인
- [ ] 성능 메트릭 추적
- [ ] 사용자 피드백 수집

### 마이그레이션 후
- [ ] 데이터 일관성 검증
- [ ] 성능 벤치마크
- [ ] 사용자 교육 자료 배포
- [ ] 문서 업데이트
- [ ] 사후 분석 (Post-mortem)

## 9. 참고 자료

- [Editor.js 마이그레이션 가이드](https://editorjs.io/migration)
- [TipTap 스키마 버전 관리](https://tiptap.dev/guide/migration)
- [MySQL 온라인 스키마 변경](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl.html)
- [Feature Flag 모범 사례](https://martinfowler.com/articles/feature-toggles.html)

*최종 업데이트: 2025년 1월 6일*