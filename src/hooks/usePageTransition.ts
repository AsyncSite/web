import { useEffect, useState } from 'react';

interface UsePageTransitionOptions {
  loadingTime?: number;
  enableLoading?: boolean;
  fadeInDelay?: number;
}

export const usePageTransition = (options: UsePageTransitionOptions = {}) => {
  const {
    loadingTime = 500,
    enableLoading = false,
    fadeInDelay = 50
  } = options;

  const [isReady, setIsReady] = useState(false);

  // 부드러운 스크롤 함수
  const smoothScrollToTop = () => {
    document.documentElement.style.scrollBehavior = 'smooth';
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    }, 300);
  };

  // 페이지 로드 시 처리
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });

    // 데이터 준비 시뮬레이션
    const timer = setTimeout(() => {
      setIsReady(true);

      // 페이지 표시
      const pageElement = document.querySelector('.page-container');
      if (pageElement) {
        pageElement.classList.remove('opacity-0');
        pageElement.classList.add('opacity-100');
      }
    }, enableLoading ? loadingTime : fadeInDelay);

    return () => clearTimeout(timer);
  }, [enableLoading, loadingTime, fadeInDelay]);

  return {
    isReady,
    smoothScrollToTop
  };
};

// 상태 변경 시 스크롤 훅
export const useScrollOnChange = (dependency: any) => {
  useEffect(() => {
    // 부드러운 스크롤 함수를 직접 정의 (무한 루프 방지)
    const smoothScrollToTop = () => {
      document.documentElement.style.scrollBehavior = 'smooth';
      window.scrollTo({ top: 0 });
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'auto';
      }, 300);
    };

    smoothScrollToTop();
  }, [dependency]);
};
