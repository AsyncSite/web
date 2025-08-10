import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  data: {
    title: string;
    subtitle?: string;
    emoji?: string;
    image?: string;
    infoBox?: {
      header?: string;
      items?: Array<{
        icon?: string;
        text: string;
        highlight?: string;
      }>;
    };
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({ data }) => {
  const {
    title,
    subtitle,
    emoji,
    image,
    infoBox
  } = data;
  
  return (
    <div className="study-detail-hero-section">
      <div className="hero-content">
        {/* 제목 (이모지 포함 가능) */}
        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: title }} />
        
        {/* 부제목 */}
        {subtitle && (
          <p className="hero-subtitle" dangerouslySetInnerHTML={{ __html: subtitle }} />
        )}
        
        {/* 이미지 (옵션) */}
        {image && (
          <div className="hero-image-wrapper">
            <img src={image} alt="Study Hero Image" />
          </div>
        )}
      </div>

      {/* 정보 박스 섹션 (TecoTeco 스타일) */}
      {infoBox && infoBox.items && infoBox.items.length > 0 && (
        <div className="hero-info-box">
          {infoBox.header && (
            <div className="info-section-header">{infoBox.header}</div>
          )}
          <div className="info-content-area">
            {infoBox.items.map((item, index) => (
              <div key={index} className="info-line-item">
                {item.icon && <span className="line-icon">{item.icon}</span>}
                <p className="line-text" dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;