import React from 'react';
import RichTextDisplay from '../../common/RichTextDisplay';
import './RichTextSection.css';

interface RichTextSectionProps {
  data: {
    content: string;
    alignment?: 'left' | 'center' | 'right';
    padding?: string;
    maxWidth?: string;
  };
}

const RichTextSection: React.FC<RichTextSectionProps> = ({ data }) => {
  const { 
    content, 
    alignment = 'left', 
    padding = '3rem 0',
    maxWidth = '900px'
  } = data;
  
  return (
    <div 
      className="study-detail-rich-text-section"
      style={{ padding }}
    >
      <div 
        className="rich-text-container"
        style={{ 
          textAlign: alignment as any,
          maxWidth,
          margin: '0 auto'
        }}
      >
        <RichTextDisplay 
          content={content}
          className="study-detail-rich-text-content"
        />
      </div>
    </div>
  );
};

export default RichTextSection;