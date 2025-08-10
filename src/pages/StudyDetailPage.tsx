import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { TemplateHeader } from '../components/layout';
import { Footer } from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import studyService, { type Study } from '../api/studyService';

const StudyDetailPage: React.FC = () => {
  const { studyIdentifier } = useParams<{ studyIdentifier: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStudy = async () => {
      if (!studyIdentifier) {
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // slug로 직접 조회
        const studyData = await studyService.getStudyBySlug(studyIdentifier);
        setStudy(studyData);
      } catch (err) {
        console.error('Failed to fetch study:', err);
        setError('스터디를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudy();
  }, [studyIdentifier]);
  
  if (!studyIdentifier) {
    return <Navigate to="/study" replace />;
  }
  
  if (loading) {
    return (
      <div className="study-detail-page">
        <TemplateHeader />
        <main className="page-content">
          <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <p>스터디 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !study) {
    return <Navigate to="/study" replace />;
  }

  // 테코테코는 동적 페이지로 렌더링되므로 리다이렉트 제거

  // 기본 스터디 상세 페이지 (향후 개발)
  return (
    <div className="study-detail-page">
      <TemplateHeader />
      <main className="page-content">
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <h1>{study.name} {study.generation > 1 ? `${study.generation}기` : ''}</h1>
          <p>{study.tagline}</p>
          {study.description && <p>{study.description}</p>}
          
          <div style={{ marginTop: '40px' }}>
            <h2>스터디 정보</h2>
            <ul>
              {(study.schedule || study.duration) && (
                <li>일정: {study.schedule} {study.duration}</li>
              )}
              {study.capacity > 0 && (
                <li>정원: {study.capacity}명 (현재 {study.enrolled}명 참여)</li>
              )}
              <li>리더: {study.leader.name}</li>
              <li>상태: {study.status === 'recruiting' ? '모집중' : study.status === 'ongoing' ? '진행중' : '종료'}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            marginTop: '40px', 
            display: 'flex', 
            gap: '16px', 
            flexWrap: 'wrap' 
          }}>
            {/* 스터디 제안자인지 확인 */}
            {isAuthenticated && user && study.proposerId === user.email ? (
              /* 스터디 제안자는 관리 버튼만 표시 */
              <button
                onClick={() => navigate(`/study/${study.id}/manage`)}
                style={{
                  background: 'linear-gradient(135deg, #89DDFF 0%, #C3E88D 100%)',
                  border: 'none',
                  color: '#1a1a1a',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(137, 221, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(137, 221, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(137, 221, 255, 0.3)';
                }}
              >
                🎛️ 스터디 관리
              </button>
            ) : (
              /* 일반 사용자는 참가 신청 버튼 표시 */
              study.status === 'recruiting' && (
                <button
                  onClick={() => navigate(`/study/${study.id}/apply`)}
                  style={{
                    background: 'linear-gradient(135deg, #C3E88D 0%, #89DDFF 100%)',
                    border: 'none',
                    color: '#1a1a1a',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(195, 232, 141, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(195, 232, 141, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(195, 232, 141, 0.3)';
                  }}
                >
                  📝 참가 신청하기
                </button>
              )
            )}
          </div>
          
          <div style={{ 
            marginTop: '60px', 
            padding: '24px',
            background: 'rgba(137, 221, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(137, 221, 255, 0.2)'
          }}>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>💡 이 페이지는 향후 각 스터디별 맞춤 페이지로 개발될 예정입니다.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudyDetailPage;
