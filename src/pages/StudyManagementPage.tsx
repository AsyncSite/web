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
import { adaptSectionForBackend, restoreSectionTypes, isExtendedSection } from '../components/studyDetailPage/utils/sectionTypeAdapter';
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
        
        // Fetch study details
        const studyData = await studyService.getStudyById(studyId);
        if (!studyData) {
          alert('존재하지 않는 스터디입니다.');
          navigate('/study');
          return;
        }

        setStudy(studyData);

        // 권한 체크
        // TODO: 백엔드에서 실제로 스터디 호스트인지 확인하는 API가 필요합니다.
        // 현재는 프론트엔드에서만 체크하므로 보안상 완벽하지 않습니다.
        // 백엔드에서 proposerId나 role 정보를 확인해야 합니다.
        
        // Fetch applications
        try {
          const applicationsData = await studyService.getStudyApplications(studyId, 0, 50);
          setApplications(applicationsData.content);
        } catch (error) {
          console.warn('Failed to fetch applications:', error);
          setApplications([]);
        }

        // Fetch members
        try {
          const membersData = await studyService.getStudyMembers(studyId, 0, 50);
          setMembers(membersData.content);
        } catch (error) {
          console.warn('Failed to fetch members:', error);
          setMembers([]);
        }

        // Fetch page data for editor
        try {
          const pageData = await studyDetailPageService.getDraftPage(studyId);
          // 받은 데이터의 섹션 타입을 복원
          if (pageData && pageData.sections) {
            pageData.sections = restoreSectionTypes(pageData.sections);
          }
          setPageData(pageData);
        } catch (error) {
          console.warn('Failed to fetch page data, trying to fetch by slug:', error);
          // Try to fetch by slug if draft page doesn't exist
          if (studyData.slug) {
            try {
              const pageData = await studyDetailPageService.getPublishedPageBySlug(studyData.slug);
              // 받은 데이터의 섹션 타입을 복원
              if (pageData && pageData.sections) {
                pageData.sections = restoreSectionTypes(pageData.sections);
              }
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
        alert('스터디 관리 정보를 불러올 수 없습니다.');
        navigate('/study');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studyId, navigate, isAuthenticated, user]);

  const handleAcceptApplication = async (applicationId: string) => {
    if (!studyId || !user) return;

    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    const confirmMessage = `${application.applicantId}님의 참가 신청을 승인하시겠습니까?`;
    if (!confirm(confirmMessage)) return;

    setActionLoading(applicationId);
    
    try {
      await studyService.acceptApplication(studyId, applicationId, {
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

      alert('참가 신청이 승인되었습니다.');
      
      // Refresh members list
      try {
        const membersData = await studyService.getStudyMembers(studyId, 0, 50);
        setMembers(membersData.content);
      } catch (error) {
        console.warn('Failed to refresh members:', error);
      }
    } catch (error: any) {
      console.error('승인 처리 실패:', error);
      const errorMessage = error.response?.data?.message || '승인 처리 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Page editor handlers
  const handleAddSection = async (type: SectionType | string, props: any) => {
    if (!studyId) return;

    try {
      setSaving(true);
      // 확장 타입인 경우 어댑터를 통해 변환
      const adapted = adaptSectionForBackend(type, props);
      const request: AddSectionRequest = { 
        type: adapted.type, 
        props: adapted.props 
      };
      const updatedPage = await studyDetailPageService.addSection(studyId, request);
      // 받은 데이터의 섹션 타입을 복원
      if (updatedPage && updatedPage.sections) {
        updatedPage.sections = restoreSectionTypes(updatedPage.sections);
      }
      setPageData(updatedPage);
      setShowAddSection(false);
    } catch (err) {
      console.error('Failed to add section:', err);
      alert('섹션 추가에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = async (sectionId: string, sectionType: SectionType | string, props: any) => {
    if (!studyId) return;

    try {
      setSaving(true);
      // 확장 타입인 경우 어댑터를 통해 변환
      const adapted = adaptSectionForBackend(sectionType, props);
      const request: AddSectionRequest = { 
        type: adapted.type, 
        props: adapted.props 
      };
      const updatedPage = await studyDetailPageService.updateSection(studyId, sectionId, request);
      // 받은 데이터의 섹션 타입을 복원
      if (updatedPage && updatedPage.sections) {
        updatedPage.sections = restoreSectionTypes(updatedPage.sections);
      }
      setPageData(updatedPage);
      setSelectedSection(null);
    } catch (err) {
      console.error('Failed to update section:', err);
      alert('섹션 업데이트에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!studyId) return;
    
    if (!window.confirm('정말로 이 섹션을 삭제하시겠습니까?')) return;

    try {
      setSaving(true);
      const updatedPage = await studyDetailPageService.removeSection(studyId, sectionId);
      setPageData(updatedPage);
    } catch (err) {
      console.error('Failed to delete section:', err);
      alert('섹션 삭제에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleReorderSection = async (sectionId: string, newOrder: number) => {
    if (!studyId || !pageData) return;

    try {
      setSaving(true);
      // Create new order array with the section moved
      const sections = [...pageData.sections];
      const currentIndex = sections.findIndex(s => s.id === sectionId);
      if (currentIndex === -1) return;
      
      const [removed] = sections.splice(currentIndex, 1);
      sections.splice(newOrder, 0, removed);
      
      const sectionIds = sections.map(s => s.id);
      const updatedPage = await studyDetailPageService.reorderSections(studyId, sectionIds);
      setPageData(updatedPage);
    } catch (err) {
      console.error('Failed to reorder section:', err);
      alert('섹션 순서 변경에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!studyId || !pageData) return;

    try {
      setSaving(true);
      const updatedPage = await studyDetailPageService.saveDraft(studyId, {
        theme: pageData.theme,
        sections: pageData.sections
      });
      setPageData(updatedPage);
      alert('초안이 저장되었습니다');
    } catch (err) {
      console.error('Failed to save draft:', err);
      alert('초안 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishPage = async () => {
    if (!studyId) return;
    
    if (!window.confirm('페이지를 발행하시겠습니까?')) return;

    try {
      setSaving(true);
      const updatedPage = await studyDetailPageService.publish(studyId);
      setPageData(updatedPage);
      
      // 발행 후 선택된 섹션을 해제하여 최신 데이터로 다시 로드하도록 유도
      setSelectedSection(null);
      
      alert('페이지가 발행되었습니다');
    } catch (err) {
      console.error('Failed to publish page:', err);
      alert('페이지 발행에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    if (!studyId || !user) return;

    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    const reason = prompt(`${application.applicantId}님의 참가 신청을 거절하는 이유를 입력해주세요:`);
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

      alert('참가 신청이 거절되었습니다.');
    } catch (error: any) {
      console.error('거절 처리 실패:', error);
      const errorMessage = error.response?.data?.message || '거절 처리 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
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
          <div className="loading-spinner">⏳</div>
          <p>스터디 관리 정보를 불러오는 중...</p>
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
                      const newPage = await studyDetailPageService.createPage(studyId, {
                        slug: study?.slug || studyId,
                      });
                      setPageData(newPage);
                    } catch (err) {
                      console.error('Failed to create page:', err);
                      alert('페이지 생성에 실패했습니다');
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
              <div className="editor-content">
                <div className="sections-manager">
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
                          {[...Object.values(SectionType), 'HOW_WE_ROLL', 'JOURNEY', 'EXPERIENCE'].map((type) => (
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

                  <div className="sections-list">
                    {pageData.sections.length === 0 ? (
                      <p className="empty-message">아직 섹션이 없습니다. 섹션을 추가해주세요.</p>
                    ) : (
                      pageData.sections.map((section, index) => (
                        <div key={section.id} className="section-item">
                          <div className="section-info">
                            <span className="section-type">{section.type}</span>
                            <span className="section-order">순서: {section.order}</span>
                          </div>
                          <div className="section-actions">
                            <button onClick={() => setSelectedSection(section)}>편집</button>
                            <button 
                              onClick={() => handleReorderSection(section.id, Math.max(0, index - 1))}
                              disabled={index === 0}
                            >↑</button>
                            <button 
                              onClick={() => handleReorderSection(section.id, Math.min(pageData.sections.length - 1, index + 1))}
                              disabled={index === pageData.sections.length - 1}
                            >↓</button>
                            <button onClick={() => handleDeleteSection(section.id)}>삭제</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selectedSection && (
                  <div className="section-editor">
                    <SectionEditForm
                      sectionType={selectedSection.type}
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
    </div>
  );
};

export default StudyManagementPage;