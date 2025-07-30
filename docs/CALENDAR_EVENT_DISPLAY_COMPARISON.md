# Calendar Event Display Comparison

## 개요
StudyCalendar의 이벤트 표시 방식에 대한 비교 분석 문서입니다. 현재의 상세 표시 방식과 ModernCalendar의 미니멀 점 표시 방식을 비교합니다.

## 표시 방식 비교

### 1. 현재 방식 (상세 표시)
```
┌─────────────────┐
│ 15              │
│ [19:30] 테코테코 │
│ [23:00] 11루틴   │
└─────────────────┘
```

**장점:**
- ✅ **즉각적인 정보 제공** - 한눈에 무슨 일정인지 파악 가능
- ✅ **시간 정보 포함** - 스케줄 충돌을 즉시 확인 가능
- ✅ **직관적** - 추가 인터랙션 없이 정보 획득
- ✅ **실용성** - 스터디 참여자에게 필요한 모든 정보 표시

**단점:**
- ❌ **시각적 과부하** - 일정이 많은 날은 복잡해 보임
- ❌ **모바일 가독성** - 작은 화면에서 텍스트가 겹칠 수 있음
- ❌ **공간 제약** - 셀 크기에 따라 정보가 잘릴 수 있음
- ❌ **미학적 제한** - 텍스트가 많아 깔끔한 디자인 어려움

### 2. ModernCalendar 방식 (점 표시)
```
┌─────────────────┐
│ 15              │
│   ● ● ●         │
│                 │
└─────────────────┘
```

**장점:**
- ✅ **깔끔한 미학** - 미니멀하고 세련된 디자인
- ✅ **밀도 시각화** - 일정이 많은 날을 직관적으로 표현
- ✅ **포커스** - 날짜 자체에 집중 가능
- ✅ **반응형 우수** - 모바일에서도 깨끗한 레이아웃
- ✅ **확장성** - 많은 이벤트도 깔끔하게 표현 가능

**단점:**
- ❌ **추가 인터랙션 필요** - 상세 정보는 클릭/호버 필요
- ❌ **정보 부족** - 어떤 스터디인지 즉시 알 수 없음
- ❌ **학습 곡선** - 사용자가 점의 의미를 학습해야 함
- ❌ **접근성** - 스크린 리더 사용자에게 불리

## 하이브리드 접근 방식

### 1. 적응형 표시
```typescript
// 일정 개수에 따라 표시 방식 자동 변경
const renderEvents = (events: CalendarEvent[]) => {
  if (events.length <= 2) {
    return <DetailedEventList events={events} />;
  } else {
    return <DotIndicators events={events} showCount />;
  }
};
```

### 2. 사용자 선택형
```typescript
// 사용자가 직접 표시 방식 선택
type DisplayMode = 'detailed' | 'minimal' | 'hybrid';

const CalendarSettings = {
  displayMode: localStorage.getItem('calendar-display-mode') || 'detailed'
};
```

### 3. 컨텍스트별 최적화
```typescript
// 화면 크기와 상황에 따라 자동 조정
const getDisplayMode = () => {
  if (isMobile) return 'minimal';
  if (isMonthView) return 'hybrid';
  if (isWeekView) return 'detailed';
  return userPreference;
};
```

## 구현 예시

### 점 표시 구현
```typescript
interface DotIndicatorProps {
  events: CalendarEvent[];
  maxDots?: number;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({ events, maxDots = 3 }) => {
  const studyTypeColors = {
    tecoteco: '#C3E88D',
    routine11: '#82AAFF',
    devlog: '#F78C6C'
  };

  return (
    <div className="sc-dot-container">
      {events.slice(0, maxDots).map((event, idx) => (
        <span 
          key={idx}
          className="sc-event-dot"
          style={{ backgroundColor: studyTypeColors[event.studyType] }}
          title={`${event.startTime} ${event.title}`}
        />
      ))}
      {events.length > maxDots && (
        <span className="sc-more-indicator">+{events.length - maxDots}</span>
      )}
    </div>
  );
};
```

### 하이브리드 표시 구현
```typescript
const HybridEventDisplay: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
  if (events.length === 0) return null;
  
  if (events.length === 1) {
    // 1개일 때: 전체 정보 표시
    return <DetailedEvent event={events[0]} />;
  }
  
  if (events.length <= 3) {
    // 2-3개일 때: 시간과 제목만
    return <CompactEventList events={events} />;
  }
  
  // 4개 이상: 점 표시 + 개수
  return <DotIndicator events={events} showTooltip />;
};
```

## 추천 방향

### StudyCalendar의 목적과 사용자를 고려한 추천:

1. **기본값: 현재 상세 표시 유지**
   - 스터디 참여자가 주 사용자
   - 일정 확인이 핵심 기능
   - 시간 충돌 방지가 중요

2. **옵션으로 미니멀 뷰 제공**
   - 사용자 설정에서 변경 가능
   - 로컬 스토리지에 저장

3. **모바일 최적화**
   - 작은 화면에서는 자동으로 점 표시
   - 탭으로 상세 정보 확인

4. **향후 개선 사항**
   - 히트맵 형태의 density view
   - 드래그 앤 드롭 일정 관리
   - 개인화된 뷰 설정

## 구현 우선순위

1. **Phase 1**: 현재 방식 최적화
   - 모바일 반응형 개선
   - 툴팁 성능 최적화

2. **Phase 2**: 사용자 설정 추가
   - 표시 모드 토글
   - 설정 저장 기능

3. **Phase 3**: 미니멀 뷰 구현
   - 점 표시 컴포넌트
   - 애니메이션 효과

4. **Phase 4**: 고급 기능
   - 히트맵 뷰
   - 개인화 기능

---

작성일: 2025-07-30
작성자: AsyncSite Team