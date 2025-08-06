# 백오피스 관리자 UI/UX 설계

## Executive Summary

AsyncSite 백오피스 시스템의 TipTap 에디터 통합을 위한 관리자 인터페이스 설계입니다. 콘텐츠 모더레이션, 사용자 관리, 통계 분석 등 관리자의 모든 요구사항을 충족하는 효율적인 UI/UX를 제공합니다.

## 1. 백오피스 아키텍처 개요

### 1.1 시스템 구조
```
AsyncSite Backoffice
├── Dashboard (대시보드)
│   ├── Overview (전체 현황)
│   ├── Realtime Metrics (실시간 지표)
│   └── Quick Actions (빠른 작업)
├── Content Management (콘텐츠 관리)
│   ├── Profile Management (프로필 관리)
│   ├── Study Management (스터디 관리)
│   ├── Content Moderation (콘텐츠 검토)
│   └── Bulk Operations (일괄 작업)
├── User Management (사용자 관리)
│   ├── User List (사용자 목록)
│   ├── Permission Control (권한 관리)
│   └── Activity Logs (활동 로그)
├── Analytics (분석)
│   ├── Content Analytics (콘텐츠 분석)
│   ├── User Behavior (사용자 행동)
│   └── Performance Metrics (성능 지표)
└── Settings (설정)
    ├── Editor Configuration (에디터 설정)
    ├── Moderation Rules (검토 규칙)
    └── System Settings (시스템 설정)
```

### 1.2 관리자 역할 정의

```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',        // 모든 권한
  CONTENT_MANAGER = 'content_manager', // 콘텐츠 관리
  COMMUNITY_MANAGER = 'community_manager', // 커뮤니티 관리
  MODERATOR = 'moderator',            // 콘텐츠 검토
  ANALYST = 'analyst',                // 읽기 전용 + 분석
  SUPPORT = 'support'                  // 사용자 지원
}

interface AdminPermissions {
  content: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    bulk: boolean;
  };
  users: {
    view: boolean;
    edit: boolean;
    ban: boolean;
    permissions: boolean;
  };
  analytics: {
    view: boolean;
    export: boolean;
  };
  system: {
    settings: boolean;
    configuration: boolean;
  };
}
```

## 2. 메인 대시보드 설계

### 2.1 대시보드 레이아웃
```
┌──────────────────────────────────────────────────────────────┐
│                     AsyncSite Admin Dashboard                 │
├────────────┬─────────────────────────────────────────────────┤
│            │  Welcome back, Admin 👋                          │
│   Sidebar  │  Monday, January 6, 2025 | 14:32 KST            │
│            ├─────────────────────────────────────────────────┤
│  ┌──────┐  │  ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ Logo │  │  │ 대기 콘텐츠  │ │ 오늘 처리   │ │ 활성 사용자 ││
│  └──────┘  │  │     24       │ │     18      │ │    342     ││
│            │  │   +12% ↑     │ │   -5% ↓     │ │   +8% ↑    ││
│  Dashboard │  └─────────────┘ └─────────────┘ └────────────┘│
│  Content   ├─────────────────────────────────────────────────┤
│  Users     │  실시간 활동                                      │
│  Analytics │  ┌─────────────────────────────────────────────┐│
│  Reports   │  │ [그래프: 시간대별 콘텐츠 제출]                ││
│  Settings  │  │     📊                                       ││
│  ────────  │  │      │                                       ││
│  Logout    │  │      │     │                                 ││
│            │  │  ────┼─────┼─────                           ││
│            │  │  00  06    12    18    24                   ││
│            │  └─────────────────────────────────────────────┘│
│            ├─────────────────────────────────────────────────┤
│            │  최근 활동                    빠른 작업           │
│            │  ┌──────────────────┐  ┌─────────────────────┐ │
│            │  │ • 김개발 프로필    │  │ [콘텐츠 검토하기]   │ │
│            │  │   2분 전          │  │ [사용자 관리]       │ │
│            │  │ • React 스터디    │  │ [보고서 생성]      │ │
│            │  │   15분 전         │  │ [설정 변경]        │ │
│            │  └──────────────────┘  └─────────────────────┘ │
└────────────┴─────────────────────────────────────────────────┘
```

### 2.2 대시보드 위젯 컴포넌트

```typescript
// 대시보드 메트릭 카드
const MetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon,
  onClick 
}: MetricCardProps) => {
  return (
    <div className="metric-card" onClick={onClick}>
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      
      <div className="metric-value">
        <span className="value">{value}</span>
        {change && (
          <span className={`change ${trend}`}>
            {trend === 'up' ? '↑' : '↓'} {change}%
          </span>
        )}
      </div>
      
      <div className="metric-sparkline">
        <Sparkline data={getRecentData(title)} />
      </div>
    </div>
  );
};

// 실시간 활동 피드
const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    // WebSocket 연결로 실시간 업데이트
    const ws = new WebSocket('wss://api.asyncsite.com/admin/activities');
    
    ws.onmessage = (event) => {
      const activity = JSON.parse(event.data);
      setActivities(prev => [activity, ...prev].slice(0, 10));
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="activity-feed">
      <h3>실시간 활동</h3>
      <div className="activity-list">
        {activities.map(activity => (
          <ActivityItem key={activity.id}>
            <Avatar user={activity.user} />
            <div className="activity-content">
              <div className="activity-text">
                <strong>{activity.user.name}</strong>
                {activity.action}
              </div>
              <time>{formatTimeAgo(activity.timestamp)}</time>
            </div>
            <ActionButton action={activity.requiredAction} />
          </ActivityItem>
        ))}
      </div>
    </div>
  );
};
```

## 3. 콘텐츠 관리 인터페이스

### 3.1 콘텐츠 검토 큐

