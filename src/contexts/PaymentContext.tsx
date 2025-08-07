import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  PaymentConfig,
  PaymentContextValue,
  PaymentError,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus
} from '../types/payment';

// 기본 설정
const defaultConfig: PaymentConfig = {
  clientKey: process.env.REACT_APP_TOSS_CLIENT_KEY || '',
  mode: process.env.REACT_APP_PAYMENT_MODE as 'test' | 'production' || 'test',
  providers: {
    toss: {
      enabled: true,
      clientKey: process.env.REACT_APP_TOSS_CLIENT_KEY || '',
      priority: 1
    },
    kakaopay: {
      enabled: true,
      priority: 2
    },
    naverpay: {
      enabled: true,
      priority: 3
    },
    payco: {
      enabled: false,
      priority: 4
    },
    samsungpay: {
      enabled: false,
      priority: 5
    }
  },
  ui: {
    theme: 'dark',
    primaryColor: '#c3e88d',
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
  }
};

const PaymentContext = createContext<PaymentContextValue | undefined>(undefined);

interface PaymentProviderProps {
  children: React.ReactNode;
  config?: Partial<PaymentConfig>;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ 
  children, 
  config: userConfig 
}) => {
  const [config] = useState<PaymentConfig>({
    ...defaultConfig,
    ...userConfig,
    providers: {
      ...defaultConfig.providers,
      ...userConfig?.providers
    },
    ui: {
      ...defaultConfig.ui,
      ...userConfig?.ui
    }
  });

  const [currentPayment, setCurrentPayment] = useState<PaymentRequest | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<PaymentError | null>(null);

  // TossPayments SDK 로드
  useEffect(() => {
    if (config.providers.toss?.enabled && config.providers.toss.clientKey) {
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [config]);

  // 결제 시작
  const initiatePayment = useCallback(async (request: PaymentRequest) => {
    try {
      setStatus('preparing');
      setError(null);
      setCurrentPayment(request);

      // 백엔드 API 호출 (결제 준비)
      if (process.env.REACT_APP_API_URL) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/prepare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          },
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error('Payment preparation failed');
        }

        const data = await response.json();
        setCurrentPayment({ ...request, ...data });
      }

      setStatus('ready');
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'PAYMENT_INIT_ERROR',
        message: err instanceof Error ? err.message : 'Payment initialization failed',
        details: err
      };
      setError(paymentError);
      setStatus('failed');
      throw paymentError;
    }
  }, []);

  // 결제 확인
  const confirmPayment = useCallback(async (paymentKey: string): Promise<PaymentResponse> => {
    try {
      setStatus('processing');
      
      // 백엔드 API 호출 (결제 승인)
      if (process.env.REACT_APP_API_URL) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          },
          body: JSON.stringify({
            paymentKey,
            orderId: currentPayment?.orderId,
            amount: currentPayment?.amount.final
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Payment confirmation failed');
        }

        const paymentResponse: PaymentResponse = await response.json();
        setStatus('completed');
        return paymentResponse;
      } else {
        // 개발 모드: localStorage 사용
        const mockResponse: PaymentResponse = {
          paymentKey,
          orderId: currentPayment?.orderId || '',
          status: 'completed',
          amount: currentPayment?.amount || { original: 0, discount: 0, final: 0, currency: 'KRW' },
          approvedAt: new Date().toISOString()
        };
        
        // localStorage에 저장
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push(mockResponse);
        localStorage.setItem('payments', JSON.stringify(payments));
        
        setStatus('completed');
        return mockResponse;
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'PAYMENT_CONFIRM_ERROR',
        message: err instanceof Error ? err.message : 'Payment confirmation failed',
        details: err
      };
      setError(paymentError);
      setStatus('failed');
      throw paymentError;
    }
  }, [currentPayment]);

  // 결제 취소
  const cancelPayment = useCallback(() => {
    setStatus('cancelled');
    setCurrentPayment(null);
    setError(null);
  }, []);

  // 환불
  const refundPayment = useCallback(async (paymentKey: string, amount?: number) => {
    try {
      if (process.env.REACT_APP_API_URL) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/${paymentKey}/refund`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          },
          body: JSON.stringify({ amount })
        });

        if (!response.ok) {
          throw new Error('Refund failed');
        }

        setStatus('refunded');
      } else {
        // 개발 모드
        console.log('Refund requested:', { paymentKey, amount });
        setStatus('refunded');
      }
    } catch (err) {
      const paymentError: PaymentError = {
        code: 'REFUND_ERROR',
        message: err instanceof Error ? err.message : 'Refund failed',
        details: err
      };
      setError(paymentError);
      throw paymentError;
    }
  }, []);

  const value: PaymentContextValue = {
    config,
    currentPayment,
    status,
    error,
    initiatePayment,
    confirmPayment,
    cancelPayment,
    refundPayment
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom Hook
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};