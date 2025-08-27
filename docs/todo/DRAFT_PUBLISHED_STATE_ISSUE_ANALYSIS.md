# DRAFT/PUBLISHED 상태 관리 문제 분석 및 해결 방안

## 📅 문서 작성일
- 2025-08-26
- 작성자: System Analysis

## 🔴 현재 시스템의 핵심 문제

### 1. DRAFT 상태가 실질적으로 존재하지 않음

#### 발견된 사실
- **DB 현황**: `study_detail_pages` 테이블의 모든 레코드가 `PUBLISHED` 상태 (DRAFT: 0개)
- **코드 동작**: 스터디 승인 시 페이지가 생성되고 즉시 `PUBLISHED`로 전환
- **결과**: "저장"과 "발행"이 사실상 동일한 동작

#### 코드 증거
```java
// StudyUseCaseImpl.java:116-118
// 스터디 승인 시 페이지를 즉시 발행
var published = studyDetailPageService.publish(studyId, proposerId);
```

```java
// StudyDetailPage.java:172
public boolean isEditable() {
    return status == PageStatus.DRAFT || status == PageStatus.PUBLISHED;
    // PUBLISHED 상태에서도 편집 가능!
}
```

### 2. 현재 라이프사이클

```
[스터디 제안] 
    ↓
[관리자 승인]
    ↓
[페이지 자동 생성 (DRAFT)]
    ↓ (즉시)
[자동으로 PUBLISHED 전환]  ← 문제의 핵심
    ↓
[모든 섹션 수정이 즉시 라이브 반영]
```

### 3. 리스크

1. **즉시 공개 리스크**: 작업 중인 미완성 콘텐츠가 사용자에게 노출
2. **협업 충돌**: 여러 관리자 동시 편집 시 충돌
3. **버전 관리 불가**: 이전 상태로 롤백 불가능
4. **감사 추적 어려움**: 누가 언제 무엇을 변경했는지 추적 어려움

## 💡 본질적 해결 방안: 버전 관리 시스템 도입

### 설계 원칙
- **MVCC (Multi-Version Concurrency Control)** 개념 적용
- **READ COMMITTED** 격리 수준 시뮬레이션
- **원자적 발행 (Atomic Publishing)** 보장

## 🏗️ 제안하는 아키텍처

### 1. 데이터베이스 스키마 설계

```sql
-- 1. 페이지 메타데이터 테이블
CREATE TABLE study_detail_pages (
    id UUID PRIMARY KEY,
    study_id UUID NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    
    -- 버전 포인터
    published_version_id UUID,  -- 현재 공개된 버전 (NULL 가능 = 미발행)
    draft_version_id UUID,       -- 작업 중인 버전 (NULL 가능 = 편집 없음)
    
    -- 메타데이터
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    first_published_at TIMESTAMP,
    last_published_at TIMESTAMP,
    last_published_by VARCHAR(255),
    
    -- 외래키
    FOREIGN KEY (published_version_id) REFERENCES page_versions(id),
    FOREIGN KEY (draft_version_id) REFERENCES page_versions(id),
    INDEX idx_study_id (study_id),
    INDEX idx_slug (slug)
);

-- 2. 버전 컨텐츠 테이블 (불변 스냅샷)
CREATE TABLE page_versions (
    id UUID PRIMARY KEY,
    page_id UUID NOT NULL,
    
    -- 컨텐츠
    theme JSON NOT NULL,
    sections JSON NOT NULL,
    schema_version VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    
    -- 버전 메타데이터
    version_number INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    commit_message TEXT,  -- 변경 사항 설명
    
    -- 버전 체인
    parent_version_id UUID,  -- 이전 버전 참조
    
    FOREIGN KEY (page_id) REFERENCES study_detail_pages(id),
    FOREIGN KEY (parent_version_id) REFERENCES page_versions(id),
    INDEX idx_page_versions (page_id, version_number DESC),
    UNIQUE KEY uk_page_version (page_id, version_number)
);

-- 3. 변경 이력 테이블 (감사용)
CREATE TABLE page_change_logs (
    id UUID PRIMARY KEY,
    page_id UUID NOT NULL,
    version_id UUID NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'PUBLISH', 'REVERT') NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP NOT NULL,
    details JSON,  -- 변경된 섹션 ID, 필드 등
    
    FOREIGN KEY (page_id) REFERENCES study_detail_pages(id),
    FOREIGN KEY (version_id) REFERENCES page_versions(id),
    INDEX idx_page_logs (page_id, changed_at DESC)
);
```