```
┌──────────────────────────────────────────────────────────────┐
│                    콘텐츠 검토 대기열                          │
├──────────────────────────────────────────────────────────────┤
│  필터: [전체 ▼] [긴급 ▼] [오늘 ▼]   검색: [_____________] 🔍 │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐    │
│  │ □ 전체 선택  24개 항목  [일괄 승인] [일괄 거절]       │    │
│  └──────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐    │
│  │ □ | ID  | 유형 | 제목 | 작성자 | 제출일 | 우선순위 | 액션│
│  ├──────────────────────────────────────────────────────┤    │
│  │ □ | 124 | 프로필| 김개발... | kim@... | 2분전 | 🔴 높음| [검토]│
│  │ □ | 123 | 스터디| React... | lee@... | 15분 | ⚪ 보통| [검토]│
│  │ □ | 122 | 프로필| 박백엔드 | park@.. | 1시간 | 🔵 낮음| [검토]│
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  [이전] 1 2 3 4 5 ... 10 [다음]                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 콘텐츠 상세 검토 화면

```typescript
// 분할 화면 검토 인터페이스
const ContentReviewInterface = ({ contentId }: { contentId: string }) => {
  const [content, setContent] = useState<Content | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  
  return (
    <div className="review-interface">
      <div className="review-header">
        <BackButton />
        <h2>콘텐츠 검토 #{contentId}</h2>
        <div className="review-actions">
          <button onClick={getPreviousContent}>이전</button>
          <button onClick={getNextContent}>다음</button>
        </div>
      </div>
      
      <SplitPane split="vertical" defaultSize="60%">
        {/* 왼쪽: 콘텐츠 뷰어 */}
        <div className="content-viewer-panel">
          <div className="viewer-toolbar">
            <button onClick={toggleHighlight}>하이라이트</button>
            <button onClick={toggleComments}>코멘트</button>
            <button onClick={toggleDiff}>변경사항</button>
          </div>
          
          <TipTapViewer
            content={content}
            readOnly
            highlights={aiAnalysis?.issues}
            comments={comments}
          />
          
          {/* AI 분석 결과 오버레이 */}
          {aiAnalysis && (
            <AIAnalysisOverlay>
              <div className="ai-score">
                AI 점수: {aiAnalysis.score}/100
              </div>
              <div className="ai-issues">
                {aiAnalysis.issues.map(issue => (
                  <IssueCard key={issue.id}>
                    <span className={`severity-${issue.severity}`}>
                      {issue.severity}
                    </span>
                    <span>{issue.description}</span>
                    <button onClick={() => jumpToIssue(issue)}>
                      위치 보기
                    </button>
                  </IssueCard>
                ))}
              </div>
            </AIAnalysisOverlay>
          )}
        </div>
        
        {/* 오른쪽: 정보 및 액션 패널 */}
        <div className="info-action-panel">
          {/* 작성자 정보 */}
          <Card title="작성자 정보">
            <UserProfile user={content?.author}>
              <div className="user-stats">
                <Stat label="가입일" value={user.joinDate} />
                <Stat label="작성 콘텐츠" value={user.contentCount} />
                <Stat label="승인률" value={`${user.approvalRate}%`} />
                <Stat label="신고 이력" value={user.reportCount} />
              </div>
            </UserProfile>
            
            <UserHistory userId={content?.author.id} limit={5} />
          </Card>
          
          {/* 빠른 체크리스트 */}
          <Card title="검토 체크리스트">
            <Checklist>
              <CheckItem 
                checked={!hasProhibitedContent} 
                label="금지된 콘텐츠 없음" 
              />
              <CheckItem 
                checked={!hasSpam} 
                label="스팸/광고 없음" 
              />
              <CheckItem 
                checked={isOriginal} 
                label="독창적 콘텐츠" 
              />
              <CheckItem 
                checked={isAppropriate} 
                label="커뮤니티 가이드라인 준수" 
              />
              <CheckItem 
                checked={hasProperFormat} 
                label="적절한 포맷" 
              />
            </Checklist>
          </Card>
          
          {/* 검토 액션 */}
          <Card title="검토 결정">
            <DecisionPanel>
              <TextArea
                placeholder="검토 의견을 입력하세요 (선택사항)"
                value={decision?.comment}
                onChange={(e) => setDecision({
                  ...decision,
                  comment: e.target.value
                })}
              />
              
              <div className="decision-buttons">
                <button 
                  className="approve-btn"
                  onClick={() => handleDecision('approve')}
                >
                  ✅ 승인
                </button>
                
                <button 
                  className="request-edit-btn"
                  onClick={() => handleDecision('request_edit')}
                >
                  ✏️ 수정 요청
                </button>
                
                <button 
                  className="reject-btn"
                  onClick={() => handleDecision('reject')}
                >
                  ❌ 거절
                </button>
              </div>
              
              {decision?.type === 'request_edit' && (
                <EditRequestForm>
                  <h4>수정 요청 사항</h4>
                  <CheckboxList>
                    <label>
                      <input type="checkbox" />
                      제목 수정 필요
                    </label>
                    <label>
                      <input type="checkbox" />
                      내용 보완 필요
                    </label>
                    <label>
                      <input type="checkbox" />
                      이미지 교체 필요
                    </label>
                  </CheckboxList>
                  <TextArea
                    placeholder="구체적인 수정 요청 사항을 입력하세요"
                  />
                </EditRequestForm>
              )}
              
              {decision?.type === 'reject' && (
                <RejectReasonForm>
                  <h4>거절 사유</h4>
                  <RadioList>
                    <label>
                      <input type="radio" name="reason" />
                      부적절한 콘텐츠
                    </label>
                    <label>
                      <input type="radio" name="reason" />
                      스팸/광고
                    </label>
                    <label>
                      <input type="radio" name="reason" />
                      저작권 위반
                    </label>
                    <label>
                      <input type="radio" name="reason" />
                      기타
                    </label>
                  </RadioList>
                </RejectReasonForm>
              )}
            </DecisionPanel>
          </Card>
        </div>
      </SplitPane>
    </div>
  );
};
```

## 4. 일괄 작업 인터페이스

### 4.1 벌크 에디터

```typescript
// 일괄 편집 인터페이스
const BulkEditor = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  
  return (
    <div className="bulk-editor">
      <div className="bulk-header">
        <h2>일괄 작업</h2>
        <div className="selection-info">
          {selectedItems.length}개 항목 선택됨
        </div>
      </div>
      
      <div className="bulk-toolbar">
        <button 
          onClick={() => setBulkAction('edit')}
          disabled={selectedItems.length === 0}
        >
          일괄 편집
        </button>
        
        <button 
          onClick={() => setBulkAction('approve')}
          disabled={selectedItems.length === 0}
        >
          일괄 승인
        </button>
        
        <button 
          onClick={() => setBulkAction('delete')}
          disabled={selectedItems.length === 0}
        >
          일괄 삭제
        </button>
        
        <button onClick={exportSelected}>
          내보내기
        </button>
      </div>
      
      {bulkAction === 'edit' && (
        <BulkEditPanel>
          <h3>일괄 편집 옵션</h3>
          
          <div className="edit-options">
            <label>
              <input type="checkbox" />
              카테고리 변경
              <select disabled={!checked}>
                <option>Frontend</option>
                <option>Backend</option>
                <option>DevOps</option>
              </select>
            </label>
            
            <label>
              <input type="checkbox" />
              태그 추가
              <TagInput disabled={!checked} />
            </label>
            
            <label>
              <input type="checkbox" />
              상태 변경
              <select disabled={!checked}>
                <option>공개</option>
                <option>비공개</option>
                <option>초안</option>
              </select>
            </label>
          </div>
          
          <div className="preview-changes">
            <h4>변경사항 미리보기</h4>
            <ChangesList items={getPreviewChanges()} />
          </div>
          
          <div className="bulk-actions">
            <button onClick={cancelBulkEdit}>취소</button>
            <button onClick={applyBulkEdit} className="primary">
              {selectedItems.length}개 항목에 적용
            </button>
          </div>
        </BulkEditPanel>
      )}
    </div>
  );
};
```

## 5. 사용자 관리 인터페이스

### 5.1 사용자 목록 및 관리

```
┌──────────────────────────────────────────────────────────────┐
│                        사용자 관리                            │
├──────────────────────────────────────────────────────────────┤
│  검색: [이름/이메일] [역할 ▼] [상태 ▼] [가입일 ▼]     [검색] │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐    │
│  │ ID | 사용자 | 이메일 | 역할 | 콘텐츠 | 상태 | 액션   │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ 1  | 김개발 | kim@.. | User | 12 | 활성 | [상세][편집]│    │
│  │ 2  | 이디자인| lee@.. | User | 8  | 활성 | [상세][편집]│    │
│  │ 3  | 박관리 | park@. | Admin| 0  | 활성 | [상세][편집]│    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  선택된 사용자 액션: [메시지 전송] [권한 변경] [계정 정지]      │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 사용자 상세 정보

