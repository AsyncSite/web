import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const prevPathname = useRef(pathname);
  const prevLocationKey = useRef(key);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 초기 마운트 시에는 스크롤하지 않음
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathname.current = pathname;
      prevLocationKey.current = key;
      return;
    }

    // 뒤로가기/앞으로가기인 경우 스크롤 위치를 건드리지 않음 (브라우저가 자동으로 복원)
    if (navigationType === 'POP') {
      prevPathname.current = pathname;
      prevLocationKey.current = key;
      return;
    }

    // 새로운 페이지로의 이동인 경우에만 맨 위로 스크롤
    if (prevPathname.current !== pathname) {
      // ScrollRestoration보다 늦게 실행되도록 더 긴 딜레이
      const timeoutId = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 10);

      prevPathname.current = pathname;
      prevLocationKey.current = key;

      return () => clearTimeout(timeoutId);
    }

    prevPathname.current = pathname;
    prevLocationKey.current = key;
  }, [pathname, key, navigationType]);

  return null;
};

export default ScrollToTop;
