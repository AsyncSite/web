import React, { useState } from 'react';
import { CheckoutRequest, CheckoutDomain, CheckoutResponse, CheckoutError } from '../../types/checkout';
import UnifiedCheckoutModal from './UnifiedCheckoutModal';
import styles from './CheckoutButton.module.css';

interface CheckoutButtonProps {
  // 버튼 스타일 관련
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  
  // 버튼 내용
  label?: string;
  icon?: React.ReactNode;
  showPrice?: boolean;
  
  // Checkout 데이터 (paymentMethod 제외)
  checkoutData: Omit<CheckoutRequest, 'paymentMethod'>;
  
  // 이벤트 핸들러
  onCheckoutStart?: () => void;
  onCheckoutComplete?: (result: CheckoutResponse) => void;
  onCheckoutError?: (error: CheckoutError) => void;
  
  // 추가 옵션
  className?: string;
  testId?: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  label,
  icon,
  showPrice = false,
  checkoutData,
  onCheckoutStart,
  onCheckoutComplete,
  onCheckoutError,
  className = '',
  testId = 'unified-checkout-button'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 도메인별 기본 레이블 설정
  const getDefaultLabel = (): string => {
    if (label) return label;
    
    if (showPrice) {
      const formattedPrice = checkoutData.amount.final.toLocaleString('ko-KR');
      return `${formattedPrice}원 결제하기`;
    }
    
    switch (checkoutData.domain) {
      case 'study':
        return '스터디 참가 신청';
      case 'documento':
        return '구독 시작하기';
      case 'job-navigator':
        return '서비스 이용 시작';
      default:
        return '결제하기';
    }
  };
  
  // 도메인별 아이콘 설정
  const getDefaultIcon = (): React.ReactNode => {
    if (icon) return icon;
    
    switch (checkoutData.domain) {
      case 'study':
        return <span className={styles['unified-checkout-button-icon']}>📚</span>;
      case 'documento':
        return <span className={styles['unified-checkout-button-icon']}>📄</span>;
      case 'job-navigator':
        return <span className={styles['unified-checkout-button-icon']}>💼</span>;
      default:
        return null;
    }
  };
  
  const handleClick = () => {
    if (disabled || loading) return;
    
    onCheckoutStart?.();
    setIsModalOpen(true);
  };
  
  // CSS 클래스 조합
  const buttonClasses = [
    styles['unified-checkout-button'],
    styles[`unified-checkout-button--${variant}`],
    styles[`unified-checkout-button--${size}`],
    fullWidth && styles['unified-checkout-button--full-width'],
    disabled && styles['unified-checkout-button--disabled'],
    loading && styles['unified-checkout-button--loading'],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <>
      <button
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        data-testid={testId}
        data-domain={checkoutData.domain}
        aria-label={getDefaultLabel()}
      >
        {loading ? (
          <span className={styles['unified-checkout-button-spinner']}>
            <span className={styles['unified-checkout-button-spinner-dot']}></span>
            <span className={styles['unified-checkout-button-spinner-dot']}></span>
            <span className={styles['unified-checkout-button-spinner-dot']}></span>
          </span>
        ) : (
          <>
            {getDefaultIcon()}
            <span className={styles['unified-checkout-button-label']}>
              {getDefaultLabel()}
            </span>
          </>
        )}
      </button>
      
      <UnifiedCheckoutModal
        isOpen={isModalOpen}
        checkoutData={checkoutData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(response) => {
          setIsModalOpen(false);
          onCheckoutComplete?.(response);
        }}
        onError={(error) => {
          onCheckoutError?.(error);
        }}
      />
    </>
  );
};

export default CheckoutButton;