```typescript
const UserDetailModal = ({ userId }: { userId: string }) => {
  const user = useUserDetails(userId);
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <Modal size="large" title={`사용자 상세: ${user.name}`}>
      <TabNav>
        <Tab 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          개요
        </Tab>
        <Tab 
          active={activeTab === 'content'} 
          onClick={() => setActiveTab('content')}
        >
          콘텐츠
        </Tab>
        <Tab 
          active={activeTab === 'activity'} 
          onClick={() => setActiveTab('activity')}
        >
          활동 로그
        </Tab>
        <Tab 
          active={activeTab === 'permissions'} 
          onClick={() => setActiveTab('permissions')}
        >
          권한
        </Tab>
      </TabNav>
      
      <TabContent>
        {activeTab === 'overview' && (
          <UserOverview user={user}>
            <InfoGrid>
              <InfoItem label="가입일" value={user.joinDate} />
              <InfoItem label="마지막 로그인" value={user.lastLogin} />
              <InfoItem label="총 콘텐츠" value={user.contentCount} />
              <InfoItem label="승인률" value={`${user.approvalRate}%`} />
            </InfoGrid>
            
            <UserStats>
              <StatChart type="line" data={user.activityTrend} />
              <StatChart type="pie" data={user.contentTypes} />
            </UserStats>
          </UserOverview>
        )}
        
        {activeTab === 'content' && (
          <UserContent userId={userId}>
            <ContentList 
              items={user.contents}
              onEdit={(id) => openContentEditor(id)}
              onDelete={(id) => deleteContent(id)}
            />
          </UserContent>
        )}
        
        {activeTab === 'activity' && (
          <ActivityLog userId={userId}>
            <LogFilters>
              <DateRangePicker />
              <Select options={activityTypes} />
            </LogFilters>
            <LogList items={user.activities} />
          </ActivityLog>
        )}
        
        {activeTab === 'permissions' && (
          <PermissionManager user={user}>
            <RoleSelector 
              current={user.role}
              onChange={(newRole) => updateUserRole(userId, newRole)}
            />
            
            <PermissionGrid>
              {Object.entries(user.permissions).map(([key, value]) => (
                <PermissionToggle
                  key={key}
                  permission={key}
                  enabled={value}
                  onChange={(enabled) => updatePermission(userId, key, enabled)}
                />
              ))}
            </PermissionGrid>
          </PermissionManager>
        )}
      </TabContent>
      
      <ModalFooter>
        <button onClick={closeModal}>닫기</button>
        <button onClick={saveChanges} className="primary">
          변경사항 저장
        </button>
      </ModalFooter>
    </Modal>
  );
};
```

