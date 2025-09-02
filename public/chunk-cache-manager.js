// Chunk Cache Manager - 청크 로딩 실패 시 캐시 무효화
(function() {
  // 원본 fetch 함수 저장
  const originalFetch = window.fetch;
  
  // fetch 함수 오버라이드
  window.fetch = function(...args) {
    const [url] = args;
    
    return originalFetch.apply(this, args).catch(error => {
      // 청크 파일 로딩 실패 감지
      if (typeof url === 'string' && url.includes('.chunk.js')) {
        console.warn('Chunk loading failed, attempting cache bypass:', url);
        
        // 캐시를 무시하고 다시 시도
        const urlWithCacheBust = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
        
        return originalFetch(urlWithCacheBust, {
          ...args[1],
          cache: 'no-cache'
        }).catch(() => {
          // 그래도 실패하면 원래 에러 전파
          throw error;
        });
      }
      
      // 청크 파일이 아닌 경우 원래 에러 전파
      throw error;
    });
  };
})();