import React, { useState } from 'react';
import PaymentModal from './PaymentModal';
import { PaymentRequest, PaymentResponse } from '../../types/payment';
import './PaymentButton.css';

interface PaymentButtonProps {
  // 버튼 관련
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  
  // 결제 관련
  request: PaymentRequest;
  onSuccess: (payment: PaymentResponse) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  
  // 추가 옵션
  className?: string;
  showPrice?: boolean;
  pricePrefix?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  icon,
  request,
  onSuccess,
  onError,
  onCancel,
  className = '',
  showPrice = true,
  pricePrefix = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handlePaymentSuccess = (payment: PaymentResponse) => {
    setIsModalOpen(false);
    onSuccess(payment);
  };

  const handlePaymentError = (error: any) => {
    if (onError) {
      onError(error);
    }
  };

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (label) {
      return label;
    }
    
    if (showPrice) {
      const priceText = `${request.amount.final.toLocaleString()}원`;
      return pricePrefix ? `${pricePrefix} ${priceText}` : priceText;
    }
    
    return '결제하기';
  };

  return (
    <>
      <button
        className={`payment-button payment-button-${variant} payment-button-${size} ${fullWidth ? 'full-width' : ''} ${className}`}
        onClick={handleClick}
        disabled={disabled}
      >
        {icon && <span className="button-icon">{icon}</span>}
        <span className="button-text">{getButtonText()}</span>
        {variant === 'gradient' && <span className="button-glow"></span>}
      </button>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        request={request}
      />
    </>
  );
};

export default PaymentButton;