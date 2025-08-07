import React, { useEffect, useState } from 'react';
import { PaymentMethod, PaymentProvider } from '../../types/payment';
import './PaymentProcessing.css';

interface PaymentProcessingProps {
  method: PaymentMethod;
  provider: PaymentProvider | null;
}

const PaymentProcessing: React.FC<PaymentProcessingProps> = ({ method, provider }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('결제를 준비하고 있습니다...');

  useEffect(() => {
    // 프로그레스 애니메이션
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    // 상태 메시지 업데이트
    const messages = [
      '결제를 준비하고 있습니다...',
      '결제 정보를 확인하고 있습니다...',
      '안전하게 처리하고 있습니다...',
      '잠시만 기다려주세요...'
    ];

    let messageIndex = 0;
    const messageTimer = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setStatusMessage(messages[messageIndex]);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, []);

  const getMethodName = () => {
    const methodNames: Record<PaymentMethod, string> = {
      card: '카드 결제',
      transfer: '계좌이체',
      virtualAccount: '가상계좌',
      phone: '휴대폰 결제',
      easyPay: '간편결제'
    };
    return methodNames[method];
  };

  const getProviderName = () => {
    if (!provider) return '';
    const providerNames: Record<PaymentProvider, string> = {
      toss: '토스',
      kakaopay: '카카오페이',
      naverpay: '네이버페이',
      payco: '페이코',
      samsungpay: '삼성페이'
    };
    return providerNames[provider];
  };

  return (
    <div className="payment-processing">
      <div className="processing-animation">
        <div className="spinner-container">
          <div className="spinner"></div>
          <div className="spinner-inner"></div>
        </div>
      </div>

      <div className="processing-info">
        <h3>결제 처리 중</h3>
        <p className="processing-method">
          {getMethodName()}
          {provider && ` - ${getProviderName()}`}
        </p>
        
        <p className="status-message">{statusMessage}</p>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="security-info">
          <span className="security-icon">🔒</span>
          <span className="security-text">
            안전한 256bit SSL 암호화 통신으로 보호됩니다
          </span>
        </div>
      </div>

      <div className="processing-tips">
        <p className="tip-message">
          💡 결제 창을 닫지 마세요. 처리가 완료되면 자동으로 이동됩니다.
        </p>
        <p className="sub-tip">
          네트워크 상태에 따라 최대 1분 정도 소요될 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default PaymentProcessing;