### 2. 도메인 모델 설계

```java
// 페이지 집합체 루트
@Entity
public class StudyDetailPage {
    @Id
    private UUID id;
    private UUID studyId;
    private String slug;
    
    @OneToOne
    private PageVersion publishedVersion;
    
    @OneToOne  
    private PageVersion draftVersion;
    
    private LocalDateTime firstPublishedAt;
    private LocalDateTime lastPublishedAt;
    private String lastPublishedBy;
    
    // 비즈니스 메서드
    public PageVersion createDraft(String userId) {
        if (draftVersion != null) {
            throw new DraftAlreadyExistsException();
        }
        
        // 발행된 버전이 있으면 그것을 기반으로, 없으면 빈 페이지
        PageVersion base = publishedVersion != null ? 
            publishedVersion.copy() : PageVersion.empty();
            
        this.draftVersion = base.withCreatedBy(userId);
        return this.draftVersion;
    }
    
    public void updateDraft(List<PageSection> sections, String userId) {
        if (draftVersion == null) {
            createDraft(userId);
        }
        draftVersion.updateSections(sections);
    }
    
    public PageVersion publish(String userId, String message) {
        if (draftVersion == null) {
            throw new NoDraftToPublishException();
        }
        
        // 원자적 발행
        PageVersion newPublished = draftVersion.finalize(userId, message);
        
        // 이전 발행본은 히스토리로
        if (publishedVersion != null) {
            publishedVersion.archive();
        }
        
        this.publishedVersion = newPublished;
        this.draftVersion = null;  // 발행 후 draft 클리어
        this.lastPublishedAt = LocalDateTime.now();
        this.lastPublishedBy = userId;
        
        if (this.firstPublishedAt == null) {
            this.firstPublishedAt = this.lastPublishedAt;
        }
        
        return newPublished;
    }
    
    public void discardDraft() {
        this.draftVersion = null;
    }
    
    public PageVersion revertToVersion(UUID versionId, String userId) {
        PageVersion targetVersion = findVersion(versionId);
        this.draftVersion = targetVersion.copy().withCreatedBy(userId);
        return this.draftVersion;
    }
}

// 버전 값 객체
@Entity
public class PageVersion {
    @Id
    private UUID id;
    
    @ManyToOne
    private StudyDetailPage page;
    
    @Type(type = "json")
    private PageTheme theme;
    
    @Type(type = "json")
    private List<PageSection> sections;
    
    private Integer versionNumber;
    private LocalDateTime createdAt;
    private String createdBy;
    private String commitMessage;
    
    @ManyToOne
    private PageVersion parentVersion;
    
    @Enumerated(EnumType.STRING)
    private VersionStatus status;  // DRAFT, PUBLISHED, ARCHIVED
    
    // 불변성 보장
    @PrePersist
    @PreUpdate
    private void preventModification() {
        if (status != VersionStatus.DRAFT) {
            throw new ImmutableVersionException();
        }
    }
}
```

### 3. API 설계

```typescript
// 프론트엔드 API 인터페이스
interface StudyDetailPageAPI {
    // 읽기
    getPublishedPage(slug: string): Promise<PageContent>;  // 공개 페이지
    getDraftPage(studyId: string): Promise<PageContent>;   // 편집 중인 초안
    getPageHistory(studyId: string): Promise<PageVersion[]>;  // 버전 히스토리
    
    // 편집 (draft만 영향)
    createDraft(studyId: string): Promise<void>;
    saveDraft(studyId: string, sections: Section[]): Promise<void>;
    addSection(studyId: string, section: Section): Promise<void>;
    updateSection(studyId: string, sectionId: string, data: any): Promise<void>;
    deleteSection(studyId: string, sectionId: string): Promise<void>;
    reorderSections(studyId: string, sectionIds: string[]): Promise<void>;
    
    // 발행
    publish(studyId: string, message?: string): Promise<void>;
    discardDraft(studyId: string): Promise<void>;
    
    // 버전 관리
    compareVersions(v1: string, v2: string): Promise<VersionDiff>;
    revertToVersion(studyId: string, versionId: string): Promise<void>;
    
    // 협업
    getLock(studyId: string): Promise<EditLock>;  // 편집 잠금
    releaseLock(studyId: string): Promise<void>;
}
```

