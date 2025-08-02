import React from 'react';

/**
 * 텍스트에서 검색어를 하이라이트 처리
 * 
 * @param text 원본 텍스트
 * @param searchQuery 검색어
 * @returns 하이라이트된 React 요소
 */
export function highlightText(text: string, searchQuery: string): React.ReactNode {
  if (!searchQuery || !text) {
    return text;
  }

  // 검색어를 정규식으로 변환 (대소문자 구분 없이)
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  // 텍스트를 검색어 기준으로 분할
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    // 검색어와 일치하는 부분을 하이라이트
    if (part.toLowerCase() === searchQuery.toLowerCase()) {
      return (
        <mark
          key={index}
          style={{
            backgroundColor: 'rgba(195, 232, 141, 0.3)',
            color: 'inherit',
            padding: '0 2px',
            borderRadius: '2px',
            fontWeight: 600
          }}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

/**
 * 여러 필드에서 검색어가 포함되어 있는지 확인
 * 
 * @param fields 검색할 필드들
 * @param searchQuery 검색어
 * @returns 검색어가 포함되어 있으면 true
 */
export function containsSearchQuery(fields: (string | undefined)[], searchQuery: string): boolean {
  if (!searchQuery) return false;
  
  const lowerQuery = searchQuery.toLowerCase();
  return fields.some(field => 
    field && field.toLowerCase().includes(lowerQuery)
  );
}