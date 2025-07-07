// src/pages/TecoTecoPage/sections/JourneySection.tsx
import React from 'react';
import { JOURNEY_DATA } from '../utils/constants';
import './JourneySection.css';

export const JourneySection: React.FC = () => {
  const calculateDays = () => {
    const startDate = new Date(JOURNEY_DATA.startDate);
    const today = new Date('2025-06-14'); // Current date is June 14, 2025
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceStart = calculateDays();

  return (
    <section className="tecoteco-journey-section">
      <div className="section-tag-header">우리의 여정</div>

      <h2 className="section-title">
        하루하루가 쌓이니 벌써 <span className="highlight">{daysSinceStart}일</span>이 되었어요.
      </h2>

      <p className="section-subtitle">{JOURNEY_DATA.subtitle}</p>

      {/* 현재 성과 요약 */}
      {/*<div className="journey-stats">*/}
      {/*    <div className="stat-card">*/}
      {/*        <span className="stat-number">{JOURNEY_DATA.currentStats.totalProblems}</span>*/}
      {/*        <span className="stat-label">해결한 문제</span>*/}
      {/*    </div>*/}
      {/*    <div className="stat-card">*/}
      {/*        <span className="stat-number">{JOURNEY_DATA.currentStats.studyHours}</span>*/}
      {/*        <span className="stat-label">함께한 시간</span>*/}
      {/*    </div>*/}
      {/*    <div className="stat-card">*/}
      {/*        <span className="stat-number">50%</span>*/}
      {/*        <span className="stat-label">평균 실력 향상</span>*/}
      {/*    </div>*/}
      {/*    <div className="stat-card">*/}
      {/*        <span className="stat-number">100%</span>*/}
      {/*        <span className="stat-label">함께하는 즐거움</span>*/}
      {/*    </div>*/}
      {/*</div>*/}

      {/* 시즌별 여정 */}
      <ul className="journey-list">
        {JOURNEY_DATA.seasons.map((season, index) => (
          <li key={index} className="journey-item">
            <div className="season-header">
              <span className="season-icon">{season.icon}</span>
              <strong>{season.title}</strong>
            </div>
            <span className="journey-description">{season.description}</span>
            <div className="achievements">
              {season.achievements.map((achievement, i) => (
                <span key={i} className="achievement-badge">
                  {achievement}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* 미래 계획 이미지 */}
      <div className="journey-image-wrapper">
        <div className="image-header">
          <h4>앞으로의 계획</h4>
          <p>체계적이고 지속적인 성장을 위한 로드맵</p>
        </div>
        <img src={process.env.PUBLIC_URL + JOURNEY_DATA.imagePath} alt={JOURNEY_DATA.imageAlt} />
      </div>

      {/*/!* 마무리 메시지 *!/*/}
      {/*<div className="journey-closing">*/}
      {/*    <p>*/}
      {/*        작은 걸음이지만 꾸준히, 의미 있게.*/}
      {/*    </p>*/}
      {/*</div>*/}
    </section>
  );
};
