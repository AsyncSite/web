import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { TemplateHeader } from '../components/layout';
import { Footer } from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import studyService, { type Study } from '../api/studyService';
import { getStudyDisplayInfo } from '../utils/studyStatusUtils';
import styles from './StudyDetailPage.module.css';

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
        setError('스터디 식별자가 없습니다');
        setLoading(false);
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
  
  if (!studyIdentifier || error || !study) {
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
              <li>상태: {getStudyDisplayInfo(
                study.status,
                study.deadline?.toISOString(),
                study.startDate instanceof Date ? study.startDate.toISOString() : study.startDate,
                study.endDate instanceof Date ? study.endDate.toISOString() : study.endDate,
                study.capacity,
                study.enrolled,
                study.isRecruiting
              ).label}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            marginTop: '40px', 
            display: 'flex', 
            gap: '16px', 
            flexWrap: 'wrap' 
          }}>
            {/* 스터디 제안자 또는 ADMIN인지 확인 */}
            {isAuthenticated && user && (study.proposerId === user.email || user.role === 'ADMIN' || user.roles?.includes('ADMIN')) ? (
              /* 스터디 제안자는 관리 버튼만 표시 */
              <button
                onClick={() => navigate(`/study/${study.slug}/manage`)}
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
              getStudyDisplayInfo(
                study.status,
                study.deadline?.toISOString(),
                study.startDate instanceof Date ? study.startDate.toISOString() : study.startDate,
                study.endDate instanceof Date ? study.endDate.toISOString() : study.endDate,
                study.capacity,
                study.enrolled,
                study.isRecruiting
              ).canApply && (
                <button
                  onClick={() => navigate(`/study/${study.slug}/apply`)}
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

          {/* QueryDaily Contextual Promotion Card */}
          <div className={styles['study-companion-card']}>
            <div className={styles['companion-header']}>
              <div className={styles['companion-icon']}>💡</div>
              <div className={styles['companion-badge']}>추천</div>
            </div>
            <div className={styles['companion-content']}>
              <h4>스터디와 함께 면접 준비도!</h4>
              <p>QueryDaily로 당신의 이력서 기반 맞춤 면접 질문 받기</p>
              <div className={styles['companion-benefits']}>
                <div className={styles['benefit-item']}>
                  <span className={styles['benefit-icon']}>🎯</span>
                  <span>맞춤형 꼬리 질문</span>
                </div>
                <div className={styles['benefit-item']}>
                  <span className={styles['benefit-icon']}>💼</span>
                  <span>실전 면접 대비</span>
                </div>
                <div className={styles['benefit-item']}>
                  <span className={styles['benefit-icon']}>⏰</span>
                  <span>매일 오전 9시</span>
                </div>
              </div>
              <button
                onClick={() => window.open('https://querydaily.asyncsite.com/', '_blank')}
                className={styles['companion-cta']}
              >
                QueryDaily 시작하기 →
              </button>
            </div>
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
