import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkoutService } from '../services/checkoutService';
import styles from './PaymentFailPage.module.css';
import './TabPage.css';

// SessionData 타입 (checkoutService와 동일)
interface SessionData {
  intentId: string;
  domain: string;
  domainId: string;
  reservations: Record<string, string>;
  expiresAt: string;
  correlationId: string;
}

const PaymentFailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<{
    code: string;
    message: string;
    orderId: string;
    intentId?: string;
    paymentMethod?: string;
  } | null>(null);
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // 세션 복구 및 예약 취소
  const handleSessionRecovery = useCallback(async () => {
    try {
      // 현재 세션 조회
      const currentSession = checkoutService.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        
        // 예약 취소 (백그라운드)
        setIsCancelling(true);
        await checkoutService.cancelReservation(currentSession.intentId);
        
        // 세션 정리
        checkoutService.clearSession(currentSession.intentId);
        setIsCancelling(false);
      }
    } catch (error) {
      // 실패 무시
      setIsCancelling(false);
    }
  }, []);

  useEffect(() => {
    // URL 파라미터에서 에러 정보 추출
    const code = searchParams.get('code') || searchParams.get('error_code');
    const message = searchParams.get('message') || searchParams.get('error_msg');
    const orderId = searchParams.get('orderId');
    
    // PG사별 파라미터 파싱
    const resultCode = searchParams.get('resultCode'); // NaverPay
    const status = searchParams.get('status'); // KakaoPay
    
    // 에러 코드 통합 처리
    let finalCode = code;
    let finalMessage = message;
    
    if (!finalCode && resultCode && resultCode !== 'Success') {
      finalCode = resultCode;
      finalMessage = searchParams.get('resultMessage') || 'NaverPay 결제 실패';
    }
    
    if (!finalCode && status && status !== 'success') {
      finalCode = 'KAKAOPAY_FAILED';
      finalMessage = 'KakaoPay 결제가 취소되었습니다.';
    }

    if (finalCode) {
      setErrorInfo({ 
        code: finalCode, 
        message: finalMessage ? decodeURIComponent(finalMessage) : '결제 처리 중 오류가 발생했습니다.',
        orderId: orderId || '',
        intentId: searchParams.get('intentId') || undefined,
        paymentMethod: searchParams.get('paymentMethod') || undefined
      });
    }
    
    // 세션 복구 및 예약 취소
    handleSessionRecovery();
  }, [searchParams, handleSessionRecovery]);

  const getErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
      // Toss Payments 에러 코드
      'PAY_PROCESS_CANCELED': '사용자가 결제를 취소했습니다.',
      'PAY_PROCESS_ABORTED': '결제가 중단되었습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 결제를 거절했습니다.',
      'INSUFFICIENT_BALANCE': '잔액이 부족합니다.',
      'EXCEED_MAX_AMOUNT': '결제 한도를 초과했습니다.',
      'INVALID_CARD_NUMBER': '유효하지 않은 카드번호입니다.',
      'EXPIRED_CARD': '만료된 카드입니다.',
      
      // NaverPay 에러 코드
      'UserCancel': '사용자가 결제를 취소했습니다.',
      'Fail': 'NaverPay 결제 처리에 실패했습니다.',
      'TimeExpired': 'NaverPay 결제 시간이 만료되었습니다.',
      
      // KakaoPay 에러 코드
      'KAKAOPAY_FAILED': 'KakaoPay 결제가 취소되었습니다.',
      'USER_QUIT': '사용자가 KakaoPay 결제를 취소했습니다.',
      
      // 시스템 에러
      'PAYMENT_TIMEOUT': '결제 확인 시간이 초과되었습니다.',
      'CHECKOUT_EXPIRED': '결제 세션이 만료되었습니다.',
      'RESERVATION_FAILED': '상품 예약에 실패했습니다.',
      
      'DEFAULT': '결제 처리 중 오류가 발생했습니다.'
    };

    return errorMessages[code] || errorMessages['DEFAULT'];
  };
  
  // 재시도 핸들러 (새 세션 생성)
  const handleRetryWithNewSession = async () => {
    setIsRetrying(true);
    
    try {
      // 세션 정보가 있으면 동일한 상품으로 재시도
      if (session) {
        // 도메인별 상품 페이지로 이동
        const domain = session.domain;
        const domainId = session.domainId;
        
        switch (domain) {
          case 'study':
            navigate(`/study/${domainId}`);
            break;
          case 'documento':
            navigate('/documento');
            break;
          case 'job-navigator':
            navigate('/job-navigator');
            break;
          default:
            navigate(-1);
        }
      } else {
        // 세션 정보가 없으면 이전 페이지로
        navigate(-1);
      }
    } catch (error) {
      // 실패 무시
      setIsRetrying(false);
    }
  };
  
  // 고객센터 연락처 복사
  const copySupport = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다.');
  };

  return (
    <div className="page-container">
      <main className="page-content">
        <div className={styles['payment-fail-container']}>
          <div className={styles['fail-icon']}>❌</div>
          <h1 className={styles['fail-title']}>결제에 실패했습니다</h1>
          
          {errorInfo && (
            <div className={styles['error-info-box']}>
              <div className={styles['error-info-item']}>
                <strong className={styles['error-info-label']}>에러 코드:</strong>
                <span className={`${styles['error-info-value']} ${styles['error-code']}`}>
                  {errorInfo.code}
                </span>
              </div>
              <div className={styles['error-info-item']}>
                <strong className={styles['error-info-label']}>에러 메시지:</strong>
                <span className={styles['error-info-value']}>
                  {getErrorMessage(errorInfo.code)}
                </span>
              </div>
              {errorInfo.orderId && (
                <div className={styles['error-info-item']}>
                  <strong className={styles['error-info-label']}>주문번호:</strong>
                  <span className={styles['error-info-value']}>
                    {errorInfo.orderId}
                  </span>
                </div>
              )}
            </div>
          )}

          <p className={styles['fail-description']}>
            결제를 다시 시도하거나 다른 결제 수단을 이용해주세요.
          </p>

          <div className={styles['action-buttons']}>
            <button
              onClick={handleRetryWithNewSession}
              disabled={isRetrying || isCancelling}
              className={styles['button-retry']}
            >
              {isRetrying ? '처리 중...' : '다시 시도하기'}
            </button>
            <button
              onClick={() => navigate('/study')}
              disabled={isCancelling}
              className={styles['button-secondary']}
            >
              스터디 목록으로
            </button>
          </div>

          <div className={styles['support-info']}>
            <p className={styles['support-text']}>
              💡 결제 관련 문의사항이 있으시면 고객센터로 연락주세요.
            </p>
            <div className={styles['support-contacts']}>
              <span 
                className={styles['support-contact']}
                onClick={() => copySupport('support@asyncsite.com')}
              >
                support@asyncsite.com
              </span>
              <span className={styles['support-divider']}>|</span>
              <span 
                className={styles['support-contact']}
                onClick={() => copySupport('1588-0000')}
              >
                1588-0000
              </span>
            </div>
          </div>
          
          {/* 개발 모드 세션 정보 */}
          {process.env.NODE_ENV === 'development' && session && (
            <div className={styles['dev-session-info']}>
              <p className={styles['dev-session-title']}>
                📾 세션 정보 (개발 모드)
              </p>
              <p className={styles['dev-session-text']}>
                Intent ID: {session.intentId}
              </p>
              <p className={styles['dev-session-text']}>
                Domain: {session.domain} ({session.domainId})
              </p>
              {isCancelling && (
                <p className={styles['dev-session-cancelling']}>
                  예약 취소 중...
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentFailPage;