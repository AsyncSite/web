import React from 'react';
import { CheckoutPaymentMethod } from '../../types/checkout';
import styles from './PaymentMethodSelector.module.css';

interface PaymentMethodSelectorProps {
  selectedMethod: CheckoutPaymentMethod | null;
  onMethodSelect: (method: CheckoutPaymentMethod) => void;
  disabled?: boolean;
  className?: string;
}

interface PaymentMethodInfo {
  id: CheckoutPaymentMethod;
  name: string;
  description: string;
  logo: string;
  bgColor: string;
  borderColor: string;
  popular?: boolean;
}

const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: 'inicis',
    name: '카드결제',
    description: '신용카드/체크카드 결제',
    logo: '💳',
    bgColor: '#3182CE',
    borderColor: '#2B6CB0',
    popular: true
  },
  {
    id: 'ACCOUNT_TRANSFER',
    name: '계좌이체',
    description: '입금 확인 후 승인 (1-2일 소요)',
    logo: '🏦',
    bgColor: '#4A5568',
    borderColor: '#2D3748'
  }
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`${styles['unified-payment-selector-container']} ${className}`}>
      <h3 className={styles['unified-payment-selector-title']}>
        결제 수단 선택
      </h3>
      
      <div className={styles['unified-payment-selector-methods']}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              type="button"
              className={[
                styles['unified-payment-method-card'],
                isSelected && styles['unified-payment-method-card--selected'],
                disabled && styles['unified-payment-method-card--disabled']
              ].filter(Boolean).join(' ')}
              onClick={() => !disabled && onMethodSelect(method.id)}
              disabled={disabled}
              aria-label={`${method.name} 선택`}
              aria-pressed={isSelected}
              data-payment-method={method.id}
            >
              {/* 인기 배지 */}
              {method.popular && (
                <span className={styles['unified-payment-method-badge']}>
                  인기
                </span>
              )}
              
              {/* 선택 체크마크 */}
              {isSelected && (
                <span className={styles['unified-payment-method-checkmark']}>
                  ✓
                </span>
              )}
              
              {/* 로고 영역 */}
              <div 
                className={styles['unified-payment-method-logo']}
                style={{ 
                  backgroundColor: method.bgColor,
                  borderColor: method.borderColor 
                }}
              >
                <span className={styles['unified-payment-method-logo-icon']}>
                  {method.logo}
                </span>
              </div>
              
              {/* 텍스트 영역 */}
              <div className={styles['unified-payment-method-info']}>
                <strong className={styles['unified-payment-method-name']}>
                  {method.name}
                </strong>
                <span className={styles['unified-payment-method-description']}>
                  {method.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* 안내 메시지 */}
      <div className={styles['unified-payment-selector-notice']}>
        <span className={styles['unified-payment-selector-notice-icon']}>ℹ️</span>
        <span className={styles['unified-payment-selector-notice-text']}>
          선택하신 결제 수단의 앱 또는 웹사이트로 이동하여 결제를 진행합니다.
        </span>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;