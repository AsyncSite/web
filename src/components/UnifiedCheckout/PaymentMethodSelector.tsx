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
    id: 'kakaopay',
    name: '카카오페이',
    description: '카카오톡으로 간편결제',
    logo: '🟨',  // 실제로는 이미지 URL 사용
    bgColor: '#FEE500',
    borderColor: '#F5D800',
    popular: true
  },
  {
    id: 'naverpay',
    name: '네이버페이',
    description: '네이버 아이디로 간편결제',
    logo: '🟩',  // 실제로는 이미지 URL 사용
    bgColor: '#03C75A',
    borderColor: '#00B050'
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