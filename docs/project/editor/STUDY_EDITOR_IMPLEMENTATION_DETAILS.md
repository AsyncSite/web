# 스터디 에디터 구현 상세 설계서

## 1. 기술적 구현 상세

### 1.1 컴포넌트 아키텍처

#### 웹 프론트엔드 구조
```
web/src/
├── pages/study/
│   ├── propose/
│   │   ├── StudyProposePage.tsx         # 메인 페이지
│   │   ├── StudyProposePage.css
│   │   └── components/
│   │       ├── StudyBasicInfoForm.tsx   # 기본 정보
│   │       ├── StudyDetailEditor.tsx    # 상세 정보 에디터
│   │       ├── StudyPreview.tsx         # 미리보기
│   │       └── StudySubmitModal.tsx     # 제출 확인
│   └── detail/
│       └── [id]/
│           └── StudyDetailPage.tsx      # 상세 페이지 (읽기 전용)
│
├── components/study/
│   ├── editor/
│   │   ├── StudyRichTextEditor.tsx      # 스터디 특화 에디터
│   │   ├── StudyEditorToolbar.tsx       # 커스텀 툴바
│   │   └── StudyTemplate.tsx            # 템플릿 선택기
│   └── common/
│       ├── StudyCard.tsx
│       └── StudyStatus.tsx
│
└── hooks/study/
    ├── useStudyProposal.ts               # 제안 로직
    ├── useStudyValidation.ts             # 유효성 검증
    └── useStudyTemplates.ts              # 템플릿 관리
```

### 1.2 스터디 특화 RichTextEditor 확장

```typescript
// components/study/editor/StudyRichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import { StudyEditorToolbar } from './StudyEditorToolbar';

interface StudyRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  section: 'introduction' | 'curriculum' | 'requirements' | 'benefits';
  userRole: 'USER' | 'ADMIN';
  placeholder?: string;
  maxLength?: number;
  template?: string;
}

export function StudyRichTextEditor({
  value,
  onChange,
  section,
  userRole,
  placeholder,
  maxLength = 5000,
  template
}: StudyRichTextEditorProps) {
  
  // 섹션별 기본 템플릿
  const sectionTemplates = {
    introduction: `
      <h2>스터디 소개</h2>
      <p>이 스터디는...</p>
      <h3>목표</h3>
      <ul>
        <li>목표 1</li>
        <li>목표 2</li>
      </ul>
    `,
    curriculum: `
      <h2>커리큘럼</h2>
      <table>
        <tr>
          <th>주차</th>
          <th>주제</th>
          <th>학습 내용</th>
        </tr>
        <tr>
          <td>1주차</td>
          <td></td>
          <td></td>
        </tr>
      </table>
    `,
    requirements: `
      <h2>참가 요건</h2>
      <h3>필수 요건</h3>
      <ul>
        <li>요건 1</li>
      </ul>
      <h3>우대 사항</h3>
      <ul>
        <li>우대 1</li>
      </ul>
    `,
    benefits: `
      <h2>기대 효과</h2>
      <p>이 스터디를 통해...</p>
      <ul>
        <li>효과 1</li>
        <li>효과 2</li>
      </ul>
    `
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3], // H1 제외 (페이지 제목용)
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      // 스터디 특화 익스텐션 추가 가능
    ],
    content: value || template || sectionTemplates[section],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'study-editor-content',
        'data-section': section,
      },
    },
  });

  // 관리자 전용 기능
  const adminFeatures = userRole === 'ADMIN' ? {
    allowImageUpload: true,
    allowVideoEmbed: true,
    allowCodeBlock: true,
    maxLength: 10000,
  } : {
    allowImageUpload: false,
    allowVideoEmbed: false,
    allowCodeBlock: false,
    maxLength: 5000,
  };

  return (
    <div className="study-rich-text-editor">
      <StudyEditorToolbar 
        editor={editor}
        features={adminFeatures}
        section={section}
      />
      <EditorContent 
        editor={editor} 
        className="study-editor-content-wrapper"
      />
      <div className="study-editor-footer">
        <span className="character-count">
          {editor?.storage.characterCount.characters() || 0} / {adminFeatures.maxLength}
        </span>
        {section === 'curriculum' && (
          <button onClick={() => insertCurriculumTable(editor)}>
            커리큘럼 표 삽입
          </button>
        )}
      </div>
    </div>
  );
}

// 커리큘럼 표 삽입 헬퍼
function insertCurriculumTable(editor: any) {
  if (!editor) return;
  
  editor.chain().focus().insertTable({
    rows: 5,
    cols: 3,
    withHeaderRow: true,
  }).run();
}
```

