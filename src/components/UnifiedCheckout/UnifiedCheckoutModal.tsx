import React, { useState, useEffect } from 'react';
import { 
  CheckoutRequest, 
  CheckoutPaymentMethod,
  CheckoutError,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
      setErrorMessage('결제 시간이 만료되었습니다.');
      setTimeout(() => {
        onClose();
        clearSession();
      }, 3000);
    }
  }, [isExpired, isOpen, onClose, clearSession]);
  
  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null);
      setAgreedToTerms(false);
      setErrorMessage(null);
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
              `${checkoutService['config'].baseUrl}/sessions/${session.intentId}/cancel`,
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
  
  // 결제 처리
  const handleCheckout = async () => {
    if (!selectedMethod) {
      setErrorMessage('결제 수단을 선택해주세요.');
      return;
    }
    
    if (!agreedToTerms) {
      setErrorMessage('약관에 동의해주세요.');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
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
      
      // 결제 URL이 있으면 이동
      if (intent.paymentUrl) {
        // 1초 후 redirect (로딩 표시를 위해)
        setTimeout(() => {
          window.location.href = intent.paymentUrl!; // paymentUrl is checked above
        }, 1000);
      } else {
        throw new Error('결제 URL을 받지 못했습니다.');
      }
      
    } catch (error) {
      setIsProcessing(false);
      const checkoutError: CheckoutError = {
        code: error instanceof Error && 'code' in error ? (error as any).code : 'CHECKOUT_FAILED',
        message: error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.',
        details: error
      };
      setErrorMessage(checkoutError.message);
      onError?.(checkoutError);
      
      // 세션이 있으면 취소
      if (session) {
        await checkoutService.cancelReservation(session.intentId);
        clearSession();
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
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
                onClick={() => {
                  if (session) {
                    checkoutService.cancelReservation(session.intentId);
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
              
              {/* 에러 메시지 */}
              {errorMessage && (
                <div className={styles['unified-checkout-modal-error']}>
                  {errorMessage}
                </div>
              )}
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
    </div>
  );
};

export default UnifiedCheckoutModal;