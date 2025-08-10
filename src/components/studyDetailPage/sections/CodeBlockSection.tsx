import React from 'react';

interface CodeBlockSectionProps {
  data: {
    language?: string;
    code?: string;
    title?: string;
    showLineNumbers?: boolean;
  };
}

const CodeBlockSection: React.FC<CodeBlockSectionProps> = ({ data }) => {
  const { language = 'javascript', code = '', title, showLineNumbers = true } = data;
  
  const lines = code.split('\n');
  
  return (
    <div style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {title && (
          <h3 style={{ 
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: 600
          }}>
            {title}
          </h3>
        )}
        <div style={{
          backgroundColor: '#1a202c',
          borderRadius: '8px',
          padding: '1.5rem',
          overflow: 'auto'
        }}>
          <pre style={{ margin: 0 }}>
            <code style={{
              color: '#e2e8f0',
              fontFamily: "'Fira Code', 'Consolas', monospace",
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {showLineNumbers ? (
                lines.map((line, index) => (
                  <div key={index} style={{ display: 'flex' }}>
                    <span style={{
                      color: '#4a5568',
                      marginRight: '1rem',
                      userSelect: 'none',
                      minWidth: '2em',
                      textAlign: 'right'
                    }}>
                      {index + 1}
                    </span>
                    <span>{line || ' '}</span>
                  </div>
                ))
              ) : (
                code
              )}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeBlockSection;