### 1.3 스터디 제안 페이지 구현

```typescript
// pages/study/propose/StudyProposePage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { StudyRichTextEditor } from '../../../components/study/editor/StudyRichTextEditor';
import { StudyPreview } from './components/StudyPreview';
import studyService from '../../../api/studyService';
import './StudyProposePage.css';

interface StudyProposalData {
  // 기본 정보
  title: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  maxMembers: number;
  duration: number; // weeks
  startDate: string;
  endDate: string;
  
  // 상세 정보 (HTML)
  introduction: string;
  curriculum: string;
  requirements: string;
  benefits: string;
  
  // 운영 정보
  meetingType: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  meetingSchedule: string;
  location?: string;
  
  // 메타 정보
  tags: string[];
  isPublic: boolean;
  proposalStatus?: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
}

export function StudyProposePage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StudyProposalData>({
    title: '',
    category: '',
    difficulty: 'BEGINNER',
    maxMembers: 10,
    duration: 8,
    startDate: '',
    endDate: '',
    introduction: '',
    curriculum: '',
    requirements: '',
    benefits: '',
    meetingType: 'ONLINE',
    meetingSchedule: '',
    location: '',
    tags: [],
    isPublic: true,
  });
  const [errors, setErrors] = useState<Partial<StudyProposalData>>({});
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // 자동 저장 (드래프트)
  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    
    const timer = setTimeout(() => {
      saveDraft();
    }, 3000); // 3초 후 자동 저장
    
    setAutoSaveTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData]);

  const saveDraft = async () => {
    try {
      await studyService.saveStudyDraft({
        ...formData,
        proposalStatus: 'DRAFT'
      });
      // 저장 완료 표시
    } catch (error) {
      console.error('Draft save failed:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<StudyProposalData> = {};
    
    if (step === 1) {
      // 기본 정보 검증
      if (!formData.title) newErrors.title = '제목을 입력해주세요';
      if (!formData.category) newErrors.category = '카테고리를 선택해주세요';
      if (!formData.startDate) newErrors.startDate = '시작일을 선택해주세요';
      if (!formData.endDate) newErrors.endDate = '종료일을 선택해주세요';
      if (formData.maxMembers < 2) newErrors.maxMembers = '최소 2명 이상이어야 합니다';
    } else if (step === 2) {
      // 상세 정보 검증
      if (!formData.introduction || formData.introduction.length < 100) {
        newErrors.introduction = '소개는 최소 100자 이상 작성해주세요';
      }
      if (!formData.curriculum || formData.curriculum.length < 100) {
        newErrors.curriculum = '커리큘럼은 최소 100자 이상 작성해주세요';
      }
    } else if (step === 3) {
      // 운영 정보 검증
      if (!formData.meetingSchedule) {
        newErrors.meetingSchedule = '모임 일정을 입력해주세요';
      }
      if (formData.meetingType !== 'ONLINE' && !formData.location) {
        newErrors.location = '오프라인 장소를 입력해주세요';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSaving(true);
    try {
      const response = await studyService.proposeStudy({
        ...formData,
        proposalStatus: user?.systemRole === 'ROLE_ADMIN' ? 'APPROVED' : 'PENDING_REVIEW'
      });
      
      // 성공 처리
      if (user?.systemRole === 'ROLE_ADMIN') {
        // 관리자는 바로 상세 페이지로
        window.location.href = `/study/${response.id}`;
      } else {
        // 일반 유저는 제안 완료 페이지로
        window.location.href = `/study/proposal-complete`;
      }
    } catch (error) {
      console.error('Submit failed:', error);
      // 에러 처리
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="study-propose-page">
      <div className="study-propose-header">
        <h1>스터디 {user?.systemRole === 'ROLE_ADMIN' ? '개설' : '제안'}</h1>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. 기본 정보</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. 상세 정보</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. 운영 정보</div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. 검토 및 제출</div>
        </div>
      </div>

      {!isPreview ? (
        <div className="study-propose-content">
          {currentStep === 1 && (
            <StudyBasicInfoStep 
              data={formData}
              onChange={setFormData}
              errors={errors}
            />
          )}
          
          {currentStep === 2 && (
            <StudyDetailStep
              data={formData}
              onChange={setFormData}
              errors={errors}
              userRole={user?.systemRole || 'ROLE_USER'}
            />
          )}
          
          {currentStep === 3 && (
            <StudyOperationStep
              data={formData}
              onChange={setFormData}
              errors={errors}
            />
          )}
          
          {currentStep === 4 && (
            <StudyReviewStep
              data={formData}
              onEdit={(step) => setCurrentStep(step)}
              onPreview={() => setIsPreview(true)}
            />
          )}
        </div>
      ) : (
        <StudyPreview 
          data={formData}
          onClose={() => setIsPreview(false)}
        />
      )}

      <div className="study-propose-footer">
        {currentStep > 1 && (
          <button onClick={handlePrevious} className="btn-secondary">
            이전
          </button>
        )}
        
        {currentStep < 4 ? (
          <button onClick={handleNext} className="btn-primary">
            다음
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="btn-submit"
          >
            {isSaving ? '제출 중...' : 
             user?.systemRole === 'ROLE_ADMIN' ? '스터디 개설' : '제안 제출'}
          </button>
        )}
      </div>
    </div>
  );
}

// Step 2: 상세 정보 입력
function StudyDetailStep({ data, onChange, errors, userRole }) {
  return (
    <div className="study-detail-step">
      <h2>스터디 상세 정보</h2>
      
      <div className="form-section">
        <label>스터디 소개 *</label>
        <StudyRichTextEditor
          value={data.introduction}
          onChange={(html) => onChange({ ...data, introduction: html })}
          section="introduction"
          userRole={userRole}
          placeholder="스터디의 목적과 특징을 소개해주세요"
        />
        {errors.introduction && <span className="error">{errors.introduction}</span>}
      </div>

      <div className="form-section">
        <label>커리큘럼 *</label>
        <StudyRichTextEditor
          value={data.curriculum}
          onChange={(html) => onChange({ ...data, curriculum: html })}
          section="curriculum"
          userRole={userRole}
          placeholder="주차별 학습 계획을 작성해주세요"
        />
        {errors.curriculum && <span className="error">{errors.curriculum}</span>}
      </div>

      <div className="form-section">
        <label>참가 요건</label>
        <StudyRichTextEditor
          value={data.requirements}
          onChange={(html) => onChange({ ...data, requirements: html })}
          section="requirements"
          userRole={userRole}
          placeholder="필수 요건과 우대 사항을 작성해주세요"
        />
      </div>

      <div className="form-section">
        <label>기대 효과</label>
        <StudyRichTextEditor
          value={data.benefits}
          onChange={(html) => onChange({ ...data, benefits: html })}
          section="benefits"
          userRole={userRole}
          placeholder="스터디를 통해 얻을 수 있는 것들을 작성해주세요"
        />
      </div>
    </div>
  );
}
```

