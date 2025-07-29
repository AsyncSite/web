import React, { useEffect, useState } from 'react';
import { STUDY_LIST, getStudyUrl } from '../../../constants/studies';
import './Studies.css';

const Studies: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트
    
    return () => clearInterval(timer);
  }, []);
  
  const calculateDaysLeft = (deadline: Date): number => {
    const diff = deadline.getTime() - currentTime.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  // 중앙화된 스터디 데이터 사용
  const studies = STUDY_LIST.filter(study => study.status === 'recruiting' || study.status === 'ongoing');
  
  return (
    <section className="studies section-background" id="studies">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">당신을 기다리는 동료들</h2>
          <p className="section-subtitle">
            각자의 별에서 시작해, 함께 빛나는 여정으로
          </p>
        </div>
        
        <div className="studies-grid">
          {studies.map((study) => {
            const daysLeft = calculateDaysLeft(study.deadline);
            const spotsLeft = study.capacity - study.enrolled;
            const isAlmostFull = spotsLeft <= 5;
            const progressPercentage = (study.enrolled / study.capacity) * 100;
            
            return (
              <div 
                key={study.id} 
                className="study-card"
                style={{
                  '--study-primary': study.color.primary,
                  '--study-glow': study.color.glow
                } as React.CSSProperties}
              >
                {/* 스터디 헤더 */}
                <div className="study-header">
                  <div className="study-info">
                    <h3 className="study-name">
                      {study.name} <span className="study-generation">{study.generation}기</span>
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
                    {daysLeft <= 7 && (
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
                <div className="study-details">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span>{study.schedule} {study.duration}</span>
                  </div>
                </div>
                
                {/* 참여 현황 */}
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
                
                {/* 최근 후기 */}
                {study.recentTestimonial && (
                  <div className="recent-testimonial">
                    <p>"{study.recentTestimonial.content}"</p>
                    <span>- {study.recentTestimonial.author}</span>
                  </div>
                )}
                
                {/* CTA 버튼 */}
                <a href={getStudyUrl(study)} className="study-cta">
                  함께하기
                </a>
              </div>
            );
          })}
        </div>
        
        {/* 더 많은 스터디 안내 */}
        <div className="more-studies">
          <p className="more-text">더 많은 스터디가 준비 중이에요</p>
          <a href="/study" className="more-link">
            모든 스터디 보기 →
          </a>
        </div>
      </div>
    </section>
  );
};

export default Studies;