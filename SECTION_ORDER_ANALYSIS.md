# 📊 섹션 순서 조정 기능 분석 보고서

## 🔍 현재 상태 (AS-IS)

### 1. 데이터베이스 구조
- **테이블**: `study_detail_pages`
- **섹션 필드**: `sections` (JSON 타입)
- **순서 관리**: 각 섹션에 `order` 필드 (0부터 시작)
- **현재 TecoTeco 페이지 순서**:
  ```
  0: HERO - 메인 히어로
  1: RICH_TEXT - TecoTeco 소개
  2: MEMBERS - 함께하는 사람들
  3: CUSTOM_HTML (HOW_WE_ROLL) - 모임 진행 방식
  4: CUSTOM_HTML (JOURNEY) - 우리의 여정
  5: CUSTOM_HTML (EXPERIENCE) - 테코테코 모임을 한다는 건
  6: FAQ - 자주 묻는 질문
  ```

### 2. 백엔드 API (✅ 구현됨)

#### API 엔드포인트
```
PUT /api/study-pages/{studyId}/sections/reorder
```

#### 요청 형식
```json
{
  "sectionIds": [
    "92c217b2-7bb4-40ad-8e64-47753eda43a6",  // 모든 섹션 ID를
    "95a73954-a7dc-4c8e-a114-2101049b65e3",  // 원하는 순서대로
    "532979bb-facf-4de8-a64c-4d947cfa804c",  // 나열
    "..."
  ]
}
```

#### 핵심 로직
- **StudyDetailPageController.java**: `@PutMapping("/{studyId}/sections/reorder")`
- **StudyDetailPageService.java**: `reorderSections(UUID studyId, List<String> sectionIds, String updatedBy)`
- **StudyDetailPage.java**: `reorderSections(List<String> sectionIds)`

#### 제약사항
- ⚠️ **모든 섹션 ID 필수**: `sectionIds` 배열에 모든 섹션의 ID가 포함되어야 함
- ⚠️ **인증 필요**: Bearer 토큰 필수
- ⚠️ **편집 가능 상태**: DRAFT 또는 PUBLISHED 상태에서만 가능

### 3. 프론트엔드 구현 (⚠️ 부분 구현)

#### StudyManagementPage.tsx
```typescript
// 순서 변경 핸들러 존재
const handleReorderSection = async (sectionId: string, newOrder: number) => {
  // 섹션 배열 재정렬
  const sections = [...pageData.sections];
  const currentIndex = sections.findIndex(s => s.id === sectionId);
  const [removed] = sections.splice(currentIndex, 1);
  sections.splice(newOrder, 0, removed);
  
  // API 호출
  const sectionIds = sections.map(s => s.id);
  const updatedPage = await studyDetailPageService.reorderSections(studyId, sectionIds);
}

// UI 버튼 존재
<button onClick={() => handleReorderSection(section.id, Math.max(0, section.order - 1))}>↑</button>
<button onClick={() => handleReorderSection(section.id, section.order + 1)}>↓</button>
```

#### studyDetailPageService.ts
```typescript
async reorderSections(studyId: string, sectionIds: string[]): Promise<StudyDetailPageData> {
  const response = await apiClient.put(`/api/study-pages/${studyId}/sections/reorder`, { sectionIds });
  return response.data;
}
```

### 4. 현재 문제점

1. **UI/UX 문제**:
   - ↑↓ 버튼만 있어서 한 칸씩만 이동 가능
   - 드래그 앤 드롭 미지원
   - 순서 변경 시 실시간 미리보기 없음
   - 변경 후 즉시 저장 (실행 취소 불가)

2. **기능적 제한**:
   - 섹션을 여러 칸 이동하려면 여러 번 클릭 필요
   - 섹션이 많을 때 비효율적
   - 순서 변경 중 로딩 상태 표시 미흡

3. **데이터 일관성**:
   - order 값이 중복될 가능성 (API는 sectionIds 순서로 재정렬)
   - 프론트엔드와 백엔드 order 동기화 이슈 가능

## 🎯 개선 방향 (TO-BE)

### 1. UI/UX 개선

#### 1.1 드래그 앤 드롭 구현
```typescript
// react-beautiful-dnd 또는 @dnd-kit/sortable 사용
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SectionList = () => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // API 호출
    const sectionIds = items.map(item => item.id);
    await reorderSections(studyId, sectionIds);
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sections">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {sections.map((section, index) => (
              <Draggable key={section.id} draggableId={section.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    {/* 섹션 UI */}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

#### 1.2 순서 입력 필드
```typescript
// 직접 순서 입력 가능
<input 
  type="number" 
  value={section.order + 1} 
  onChange={(e) => handleDirectOrderChange(section.id, parseInt(e.target.value) - 1)}
  min="1"
  max={sections.length}
/>
```

#### 1.3 일괄 편집 모드
```typescript
// 변경사항 임시 저장 후 일괄 적용
const [tempOrder, setTempOrder] = useState(sections);
const [isEditing, setIsEditing] = useState(false);

const handleSaveOrder = async () => {
  const sectionIds = tempOrder.map(s => s.id);
  await reorderSections(studyId, sectionIds);
  setIsEditing(false);
};