### 1.4 백오피스 검토 시스템

```typescript
// backoffice/pages/study/review/StudyReviewPage.tsx
import { useState, useEffect } from 'react';
import { RichTextDisplay } from '../../../components/common/RichTextDisplay';
import studyService from '../../../api/studyService';
import './StudyReviewPage.css';

interface StudyProposal {
  id: number;
  title: string;
  proposer: {
    id: number;
    name: string;
    email: string;
  };
  proposedAt: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  introduction: string;
  curriculum: string;
  requirements: string;
  benefits: string;
  reviewHistory: ReviewAction[];
}

interface ReviewAction {
  id: number;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comment: string;
  reviewedBy: string;
  reviewedAt: string;
}

export function StudyReviewPage() {
  const [proposals, setProposals] = useState<StudyProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<StudyProposal | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED'>('PENDING');
  const [reviewComment, setReviewComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadProposals();
  }, [filter]);

  const loadProposals = async () => {
    try {
      const data = await studyService.getProposalsForReview(filter);
      setProposals(data);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedProposal) return;
    
    setIsProcessing(true);
    try {
      await studyService.approveProposal(selectedProposal.id, {
        comment: reviewComment,
        publishImmediately: true
      });
      
      // 목록 새로고침
      await loadProposals();
      setSelectedProposal(null);
      setReviewComment('');
      
      // 성공 알림
      alert('스터디가 승인되었습니다.');
    } catch (error) {
      console.error('Approval failed:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProposal || !reviewComment) {
      alert('거절 사유를 입력해주세요.');
      return;
    }
    
    setIsProcessing(true);
    try {
      await studyService.rejectProposal(selectedProposal.id, {
        comment: reviewComment
      });
      
      await loadProposals();
      setSelectedProposal(null);
      setReviewComment('');
      
      alert('스터디 제안이 거절되었습니다.');
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedProposal || !reviewComment) {
      alert('수정 요청 사항을 입력해주세요.');
      return;
    }
    
    setIsProcessing(true);
    try {
      await studyService.requestChanges(selectedProposal.id, {
        comment: reviewComment,
        requiredChanges: parseRequiredChanges(reviewComment)
      });
      
      await loadProposals();
      setSelectedProposal(null);
      setReviewComment('');
      
      alert('수정 요청이 전송되었습니다.');
    } catch (error) {
      console.error('Request changes failed:', error);
      alert('수정 요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="study-review-page">
      <div className="review-header">
        <h1>스터디 제안 검토</h1>
        <div className="filter-tabs">
          <button 
            className={filter === 'PENDING' ? 'active' : ''}
            onClick={() => setFilter('PENDING')}
          >
            대기 중 ({proposals.filter(p => p.status === 'PENDING_REVIEW').length})
          </button>
          <button 
            className={filter === 'ALL' ? 'active' : ''}
            onClick={() => setFilter('ALL')}
          >
            전체 ({proposals.length})
          </button>
        </div>
      </div>

      <div className="review-content">
        <div className="proposals-list">
          {proposals.map(proposal => (
            <div 
              key={proposal.id}
              className={`proposal-card ${selectedProposal?.id === proposal.id ? 'selected' : ''}`}
              onClick={() => setSelectedProposal(proposal)}
            >
              <div className="proposal-header">
                <h3>{proposal.title}</h3>
                <span className={`status status-${proposal.status.toLowerCase()}`}>
                  {proposal.status}
                </span>
              </div>
              <div className="proposal-meta">
                <span>제안자: {proposal.proposer.name}</span>
                <span>제안일: {new Date(proposal.proposedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedProposal && (
          <div className="proposal-detail">
            <div className="detail-header">
              <h2>{selectedProposal.title}</h2>
              <div className="proposer-info">
                <img 
                  src={`/api/users/${selectedProposal.proposer.id}/avatar`} 
                  alt={selectedProposal.proposer.name}
                />
                <div>
                  <strong>{selectedProposal.proposer.name}</strong>
                  <span>{selectedProposal.proposer.email}</span>
                </div>
              </div>
            </div>

            <div className="detail-content">
              <section>
                <h3>스터디 소개</h3>
                <RichTextDisplay content={selectedProposal.introduction} />
              </section>

              <section>
                <h3>커리큘럼</h3>
                <RichTextDisplay content={selectedProposal.curriculum} />
              </section>

              <section>
                <h3>참가 요건</h3>
                <RichTextDisplay content={selectedProposal.requirements} />
              </section>

              <section>
                <h3>기대 효과</h3>
                <RichTextDisplay content={selectedProposal.benefits} />
              </section>

              {selectedProposal.reviewHistory.length > 0 && (
                <section>
                  <h3>검토 이력</h3>
                  <div className="review-history">
                    {selectedProposal.reviewHistory.map(action => (
                      <div key={action.id} className="review-action">
                        <span className={`action-type ${action.action.toLowerCase()}`}>
                          {action.action}
                        </span>
                        <span>{action.reviewedBy}</span>
                        <span>{new Date(action.reviewedAt).toLocaleString()}</span>
                        <p>{action.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {selectedProposal.status === 'PENDING_REVIEW' && (
              <div className="review-actions">
                <h3>검토 의견</h3>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="검토 의견을 작성해주세요..."
                  rows={5}
                />
                
                <div className="action-buttons">
                  <button 
                    className="btn-approve"
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    승인
                  </button>
                  <button 
                    className="btn-request-changes"
                    onClick={handleRequestChanges}
                    disabled={isProcessing}
                  >
                    수정 요청
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    거절
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 수정 요청 사항 파싱 (예: 체크리스트 형태로 변환)
function parseRequiredChanges(comment: string): string[] {
  const lines = comment.split('\n');
  const changes: string[] = [];
  
  lines.forEach(line => {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      changes.push(line.trim().substring(2));
    }
  });
  
  return changes.length > 0 ? changes : [comment];
}
```

