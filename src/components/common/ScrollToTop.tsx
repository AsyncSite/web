import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const prevPathname = useRef(pathname);

  useLayoutEffect(() => {
    // 뒤로가기/앞으로가기인 경우 스크롤 위치를 건드리지 않음 (브라우저가 자동으로 복원)
    if (navigationType === 'POP') {
      prevPathname.current = pathname;
      return;
    }

    // 새로운 페이지로의 이동인 경우에만 맨 위로 스크롤
    if (prevPathname.current !== pathname) {
      window.scrollTo(0, 0);
      prevPathname.current = pathname;
    }
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