## 6. 분석 대시보드

### 6.1 에디터 사용 분석

```typescript
const EditorAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [metrics, setMetrics] = useState<EditorMetrics | null>(null);
  
  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>에디터 사용 분석</h2>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>
      
      <MetricGrid>
        <MetricCard
          title="총 세션"
          value={metrics?.totalSessions}
          change={metrics?.sessionChange}
          chart={<MiniChart data={metrics?.sessionTrend} />}
        />
        
        <MetricCard
          title="평균 작성 시간"
          value={`${metrics?.avgWritingTime}분`}
          change={metrics?.timeChange}
          chart={<MiniChart data={metrics?.timeTrend} />}
        />
        
        <MetricCard
          title="도구 사용률"
          value={`${metrics?.toolUsage}%`}
          change={metrics?.toolChange}
          chart={<MiniChart data={metrics?.toolTrend} />}
        />
        
        <MetricCard
          title="완료율"
          value={`${metrics?.completionRate}%`}
          change={metrics?.completionChange}
          chart={<MiniChart data={metrics?.completionTrend} />}
        />
      </MetricGrid>
      
      <div className="chart-grid">
        <ChartCard title="시간대별 활동">
          <HeatmapChart 
            data={metrics?.activityHeatmap}
            xAxis="hour"
            yAxis="dayOfWeek"
          />
        </ChartCard>
        
        <ChartCard title="가장 많이 사용된 기능">
          <BarChart 
            data={metrics?.featureUsage}
            horizontal
          />
        </ChartCard>
        
        <ChartCard title="콘텐츠 길이 분포">
          <HistogramChart 
            data={metrics?.contentLengthDistribution}
            bins={20}
          />
        </ChartCard>
        
        <ChartCard title="에러 발생률">
          <LineChart 
            data={metrics?.errorRate}
            showAlert={metrics?.errorRate.latest > 1}
          />
        </ChartCard>
      </div>
      
      <InsightsPanel>
        <h3>주요 인사이트</h3>
        <InsightsList>
          <Insight type="positive">
            에디터 사용률이 지난주 대비 15% 증가했습니다
          </Insight>
          <Insight type="warning">
            모바일 사용자의 완료율이 데스크톱보다 30% 낮습니다
          </Insight>
          <Insight type="info">
            이미지 업로드 기능이 가장 많이 사용되고 있습니다
          </Insight>
        </InsightsList>
      </InsightsPanel>
    </div>
  );
};
```

## 7. 설정 관리

### 7.1 에디터 설정

