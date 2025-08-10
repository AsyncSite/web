import React from 'react';
import DOMPurify from 'dompurify';

interface CustomHTMLSectionProps {
  data: {
    html?: string;
    css?: string;
    className?: string;
  };
}

const CustomHTMLSection: React.FC<CustomHTMLSectionProps> = ({ data }) => {
  const { html = '', css = '', className = '' } = data;
  
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ADD_TAGS: ['style'],
    ADD_ATTR: ['class', 'id', 'style', 'target', 'rel']
  });
  
  return (
    <div className={className} style={{ padding: '3rem 1.5rem' }}>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div 
        style={{ maxWidth: '1200px', margin: '0 auto' }}
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </div>
  );
};

export default CustomHTMLSection;
