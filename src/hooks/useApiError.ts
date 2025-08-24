import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { translateErrorMessage } from '../constants/errorMessages';

/**
 * 글로벌 API 에러 핸들러 훅
 * 중앙화된 에러 처리로 일관된 사용자 경험 제공
 */
export const useApiError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, warning } = useToast();

  const handleApiError = useCallback((err: any, options?: {
    silent?: boolean; // 토스트 메시지 표시 안 함
    skipRedirect?: boolean; // 리다이렉트 안 함
  }) => {
    const { silent = false, skipRedirect = false } = options || {};

    // 401: 인증 만료
    if (err.response?.status === 401) {
      if (!silent) {
        error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      if (!skipRedirect) {
        // 현재 페이지 정보를 state로 전달하여 재로그인 후 복귀 가능
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              from: location.pathname + location.search,
              message: '세션이 만료되었습니다'
            },
            replace: true 
          });
        }, 1500);
      }
      return '세션이 만료되었습니다';
    }

    // 403: 권한 없음
    if (err.response?.status === 403) {
      const message = '이 작업을 수행할 권한이 없습니다.';
      if (!silent) {
        error(message);
      }
      return message;
    }

    // 404: 리소스 없음
    if (err.response?.status === 404) {
      const message = '요청한 정보를 찾을 수 없습니다.';
      if (!silent) {
        warning(message);
      }
      return message;
    }

    // 409: 충돌 (중복 등)
    if (err.response?.status === 409) {
      const message = err.response?.data?.message || '이미 존재하는 항목입니다.';
      if (!silent) {
        warning(message);
      }
      return message;
    }

    // 422: 검증 실패
    if (err.response?.status === 422) {
      const message = err.response?.data?.message || '입력값을 확인해주세요.';
      if (!silent) {
        error(message);
      }
      return message;
    }

    // 500: 서버 에러
    if (err.response?.status === 500) {
      const message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      if (!silent) {
        error(message);
      }
      return message;
    }

    // 네트워크 에러
    if (err.message === 'Network Error') {
      const message = '네트워크 연결을 확인해주세요.';
      if (!silent) {
        error(message);
      }
      return message;
    }

    // 기타 에러 - translateErrorMessage 활용
    const errorCode = err.response?.data?.error?.code;
    const errorMessage = err.response?.data?.message || err.message;
    const translatedMessage = translateErrorMessage(errorCode, errorMessage);
    
    if (!silent) {
      error(translatedMessage);
    }
    
    return translatedMessage;
  }, [navigate, location, error, warning]);

  return { handleApiError };
};