### 4. 서비스 계층 구현

```java
@Service
@Transactional
public class StudyDetailPageService {
    
    // 공개 페이지 조회 (캐시 적용)
    @Cacheable("published-pages")
    public PageContent getPublishedPage(String slug) {
        StudyDetailPage page = repository.findBySlug(slug)
            .orElseThrow(() -> new PageNotFoundException());
            
        if (page.getPublishedVersion() == null) {
            throw new PageNotPublishedException();
        }
        
        return PageContent.from(page.getPublishedVersion());
    }
    
    // 초안 조회/생성
    public PageContent getDraftPage(UUID studyId, String userId) {
        StudyDetailPage page = repository.findByStudyId(studyId)
            .orElseThrow(() -> new PageNotFoundException());
            
        PageVersion draft = page.getDraftVersion();
        if (draft == null) {
            // 초안이 없으면 자동 생성
            draft = page.createDraft(userId);
            repository.save(page);
        }
        
        return PageContent.from(draft);
    }
    
    // 섹션 업데이트 (draft만 영향)
    public void updateSection(UUID studyId, String sectionId, 
                             SectionData data, String userId) {
        StudyDetailPage page = repository.findByStudyId(studyId)
            .orElseThrow(() -> new PageNotFoundException());
            
        // 편집 권한 확인
        validateEditPermission(page, userId);
        
        // 낙관적 잠금으로 동시성 제어
        try {
            page.updateDraft(sections -> {
                sections.stream()
                    .filter(s -> s.getId().equals(sectionId))
                    .findFirst()
                    .ifPresent(s -> s.updateData(data));
            }, userId);
            
            repository.save(page);
            
            // 변경 이벤트 발행 (웹소켓 실시간 협업용)
            eventPublisher.publish(new SectionUpdatedEvent(
                studyId, sectionId, userId
            ));
            
        } catch (OptimisticLockException e) {
            throw new ConcurrentEditException(
                "다른 사용자가 동시에 편집 중입니다."
            );
        }
    }
    
    // 발행 (원자적 처리)
    @CacheEvict(value = "published-pages", key = "#studyId")
    public void publish(UUID studyId, String userId, String message) {
        StudyDetailPage page = repository.findByStudyId(studyId)
            .orElseThrow(() -> new PageNotFoundException());
            
        // 권한 확인 (스터디 리더 또는 관리자)
        validatePublishPermission(page, userId);
        
        // 발행 전 검증
        validateBeforePublish(page);
        
        // 트랜잭션 내에서 원자적 발행
        PageVersion published = page.publish(userId, message);
        repository.save(page);
        
        // 감사 로그
        auditService.logPublish(page, published, userId);
        
        // 발행 알림
        notificationService.notifyPublished(page.getStudyId());
    }
    
    // 버전 비교
    public VersionDiff compareVersions(UUID versionId1, UUID versionId2) {
        PageVersion v1 = versionRepository.findById(versionId1).orElseThrow();
        PageVersion v2 = versionRepository.findById(versionId2).orElseThrow();
        
        return VersionDiff.between(v1, v2);
    }
    
    // 편집 잠금 (분산 환경 대응)
    @RedisLock(key = "#studyId", timeout = 300)  // 5분 타임아웃
    public EditLock acquireEditLock(UUID studyId, String userId) {
        return EditLock.create(studyId, userId);
    }
}
```

### 5. 프론트엔드 구현

```typescript
// StudyManagementPage.tsx
const StudyManagementPage: React.FC = () => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [publishedPage, setPublishedPage] = useState<PageContent>();
    const [draftPage, setDraftPage] = useState<PageContent>();
    const [hasChanges, setHasChanges] = useState(false);
    const [editLock, setEditLock] = useState<EditLock>();
    
    // 페이지 로드
    useEffect(() => {
        // 공개 버전과 초안 모두 로드
        Promise.all([
            api.getPublishedPage(slug),
            api.getDraftPage(studyId)
        ]).then(([published, draft]) => {
            setPublishedPage(published);
            setDraftPage(draft);
            
            // 변경사항 감지
            setHasChanges(!isEqual(published, draft));
        });
    }, [studyId]);
    
    // 편집 모드 진입
    const enterEditMode = async () => {
        try {
            // 편집 잠금 획득
            const lock = await api.getLock(studyId);
            setEditLock(lock);
            setMode('edit');
            
            // 초안이 없으면 생성
            if (!draftPage) {
                await api.createDraft(studyId);
                const draft = await api.getDraftPage(studyId);
                setDraftPage(draft);
            }
        } catch (error) {
            if (error.code === 'LOCK_TAKEN') {
                alert(`${error.lockedBy}님이 편집 중입니다.`);
            }
        }
    };
    
    // 섹션 저장 (초안에만 저장)
    const saveSection = async (sectionId: string, data: any) => {
        await api.updateSection(studyId, sectionId, data);
        const updatedDraft = await api.getDraftPage(studyId);
        setDraftPage(updatedDraft);
        setHasChanges(true);
        
        toast.success('초안에 저장되었습니다');
    };
    
    // 발행
    const handlePublish = async () => {
        const message = prompt('변경 사항을 설명해주세요:');
        
        try {
            await api.publish(studyId, message);
            
            // 발행 후 상태 업데이트
            const published = await api.getPublishedPage(slug);
            setPublishedPage(published);
            setDraftPage(null);
            setHasChanges(false);
            
            toast.success('성공적으로 발행되었습니다!');
        } catch (error) {
            toast.error('발행 실패: ' + error.message);
        }
    };
    
    // 초안 폐기
    const handleDiscard = async () => {
        if (!confirm('모든 변경사항을 폐기하시겠습니까?')) return;
        
        await api.discardDraft(studyId);
        setDraftPage(null);
        setHasChanges(false);
    };
    
    // UI 렌더링
    return (
        <div>
            {/* 상태 표시 */}
            <StatusBar>
                {hasChanges && (
                    <Badge variant="warning">
                        미발행 변경사항 있음
                    </Badge>
                )}
                {editLock && (
                    <Badge variant="info">
                        편집 중: {editLock.userId}
                    </Badge>
                )}
            </StatusBar>
            
            {/* 액션 버튼 */}
            <ActionBar>
                {mode === 'view' ? (
                    <Button onClick={enterEditMode}>편집 모드</Button>
                ) : (
                    <>
                        <Button onClick={handleDiscard} variant="ghost">
                            변경사항 폐기
                        </Button>
                        <Button onClick={handlePublish} variant="primary">
                            발행하기
                        </Button>
                    </>
                )}
            </ActionBar>
            
            {/* 페이지 렌더링 */}
            {mode === 'view' ? (
                <PageViewer content={publishedPage} />
            ) : (
                <PageEditor 
                    content={draftPage}
                    onSaveSection={saveSection}
                />
            )}
            
            {/* 변경사항 비교 */}
            {hasChanges && (
                <DiffViewer 
                    before={publishedPage}
                    after={draftPage}
                />
            )}
        </div>
    );
};
```

### 6. 마이그레이션 전략

```sql
-- 1단계: 새 테이블 생성
CREATE TABLE page_versions (...);
CREATE TABLE page_change_logs (...);

-- 2단계: 기존 데이터 마이그레이션
INSERT INTO page_versions (id, page_id, theme, sections, version_number, ...)
SELECT 
    UUID() as id,
    id as page_id,
    theme,
    sections,
    1 as version_number,
    created_at,
    created_by,
    'Initial migration' as commit_message,
    NULL as parent_version_id,
    'PUBLISHED' as status
FROM study_detail_pages
WHERE status = 'PUBLISHED';

-- 3단계: 페이지 테이블 업데이트
ALTER TABLE study_detail_pages 
ADD COLUMN published_version_id UUID,
ADD COLUMN draft_version_id UUID;

UPDATE study_detail_pages p
SET published_version_id = (
    SELECT id FROM page_versions v 
    WHERE v.page_id = p.id AND v.status = 'PUBLISHED'
    LIMIT 1
);

-- 4단계: 기존 컬럼 제거 (점진적)
-- ALTER TABLE study_detail_pages DROP COLUMN theme, sections;
```

### 7. 성능 최적화

1. **캐싱 전략**
   - Redis 캐시: 발행된 페이지는 5분간 캐시
   - CDN: 정적 리소스는 CloudFront 활용
   - 브라우저 캐시: ETag 기반 조건부 요청

2. **쿼리 최적화**
   - 인덱스: `(page_id, version_number)` 복합 인덱스
   - 지연 로딩: 섹션 컨텐츠는 필요시에만 로드
   - 배치 처리: 여러 섹션 업데이트는 한 트랜잭션으로

