import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkoutService, PaymentStatusResponse } from '../services/checkoutService';
import styles from './PaymentSuccessPage.module.css';
import './TabPage.css';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [verificationStatus, setVerificationStatus] = useState<
    'VERIFYING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT'
  >('VERIFYING');
  
  const [paymentInfo, setPaymentInfo] = useState<{
    orderId: string;
    amount: string;
    paymentKey: string;
    intentId?: string;
  } | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const pollingCountRef = useRef(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [domainRedirectUrl, setDomainRedirectUrl] = useState<string>('');
  const [domainName, setDomainName] = useState<string>('');

  // 결제 검증 및 폴링
  const verifyPayment = useCallback(async () => {
    try {
      // URL 파라미터 파싱
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      const paymentKey = searchParams.get('paymentKey');
      
      // PG사별 파라미터 파싱 (네이버페이/카카오페이)
      const paymentId = searchParams.get('paymentId'); // 네이버페이
      const pgToken = searchParams.get('pg_token'); // 카카오페이
      
      if (!orderId || (!paymentKey && !paymentId && !pgToken)) {
        throw new Error('필수 결제 정보가 없습니다.');
      }
      
      // 저장된 세션 정보 조회
      const session = checkoutService.getSession();
      const intentId = session?.intentId;
      
      setPaymentInfo({
        orderId: orderId,
        amount: amount || '0',
        paymentKey: paymentKey || paymentId || pgToken || '',
        intentId
      });
      
      // 세션이 있으면 폴링 시작
      if (intentId) {
        // 폴링 (최대 20초)
        const status = await checkoutService.pollPaymentStatus(intentId, 20, 1000);
        
        if (status.status === 'CONFIRMED') {
          setVerificationStatus('SUCCESS');

          // 세션 정리
          checkoutService.clearSession(intentId);

          // 도메인별 리다이렉트 URL 저장 (자동 이동 제거)
          if (session) {
            const redirectUrl = checkoutService.getSuccessRedirectUrl(session);
            setDomainRedirectUrl(redirectUrl);

            // 도메인명 설정
            const domain = session.domain || 'study';
            const domainNameMap: Record<string, string> = {
              'study': '스터디 페이지',
              'documento': 'Documento 대시보드',
              'job-navigator': 'Job Navigator 프리미엄'
            };
            setDomainName(domainNameMap[domain] || '서비스 페이지');
          }
        } else if (status.status === 'FAILED' || status.status === 'NOT_COMPLETED') {
          const errorMsg = status.status === 'NOT_COMPLETED'
            ? '결제가 완료되지 않았습니다.'
            : (status.message || '결제 검증에 실패했습니다.');
          throw new Error(errorMsg);
        }
      } else {
        // 세션이 없으면 직접 검증 (fallback)
        const result = await checkoutService.verifyPayment(
          orderId,
          paymentKey || paymentId || pgToken || '',
          parseInt(amount || '0')
        );
        
        if (result.status === 'completed') {
          setVerificationStatus('SUCCESS');
        } else if (result.status === 'not_completed') {
          throw new Error('결제가 완료되지 않았습니다.');
        } else {
          throw new Error('결제 상태가 완료되지 않았습니다.');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        setVerificationStatus('TIMEOUT');
        setErrorMessage('결제 확인이 지연되고 있습니다. 잠시 후 다시 확인해주세요.');
      } else {
        setVerificationStatus('FAILED');
        setErrorMessage(error instanceof Error ? error.message : '결제 검증 중 오류가 발생했습니다.');
      }
    }
  }, [searchParams, navigate]);

  // 컴포넌트 마운트 시 검증 시작
  useEffect(() => {
    verifyPayment();
  }, []);

  // 폴링 상태 표시 (최적화: 1초마다 카운트는 하되, 3초마다만 화면 업데이트)
  useEffect(() => {
    if (verificationStatus === 'VERIFYING') {
      const interval = setInterval(() => {
        pollingCountRef.current += 1;
        // 3초마다만 화면 업데이트하여 re-render 최소화
        if (pollingCountRef.current % 3 === 0) {
          setDisplayCount(pollingCountRef.current);
        }
      }, 1000);
      
      return () => {
        clearInterval(interval);
        pollingCountRef.current = 0;
      };
    }
  }, [verificationStatus]);

  // 재시도 핸들러
  const handleRetry = () => {
    setVerificationStatus('VERIFYING');
    pollingCountRef.current = 0;
    setDisplayCount(0);
    verifyPayment();
  };

  // 상태별 클래스 결정
  const getContainerClass = () => {
    switch (verificationStatus) {
      case 'SUCCESS':
        return `${styles['payment-success-container']} ${styles.success}`;
      case 'FAILED':
      case 'TIMEOUT':
        return `${styles['payment-success-container']} ${styles.failed}`;
      default:
        return `${styles['payment-success-container']} ${styles.verifying}`;
    }
  };

  const getTitleClass = () => {
    switch (verificationStatus) {
      case 'SUCCESS':
        return `${styles['payment-title']} ${styles.success}`;
      case 'FAILED':
      case 'TIMEOUT':
        return `${styles['payment-title']} ${styles.failed}`;
      default:
        return `${styles['payment-title']} ${styles.verifying}`;
    }
  };

  return (
    <div className="page-container">
      <main className="page-content">
        <div className={getContainerClass()}>
          {/* 상태별 아이콘 */}
          <div className={styles['payment-icon']}>
            {verificationStatus === 'SUCCESS' && '✅'}
            {verificationStatus === 'FAILED' && '❌'}
            {verificationStatus === 'TIMEOUT' && '⏱️'}
            {verificationStatus === 'VERIFYING' && '🔄'}
          </div>
          
          {/* 상태별 제목 */}
          <h1 className={getTitleClass()}>
            {verificationStatus === 'SUCCESS' && '결제가 완료되었습니다!'}
            {verificationStatus === 'FAILED' && '결제 검증에 실패했습니다'}
            {verificationStatus === 'TIMEOUT' && '결제 확인 중입니다'}
            {verificationStatus === 'VERIFYING' && `결제를 확인하고 있습니다... ${displayCount > 0 ? `(${displayCount}초)` : ''}`}
          </h1>
          
          {/* 결제 정보 */}
          {paymentInfo && verificationStatus === 'SUCCESS' && (
            <div className={styles['payment-info-box']}>
              <div className={styles['payment-info-item']}>
                <strong className={styles['payment-info-label']}>주문번호:</strong>
                <span className={styles['payment-info-value']}>{paymentInfo.orderId}</span>
              </div>
              <div className={styles['payment-info-item']}>
                <strong className={styles['payment-info-label']}>결제금액:</strong>
                <span className={styles['payment-info-value']}>
                  {parseInt(paymentInfo.amount).toLocaleString()}원
                </span>
              </div>
              <div className={styles['payment-info-item']}>
                <strong className={styles['payment-info-label']}>
                  {paymentInfo.paymentKey.startsWith('intent_') ? '거래 ID:' : '결제키:'}
                </strong>
                <span className={`${styles['payment-info-value']} ${styles.monospace}`}>
                  {paymentInfo.paymentKey}
                </span>
              </div>
            </div>
          )}
          
          {/* 에러 메시지 */}
          {errorMessage && (
            <div className={styles['error-message']}>
              {errorMessage}
            </div>
          )}
          
          {/* 안내 메시지 */}
          <p className={styles['payment-description']}>
            {verificationStatus === 'SUCCESS' && '결제 내역은 마이페이지에서 확인하실 수 있습니다.'}
            {verificationStatus === 'VERIFYING' && '잠시만 기다려주세요. 결제 상태를 확인하고 있습니다.'}
            {verificationStatus === 'TIMEOUT' && '결제 처리가 지연되고 있습니다. 잠시 후 마이페이지에서 확인해주세요.'}
            {verificationStatus === 'FAILED' && '결제 처리 중 문제가 발생했습니다. 고객센터로 문의해주세요.'}
          </p>

          {/* 액션 버튼 */}
          <div className={styles['action-buttons']}>
            {verificationStatus === 'SUCCESS' && (
              <>
                {domainRedirectUrl && (
                  <button
                    onClick={() => navigate(domainRedirectUrl)}
                    className={styles['button-primary']}
                  >
                    {domainName}로 이동
                  </button>
                )}
                <button
                  onClick={() => navigate('/')}
                  className={styles['button-secondary']}
                >
                  홈으로 이동
                </button>
              </>
            )}
            
            {(verificationStatus === 'FAILED' || verificationStatus === 'TIMEOUT') && (
              <>
                <button
                  onClick={handleRetry}
                  className={styles['button-retry']}
                >
                  다시 확인
                </button>
                <button
                  onClick={() => navigate('/users/me')}
                  className={styles['button-outline']}
                >
                  마이페이지로
                </button>
              </>
            )}
          </div>

          {/* Mock 모드 정보 */}
          {process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK === 'true' && (
            <div className={styles['dev-info']}>
              <p className={styles['dev-info-text']}>
                💡 Mock 모드: 테스트 결제가 자동으로 승인됩니다.
              </p>
              {paymentInfo?.intentId && (
                <p className={styles['dev-info-session']}>
                  Session ID: {paymentInfo.intentId}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;