import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * 페이지 가시성 변경 시 인증 상태를 재검증합니다
 * 다른 탭에서 로그아웃한 경우를 감지합니다
 */
export function useAuthRevalidation() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 페이지가 다시 보이게 될 때 인증 상태 확인
        const token = localStorage.getItem('authToken');
        if (!token && !isLoading && isAuthenticated) {
          // 토큰이 없는데 인증 상태로 표시되면 로그인 페이지로 리다이렉트
          navigate('/login', { replace: true });
        }
      }
    };

    const handleFocus = () => {
      // 윈도우가 포커스를 받을 때도 체크
      const token = localStorage.getItem('authToken');
      if (!token && !isLoading && isAuthenticated) {
        navigate('/login', { replace: true });
      }
    };

    // storage 이벤트로 다른 탭에서의 로그아웃 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && e.newValue === null) {
        // 다른 탭에서 로그아웃됨
        window.location.href = '/login';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, isLoading, navigate]);
}