3. **동시성 제어**
   - 낙관적 잠금: 버전 번호 기반 충돌 감지
   - 분산 잠금: Redis 기반 편집 잠금
   - 이벤트 소싱: 변경 이벤트 스트림으로 실시간 동기화

### 8. 보안 고려사항

1. **권한 검증**
   - 편집 권한: 스터디 리더, 관리자
   - 발행 권한: 스터디 리더, 관리자
   - 히스토리 조회: 스터디 멤버

2. **감사 추적**
   - 모든 변경사항 로깅
   - 발행 이력 보존
   - 접근 로그 기록

3. **데이터 무결성**
   - 발행된 버전은 불변
   - 체크섬으로 변조 감지
   - 정기 백업

## 📊 기대 효과

1. **안전한 편집**: 초안 작업이 라이브에 영향 없음
2. **원자적 발행**: 모든 변경사항이 한 번에 반영
3. **버전 관리**: 이전 버전으로 롤백 가능
4. **협업 지원**: 동시 편집 충돌 방지
5. **감사 추적**: 완벽한 변경 이력 관리

## 🚀 구현 로드맵

### Phase 1 (2주)
- [ ] 데이터베이스 스키마 생성
- [ ] 도메인 모델 구현
- [ ] 기본 CRUD API 구현

### Phase 2 (2주)
- [ ] 마이그레이션 스크립트 작성
- [ ] 프론트엔드 통합
- [ ] 테스트 환경 구축

### Phase 3 (1주)
- [ ] 성능 테스트 및 최적화
- [ ] 보안 감사
- [ ] 운영 배포

### Phase 4 (1주)
- [ ] 모니터링 설정
- [ ] 사용자 교육
- [ ] 피드백 수렴 및 개선

## 📚 참고 자료