const handleCancelOrder = () => {
  setTempOrder(sections);
  setIsEditing(false);
};
```

### 2. 백엔드 개선

#### 2.1 부분 업데이트 API 추가
```java
// 단일 섹션 순서만 변경
@PatchMapping("/{studyId}/sections/{sectionId}/order")
public StudyDetailPageResponse updateSectionOrder(
    @PathVariable UUID studyId,
    @PathVariable String sectionId,
    @RequestBody UpdateOrderRequest request
) {
    // 해당 섹션만 이동하고 나머지는 자동 조정
    var page = manageUseCase.updateSectionOrder(studyId, sectionId, request.getNewOrder());
    return StudyDetailPageResponse.from(page);
}
```

#### 2.2 벌크 업데이트 API
```java
// 여러 섹션의 순서를 개별적으로 지정
@PutMapping("/{studyId}/sections/bulk-order")
public StudyDetailPageResponse bulkUpdateOrder(
    @PathVariable UUID studyId,
    @RequestBody List<SectionOrderUpdate> updates
) {
    // [{sectionId: "...", order: 0}, {sectionId: "...", order: 1}, ...]
    var page = manageUseCase.bulkUpdateSectionOrder(studyId, updates);
    return StudyDetailPageResponse.from(page);
}
```

### 3. 프론트엔드 서비스 확장

#### 3.1 낙관적 업데이트
```typescript
const handleReorderOptimistic = async (newOrder: Section[]) => {
  // 1. UI 즉시 업데이트
  setPageData(prev => ({ ...prev, sections: newOrder }));
  
  try {
    // 2. API 호출
    const sectionIds = newOrder.map(s => s.id);
    await studyDetailPageService.reorderSections(studyId, sectionIds);
  } catch (error) {
    // 3. 실패 시 롤백
    setPageData(prev => ({ ...prev, sections: originalOrder }));
    alert('순서 변경 실패');
  }
};
```

#### 3.2 디바운싱 적용
```typescript
import { debounce } from 'lodash';

const debouncedReorder = useMemo(
  () => debounce(async (sectionIds: string[]) => {
    await studyDetailPageService.reorderSections(studyId, sectionIds);
  }, 500),
  [studyId]
);
```

### 4. 추가 기능 제안

#### 4.1 템플릿 기반 순서 설정
```typescript
const templates = {
  'standard': ['HERO', 'RICH_TEXT', 'MEMBERS', 'HOW_WE_ROLL', 'FAQ'],
  'content-first': ['RICH_TEXT', 'HERO', 'HOW_WE_ROLL', 'MEMBERS', 'FAQ'],
  'community-focus': ['HERO', 'MEMBERS', 'HOW_WE_ROLL', 'RICH_TEXT', 'FAQ']
};

const applyTemplate = (templateName: string) => {
  const template = templates[templateName];
  const orderedSections = template.map(type => 
    sections.find(s => s.type === type)
  ).filter(Boolean);
  
  handleReorderOptimistic(orderedSections);
};
```

#### 4.2 섹션 그룹화
```typescript
// 관련 섹션들을 그룹으로 묶어서 이동
const sectionGroups = {
  'intro': ['HERO', 'RICH_TEXT'],
  'community': ['MEMBERS', 'HOW_WE_ROLL'],
  'info': ['JOURNEY', 'EXPERIENCE', 'FAQ']
};
```

#### 4.3 순서 히스토리
```typescript
interface OrderHistory {
  timestamp: Date;
  order: string[];
  changedBy: string;
}

// 이전 순서로 되돌리기
const revertToHistory = async (history: OrderHistory) => {
  await studyDetailPageService.reorderSections(studyId, history.order);
};
```

## 📝 구현 우선순위

### Phase 1 (즉시 구현 가능)
1. ✅ 현재 API 활용한 순서 변경 버튼 개선
2. ✅ 순서 입력 필드 추가
3. ✅ 로딩 상태 표시 개선

### Phase 2 (단기 개선)
1. 드래그 앤 드롭 구현
2. 일괄 편집 모드
3. 낙관적 업데이트

### Phase 3 (장기 개선)
1. 부분 업데이트 API 추가
2. 템플릿 기능
3. 순서 히스토리 관리

## 🚨 주의사항

1. **현재 API 제약**:
   - 모든 섹션 ID를 포함해야 함
   - 누락된 섹션은 삭제될 수 있음
   - 중복된 섹션 ID는 에러 발생

2. **성능 고려사항**:
   - 섹션이 많을 때 전체 재정렬은 비효율적
   - 프론트엔드 최적화 필요 (React.memo, useMemo)

3. **사용자 경험**:
   - 변경사항 저장 전 확인 필요
   - 실행 취소 기능 필요
   - 실시간 미리보기 제공

## 💡 결론

현재 백엔드 API는 완전히 구현되어 있고 정상 작동하지만, 프론트엔드 UI/UX가 제한적입니다. 
드래그 앤 드롭, 일괄 편집 모드, 템플릿 등의 기능을 추가하면 사용자 경험을 크게 개선할 수 있습니다.
단계적으로 개선하되, 현재 API를 최대한 활용하면서 점진적으로 백엔드 API도 확장하는 것이 바람직합니다.