```typescript
const EditorSettingsPanel = () => {
  const [settings, setSettings] = useState<EditorSettings>(defaultSettings);
  const [previewMode, setPreviewMode] = useState(false);
  
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>에디터 설정</h2>
        <button onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? '설정으로' : '미리보기'}
        </button>
      </div>
      
      {!previewMode ? (
        <SettingsForm>
          <Section title="기본 설정">
            <Setting>
              <label>기본 툴바 구성</label>
              <ToolbarConfigurator
                value={settings.toolbar}
                onChange={(toolbar) => updateSettings({ toolbar })}
              />
            </Setting>
            
            <Setting>
              <label>자동 저장 간격</label>
              <Select
                value={settings.autoSaveInterval}
                options={[
                  { value: 10, label: '10초' },
                  { value: 30, label: '30초' },
                  { value: 60, label: '1분' },
                  { value: 0, label: '비활성화' }
                ]}
                onChange={(interval) => updateSettings({ autoSaveInterval: interval })}
              />
            </Setting>
            
            <Setting>
              <label>최대 콘텐츠 길이</label>
              <NumberInput
                value={settings.maxLength}
                min={100}
                max={100000}
                onChange={(length) => updateSettings({ maxLength: length })}
              />
            </Setting>
          </Section>
          
          <Section title="고급 기능">
            <Toggle
              label="마크다운 단축키 활성화"
              checked={settings.markdownShortcuts}
              onChange={(checked) => updateSettings({ markdownShortcuts: checked })}
            />
            
            <Toggle
              label="AI 자동 완성"
              checked={settings.aiAutoComplete}
              onChange={(checked) => updateSettings({ aiAutoComplete: checked })}
            />
            
            <Toggle
              label="협업 기능"
              checked={settings.collaboration}
              onChange={(checked) => updateSettings({ collaboration: checked })}
            />
          </Section>
          
          <Section title="콘텐츠 필터링">
            <Setting>
              <label>금지 단어 목록</label>
              <TagInput
                value={settings.bannedWords}
                onChange={(words) => updateSettings({ bannedWords: words })}
                placeholder="금지할 단어 입력"
              />
            </Setting>
            
            <Setting>
              <label>AI 모더레이션 수준</label>
              <Slider
                value={settings.aiModerationLevel}
                min={0}
                max={100}
                onChange={(level) => updateSettings({ aiModerationLevel: level })}
              />
            </Setting>
          </Section>
        </SettingsForm>
      ) : (
        <PreviewPanel>
          <h3>설정 미리보기</h3>
          <TipTapEditor config={settings} />
        </PreviewPanel>
      )}
      
      <div className="settings-actions">
        <button onClick={resetToDefault}>기본값으로 재설정</button>
        <button onClick={saveSettings} className="primary">
          설정 저장
        </button>
      </div>
    </div>
  );
};
```

## 8. 모바일 관리자 인터페이스

### 8.1 모바일 대시보드

```
Mobile Admin Dashboard (< 768px)
┌─────────────────┐
│ ☰  Admin Panel  │
├─────────────────┤
│ 👋 Welcome Admin│
├─────────────────┤
│ ┌─────────────┐ │
│ │ 대기: 24    │ │
│ │ ↑ 12%       │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ 처리: 18    │ │
│ │ ↓ 5%        │ │
│ └─────────────┘ │
├─────────────────┤
│ 빠른 작업        │
│ [콘텐츠 검토]    │
│ [사용자 관리]    │
│ [통계 보기]     │
├─────────────────┤
│ 최근 활동        │
│ • 김개발 프로필  │
│   2분 전        │
│ • React 스터디  │
│   15분 전       │
└─────────────────┘
```

### 8.2 모바일 콘텐츠 검토