- [PostgreSQL MVCC Documentation](https://www.postgresql.org/docs/current/mvcc.html)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Optimistic Locking in JPA](https://www.baeldung.com/jpa-optimistic-locking)
- [Redis Distributed Locks](https://redis.io/docs/manual/patterns/distributed-locks/)

## 🔄 업데이트 이력

- 2025-08-26: 완전한 구현 작업 계획 수립

## 📋 완전한 구현 작업 계획 (2025-08-26)

### 작업 개요
- **목표**: 완전한 버전 관리 시스템 구현 (MVCC READ COMMITTED 시뮬레이션)
- **전략**: 단계별로 구현하되 최종적으로는 완전한 시스템 제공
- **제약사항**: 마이그레이션 불필요 (테이블 드롭 후 재생성 가능)
- **총 소요 시간**: 48시간 (6일)

### Day 1: 데이터베이스 및 도메인 모델 (8시간)

**오전 (4시간)**
1. 기존 테이블 백업 및 삭제
2. 새 데이터베이스 스키마 생성
   - `study_detail_pages` 테이블 (포인터만 관리)
   - `page_versions` 테이블 (불변 스냅샷)
   - `page_edit_locks` 테이블 (분산 락)
   - `page_version_history` 테이블 (버전 이력)
3. JPA 엔티티 생성
   - `StudyDetailPageJpaEntity` 수정
   - `PageVersionJpaEntity` 신규
   - `PageEditLockJpaEntity` 신규
   - `PageVersionHistoryJpaEntity` 신규

**오후 (4시간)**
1. 도메인 모델 구현
   - `StudyDetailPage` 수정 (버전 포인터 추가)
   - `PageVersion` 신규 (불변 스냅샷)
   - `PageEditLock` 신규 (분산 락)
   - `VersionComparison` 신규 (버전 비교)
2. 도메인 서비스 구현
   - `VersioningService` (버전 관리)
   - `LockingService` (분산 락 관리)
   - `DiffService` (버전 차이 계산)

### Day 2: Redis 통합 및 서비스 레이어 (8시간)

**오전 (4시간)**
1. Redis 설정 추가
   - RedisTemplate 구성
   - Redis Cache 구성
   - Redis Lock 구성
2. 분산 락 구현
   - `RedisLockService` 구현
   - `@DistributedLock` 어노테이션 생성
   - AOP를 통한 락 처리

**오후 (4시간)**
1. 서비스 레이어 구현
   - `StudyDetailPageService` 수정
     - `createDraftVersion()` - 초안 버전 생성
     - `updateDraftVersion()` - 초안 수정
     - `publishDraftVersion()` - 초안을 발행 버전으로
     - `discardDraftVersion()` - 초안 폐기
     - `compareVersions()` - 버전 비교
2. 캐시 전략 구현
   - 발행 버전 캐싱 (TTL 1시간)
   - 초안 버전 캐싱 (TTL 5분)
   - 캐시 무효화 전략

### Day 3: API 및 이벤트 시스템 (8시간)

**오전 (4시간)**
1. REST API 수정
   - `StudyDetailPageController` 수정
     - `GET /draft` - 초안 조회
     - `PUT /draft` - 초안 저장
     - `POST /publish` - 발행
     - `DELETE /draft` - 초안 폐기
     - `GET /versions` - 버전 이력
     - `GET /diff` - 버전 비교
2. WebSocket 엔드포인트 추가
   - 실시간 편집 알림
   - 잠금 상태 브로드캐스트

**오후 (4시간)**
1. Kafka 이벤트 구현
   - `PageVersionCreatedEvent`
   - `PagePublishedEvent`
   - `PageLockedEvent`
   - `PageUnlockedEvent`
2. 이벤트 핸들러 구현
   - 캐시 무효화 핸들러
   - 알림 핸들러
   - 감사 로그 핸들러

### Day 4: 프론트엔드 API 클라이언트 (8시간)

**오전 (4시간)**
1. API 서비스 수정 (`studyDetailPageService.ts`)
   - 초안 관리 API 추가
   - 버전 비교 API 추가
   - 잠금 관리 API 추가
2. WebSocket 클라이언트 구현
   - Socket.io 클라이언트 설정
   - 실시간 이벤트 핸들링
   - 재연결 로직

**오후 (4시간)**
1. 상태 관리 구현
   - Zustand store 생성/수정
   - 버전 상태 관리
   - 잠금 상태 관리
   - 편집 상태 관리
2. React Query 통합
   - 버전 데이터 쿼리
   - 옵티미스틱 업데이트
   - 캐시 무효화 전략

### Day 5: 프론트엔드 UI 구현 (8시간)

**오전 (4시간)**
1. 관리 페이지 UI 개선 (`StudyManagementPage.tsx`)
   - 모드 전환 UI (보기/편집)
   - 버전 상태 표시
   - 저장/발행 버튼 분리
   - 변경사항 표시
2. 버전 비교 모달 구현
   - Diff 뷰어 컴포넌트
   - 변경사항 하이라이트
   - 병합 충돌 해결 UI

**오후 (4시간)**
1. 실시간 협업 UI 구현
   - 편집자 표시
   - 잠금 상태 표시
   - 충돌 경고
   - 자동 새로고침
2. 사용자 피드백 UI
   - Toast 알림
   - 로딩 상태
   - 에러 처리
   - 성공 메시지

### Day 6: 테스트 및 마이그레이션 (8시간)

**오전 (4시간)**
1. 백엔드 테스트 작성
   - 단위 테스트 (서비스, 도메인)
   - 통합 테스트 (API)
   - 동시성 테스트 (락, 버전 충돌)
2. 프론트엔드 테스트 작성
   - 컴포넌트 테스트
   - E2E 테스트 (Cypress)

**오후 (4시간)**
1. 데이터 마이그레이션 (선택적)
   - 기존 페이지를 버전 시스템으로
   - 초기 버전 생성
   - 발행 버전 설정
2. 배포 준비
   - Docker 이미지 빌드
   - 환경 변수 설정
   - 문서 업데이트
   - 모니터링 설정

### 기술 스택 요약
- **백엔드**: Spring Boot, JPA, Redis, Kafka, WebSocket
- **프론트엔드**: React, TypeScript, Zustand, React Query, Socket.io
- **인프라**: Docker, MySQL, Redis, Kafka
- **테스트**: JUnit, Mockito, Jest, Cypress

### 성공 지표
- ✅ 초안과 발행 버전이 명확히 분리됨
- ✅ 동시 편집 충돌이 방지됨
- ✅ 버전 이력이 추적됨
- ✅ 실시간 협업이 가능함
- ✅ 성능이 기존과 동일하거나 개선됨
- ✅ 0 다운타임 배포 가능

### 구현 순서 결정
Day 1부터 순차적으로 진행하되, 각 단계는 독립적으로 테스트 가능하도록 구현

- 2025-08-26: 초안 작성