## 2. 백엔드 구현 계획

### 2.1 데이터베이스 스키마

```sql
-- 스터디 테이블 확장
ALTER TABLE studies 
ADD COLUMN introduction TEXT COMMENT '스터디 소개 (HTML)',
ADD COLUMN curriculum TEXT COMMENT '커리큘럼 (HTML)',
ADD COLUMN requirements TEXT COMMENT '참가 요건 (HTML)',
ADD COLUMN benefits TEXT COMMENT '기대 효과 (HTML)',
ADD COLUMN detail_format VARCHAR(20) DEFAULT 'html' COMMENT '콘텐츠 형식',
ADD COLUMN meeting_type ENUM('ONLINE', 'OFFLINE', 'HYBRID') DEFAULT 'ONLINE',
ADD COLUMN meeting_schedule VARCHAR(500),
ADD COLUMN location VARCHAR(500),
ADD COLUMN difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
ADD COLUMN proposal_status ENUM('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT',
ADD COLUMN proposed_by BIGINT REFERENCES users(id),
ADD COLUMN proposed_at TIMESTAMP,
ADD COLUMN reviewed_by BIGINT REFERENCES users(id),
ADD COLUMN reviewed_at TIMESTAMP,
ADD COLUMN review_comment TEXT,
ADD COLUMN published_at TIMESTAMP,
ADD INDEX idx_proposal_status (proposal_status),
ADD INDEX idx_proposed_by (proposed_by);

-- 스터디 검토 이력 테이블
CREATE TABLE study_review_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  study_id BIGINT NOT NULL REFERENCES studies(id),
  action ENUM('APPROVE', 'REJECT', 'REQUEST_CHANGES') NOT NULL,
  comment TEXT,
  required_changes JSON COMMENT '수정 요청 사항 목록',
  reviewed_by BIGINT NOT NULL REFERENCES users(id),
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_study_review (study_id, reviewed_at)
);

-- 스터디 템플릿 테이블
CREATE TABLE study_templates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  introduction_template TEXT,
  curriculum_template TEXT,
  requirements_template TEXT,
  benefits_template TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_template_category (category, is_active)
);

-- 스터디 드래프트 (임시 저장)
CREATE TABLE study_drafts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  draft_data JSON NOT NULL COMMENT '임시 저장 데이터',
  last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_draft (user_id)
);
```

