import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import './RichTextDisplay.css';

interface RichTextDisplayProps {
  content: string;
  maxHeight?: string;
  className?: string;
}

function RichTextDisplay({ 
  content, 
  maxHeight,
  className = ''
}: RichTextDisplayProps): React.ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Configure DOMPurify to allow safe HTML tags and attributes
      const cleanConfig = {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 
          'ul', 'ol', 'li', 'a'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: ['target', 'rel'],
        ADD_TAGS: [],
        FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      };

      // Sanitize HTML to prevent XSS attacks
      const sanitizedContent = DOMPurify.sanitize(content, cleanConfig);
      
      // Set sanitized content
      containerRef.current.innerHTML = sanitizedContent;
      
      // Add target="_blank" and rel="noopener noreferrer" to all links
      const links = containerRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }
  }, [content]);

  // Handle empty content or plain text
  const isPlainText = !content || !content.includes('<');
  
  if (isPlainText) {
    // Convert plain text to HTML paragraphs
    const htmlContent = content
      ? content
          .split('\n\n')
          .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
          .join('')
      : '<p></p>';
    
    return (
      <div 
        ref={containerRef}
        className={`tiptap-display-container ${className}`}
        style={{ maxHeight }}
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(htmlContent) 
        }}
      />
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`tiptap-display-container ${className}`}
      style={{ maxHeight }}
    />
  );
}

export default RichTextDisplay;