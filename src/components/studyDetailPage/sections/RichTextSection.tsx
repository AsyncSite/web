import React from 'react';
import RichTextDisplay from '../../common/RichTextDisplay';
import styles from './RichTextSection.module.css';

interface RichTextSectionProps {
  data: {
    title?: string;
    content: string;
    alignment?: 'left' | 'center' | 'right';
    padding?: string;
    maxWidth?: string;
    backgroundColor?: string;
    // theme removed - using standard styles
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
  
  // Using standard styles
  
  return (
    <div 
      className={styles.studyDetailRichTextSection}
      style={{ 
        padding: padding || '50px 30px 40px',
        backgroundColor: backgroundColor
      }}
    >
      {/* Section Tag Header */}
      {title && (
        <div className={styles.sectionTagHeader}>{title}</div>
      )}
      
      <div 
        className={styles.richTextContainer}
        style={{ 
          textAlign: alignment as any,
          maxWidth: maxWidth || '100%',
          margin: '0 auto'
        }}
      >
        {/* Title is shown as tag header */}
        
        {/* HTML Content - Standard Styles */}
        <div 
          className={styles.studyDetailRichTextContent}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default RichTextSection;