```typescript
const MobileContentReview = ({ contentId }) => {
  const [viewMode, setViewMode] = useState<'content' | 'info'>('content');
  
  return (
    <div className="mobile-review">
      <div className="mobile-header">
        <BackButton />
        <h3>검토 #{contentId}</h3>
        <MoreMenu />
      </div>
      
      <TabBar>
        <Tab 
          active={viewMode === 'content'} 
          onClick={() => setViewMode('content')}
        >
          콘텐츠
        </Tab>
        <Tab 
          active={viewMode === 'info'} 
          onClick={() => setViewMode('info')}
        >
          정보
        </Tab>
      </TabBar>
      
      {viewMode === 'content' ? (
        <div className="mobile-content-view">
          <TipTapViewer 
            content={content}
            mobile
            readOnly
          />
        </div>
      ) : (
        <div className="mobile-info-view">
          <UserCard user={content.author} compact />
          <QuickStats stats={content.stats} />
          <AIScore score={content.aiScore} />
        </div>
      )}
      
      <FloatingActionBar>
        <button className="reject">거절</button>
        <button className="edit">수정 요청</button>
        <button className="approve">승인</button>
      </FloatingActionBar>
    </div>
  );
};
```

## 9. 알림 및 실시간 업데이트

### 9.1 실시간 알림 시스템

```typescript
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Server-Sent Events for real-time notifications
    const eventSource = new EventSource('/api/admin/notifications/stream');
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      
      // 토스트 알림 표시
      showToast({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        duration: 5000,
        action: notification.action
      });
      
      // 알림 목록 업데이트
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // 브라우저 알림 (권한이 있는 경우)
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/admin-icon.png',
          tag: notification.id
        });
      }
    };
    
    return () => eventSource.close();
  }, []);
  
  return (
    <div className="notification-system">
      <NotificationBell count={unreadCount} onClick={toggleDropdown} />
      
      <NotificationDropdown>
        <div className="notification-header">
          <h4>알림</h4>
          <button onClick={markAllAsRead}>모두 읽음</button>
        </div>
        
        <NotificationList>
          {notifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={() => markAsRead(notif.id)}
              onAction={(action) => handleAction(action)}
            />
          ))}
        </NotificationList>
        
        <div className="notification-footer">
          <Link to="/admin/notifications">모든 알림 보기</Link>
        </div>
      </NotificationDropdown>
    </div>
  );
};
```

## 10. 성능 모니터링

### 10.1 시스템 성능 대시보드

```typescript
const SystemPerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerting, setAlerting] = useState(false);
  
  useEffect(() => {
    const ws = new WebSocket('wss://api.asyncsite.com/admin/metrics');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMetrics(data);
      
      // 임계값 체크
      if (data.cpu > 80 || data.memory > 90 || data.errorRate > 5) {
        setAlerting(true);
        notifyAdmins('System performance degradation detected');
      }
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div className={`performance-dashboard ${alerting ? 'alerting' : ''}`}>
      {alerting && (
        <AlertBanner>
          ⚠️ 시스템 성능 저하가 감지되었습니다
          <button onClick={acknowledgeAlert}>확인</button>
        </AlertBanner>
      )}
      
      <div className="metrics-grid">
        <GaugeChart
          title="CPU 사용률"
          value={metrics?.cpu}
          max={100}
          thresholds={[60, 80]}
        />
        
        <GaugeChart
          title="메모리 사용률"
          value={metrics?.memory}
          max={100}
          thresholds={[70, 90]}
        />
        
        <GaugeChart
          title="디스크 사용률"
          value={metrics?.disk}
          max={100}
          thresholds={[70, 85]}
        />
        
        <GaugeChart
          title="에러율"
          value={metrics?.errorRate}
          max={10}
          thresholds={[1, 5]}
          unit="%"
        />
      </div>
      
      <div className="performance-charts">
        <TimeSeriesChart
          title="응답 시간"
          data={metrics?.responseTime}
          yAxis="ms"
          alertLine={500}
        />
        
        <TimeSeriesChart
          title="요청 처리량"
          data={metrics?.throughput}
          yAxis="req/s"
        />
      </div>
      
      <div className="system-logs">
        <h3>시스템 로그</h3>
        <LogViewer 
          logs={metrics?.recentLogs}
          filter={logFilter}
          highlight={['ERROR', 'WARNING']}
        />
      </div>
    </div>
  );
};
```

## 11. 접근성 및 키보드 단축키

### 11.1 관리자 키보드 단축키

