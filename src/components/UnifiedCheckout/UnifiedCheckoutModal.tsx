import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
import {
  CheckoutRequest,
  CheckoutPaymentMethod,
  CheckoutError,
  CheckoutErrorCode,
  CheckoutResponse
} from '../../types/checkout';
import { checkoutService } from '../../services/checkoutService';
import { usePaymentSession, formatRemainingTime } from '../../hooks/usePaymentSession';
import CheckoutSummary from './CheckoutSummary';
import PaymentMethodSelector from './PaymentMethodSelector';
import styles from './UnifiedCheckoutModal.module.css';

interface UnifiedCheckoutModalProps {
  isOpen: boolean;
  checkoutData: Omit<CheckoutRequest, 'paymentMethod'>;
  onClose: () => void;
  onSuccess?: (response: CheckoutResponse) => void;
  onError?: (error: CheckoutError) => void;
  className?: string;
}

const UnifiedCheckoutModal: React.FC<UnifiedCheckoutModalProps> = ({
  isOpen,
  checkoutData,
  onClose,
  onSuccess,
  onError,
  className = ''
}) => {
  const [selectedMethod, setSelectedMethod] = useState<CheckoutPaymentMethod | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 세션 관리
  const {
    session,
    remainingTime,
    isExpired,
    startSession,
    clearSession
  } = usePaymentSession();
  
  // 만료 시 모달 자동 닫기
  useEffect(() => {
    if (isExpired && isOpen) {
      toast.error('결제 시간이 만료되었습니다.', {
        duration: 4000,
        position: 'top-center',
        icon: '⏱️',
      });
      setTimeout(() => {
        onClose();
        clearSession();
      }, 2000);
    }
  }, [isExpired, isOpen, onClose, clearSession]);
  
  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null);
      setAgreedToTerms(false);
      setIsProcessing(false);
    }
  }, [isOpen]);
  
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // body 스크롤 비활성화
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, isProcessing, onClose]);
  
  // 페이지 이탈 감지 및 예약 취소
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (session && (isProcessing || remainingTime > 0)) {
        // 표준 방식
        e.preventDefault();
        // Chrome 호환성
        e.returnValue = '결제가 진행 중입니다. 페이지를 떠나시면 결제가 취소됩니다.';
        
        // 백그라운드에서 예약 취소 (사용자가 실제로 떠나면)
        window.addEventListener('unload', () => {
          if (session) {
            // 동기적으로 취소 요청 전송
            navigator.sendBeacon(
              `${checkoutService['config'].baseUrl}/payment-intents/${session.intentId}/cancel`,
              JSON.stringify({ intentId: session.intentId })
            );
          }
        }, { once: true });
        
        return e.returnValue;
      }
    };
    
    if (isOpen && session) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [session, isProcessing, remainingTime, isOpen]);
  
  // Payment status 폴링 시작
  const startPollingForPaymentStatus = async (intentId: string) => {
    console.log('[UnifiedCheckoutModal] Starting payment status polling for intentId:', intentId);
    try {
      // checkoutService의 기존 pollPaymentStatus 메소드 사용 (최대 30초, 2초 간격)
      const status = await checkoutService.pollPaymentStatus(intentId, 30, 2000);

      if (status.status === 'CONFIRMED') {
        // 성공 처리
        if (onSuccess) {
          onSuccess({
            checkoutId: intentId,
            paymentUrl: '',
            expiresAt: new Date().toISOString(),
            status: 'completed'
          });
        }

        // 세션 정리
        clearSession();

        // 성공 페이지로 이동 (URL 파라미터 포함)
        const successUrl = new URL('/payment/success', window.location.origin);
        successUrl.searchParams.set('orderId', checkoutData.orderId);
        successUrl.searchParams.set('amount', checkoutData.amount.final.toString());
        successUrl.searchParams.set('paymentKey', intentId); // intentId를 paymentKey로 사용

        setTimeout(() => {
          window.location.href = successUrl.toString();
        }, 1000);
      } else if (status.status === 'FAILED' || status.status === 'NOT_COMPLETED' || status.status === 'EXPIRED') {
        setIsProcessing(false);
        clearSession();

        // Toast 에러 메시지
        const errorMessage = status.status === 'NOT_COMPLETED'
          ? '결제가 완료되지 않았습니다.'
          : (status.message || '결제가 실패했습니다.');

        toast.error(errorMessage, {
          duration: 5000,
          position: 'top-center',
        });

        if (onError) {
          onError({
            code: 'PAYMENT_FAILED' as CheckoutErrorCode,
            message: errorMessage,
            details: status
          });
        }
      }
    } catch (error) {
      setIsProcessing(false);
      clearSession();

      const errorMessage = error instanceof Error ? error.message : '결제 확인 중 오류가 발생했습니다.';

      // Toast 에러 메시지
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });

      if (onError) {
        onError({
          code: 'PAYMENT_FAILED' as CheckoutErrorCode,
          message: errorMessage,
          details: error
        });
      }
    }
  };

  // 결제 처리
  const handleCheckout = async () => {
    if (!selectedMethod) {
      toast.error('결제 수단을 선택해주세요.', {
        duration: 3000,
        position: 'top-center',
        icon: '⚠️',
      });
      return;
    }

    if (!agreedToTerms) {
      toast.error('약관에 동의해주세요.', {
        duration: 3000,
        position: 'top-center',
        icon: '⚠️',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // 실제 Checkout Request 생성
      const fullRequest: CheckoutRequest = {
        ...checkoutData,
        paymentMethod: selectedMethod
      };
      
      // CheckoutService를 통한 세션 시작
      const intent = await checkoutService.initiateCheckout(fullRequest);

      // 세션 시작
      startSession(intent);

      // PaymentIntent ID를 키로 사용하여 결제 정보 저장
      try {
        localStorage.setItem(`payment_intent_${intent.intentId}`, JSON.stringify(fullRequest));
      } catch (_) {
        // storage 에러는 무시
      }

      // URL 모드면 결제 URL로 이동
      if (intent.paymentUrl && intent.invocationType !== 'SDK') {
        // 1초 후 redirect (로딩 표시를 위해)
        setTimeout(() => {
          window.location.href = intent.paymentUrl!; // paymentUrl is checked above
        }, 1000);
      } else if ((intent as any).sdkCompleted) {
        // SDK 모드: initiateCheckout 내에서 PortOne.requestPayment 호출 완료
        // 결제창이 닫혔으므로 바로 폴링 시작
        startPollingForPaymentStatus(intent.intentId);
      } else if (intent.invocationType === 'SDK') {
        // SDK 호출이 실패한 경우 (sdkCompleted 플래그가 없음)
        throw new Error('결제 창을 열 수 없습니다.');
      } else {
        throw new Error('결제 시작 정보가 올바르지 않습니다.');
      }
      
    } catch (error) {
      setIsProcessing(false);

      // 사용자 친화적 메시지 처리
      let userMessage = '결제를 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';
      let errorCode: CheckoutErrorCode = 'UNKNOWN_ERROR';

      if (error instanceof Error) {
        userMessage = error.message;
        if ('code' in error) {
          errorCode = (error as any).code as CheckoutErrorCode;
        }
      }

      const checkoutError: CheckoutError = {
        code: errorCode,
        message: userMessage,
        details: error
      };

      // 사용자 취소는 info로, 나머지는 error로 표시
      if (errorCode === ('USER_CANCEL' as CheckoutErrorCode)) {
        toast(userMessage, {
          duration: 3000,
          position: 'top-center',
          icon: 'ℹ️',
        });
      } else {
        toast.error(userMessage, {
          duration: 5000,
          position: 'top-center',
        });
      }

      // 취소가 아닌 경우만 onError 콜백 호출
      if (errorCode !== ('USER_CANCEL' as CheckoutErrorCode)) {
        onError?.(checkoutError);
      }

      // 개발 환경에서만 상세 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('Checkout error details:', checkoutError);
      }

      // 세션이 있으면 취소 시도 (실패해도 UI는 업데이트)
      if (session) {
        try {
          await checkoutService.cancelReservation(session.intentId);
        } catch (cancelError) {
          // 취소 실패는 무시 (이미 만료되었거나 네트워크 오류일 수 있음)
          console.error('Failed to cancel reservation:', cancelError);
        }
        clearSession();
      }
    }
  };
  
  if (!isOpen) return null;
  
  // Portal을 사용하여 body에 직접 렌더링
  return ReactDOM.createPortal(
    <div 
      className={styles['unified-checkout-modal-overlay']}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div className={`${styles['unified-checkout-modal']} ${className}`}>
        {/* 헤더 */}
        <div className={styles['unified-checkout-modal-header']}>
          <h2 className={styles['unified-checkout-modal-title']}>
            결제하기
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 만료 시간 표시 */}
            {session && remainingTime > 0 && !isProcessing && (
              <div 
                className={`${styles['unified-checkout-modal-timer-container']} ${
                  remainingTime < 30 ? styles.critical : 
                  remainingTime < 60 ? styles.warning : ''
                }`}
              >
                <span className={styles['unified-checkout-modal-timer-icon']}>
                  ⏱
                </span>
                <span className={styles['unified-checkout-modal-timer-text']}>
                  {formatRemainingTime(remainingTime)}
                </span>
              </div>
            )}
            {!isProcessing && (
              <button
                className={styles['unified-checkout-modal-close']}
                onClick={async () => {
                  if (session) {
                    try {
                      await checkoutService.cancelReservation(session.intentId);
                    } catch (cancelError) {
                      // 취소 실패는 무시
                      console.error('Failed to cancel reservation:', cancelError);
                    }
                    clearSession();
                  }
                  onClose();
                }}
                aria-label="닫기"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* 본문 */}
        <div className={styles['unified-checkout-modal-body']}>
          {isProcessing ? (
            <div className={styles['unified-checkout-modal-processing']}>
              <div className={styles['unified-checkout-modal-spinner']}>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className={styles['unified-checkout-modal-processing-text']}>
                결제 페이지로 이동 중입니다...
              </p>
            </div>
          ) : (
            <>
              {/* 주문 요약 */}
              <CheckoutSummary checkoutData={checkoutData} />
              
              {/* 결제 수단 선택 */}
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodSelect={setSelectedMethod}
              />
              
              {/* 약관 동의 */}
              <div className={styles['unified-checkout-modal-terms']}>
                <label className={styles['unified-checkout-modal-checkbox-label']}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className={styles['unified-checkout-modal-checkbox']}
                  />
                  <span className={styles['unified-checkout-modal-checkbox-text']}>
                    주문 내용을 확인하였으며, 
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      이용약관
                    </a> 및 
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      개인정보 처리방침
                    </a>에 동의합니다.
                  </span>
                </label>
              </div>
              
            </>
          )}
        </div>
        
        {/* 푸터 */}
        {!isProcessing && (
          <div className={styles['unified-checkout-modal-footer']}>
            <button
              className={styles['unified-checkout-modal-cancel-button']}
              onClick={onClose}
            >
              취소
            </button>
            <button
              className={styles['unified-checkout-modal-submit-button']}
              onClick={handleCheckout}
              disabled={!selectedMethod || !agreedToTerms}
            >
              {checkoutData.amount.final.toLocaleString('ko-KR')}원 결제하기
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default UnifiedCheckoutModal;