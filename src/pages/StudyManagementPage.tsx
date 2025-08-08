import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import studyService, { Study, ApplicationResponse, MemberResponse, ApplicationStatus } from '../api/studyService';
import './StudyManagementPage.css';

interface TabType {
  key: 'applications' | 'members';
  label: string;
  icon: string;
}

const tabs: TabType[] = [
  { key: 'applications', label: '참가 신청', icon: '📋' },
  { key: 'members', label: '멤버 관리', icon: '👥' }
];

const StudyManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { studyId } = useParams<{ studyId: string }>();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'members'>('applications');
  const [study, setStudy] = useState<Study | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      </div>
    </div>
  );
};

export default StudyManagementPage;