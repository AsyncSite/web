import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop 컴포넌트
 *
 * 페이지 이동 시 스크롤을 상단으로 순간이동시킵니다.
 * behavior: 'auto'를 사용하여 부드러운 애니메이션 없이 "툭!" 하고 즉시 이동합니다.
 * 사용자는 스크롤 움직임을 보지 않고, 새 페이지가 항상 맨 위에서 시작되는 느낌을 받습니다.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 변경 시 애니메이션 없이 즉시 스크롤을 맨 위로 순간이동
    // behavior: 'auto' = 부드러운 스크롤 애니메이션 없음
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
