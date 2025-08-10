import React from 'react';

interface TableSectionProps {
  data: {
    title?: string;
    headers?: string[];
    rows?: string[][];
    striped?: boolean;
    bordered?: boolean;
  };
}

const TableSection: React.FC<TableSectionProps> = ({ data }) => {
  const { title, headers = [], rows = [], striped = true, bordered = true } = data;
  
  if (headers.length === 0 && rows.length === 0) {
    return null;
  }
  
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {headers.length > 0 && (
              <thead>
                <tr style={{
                  backgroundColor: '#f7fafc',
                  borderBottom: bordered ? '2px solid #e2e8f0' : 'none'
                }}>
                  {headers.map((header, index) => (
                    <th key={index} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#2d3748',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} style={{
                  backgroundColor: striped && rowIndex % 2 === 1 ? '#f7fafc' : 'white',
                  borderBottom: bordered ? '1px solid #e2e8f0' : 'none'
                }}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{
                      padding: '12px 16px',
                      color: '#4a5568',
                      fontSize: '14px'
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableSection;
