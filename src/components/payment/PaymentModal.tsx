import React, { useState, useEffect } from 'react';
import { PaymentModalProps, PaymentMethod, PaymentProvider } from '../../types/payment';
import { usePayment } from '../../contexts/PaymentContext';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentSummary from './PaymentSummary';
import PaymentProcessing from './PaymentProcessing';
import './PaymentModal.css';

declare global {
  interface Window {
    TossPayments: any;
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  request,
  config,
  allowedMethods = ['card', 'transfer', 'virtualAccount', 'easyPay'],
  defaultMethod = 'card'
}) => {
  const { status, error, initiatePayment, confirmPayment } = usePayment();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(defaultMethod);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tossPayments, setTossPayments] = useState<any>(null);

  // TossPayments SDK 초기화
  useEffect(() => {
    if (isOpen && window.TossPayments) {
      const clientKey = config?.clientKey || process.env.REACT_APP_TOSS_CLIENT_KEY;
      if (clientKey) {
        setTossPayments(window.TossPayments(clientKey));
      }
    }
  }, [isOpen, config]);

  // 에러 처리
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // 모달 닫기 핸들러
  const handleClose = () => {
    if (!isProcessing) {
      setSelectedMethod(defaultMethod);
      setSelectedProvider(null);
      setAgreedToTerms(false);
      onClose();
    }
  };

  // 결제 처리
  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert('결제 약관에 동의해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. 결제 준비
      await initiatePayment(request);

      // 2. PG사별 결제 처리
      if (selectedMethod === 'easyPay' && selectedProvider) {
        await handleEasyPay(selectedProvider);
      } else {
        await handleStandardPayment(selectedMethod);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      if (onError) {
        onError({
          code: 'PAYMENT_FAILED',
          message: '결제 처리 중 오류가 발생했습니다.',
          details: error
        });
      }
    }
  };

  // 일반 결제 처리 (카드, 계좌이체 등)
  const handleStandardPayment = async (method: PaymentMethod) => {
    if (!tossPayments) {
      throw new Error('Payment SDK not initialized');
    }

    const paymentMethodMap: Record<PaymentMethod, string> = {
      card: '카드',
      transfer: '계좌이체',
      virtualAccount: '가상계좌',
      phone: '휴대폰',
      easyPay: '간편결제'
    };

    try {
      const result = await tossPayments.requestPayment(paymentMethodMap[method], {
        amount: request.amount.final,
        orderId: request.orderId,
        orderName: request.orderName,
        customerName: request.customer.name,
        customerEmail: request.customer.email,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        validHours: method === 'virtualAccount' ? 72 : undefined,
        cashReceipt: {
          type: '소득공제'
        }
      });

      // 결제 성공 시 처리
      handlePaymentSuccess(result);
    } catch (error: any) {
      if (error.code === 'USER_CANCEL') {
        setIsProcessing(false);
        // 사용자가 취소한 경우
      } else {
        throw error;
      }
    }
  };

  // 간편결제 처리
  const handleEasyPay = async (provider: PaymentProvider) => {
    switch (provider) {
      case 'kakaopay':
        await handleKakaoPay();
        break;
      case 'naverpay':
        await handleNaverPay();
        break;
      case 'toss':
        await handleTossPay();
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  const handleKakaoPay = async () => {
    // 카카오페이 결제 로직
    window.location.href = `/api/payments/kakaopay/ready?orderId=${request.orderId}&amount=${request.amount.final}`;
  };

  const handleNaverPay = async () => {
    // 네이버페이 결제 로직
    window.location.href = `/api/payments/naverpay/ready?orderId=${request.orderId}&amount=${request.amount.final}`;
  };

  const handleTossPay = async () => {
    // 토스 간편결제
    if (!tossPayments) return;
    
    await tossPayments.requestPayment('토스페이', {
      amount: request.amount.final,
      orderId: request.orderId,
      orderName: request.orderName,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`
    });
  };

  const handlePaymentSuccess = (result: any) => {
    setIsProcessing(false);
    onSuccess({
      paymentKey: result.paymentKey,
      orderId: result.orderId,
      status: 'completed',
      amount: request.amount,
      approvedAt: new Date().toISOString()
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={handleClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="payment-modal-header">
          <h2>결제하기</h2>
          <button className="close-button" onClick={handleClose} disabled={isProcessing}>
            <span>✕</span>
          </button>
        </div>

        {/* 본문 */}
        <div className="payment-modal-body">
          {isProcessing ? (
            <PaymentProcessing 
              method={selectedMethod}
              provider={selectedProvider}
            />
          ) : (
            <>
              {/* 주문 정보 요약 */}
              <PaymentSummary request={request} />

              {/* 결제 수단 선택 */}
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                selectedProvider={selectedProvider}
                onMethodSelect={setSelectedMethod}
                onProviderSelect={setSelectedProvider}
                allowedMethods={allowedMethods}
              />

              {/* 약관 동의 */}
              <div className="payment-terms">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className="checkbox-text">
                    주문 내용을 확인하였으며, 결제 약관 및 개인정보 처리방침에 동의합니다
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        {!isProcessing && (
          <div className="payment-modal-footer">
            <button 
              className="cancel-button" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              취소
            </button>
            <button 
              className="pay-button" 
              onClick={handlePayment}
              disabled={!agreedToTerms || isProcessing}
            >
              {request.amount.final.toLocaleString()}원 결제하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;