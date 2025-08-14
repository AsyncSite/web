import React from 'react';
import { JourneySectionData } from '../types/journeyTypes';
import styles from './JourneySection.module.css';

interface JourneySectionProps {
  data: JourneySectionData;
}

const JourneySection: React.FC<JourneySectionProps> = ({ data }) => {
  const layout = data.layout || 'list';
  
  // 경과일 계산
  const calculateDays = (): number | null => {
    if (!data.startDate || !data.calculateDays) return null;
    
    const startDate = new Date(data.startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysSinceStart = calculateDays();
  
  // CSS Module 스타일 사용
  const sectionClassName = styles.studyDetailJourneySection;
  
  // 동적 제목 생성
  const renderTitle = () => {
    if (data.title) {
      // 제목에 {days} 플레이스홀더가 있으면 치환
      if (daysSinceStart !== null && data.title.includes('{days}')) {
        const parts = data.title.split('{days}');
        return (
          <>
            {parts[0]}
            <span className={styles.highlight}>{daysSinceStart}일</span>
            {parts[1]}
          </>
        );
      }
      return data.title;
    }
    
    // 기본 제목 (경과일 포함)
    if (daysSinceStart !== null) {
      return (
        <>
          하루하루가 쌓이니 벌써 <span className={styles.highlight}>{daysSinceStart}일</span>이 되었어요.
        </>
      );
    }
    
    return '우리의 성장 이야기';
  };
  
  // Timeline 레이아웃 렌더링
  const renderTimeline = () => (
    <div className={styles.journeyTimeline}>
      {data.generations.map((generation, index) => (
        <div 
          key={generation.id || index} 
          className={`${styles.timelineItem} ${generation.status ? styles[generation.status] : ''} ${generation.highlight ? styles.highlighted : ''}`}
        >
          <div className={styles.timelineMarker}>
            {data.showIcons && generation.icon && (
              <span className={styles.timelineIcon}>{generation.icon}</span>
            )}
          </div>
          <div className={styles.timelineContent}>
            <h3 className={styles.generationTitle}>{generation.title}</h3>
            <p className={styles.generationDescription}>{generation.description}</p>
            {data.showAchievements && generation.achievements && generation.achievements.length > 0 && (
              <div className={styles.achievements}>
                {generation.achievements.map((achievement, i) => (
                  <span key={i} className={styles.achievementBadge}>
                    {achievement}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
  
  // Cards 레이아웃 렌더링
  const renderCards = () => (
    <div className={styles.journeyCards}>
      {data.generations.map((generation, index) => (
        <div 
          key={generation.id || index} 
          className={`${styles.journeyCard} ${generation.status ? styles[generation.status] : ''} ${generation.highlight ? styles.highlighted : ''}`}
        >
          {data.showIcons && generation.icon && (
            <div className={styles.cardIcon}>{generation.icon}</div>
          )}
          <h3 className={styles.generationTitle}>{generation.title}</h3>
          <p className={styles.generationDescription}>{generation.description}</p>
          {data.showAchievements && generation.achievements && generation.achievements.length > 0 && (
            <div className={styles.achievements}>
              {generation.achievements.map((achievement, i) => (
                <span key={i} className={styles.achievementBadge}>
                  {achievement}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
  
  // List 레이아웃 렌더링 (기본)
  const renderList = () => (
    <ul className={styles.journeyList}>
      {data.generations.map((generation, index) => (
        <li 
          key={generation.id || index} 
          className={`${styles.journeyItem} ${generation.status ? styles[generation.status] : ''} ${generation.highlight ? styles.highlighted : ''}`}
        >
          <div className={styles.seasonHeader}>
            {data.showIcons && generation.icon && (
              <span className={styles.seasonIcon}>{generation.icon}</span>
            )}
            <strong>{generation.title}</strong>
          </div>
          <span className={styles.journeyDescription}>{generation.description}</span>
          {data.showAchievements && generation.achievements && generation.achievements.length > 0 && (
            <div className={styles.achievements}>
              {generation.achievements.map((achievement, i) => (
                <span key={i} className={styles.achievementBadge}>
                  {achievement}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
  
  return (
    <section className={sectionClassName}>
      {data.tagHeader && (
        <div className={styles.sectionTagHeader}>{data.tagHeader}</div>
      )}
      
      <h2 className={styles.sectionTitle}>
        {renderTitle()}
      </h2>
      
      {data.subtitle && (
        <p className={styles.sectionSubtitle}>{data.subtitle}</p>
      )}
      
      {/* 통계 섹션 */}
      {data.showStats && data.stats && (
        <div className={styles.journeyStats}>
          {data.stats.totalProblems && (
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{data.stats.totalProblems}</span>
              <span className={styles.statLabel}>해결한 문제</span>
            </div>
          )}
          {data.stats.studyHours && (
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{data.stats.studyHours}</span>
              <span className={styles.statLabel}>함께한 시간</span>
            </div>
          )}
          {data.stats.memberGrowth && (
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{data.stats.memberGrowth}</span>
              <span className={styles.statLabel}>실력 향상</span>
            </div>
          )}
          {data.stats.teamSpirit && (
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{data.stats.teamSpirit}</span>
              <span className={styles.statLabel}>팀 만족도</span>
            </div>
          )}
          {data.stats.customStats && data.stats.customStats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              {stat.icon && <span className={styles.statIcon}>{stat.icon}</span>}
              <span className={styles.statNumber}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* 세대/시즌 목록 - 레이아웃에 따라 다르게 렌더링 */}
      {layout === 'timeline' && renderTimeline()}
      {layout === 'cards' && renderCards()}
      {layout === 'list' && renderList()}
      
      {/* 미래 계획 이미지 */}
      {data.futureImage && (
        <div className={styles.journeyImageWrapper}>
          {(data.futureImage.title || data.futureImage.description) && (
            <div className={styles.imageHeader}>
              {data.futureImage.title && <h4>{data.futureImage.title}</h4>}
              {data.futureImage.description && <p>{data.futureImage.description}</p>}
            </div>
          )}
          <img 
            src={data.futureImage.src} 
            alt={data.futureImage.alt || '미래 계획'} 
          />
        </div>
      )}
      
      {/* 마무리 메시지 */}
      {data.closingMessage && (
        <div className={styles.journeyClosing}>
          <p>{data.closingMessage}</p>
        </div>
      )}
    </section>
  );
};

export default JourneySection;