### 2.2 API 엔드포인트

```yaml
# Study Proposal APIs
POST   /api/studies/propose           # 스터디 제안
GET    /api/studies/proposals/my      # 내 제안 목록
GET    /api/studies/proposals/{id}    # 제안 상세
PUT    /api/studies/proposals/{id}    # 제안 수정
DELETE /api/studies/proposals/{id}    # 제안 철회

# Draft APIs
POST   /api/studies/drafts            # 드래프트 저장
GET    /api/studies/drafts/my         # 내 드래프트 조회
DELETE /api/studies/drafts/my         # 드래프트 삭제

# Review APIs (Admin)
GET    /api/admin/studies/proposals   # 검토 대기 목록
GET    /api/admin/studies/proposals/{id} # 제안 상세 (관리자용)
POST   /api/admin/studies/proposals/{id}/approve  # 승인
POST   /api/admin/studies/proposals/{id}/reject   # 거절
POST   /api/admin/studies/proposals/{id}/request-changes # 수정 요청

# Template APIs
GET    /api/studies/templates         # 템플릿 목록
GET    /api/studies/templates/{id}    # 템플릿 상세
POST   /api/admin/studies/templates   # 템플릿 생성 (관리자)
PUT    /api/admin/studies/templates/{id} # 템플릿 수정 (관리자)

# Study Detail APIs
GET    /api/studies/{id}/detail       # 스터디 상세 정보
PUT    /api/studies/{id}/detail       # 상세 정보 수정 (권한 체크)
```

