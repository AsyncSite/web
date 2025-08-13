import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import studyService, { Study, ApplicationResponse, MemberResponse, ApplicationStatus } from '../api/studyService';
import studyDetailPageService, { 
  StudyDetailPageData, 
  PageSection, 
  SectionType,
  AddSectionRequest 
} from '../api/studyDetailPageService';
import { SectionRenderer } from '../components/studyDetailPage/sections';
import SectionEditForm from '../components/studyDetailPage/editor/SectionEditForm';
import { normalizeMembersPropsForUI, serializeMembersPropsForAPI } from '../components/studyDetailPage/utils/membersAdapter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';
import InputModal from '../components/common/InputModal';
import { ToastContainer, ToastType } from '../components/common/Toast';
import './StudyManagementPage.css';
import '../components/studyDetailPage/StudyDetailPageRenderer.css';

interface TabType {
  key: 'applications' | 'members' | 'page-editor';
  label: string;
  icon: string;
}

const tabs: TabType[] = [
  { key: 'applications', label: '참가 신청', icon: '📋' },
  { key: 'members', label: '멤버 관리', icon: '👥' },
  { key: 'page-editor', label: '상세 페이지 편집', icon: '✏️' }
];

const StudyManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { studyId } = useParams<{ studyId: string }>();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'members' | 'page-editor'>('applications');
  const [study, setStudy] = useState<Study | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Page editor states
  const [pageData, setPageData] = useState<StudyDetailPageData | null>(null);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Modal and Toast states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmButtonClass?: string;
  }>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {},
    confirmButtonClass: 'confirm-button'
  });
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    placeholder?: string;
    onSubmit: (value: string) => void;
  }>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    placeholder: '',
    onSubmit: () => {}
  });
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type?: ToastType;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!studyId) {
        navigate('/study');
        return;
      }

      if (!isAuthenticated || !user) {
        navigate('/login', { state: { from: `/study/${studyId}/manage` } });
        return;
      }

      try {
        setLoading(true);
        
        // Fetch study details - studyId가 실제로는 slug일 수도 있음
        let studyData = null;
        
        // UUID 패턴 체크 (숫자나 slug가 아닌 경우)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studyId);
        
        if (isUUID) {
          studyData = await studyService.getStudyById(studyId);
        } else {
          // slug로 먼저 시도
          studyData = await studyService.getStudyBySlug(studyId);
        }
        
        if (!studyData) {
          addToast('존재하지 않는 스터디입니다.', 'error');
          navigate('/study');
          return;
        }

        setStudy(studyData);

        // 권한 체크
        // TODO: 백엔드에서 실제로 스터디 호스트인지 확인하는 API가 필요합니다.
        // 현재는 프론트엔드에서만 체크하므로 보안상 완벽하지 않습니다.
        // 백엔드에서 proposerId나 role 정보를 확인해야 합니다.
        
        // Fetch applications - 실제 study ID 사용
        try {
          const applicationsData = await studyService.getStudyApplications(studyData.id, 0, 50);
          setApplications(applicationsData.content);
        } catch (error) {
          console.warn('Failed to fetch applications:', error);
          setApplications([]);
        }

        // Fetch members - 실제 study ID 사용
        try {
          const membersData = await studyService.getStudyMembers(studyData.id, 0, 50);
          setMembers(membersData.content);
        } catch (error) {
          console.warn('Failed to fetch members:', error);
          setMembers([]);
        }

        // Fetch page data for editor - 실제 study ID 사용
        try {
          const pageData = await studyDetailPageService.getDraftPage(studyData.id);
          setPageData(pageData);
        } catch (error) {
          console.warn('Failed to fetch page data, trying to fetch by slug:', error);
          // Try to fetch by slug if draft page doesn't exist
          if (studyData.slug) {
            try {
              const pageData = await studyDetailPageService.getPublishedPageBySlug(studyData.slug);
              setPageData(pageData);
            } catch (error) {
              console.warn('Failed to fetch page by slug:', error);
              // Page doesn't exist yet, that's okay
              setPageData(null);
            }
          }
        }

      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        addToast('스터디 관리 정보를 불러올 수 없습니다.', 'error');
        navigate('/study');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studyId, navigate, isAuthenticated, user]);

  const handleAcceptApplication = async (applicationId: string) => {
    if (!study || !user) return;

    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setConfirmModal({
      isOpen: true,
      title: '참가 신청 승인',
      message: `${application.applicantId}님의 참가 신청을 승인하시겠습니까?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await doAcceptApplication(applicationId);
      },
      confirmButtonClass: 'confirm-button'
    });
  };
  
  const doAcceptApplication = async (applicationId: string) => {
    if (!study || !user) return;
    
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setActionLoading(applicationId);
    
    try {
      await studyService.acceptApplication(study.id, applicationId, {
        reviewerId: user.email,
        note: '참가 승인'
      });

      // Update applications state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: ApplicationStatus.ACCEPTED, reviewedBy: user.email, reviewNote: '참가 승인' }
            : app
        )
      );

      addToast('참가 신청이 승인되었습니다.', 'success');
      
      // Refresh members list
      try {
        const membersData = await studyService.getStudyMembers(study.id, 0, 50);
        setMembers(membersData.content);
      } catch (error) {
        console.warn('Failed to refresh members:', error);
      }
    } catch (error: any) {
      console.error('승인 처리 실패:', error);
      const errorMessage = error.response?.data?.message || '승인 처리 중 오류가 발생했습니다.';
      addToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Page editor handlers
  const handleAddSection = async (type: SectionType | string, props: any) => {
    if (!study) return;

    try {
      setSaving(true);
      const request: AddSectionRequest = { 
        type: type as SectionType, 
        props: props 
      };
      const updatedPage = await studyDetailPageService.addSection(study!.id, request);
      setPageData(updatedPage);
      setShowAddSection(false);
    } catch (err) {
      console.error('Failed to add section:', err);
      addToast('섹션 추가에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = async (sectionId: string, sectionType: SectionType | string, props: any) => {
    if (!studyId) return;

    try {
      setSaving(true);
      const request: AddSectionRequest = { 
        type: sectionType as SectionType, 
        props: props 
      };
      const updatedPage = await studyDetailPageService.updateSection(study!.id, sectionId, request);
      setPageData(updatedPage);
      setSelectedSection(null);
    } catch (err) {
      console.error('Failed to update section:', err);
      addToast('섹션 업데이트에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!studyId) return;
    
    setConfirmModal({
      isOpen: true,
      title: '섹션 삭제',
      message: '정말로 이 섹션을 삭제하시겠습니까?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await doDeleteSection(sectionId);
      },
      confirmButtonClass: 'delete-confirm-button'
    });
  };
  
  const doDeleteSection = async (sectionId: string) => {
    if (!studyId) return;

    try {
      setSaving(true);
      const updatedPage = await studyDetailPageService.removeSection(study!.id, sectionId);
      setPageData(updatedPage);
    } catch (err) {
      console.error('Failed to delete section:', err);
      addToast('섹션 삭제에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReorderSection = async (sectionId: string, newIndex: number) => {
    if (!studyId || !pageData) return;

    try {
      setSaving(true);
      // Create new order array with the section moved
      const sections = [...pageData.sections];
      const currentIndex = sections.findIndex(s => s.id === sectionId);
      if (currentIndex === -1) return;
      
      const [removed] = sections.splice(currentIndex, 1);
      sections.splice(newIndex, 0, removed);
      
      const sectionIds = sections.map(s => s.id);
      const updatedPage = await studyDetailPageService.reorderSections(study!.id, sectionIds);
      setPageData(updatedPage);
    } catch (err) {
      console.error('Failed to reorder section:', err);
      addToast('섹션 순서 변경에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    // 드래그 중인 요소 스타일 설정
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  // 키보드 접근성을 위한 핸들러
  const handleKeyDown = (e: React.KeyboardEvent, section: PageSection, index: number) => {
    if (!pageData) return;

    // Alt + 화살표 키로 순서 변경
    if (e.altKey) {
      if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        handleReorderSection(section.id, index - 1);
      } else if (e.key === 'ArrowDown' && index < pageData.sections.length - 1) {
        e.preventDefault();
        handleReorderSection(section.id, index + 1);
      }
    }
    // Enter 키로 편집
    else if (e.key === 'Enter') {
      e.preventDefault();
      setSelectedSection(section);
    }
    // Delete 키로 삭제
    else if (e.key === 'Delete') {
      e.preventDefault();
      handleDeleteSection(section.id);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // 드래그 종료 시 스타일 복원
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedSectionId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedSectionId || !pageData) return;
    
    const draggedIndex = pageData.sections.findIndex(s => s.id === draggedSectionId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;
    
    await handleReorderSection(draggedSectionId, dropIndex);
  };

  const handleSaveDraft = async () => {
    if (!studyId || !pageData) return;

    try {
      setSaving(true);
      const updatedPage = await studyDetailPageService.saveDraft(study!.id, {
        theme: pageData.theme,
        sections: pageData.sections
      });
      setPageData(updatedPage);
      addToast('초안이 저장되었습니다', 'success');
    } catch (err) {
      console.error('Failed to save draft:', err);
      addToast('초안 저장에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishPage = async () => {
    if (!studyId) return;
    
    setConfirmModal({
      isOpen: true,
      title: '페이지 발행',
      message: '페이지를 발행하시겠습니까?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await doPublishPage();
      },
      confirmButtonClass: 'confirm-button'
    });
  };
  
  const doPublishPage = async () => {
    if (!studyId) return;

    try {
      setSaving(true);
      const updatedPage = await studyDetailPageService.publish(study!.id);
      setPageData(updatedPage);
      
      // 발행 후 선택된 섹션을 해제하여 최신 데이터로 다시 로드하도록 유도
      setSelectedSection(null);
      
      addToast('페이지가 발행되었습니다', 'success');
    } catch (err) {
      console.error('Failed to publish page:', err);
      addToast('페이지 발행에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toast helper function
  const addToast = (message: string, type?: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const handleRejectApplication = async (applicationId: string) => {
    if (!studyId || !user) return;

    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setInputModal({
      isOpen: true,
      title: '참가 신청 거절',
      message: `${application.applicantId}님의 참가 신청을 거절하는 이유를 입력해주세요:`,
      placeholder: '거절 사유를 입력하세요...',
      onSubmit: async (reason: string) => {
        setInputModal(prev => ({ ...prev, isOpen: false }));
        if (!reason) return;
        
        setActionLoading(applicationId);
        
        try {
          await studyService.rejectApplication(studyId, applicationId, {
            reviewerId: user.email,
            reason: reason.trim()
          });

          // Update applications state
          setApplications(prev => 
            prev.map(app => 
              app.id === applicationId 
                ? { ...app, status: ApplicationStatus.REJECTED, reviewedBy: user.email, reviewNote: reason.trim() }
                : app
            )
          );

          addToast('참가 신청이 거절되었습니다.', 'info');
        } catch (error: any) {
          console.error('거절 처리 실패:', error);
          const errorMessage = error.response?.data?.message || '거절 처리 중 오류가 발생했습니다.';
          addToast(errorMessage, 'error');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return <span className="status-badge pending">대기중</span>;
      case ApplicationStatus.ACCEPTED:
        return <span className="status-badge accepted">승인됨</span>;
      case ApplicationStatus.REJECTED:
        return <span className="status-badge rejected">거절됨</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="study-management-page">
        <div className="loading-state">
          <LoadingSpinner message="스터디 관리 정보를 불러오는 중..." fullScreen={false} />
        </div>
      </div>
    );
  }

  if (!study) {
    return null;
  }

  const pendingApplications = applications.filter(app => app.status === ApplicationStatus.PENDING);
  const processedApplications = applications.filter(app => app.status !== ApplicationStatus.PENDING);

  return (
    <div className="study-management-page">
      <div className="management-container">
        <div className="management-header">
          <button 
            onClick={() => navigate(`/study/${study.slug}`)} 
            className="back-button"
          >
            ← 스터디로 돌아가기
          </button>
          <h1>스터디 관리</h1>
          <div className="study-info">
            <h2>{study.name} {study.generation > 1 && `${study.generation}기`}</h2>
            <p className="study-tagline">{study.tagline}</p>
            <div className="study-stats">
              <span>📋 신청자 {applications.length}명</span>
              <span>👥 멤버 {members.length}명</span>
              <span>⏳ 대기 {pendingApplications.length}명</span>
            </div>
          </div>
          {/* 권한 안내 메시지 */}
          {applications.length === 0 && members.length === 0 && (
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '16px',
              color: '#ffc107',
              fontSize: '14px'
            }}>
              ⚠️ 스터디 호스트만 이 페이지에 접근할 수 있습니다. 권한이 없는 경우 데이터가 표시되지 않을 수 있습니다.
            </div>
          )}
        </div>

        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
              {tab.key === 'applications' && pendingApplications.length > 0 && (
                <span className="badge">{pendingApplications.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'applications' && (
          <div className="applications-section">
            {pendingApplications.length > 0 && (
              <div className="pending-applications">
                <h3>🔔 검토 대기 중인 신청</h3>
                <div className="applications-grid">
                  {pendingApplications.map(application => (
                    <div key={application.id} className="application-card pending">
                      <div className="application-header">
                        <h4>{application.applicantId}</h4>
                        {getStatusBadge(application.status)}
                        <span className="application-date">
                          {formatDate(application.createdAt)}
                        </span>
                      </div>

                      <div className="application-content">
                        {Object.entries(application.answers).map(([question, answer]) => (
                          <div key={question} className="answer-item">
                            <strong className="question-label">
                              {question === 'motivation' && '참여 동기:'}
                              {question === 'experience' && '관련 경험:'}
                              {question === 'availability' && '참여 가능 시간:'}
                              {question === 'expectations' && '기대하는 점:'}
                              {question === 'commitment' && '각오 한마디:'}
                              {!['motivation', 'experience', 'availability', 'expectations', 'commitment'].includes(question) && `${question}:`}
                            </strong>
                            <p className="answer-text">{answer}</p>
                          </div>
                        ))}
                      </div>

                      <div className="application-actions">
                        <button 
                          onClick={() => handleRejectApplication(application.id)}
                          className="reject-button"
                          disabled={actionLoading === application.id}
                        >
                          {actionLoading === application.id ? '처리 중...' : '거절'}
                        </button>
                        <button 
                          onClick={() => handleAcceptApplication(application.id)}
                          className="accept-button"
                          disabled={actionLoading === application.id}
                        >
                          {actionLoading === application.id ? '처리 중...' : '승인'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processedApplications.length > 0 && (
              <div className="processed-applications">
                <h3>📄 처리 완료된 신청</h3>
                <div className="applications-list">
                  {processedApplications.map(application => (
                    <div key={application.id} className="application-item">
                      <div className="application-summary">
                        <span className="applicant-name">{application.applicantId}</span>
                        {getStatusBadge(application.status)}
                        <span className="application-date">{formatDate(application.createdAt)}</span>
                      </div>
                      {application.reviewNote && (
                        <div className="review-note">
                          <strong>검토 메모:</strong> {application.reviewNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {applications.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>아직 참가 신청이 없습니다</h3>
                <p>스터디가 공개되면 참가 신청이 들어올 예정입니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-section">
            {members.length > 0 ? (
              <div className="members-grid">
                {members.map(member => (
                  <div key={member.id} className="member-card">
                    <div className="member-info">
                      <h4>{member.userId}</h4>
                      <span className="member-role">{member.role}</span>
                    </div>
                    <div className="member-meta">
                      <span>가입: {formatDate(member.joinedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>아직 멤버가 없습니다</h3>
                <p>참가 신청을 승인하면 멤버로 추가됩니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'page-editor' && (
          <div className="page-editor-section">
            <div className="editor-header">
              <h3>상세 페이지 편집</h3>
              <div className="editor-actions">
                <button 
                  className="btn-preview"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? '편집 모드' : '미리보기'}
                </button>
                {/* 초안 저장 버튼 제거: 스냅샷 미도입 상태에서 혼란 방지 */}
                <button 
                  className="btn-publish"
                  onClick={handlePublishPage}
                  disabled={saving}
                >
                  발행하기
                </button>
                {study?.slug && (
                  <button 
                    className="btn-view"
                    onClick={() => window.open(`/study/${study.slug}`, '_blank')}
                  >
                    페이지 보기 →
                  </button>
                )}
              </div>
            </div>

            {!pageData ? (
              <div className="no-page-message">
                <p>아직 상세 페이지가 생성되지 않았습니다.</p>
                <button 
                  onClick={async () => {
                    if (!studyId) return;
                    try {
                      setSaving(true);
                      const newPage = await studyDetailPageService.createPage(study!.id, {
                        slug: study?.slug || studyId,
                      });
                      setPageData(newPage);
                    } catch (err) {
                      console.error('Failed to create page:', err);
                      addToast('페이지 생성에 실패했습니다', 'error');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  페이지 생성하기
                </button>
              </div>
            ) : previewMode ? (
              <div className="preview-container">
                <h4>미리보기</h4>
                <div className="preview-content study-detail-page-content">
                  <div className="sections-container">
                    {pageData.sections.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>아직 섹션이 없습니다.</p>
                    ) : (
                      pageData.sections.map((section) => (
                        <div key={section.id} className="section-wrapper">
                          <SectionRenderer type={section.type} data={section.props} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="editor-content" style={{ display: 'flex', gap: '24px' }}>
                <div className="sections-manager" style={{ flex: '0 0 380px', minWidth: '380px' }}>
                  <div className="sections-header">
                    <h4>섹션 관리</h4>
                    <button 
                      className="btn-add-section"
                      onClick={() => setShowAddSection(true)}
                    >
                      + 섹션 추가
                    </button>
                  </div>

                  {showAddSection && (
                    <div className="add-section-modal">
                      <div className="modal-content">
                        <h5>새 섹션 추가</h5>
                        <div className="section-types">
                          {[
                            SectionType.HERO,
                            SectionType.RICH_TEXT,
                            SectionType.MEMBERS,
                            SectionType.FAQ,
                            SectionType.REVIEWS,
                            SectionType.HOW_WE_ROLL,
                            SectionType.JOURNEY,
                            SectionType.EXPERIENCE
                          ].map((type) => (
                            <button
                              key={type}
                              className="section-type-btn"
                              onClick={() => {
                                setSelectedSection({
                                  id: 'new',
                                  type: type as any,
                                  props: {},
                                  order: pageData.sections.length
                                });
                                setShowAddSection(false);
                              }}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <button 
                          className="btn-cancel"
                          onClick={() => setShowAddSection(false)}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="study-mgmt-sections-list">
                    {pageData.sections.length === 0 ? (
                      <p className="study-mgmt-empty-message">아직 섹션이 없습니다. 섹션을 추가해주세요.</p>
                    ) : (
                      pageData.sections.map((section, index) => (
                        <div 
                          key={section.id} 
                          className={`study-mgmt-section-item ${
                            draggedSectionId === section.id ? 'study-mgmt-section-dragging' : ''
                          } ${
                            dragOverIndex === index ? 'study-mgmt-section-drag-over' : ''
                          }`}
                          draggable
                          tabIndex={0}
                          role="listitem"
                          aria-label={`${section.type} 섹션, ${index + 1}번째 위치. Alt+화살표로 순서 변경, Enter로 편집, Delete로 삭제`}
                          onDragStart={(e) => handleDragStart(e, section.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, section, index)}
                        >
                          <div className="study-mgmt-drag-handle" title="드래그하여 순서 변경">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <circle cx="6" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="6" cy="10" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="6" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="14" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="14" cy="10" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="14" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
                            </svg>
                          </div>
                          <div className="study-mgmt-section-info">
                            <span className="study-mgmt-section-type">{section.type}</span>
                          </div>
                          <div className="study-mgmt-section-actions">
                            <button 
                              className="study-mgmt-edit-btn"
                              onClick={() => setSelectedSection(section)}
                              title="섹션 편집"
                            >
                              ✏️
                            </button>
                            <button 
                              className="study-mgmt-delete-btn"
                              onClick={() => handleDeleteSection(section.id)}
                              title="섹션 삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selectedSection && (
                  <div className="section-editor" style={{ flex: 1, minWidth: 0 }}>
                    <SectionEditForm
                      sectionType={selectedSection.type}
                      studyId={study?.id}  // 실제 스터디 ID 전달
                      initialData={selectedSection.type === SectionType.MEMBERS
                        ? normalizeMembersPropsForUI(selectedSection.props || {})
                        : (selectedSection.props || {})}
                      onSave={(data) => {
                        const outgoing = selectedSection.type === SectionType.MEMBERS
                          ? serializeMembersPropsForAPI(data)
                          : data;
                        if (selectedSection.id === 'new') {
                          handleAddSection(selectedSection.type, outgoing);
                        } else {
                          handleUpdateSection(selectedSection.id, selectedSection.type, outgoing);
                        }
                      }}
                      onCancel={() => setSelectedSection(null)}
                    />
                  </div>
                )}
              </div>
            )}

            {saving && (
              <div className="saving-overlay">
                <LoadingSpinner />
                <p>저장 중...</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmButtonClass={confirmModal.confirmButtonClass}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
      
      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
        onSubmit={inputModal.onSubmit}
        onCancel={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
        multiline={true}
        maxLength={500}
      />
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default StudyManagementPage;