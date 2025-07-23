import { useEffect } from 'react';

/**
 * 브라우저 캐시를 방지하여 뒤로가기 시 인증된 페이지가 보이지 않도록 합니다
 */
export function usePreventCache() {
  useEffect(() => {
    // 캐시 방지 메타 태그 추가
    const metaTags = [
      { name: 'cache-control', content: 'no-cache, no-store, must-revalidate' },
      { name: 'pragma', content: 'no-cache' },
      { name: 'expires', content: '0' }
    ];

    const addedTags: HTMLMetaElement[] = [];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
        addedTags.push(meta);
      }
    });

    // 브라우저 뒤로가기 감지 및 처리
    const handlePopState = () => {
      // 인증이 필요한 페이지에서 뒤로가기 시 페이지 새로고침
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      // 클린업: 추가한 메타 태그 제거
      addedTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
}