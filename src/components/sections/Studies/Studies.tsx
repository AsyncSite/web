import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import studyService, { type Study } from '../../../api/studyService';
import { handlePublicApiError } from '../../../api/publicClient';
import { getStudyDisplayInfo } from '../../../utils/studyStatusUtils';
import './Studies.css';

const Studies: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studies, setStudies] = useState<Study[]>([]);
  const [recruitingStudies, setRecruitingStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allStudies = await studyService.getAllStudies();
        // 활성 스터디: 모집 중이거나 진행 중인 스터디
        const activeStudies = allStudies.filter(study => {
          const displayInfo = getStudyDisplayInfo(
            study.status,
            study.deadline?.toISOString()
          );
          return displayInfo.canApply || displayInfo.isActive;
        });
        // 모집 중인 스터디만
        const recruitingOnly = allStudies.filter(study => {
          const displayInfo = getStudyDisplayInfo(
            study.status,
            study.deadline?.toISOString()
          );
          return displayInfo.canApply;
        });
        
        setStudies(activeStudies);
        setRecruitingStudies(recruitingOnly);
      } catch (err) {
        console.error('Failed to load studies:', err);
        const errorMessage = handlePublicApiError(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudies();
  }, []);
  
  const calculateDaysLeft = (deadline: Date | null): number | null => {
    if (!deadline) return null;
    const diff = deadline.getTime() - currentTime.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  const hasRecruitingStudies = recruitingStudies.length > 0;
  
  // Loading state
  if (isLoading) {
    return (
      <section className="studies section-background" id="studies">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">지금 Async Site에서는</h2>
          </div>
          <div className="studies-loading">
            <p>스터디 목록을 불러오고 있습니다...</p>
          </div>
        </div>
      </section>
    );
  }
  
  // Error state
  if (error) {
    return (
      <section className="studies section-background" id="studies">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">지금 Async Site에서는</h2>
          </div>
          <div className="studies-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              다시 시도
            </button>
          </div>
        </div>
      </section>
    );
  }
  
  // Empty state
  if (studies.length === 0) {
    return (
      <section className="studies section-background" id="studies">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">지금 Async Site에서는</h2>
          </div>
          <div className="studies-empty">
            <p>현재 진행 중인 스터디가 없습니다.</p>
            <p>곧 새로운 스터디가 열릴 예정이니 기대해주세요!</p>
            <Link to="/login" className="more-link join-us-btn">
              JOIN US
            </Link>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="studies section-background" id="studies">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">지금 Async Site에서는</h2>
          {hasRecruitingStudies && (
            <p className="section-subtitle">
              모집 중인 스터디를 확인해보세요!
            </p>
          )}
        </div>
        
        <div className="studies-grid">
          {studies.map((study) => {
            const daysLeft = calculateDaysLeft(study.deadline);
            const spotsLeft = study.capacity > 0 ? study.capacity - study.enrolled : 0;
            const isAlmostFull = study.capacity > 0 && spotsLeft <= 5;
            const progressPercentage = study.capacity > 0 ? (study.enrolled / study.capacity) * 100 : 0;
            
            return (
              <div 
                key={study.id} 
                className="study-card"
                style={{
                  '--study-primary': study.color?.primary || '#82AAFF',
                  '--study-glow': study.color?.glow || 'rgba(130, 170, 255, 0.3)'
                } as React.CSSProperties}
              >
                {/* 스터디 헤더 */}
                <div className="study-header">
                  <div className="study-info">
                    <h3 className="study-name">
                      {study.name} 
                      {study.generation > 1 && <span className="study-generation">{study.generation}기</span>}
                    </h3>
                    <p className="study-tagline">{study.tagline}</p>
                  </div>
                  <div className="study-badges">
                    <div className={`study-type-badge ${study.type}`}>
                      <span className="type-icon">
                        {study.type === 'participatory' ? '👥' : '📚'}
                      </span>
                      <span className="type-label">{study.typeLabel}</span>
                    </div>
                    {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                      <div className="deadline-badge">
                        D-{daysLeft}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 리더 소개 */}
                <div className="leader-section">
                  <img 
                    src={study.leader.profileImage} 
                    alt={study.leader.name}
                    className="leader-avatar"
                  />
                  <div className="leader-message">
                    <p className="leader-name">{study.leader.name} 리더</p>
                    <p className="welcome-message">"{study.leader.welcomeMessage}"</p>
                  </div>
                </div>
                
                {/* 스터디 정보 */}
                {(study.schedule || study.duration) ? (
                  <div className="study-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>
                        {study.schedule || '일정 미정'}
                        {study.duration && ` ${study.duration}`}
                      </span>
                    </div>
                  </div>
                ) : null}
                
                {/* 참여 현황 */}
                {study.capacity && study.capacity > 0 ? (
                  <div className="participation-status">
                    <div className="status-text">
                      <span>{spotsLeft}분의 자리가 남았어요</span>
                      {isAlmostFull && <span className="almost-full">곧 마감</span>}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ) : null}
                
                {/* 최근 후기 */}
                {study.recentTestimonial && (
                  <div className="recent-testimonial">
                    <p>"{study.recentTestimonial.content}"</p>
                    <span>- {study.recentTestimonial.author}</span>
                  </div>
                )}
                
                {/* CTA 버튼 */}
                <Link to={`/study/${study.slug}`} className="study-cta">
                  함께하기
                </Link>
              </div>
            );
          })}
        </div>
        
        {/* 더 많은 스터디 안내 */}
        <div className="more-studies">
          <p className="more-text">
            {studies.length > 0 
              ? "더 많은 스터디를 확인해보세요" 
              : "아쉽지만 지금은 진행중인 스터디가 없어요! 알림을 보내드릴게요!"}
          </p>
          {studies.length > 0 ? (
            <Link to="/study" className="more-link">
              모든 스터디 보기 →
            </Link>
          ) : (
            <Link to="/login" className="more-link join-us-btn">
              JOIN US
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Studies;