### 2.3 Spring Boot 구현 예시

```kotlin
// StudyProposalController.kt
@RestController
@RequestMapping("/api/studies")
class StudyProposalController(
    private val studyProposalService: StudyProposalService,
    private val studyDraftService: StudyDraftService
) {
    
    @PostMapping("/propose")
    fun proposeStudy(
        @Valid @RequestBody request: StudyProposalRequest,
        @AuthenticationPrincipal user: UserPrincipal
    ): ResponseEntity<StudyProposalResponse> {
        // HTML 콘텐츠 검증 및 sanitize
        val sanitizedRequest = request.copy(
            introduction = htmlSanitizer.sanitize(request.introduction),
            curriculum = htmlSanitizer.sanitize(request.curriculum),
            requirements = htmlSanitizer.sanitize(request.requirements),
            benefits = htmlSanitizer.sanitize(request.benefits)
        )
        
        // 관리자는 바로 승인, 일반 유저는 검토 대기
        val proposalStatus = if (user.hasRole("ADMIN")) {
            ProposalStatus.APPROVED
        } else {
            ProposalStatus.PENDING_REVIEW
        }
        
        val proposal = studyProposalService.createProposal(
            sanitizedRequest,
            user.id,
            proposalStatus
        )
        
        // 드래프트 삭제
        studyDraftService.deleteDraft(user.id)
        
        return ResponseEntity.ok(StudyProposalResponse.from(proposal))
    }
    
    @PostMapping("/drafts")
    fun saveDraft(
        @RequestBody draftData: Map<String, Any>,
        @AuthenticationPrincipal user: UserPrincipal
    ): ResponseEntity<Void> {
        studyDraftService.saveDraft(user.id, draftData)
        return ResponseEntity.ok().build()
    }
    
    @GetMapping("/drafts/my")
    fun getMyDraft(
        @AuthenticationPrincipal user: UserPrincipal
    ): ResponseEntity<Map<String, Any>> {
        val draft = studyDraftService.getDraft(user.id)
        return if (draft != null) {
            ResponseEntity.ok(draft)
        } else {
            ResponseEntity.noContent().build()
        }
    }
}

// StudyReviewController.kt (Admin)
@RestController
@RequestMapping("/api/admin/studies/proposals")
@PreAuthorize("hasRole('ADMIN')")
class StudyReviewController(
    private val studyReviewService: StudyReviewService,
    private val notificationService: NotificationService
) {
    
    @GetMapping
    fun getProposalsForReview(
        @RequestParam(defaultValue = "PENDING_REVIEW") status: String,
        @PageableDefault(size = 20) pageable: Pageable
    ): Page<StudyProposalSummary> {
        return studyReviewService.getProposalsByStatus(status, pageable)
    }
    
    @PostMapping("/{id}/approve")
    fun approveProposal(
        @PathVariable id: Long,
        @RequestBody request: ApprovalRequest,
        @AuthenticationPrincipal reviewer: UserPrincipal
    ): ResponseEntity<Void> {
        val study = studyReviewService.approveProposal(
            id,
            reviewer.id,
            request.comment,
            request.publishImmediately
        )
        
        // 제안자에게 알림 전송
        notificationService.sendStudyApprovedNotification(
            study.proposedBy,
            study.title
        )
        
        return ResponseEntity.ok().build()
    }
    
    @PostMapping("/{id}/reject")
    fun rejectProposal(
        @PathVariable id: Long,
        @RequestBody request: RejectionRequest,
        @AuthenticationPrincipal reviewer: UserPrincipal
    ): ResponseEntity<Void> {
        studyReviewService.rejectProposal(
            id,
            reviewer.id,
            request.comment
        )
        
        // 제안자에게 알림 전송
        notificationService.sendStudyRejectedNotification(
            study.proposedBy,
            study.title,
            request.comment
        )
        
        return ResponseEntity.ok().build()
    }
    
    @PostMapping("/{id}/request-changes")
    fun requestChanges(
        @PathVariable id: Long,
        @RequestBody request: ChangeRequest,
        @AuthenticationPrincipal reviewer: UserPrincipal
    ): ResponseEntity<Void> {
        studyReviewService.requestChanges(
            id,
            reviewer.id,
            request.comment,
            request.requiredChanges
        )
        
        // 제안자에게 알림 전송
        notificationService.sendStudyChangeRequestNotification(
            study.proposedBy,
            study.title,
            request.requiredChanges
        )
        
        return ResponseEntity.ok().build()
    }
}
```

