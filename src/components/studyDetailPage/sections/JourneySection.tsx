import React from 'react';
import { JourneySectionData } from '../types/journeyTypes';
import './JourneySection.css';

interface JourneySectionProps {
  data: JourneySectionData;
}

const JourneySection: React.FC<JourneySectionProps> = ({ data }) => {
  const theme = data.theme || 'tecoteco';
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
  
  // tecoteco 테마일 때는 하드코딩된 페이지와 동일한 클래스명 사용
  const sectionClassName = theme === 'tecoteco'
    ? 'tecoteco-journey-section'
    : `study-detail-journey-section ${theme}-theme ${layout}-layout`;
  
  // 동적 제목 생성
  const renderTitle = () => {
    if (data.title) {
      // 제목에 {days} 플레이스홀더가 있으면 치환
      if (daysSinceStart !== null && data.title.includes('{days}')) {
        const parts = data.title.split('{days}');
        return (
          <>
            {parts[0]}
            <span className="highlight">{daysSinceStart}일</span>
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
          하루하루가 쌓이니 벌써 <span className="highlight">{daysSinceStart}일</span>이 되었어요.
        </>
      );
    }
    
    return '우리의 성장 이야기';
  };
  
  // Timeline 레이아웃 렌더링
  const renderTimeline = () => (
    <div className="journey-timeline">
      {data.generations.map((generation, index) => (
        <div 
          key={generation.id || index} 
          className={`timeline-item ${generation.status || ''} ${generation.highlight ? 'highlighted' : ''}`}
        >
          <div className="timeline-marker">
            {data.showIcons && generation.icon && (
              <span className="timeline-icon">{generation.icon}</span>
            )}
          </div>
          <div className="timeline-content">
            <h3 className="generation-title">{generation.title}</h3>
            <p className="generation-description">{generation.description}</p>
            {data.showAchievements && generation.achievements && generation.achievements.length > 0 && (
              <div className="achievements">
                {generation.achievements.map((achievement, i) => (
                  <span key={i} className="achievement-badge">
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
    <div className="journey-cards">
      {data.generations.map((generation, index) => (
        <div 
          key={generation.id || index} 
          className={`journey-card ${generation.status || ''} ${generation.highlight ? 'highlighted' : ''}`}
        >
          {data.showIcons && generation.icon && (
            <div className="card-icon">{generation.icon}</div>
          )}
          <h3 className="generation-title">{generation.title}</h3>
          <p className="generation-description">{generation.description}</p>
          {data.showAchievements && generation.achievements && generation.achievements.length > 0 && (
            <div className="achievements">
              {generation.achievements.map((achievement, i) => (
                <span key={i} className="achievement-badge">
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
    <ul className="journey-list">
      {data.generations.map((generation, index) => (
        <li 
          key={generation.id || index} 
          className={`journey-item ${generation.status || ''} ${generation.highlight ? 'highlighted' : ''}`}
        >
          <div className="season-header">
            {data.showIcons && generation.icon && (
              <span className="season-icon">{generation.icon}</span>
            )}
            <strong>{generation.title}</strong>
          </div>
          <span className="journey-description">{generation.description}</span>
          {data.showAchievements && generation.achievements && generation.achievements.length > 0 && (
            <div className="achievements">
              {generation.achievements.map((achievement, i) => (
                <span key={i} className="achievement-badge">
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
        <div className="section-tag-header">{data.tagHeader}</div>
      )}
      
      <h2 className="section-title">
        {renderTitle()}
      </h2>
      
      {data.subtitle && (
        <p className="section-subtitle">{data.subtitle}</p>
      )}
      
      {/* 통계 섹션 */}
      {data.showStats && data.stats && (
        <div className="journey-stats">
          {data.stats.totalProblems && (
            <div className="stat-card">
              <span className="stat-number">{data.stats.totalProblems}</span>
              <span className="stat-label">해결한 문제</span>
            </div>
          )}
          {data.stats.studyHours && (
            <div className="stat-card">
              <span className="stat-number">{data.stats.studyHours}</span>
              <span className="stat-label">함께한 시간</span>
            </div>
          )}
          {data.stats.memberGrowth && (
            <div className="stat-card">
              <span className="stat-number">{data.stats.memberGrowth}</span>
              <span className="stat-label">실력 향상</span>
            </div>
          )}
          {data.stats.teamSpirit && (
            <div className="stat-card">
              <span className="stat-number">{data.stats.teamSpirit}</span>
              <span className="stat-label">팀 만족도</span>
            </div>
          )}
          {data.stats.customStats && data.stats.customStats.map((stat, index) => (
            <div key={index} className="stat-card">
              {stat.icon && <span className="stat-icon">{stat.icon}</span>}
              <span className="stat-number">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
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
        <div className="journey-image-wrapper">
          {(data.futureImage.title || data.futureImage.description) && (
            <div className="image-header">
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
        <div className="journey-closing">
          <p>{data.closingMessage}</p>
        </div>
      )}
    </section>
  );
};

export default JourneySection;