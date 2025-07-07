// src/pages/TecoTecoPage/sections/HeroSection.tsx
import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  onCtaClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  return (
    <section className="tecoteco-hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          💯 코테 스터디 <br /> 테코테코
        </h1>
        <p className="hero-subtitle">
          변화 속에서 <br />{' '}
          <span className="highlight">
            변치 않는 ____를 찾다 <br />{' '}
          </span>
        </p>
        <div className="hero-image-wrapper">
          <img
            src={process.env.PUBLIC_URL + '/images/tecoteco/profile1.svg'}
            alt="테코테코 프로필 이미지"
          />
        </div>
      </div>

      {/* 새로운 정보 박스 섹션 추가 */}
      <div className="hero-info-box">
        <div className="info-section-header"> TecoTeco: 함께 성장할 용기</div>
        <div className="info-content-area">
          <div className="info-line-item">
            <span className="line-icon">💡</span>
            <p className="line-text">
              기술 변화 속 <span className="highlight">흔들리지 않는 개발자 사고의 뿌리</span>를
              탐구해요.
            </p>
          </div>
          <div className="info-line-item">
            <span className="line-icon">📚</span>
            <p className="line-text">
              단순한 코딩 테스트 넘어, <span className="highlight">자료구조와 알고리즘의 본질</span>
              에 Deep Dive 해요.
            </p>
          </div>
          <div className="info-line-item">
            <span className="line-icon">🤝</span>
            <p className="line-text">
              서로의 질문이 <span className="highlight">해답</span>이 되고,{' '}
              <span className="highlight">함께 성장</span>하는 시너지를 경험해요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