## 3. 성능 및 보안 고려사항

### 3.1 성능 최적화
- **지연 로딩**: 상세 정보는 필요 시에만 로드
- **캐싱**: 승인된 스터디 상세 정보는 Redis 캐싱
- **CDN**: 이미지 및 정적 콘텐츠는 CDN 활용
- **페이지네이션**: 목록 조회 시 페이지 단위 로드

### 3.2 보안 강화
- **XSS 방지**: 모든 HTML 콘텐츠 DOMPurify 처리
- **권한 검증**: 각 API별 세밀한 권한 체크
- **Rate Limiting**: 제안 API에 속도 제한 적용
- **입력 검증**: 서버 사이드 콘텐츠 길이 및 형식 검증

### 3.3 사용성 개선
- **자동 저장**: 3초마다 드래프트 자동 저장
- **실시간 미리보기**: 작성 중 실시간 미리보기 제공
- **템플릿 제공**: 카테고리별 기본 템플릿 제공
- **진행 상황 표시**: 단계별 진행률 표시

## 4. 테스트 계획

### 4.1 단위 테스트
```typescript
// StudyRichTextEditor.test.tsx
describe('StudyRichTextEditor', () => {
  it('should initialize with template for each section', () => {
    const { getByText } = render(
      <StudyRichTextEditor 
        section="curriculum"
        value=""
        onChange={jest.fn()}
        userRole="USER"
      />
    );
    expect(getByText('커리큘럼')).toBeInTheDocument();
  });
  
  it('should enforce character limit for regular users', () => {
    // ...
  });
  
  it('should allow extended features for admin users', () => {
    // ...
  });
});
```

### 4.2 통합 테스트
```typescript
// StudyProposal.e2e.test.ts
describe('Study Proposal Flow', () => {
  it('should complete full proposal flow for regular user', async () => {
    // 1. 로그인
    // 2. 제안 페이지 접근
    // 3. 각 단계 입력
    // 4. 제출
    // 5. 대기 상태 확인
  });
  
  it('should auto-approve for admin user', async () => {
    // ...
  });
});
```

### 4.3 성능 테스트
- 에디터 로딩 시간 < 1초
- 자동 저장 응답 시간 < 500ms
- 대용량 콘텐츠 (10,000자) 렌더링 < 2초

## 5. 마이그레이션 계획

### 5.1 기존 스터디 데이터 마이그레이션
```sql
-- 하드코딩된 스터디 정보를 DB로 이전
INSERT INTO studies (
  title,
  introduction,
  curriculum,
  requirements,
  benefits,
  proposal_status,
  proposed_by,
  reviewed_by,
  published_at
) VALUES (
  '테코테코',
  '<h2>테코테코 소개</h2><p>...</p>',  -- 기존 HTML 변환
  '<h2>커리큘럼</h2>...',
  '<h2>참가 요건</h2>...',
  '<h2>기대 효과</h2>...',
  'APPROVED',
  1,  -- 시스템 관리자
  1,
  NOW()
);
```

### 5.2 단계별 롤아웃
1. **Alpha**: 내부 테스트 (1주)
2. **Beta**: 선별된 유저 그룹 (2주)
3. **GA**: 전체 유저 오픈 (점진적 롤아웃)

## 6. 모니터링 및 분석

### 6.1 핵심 지표
- 일일 제안 수
- 제안 완료율
- 승인/거절 비율
- 평균 검토 시간
- 에디터 사용 패턴

### 6.2 에러 모니터링
- Sentry 통합
- 에디터 크래시 추적
- API 에러율 모니터링

## 7. 향후 개선 사항

### Phase 2 (2개월 후)
- AI 기반 콘텐츠 제안
- 협업 편집 기능
- 버전 관리 시스템
- 댓글 및 피드백 시스템

### Phase 3 (6개월 후)
- 스터디 템플릿 마켓플레이스
- 멀티미디어 콘텐츠 지원
- 실시간 프리뷰
- A/B 테스트 플랫폼

*작성일: 2025년 8월 6일*
*작성자: AsyncSite Platform Team*