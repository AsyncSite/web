import React from 'react';
import { PaymentMethod, PaymentProvider, CardCompany } from '../../types/payment';
import './PaymentMethodSelector.css';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  selectedProvider: PaymentProvider | null;
  onMethodSelect: (method: PaymentMethod) => void;
  onProviderSelect: (provider: PaymentProvider | null) => void;
  allowedMethods: PaymentMethod[];
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  selectedProvider,
  onMethodSelect,
  onProviderSelect,
  allowedMethods
}) => {
  // 결제 수단 정보
  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      name: '신용/체크카드',
      icon: '💳',
      description: '국내 모든 카드 결제 가능'
    },
    {
      id: 'transfer' as PaymentMethod,
      name: '실시간 계좌이체',
      icon: '🏦',
      description: '은행 계좌에서 바로 이체'
    },
    {
      id: 'virtualAccount' as PaymentMethod,
      name: '가상계좌',
      icon: '📮',
      description: '무통장 입금 (입금 기한 3일)'
    },
    {
      id: 'phone' as PaymentMethod,
      name: '휴대폰',
      icon: '📱',
      description: '휴대폰 요금과 함께 결제'
    },
    {
      id: 'easyPay' as PaymentMethod,
      name: '간편결제',
      icon: '⚡',
      description: '토스, 카카오페이, 네이버페이'
    }
  ];

  // 간편결제 프로바이더
  const easyPayProviders = [
    {
      id: 'toss' as PaymentProvider,
      name: '토스',
      logo: '/images/payment/toss.png',
      color: '#0064FF'
    },
    {
      id: 'kakaopay' as PaymentProvider,
      name: '카카오페이',
      logo: '/images/payment/kakaopay.png',
      color: '#FEE500'
    },
    {
      id: 'naverpay' as PaymentProvider,
      name: '네이버페이',
      logo: '/images/payment/naverpay.png',
      color: '#03C75A'
    },
    {
      id: 'payco' as PaymentProvider,
      name: '페이코',
      logo: '/images/payment/payco.png',
      color: '#E4002B'
    },
    {
      id: 'samsungpay' as PaymentProvider,
      name: '삼성페이',
      logo: '/images/payment/samsungpay.png',
      color: '#1428A0'
    }
  ];

  // 카드사 목록
  const cardCompanies: Array<{ id: CardCompany; name: string; logo?: string }> = [
    { id: 'samsung', name: '삼성카드' },
    { id: 'shinhan', name: '신한카드' },
    { id: 'kb', name: 'KB국민카드' },
    { id: 'hyundai', name: '현대카드' },
    { id: 'lotte', name: '롯데카드' },
    { id: 'bc', name: 'BC카드' },
    { id: 'nh', name: 'NH농협카드' },
    { id: 'hana', name: '하나카드' },
    { id: 'woori', name: '우리카드' },
    { id: 'citi', name: '씨티카드' },
    { id: 'kakaobank', name: '카카오뱅크' },
    { id: 'kbank', name: '케이뱅크' }
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    onMethodSelect(method);
    if (method !== 'easyPay') {
      onProviderSelect(null);
    }
  };

  return (
    <div className="payment-method-selector">
      <h3>결제 수단</h3>
      
      {/* 결제 수단 선택 */}
      <div className="payment-methods">
        {paymentMethods
          .filter(method => allowedMethods.includes(method.id))
          .map(method => (
            <button
              key={method.id}
              className={`payment-method-button ${selectedMethod === method.id ? 'selected' : ''}`}
              onClick={() => handleMethodSelect(method.id)}
            >
              <span className="method-icon">{method.icon}</span>
              <div className="method-info">
                <span className="method-name">{method.name}</span>
                <span className="method-description">{method.description}</span>
              </div>
            </button>
          ))}
      </div>

      {/* 간편결제 선택 시 프로바이더 선택 */}
      {selectedMethod === 'easyPay' && (
        <div className="easy-pay-providers">
          <h4>간편결제 서비스 선택</h4>
          <div className="provider-grid">
            {easyPayProviders.map(provider => (
              <button
                key={provider.id}
                className={`provider-button ${selectedProvider === provider.id ? 'selected' : ''}`}
                onClick={() => onProviderSelect(provider.id)}
                style={{ borderColor: selectedProvider === provider.id ? provider.color : 'transparent' }}
              >
                <div className="provider-logo" style={{ backgroundColor: provider.color }}>
                  {provider.name[0]}
                </div>
                <span className="provider-name">{provider.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 카드 결제 선택 시 카드사 목록 (참고용) */}
      {selectedMethod === 'card' && (
        <div className="card-companies">
          <p className="card-info">
            <span className="info-icon">ℹ️</span>
            모든 국내 신용/체크카드로 결제 가능합니다
          </p>
          <details className="card-list-details">
            <summary>지원 카드사 보기</summary>
            <div className="card-list">
              {cardCompanies.map(card => (
                <span key={card.id} className="card-item">
                  {card.name}
                </span>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* 계좌이체 선택 시 안내 */}
      {selectedMethod === 'transfer' && (
        <div className="transfer-info">
          <p className="info-message">
            <span className="info-icon">🔒</span>
            공인인증서 또는 금융인증서가 필요합니다
          </p>
        </div>
      )}

      {/* 가상계좌 선택 시 안내 */}
      {selectedMethod === 'virtualAccount' && (
        <div className="virtual-account-info">
          <p className="info-message">
            <span className="info-icon">⏰</span>
            입금 기한은 발급일로부터 3일입니다
          </p>
          <p className="sub-info">
            가상계좌 번호는 결제 완료 후 문자로 발송됩니다
          </p>
        </div>
      )}

      {/* 휴대폰 결제 선택 시 안내 */}
      {selectedMethod === 'phone' && (
        <div className="phone-info">
          <p className="info-message">
            <span className="info-icon">📞</span>
            본인 명의 휴대폰만 결제 가능합니다
          </p>
          <p className="sub-info">
            월 한도: 소액결제 30만원
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;