```typescript
const AdminKeyboardShortcuts = {
  // 네비게이션
  'g h': 'Go to Home',
  'g c': 'Go to Content',
  'g u': 'Go to Users',
  'g a': 'Go to Analytics',
  'g s': 'Go to Settings',
  
  // 콘텐츠 검토
  'a': 'Approve content',
  'r': 'Reject content',
  'e': 'Request edit',
  'n': 'Next content',
  'p': 'Previous content',
  
  // 검색 및 필터
  '/': 'Focus search',
  'f': 'Open filters',
  'esc': 'Close modal',
  
  // 빠른 작업
  'c n': 'Create new',
  'c u': 'Create user',
  'c r': 'Create report',
  
  // 보기 전환
  '1': 'List view',
  '2': 'Grid view',
  '3': 'Compact view'
};

// 키보드 단축키 헬퍼
const KeyboardShortcutHelper = () => {
  const [showHelper, setShowHelper] = useState(false);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        setShowHelper(!showHelper);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showHelper]);
  
  if (!showHelper) return null;
  
  return (
    <Modal title="키보드 단축키" onClose={() => setShowHelper(false)}>
      <div className="shortcut-list">
        {Object.entries(AdminKeyboardShortcuts).map(([key, description]) => (
          <div key={key} className="shortcut-item">
            <kbd>{key}</kbd>
            <span>{description}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
};
```

## 12. 보안 및 권한 관리

### 12.1 2단계 인증 설정

```typescript
const TwoFactorAuthSetup = () => {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  return (
    <div className="two-factor-setup">
      {step === 'setup' && (
        <div className="setup-step">
          <h3>2단계 인증 설정</h3>
          <p>관리자 계정 보안을 강화하기 위해 2단계 인증을 설정하세요.</p>
          
          <div className="qr-code">
            <QRCode value={qrCode} size={200} />
          </div>
          
          <div className="manual-entry">
            <p>또는 수동으로 입력:</p>
            <code>{getManualEntryCode()}</code>
            <CopyButton text={getManualEntryCode()} />
          </div>
          
          <button onClick={() => setStep('verify')}>
            다음: 인증 코드 확인
          </button>
        </div>
      )}
      
      {step === 'verify' && (
        <div className="verify-step">
          <h3>인증 코드 확인</h3>
          <p>인증 앱에 표시된 6자리 코드를 입력하세요.</p>
          
          <OTPInput
            length={6}
            onChange={(code) => verifyCode(code)}
          />
          
          <button onClick={() => setStep('complete')}>
            확인
          </button>
        </div>
      )}
      
      {step === 'complete' && (
        <div className="complete-step">
          <h3>✅ 2단계 인증 활성화 완료</h3>
          
          <div className="backup-codes">
            <h4>백업 코드</h4>
            <p>인증 앱에 접근할 수 없을 때 사용할 수 있는 백업 코드입니다.</p>
            
            <div className="codes-list">
              {backupCodes.map(code => (
                <code key={code}>{code}</code>
              ))}
            </div>
            
            <button onClick={downloadBackupCodes}>
              백업 코드 다운로드
            </button>
          </div>
          
          <button onClick={complete} className="primary">
            완료
          </button>
        </div>
      )}
    </div>
  );
};
```

## 결론

이 백오피스 관리자 UI/UX 설계는 AsyncSite 플랫폼의 효율적인 콘텐츠 관리와 사용자 관리를 위한 포괄적인 인터페이스를 제공합니다. TipTap 에디터와의 완벽한 통합을 통해 관리자는 콘텐츠를 효과적으로 검토하고 관리할 수 있습니다.

### 핵심 특징
1. **효율성**: 일괄 작업과 키보드 단축키로 빠른 작업 처리
2. **실시간성**: WebSocket을 통한 실시간 업데이트와 알림
3. **분석력**: 상세한 분석과 인사이트 제공
4. **보안성**: 2단계 인증과 세밀한 권한 관리
5. **반응성**: 모바일에서도 완벽하게 작동하는 관리 인터페이스

*최종 업데이트: 2025년 1월 6일*