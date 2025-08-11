import React from 'react';
import RichTextRenderer from '../../common/richtext/RichTextRenderer';
import { RichTextData } from '../../common/richtext/RichTextTypes';
import { RichTextConverter } from '../../common/richtext/RichTextConverter';
import './HeroSection.css';

interface HeroSectionProps {
  data: {
    title: string | RichTextData;
    subtitle?: string | RichTextData;
    emoji?: string;
    image?: string;
    infoBox?: {
      header?: string;
      items?: Array<{
        icon?: string;
        text: string | RichTextData;
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
        <h1 className="hero-title">
          <RichTextRenderer data={title} />
        </h1>
        
        {/* 부제목 */}
        {subtitle && (
          <div className="hero-subtitle">
            <RichTextRenderer 
              data={subtitle} 
              theme={{
                colors: {
                  primary: '#c3e88d',
                  secondary: '#82aaff',
                  highlight: '#c3e88d',  // subtitle용 연두색
                  subtleHighlight: '#82aaff',
                  text: '#f0f0f0'
                }
              }}
            />
          </div>
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
                <div className="line-text">
                  <RichTextRenderer 
                    data={item.text} 
                    theme={{
                      colors: {
                        primary: '#c3e88d',
                        secondary: '#82aaff',
                        highlight: '#ffea00',  // InfoBox용 노란색
                        subtleHighlight: '#ff9800',
                        text: '#f0f0f0'
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;