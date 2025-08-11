import React from 'react';
import RichTextDisplay from '../../common/RichTextDisplay';
import './RichTextSection.css';

interface RichTextSectionProps {
  data: {
    title?: string;
    content: string;
    alignment?: 'left' | 'center' | 'right';
    padding?: string;
    maxWidth?: string;
    backgroundColor?: string;
    theme?: 'default' | 'tecoteco';
  };
}

const RichTextSection: React.FC<RichTextSectionProps> = ({ data }) => {
  const { 
    title,
    content, 
    alignment = 'left', 
    padding,
    maxWidth,
    backgroundColor,
    theme = 'tecoteco' // 기본값을 tecoteco로 설정
  } = data;
  
  // TecoTeco 테마인 경우 특별한 스타일 적용
  const isTecoteco = theme === 'tecoteco';
  
  return (
    <div 
      className={`study-detail-rich-text-section ${isTecoteco ? 'tecoteco-theme' : ''}`}
      style={{ 
        padding: padding || (isTecoteco ? '50px 30px 40px' : '3rem 0'),
        backgroundColor: backgroundColor || (isTecoteco ? undefined : 'white')
      }}
    >
      {/* TecoTeco 스타일 태그 헤더 */}
      {isTecoteco && title && (
        <div className="section-tag-header">{title}</div>
      )}
      
      <div 
        className="rich-text-container"
        style={{ 
          textAlign: alignment as any,
          maxWidth: maxWidth || (isTecoteco ? '100%' : '900px'),
          margin: '0 auto'
        }}
      >
        {/* 일반 타이틀 (TecoTeco가 아닌 경우) */}
        {!isTecoteco && title && (
          <h2 className="rich-text-title">{title}</h2>
        )}
        
        {/* HTML 컨텐츠 - TecoTeco 스타일 적용 */}
        <div 
          className={`study-detail-rich-text-content ${isTecoteco ? 'tecoteco-content' : ''}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default RichTextSection;