import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import studyService, { type Study } from '../../../api/studyService';
import { handlePublicApiError } from '../../../api/publicClient';
import { getStudyDisplayInfo } from '../../../utils/studyStatusUtils';
import { parseDate } from '../../../utils/studyScheduleUtils';
import styles from './Studies.module.css';

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
        const now = new Date();
        
        // 활성 스터디: 모집 중, 시작 예정, 진행 중인 스터디
        const activeStudies = allStudies.filter(study => {
          const displayInfo = getStudyDisplayInfo(
            study.status,
            study.deadline instanceof Date ? study.deadline.toISOString() : study.deadline
          );
          
          // 모집중 또는 진행중
          if (displayInfo.canApply || displayInfo.isActive) return true;
          
          // 시작예정 (모집 마감됐지만 아직 시작 안함)
          const startDate = parseDate(study.startDate);
          if (study.status === 'APPROVED' && !displayInfo.canApply && startDate && startDate > now) {
            return true;
          }
          
          return false;
        });
        
        // 모집 중인 스터디만
        const recruitingOnly = allStudies.filter(study => {
          const displayInfo = getStudyDisplayInfo(
            study.status,
            study.deadline instanceof Date ? study.deadline.toISOString() : study.deadline
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
      <section className={`${styles.studies} section-background`} id="studies">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">지금 Async Site에서는</h2>
          </div>
          <div className={styles.studiesLoading}>
            <p>스터디 목록을 불러오고 있습니다...</p>
          </div>
        </div>
      </section>
    );
  }
  
  // Error state
  if (error) {
    return (
      <section className={`${styles.studies} section-background`} id="studies">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">지금 Async Site에서는</h2>
          </div>
          <div className={styles.studiesError}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryBtn}>
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
      <section className={`${styles.studies} section-background`} id="studies">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">지금 Async Site에서는</h2>
          </div>
          <div className={styles.studiesEmpty}>
            <p>현재 진행 중인 스터디가 없습니다.</p>
            <p>곧 새로운 스터디가 열릴 예정이니 기대해주세요!</p>
            <Link to="/login" className={`${styles.moreLink} ${styles.joinUsBtn}`}>
              JOIN US
            </Link>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className={`${styles.studies} section-background`} id="studies">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">지금 Async Site에서는</h2>
          {hasRecruitingStudies && (
            <p className="section-subtitle">
              모집 중인 스터디를 확인해보세요!
            </p>
          )}
        </div>
        
        <div className={styles.studiesGrid}>
          {studies.map((study) => {
            const daysLeft = calculateDaysLeft(study.deadline);
            const spotsLeft = study.capacity > 0 ? study.capacity - study.enrolled : 0;
            const isAlmostFull = study.capacity > 0 && spotsLeft <= 5;
            const progressPercentage = study.capacity > 0 ? (study.enrolled / study.capacity) * 100 : 0;
            
            return (
              <div 
                key={study.id} 
                className={styles.studyCard}
                style={{
                  '--study-primary': study.color?.primary || '#82AAFF',
                  '--study-glow': study.color?.glow || 'rgba(130, 170, 255, 0.3)'
                } as React.CSSProperties}
              >
                {/* 뱃지 영역 - 모든 카드에 동일한 높이 확보 */}
                <div className={styles.badgeArea}>
                  {study.generation > 1 && (
                    <span className={styles.generationBadge}>{study.generation}기</span>
                  )}
                  <div className={`${styles.studyTypeBadge} ${styles[study.type]}`}>
                    <span className={styles.typeIcon}>
                      {study.type === 'participatory' ? '👥' : '📚'}
                    </span>
                    <span className={styles.typeLabel}>{study.typeLabel}</span>
                  </div>
                  {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                    <div className={styles.deadlineBadge}>
                      D-{daysLeft}
                    </div>
                  )}
                </div>
                
                {/* 스터디 헤더 */}
                <div className={styles.studyHeader}>
                  <div className={styles.studyInfo}>
                    <h3 className={styles.studyName}>{study.name}</h3>
                    <p className={styles.studyTagline}>{study.tagline}</p>
                  </div>
                </div>
                
                {/* 리더 소개 */}
                <div className={styles.leaderSection}>
                  <img 
                    src={study.leader.profileImage} 
                    alt={study.leader.name}
                    className={styles.leaderAvatar}
                  />
                  <div className={styles.leaderMessage}>
                    <p className={styles.leaderName}>{study.leader.name} 리더</p>
                    <p className={styles.welcomeMessage}>"{study.leader.welcomeMessage}"</p>
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
                  <div className={styles.participationStatus}>
                    <div className={styles.statusText}>
                      <span>{spotsLeft}분의 자리가 남았어요</span>
                      {isAlmostFull && <span className={styles.almostFull}>곧 마감</span>}
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ) : null}
                
                {/* 최근 후기 */}
                {study.recentTestimonial && (
                  <div className={styles.recentTestimonial}>
                    <p>"{study.recentTestimonial.content}"</p>
                    <span>- {study.recentTestimonial.author}</span>
                  </div>
                )}
                
                {/* CTA 버튼 */}
                <Link to={`/study/${study.slug}`} className={styles.studyCta}>
                  함께하기
                </Link>
              </div>
            );
          })}
        </div>
        
        {/* 더 많은 스터디 안내 */}
        <div className={styles.moreStudies}>
          <p className={styles.moreText}>
            {studies.length > 0 
              ? "더 많은 스터디를 확인해보세요" 
              : "아쉽지만 지금은 진행중인 스터디가 없어요! 알림을 보내드릴게요!"}
          </p>
          {studies.length > 0 ? (
            <Link to="/study" className={styles.moreLink}>
              모든 스터디 보기 →
            </Link>
          ) : (
            <Link to="/login" className={`${styles.moreLink} ${styles.joinUsBtn}`}>
              JOIN US
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Studies;
