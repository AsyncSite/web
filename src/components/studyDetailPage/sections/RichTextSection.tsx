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
    backgroundColor
  } = data;
  
  // 테마 제거: 항상 tecoteco 스타일 적용
  const isTecoteco = true;
  
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
        {/* 제목은 테코테코 스타일에서는 태그 헤더로만 노출 */}
        
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