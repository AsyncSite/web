import React from 'react';
import { PaymentRequest } from '../../types/payment';
import './PaymentSummary.css';

interface PaymentSummaryProps {
  request: PaymentRequest;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ request }) => {
  const hasDiscount = request.amount.discount > 0;
  const discountRate = hasDiscount 
    ? Math.round((request.amount.discount / request.amount.original) * 100)
    : 0;

  return (
    <div className="payment-summary">
      <h3>주문 내역</h3>
      
      {/* 주문 정보 */}
      <div className="order-info">
        <div className="order-header">
          <span className="order-name">{request.orderName}</span>
        </div>
        
        {/* 상품 목록 */}
        {request.items.length > 0 && (
          <div className="order-items">
            {request.items.map((item, index) => (
              <div key={item.id || index} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  {item.description && (
                    <span className="item-description">{item.description}</span>
                  )}
                </div>
                <div className="item-price">
                  {item.quantity > 1 && (
                    <span className="item-quantity">{item.quantity}개 × </span>
                  )}
                  <span className="item-amount">
                    {item.price.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 금액 정보 */}
      <div className="price-breakdown">
        <div className="price-row">
          <span className="price-label">상품 금액</span>
          <span className="price-value">
            {request.amount.original.toLocaleString()}원
          </span>
        </div>
        
        {hasDiscount && (
          <>
            <div className="price-row discount">
              <span className="price-label">
                할인 금액
                {discountRate > 0 && (
                  <span className="discount-rate">({discountRate}%)</span>
                )}
              </span>
              <span className="price-value discount-amount">
                -{request.amount.discount.toLocaleString()}원
              </span>
            </div>
            
            {request.metadata?.promotionCode && (
              <div className="promotion-info">
                <span className="promotion-icon">🎫</span>
                <span className="promotion-code">
                  프로모션 코드: {request.metadata.promotionCode}
                </span>
              </div>
            )}
          </>
        )}
        
        <div className="price-row total">
          <span className="price-label">최종 결제 금액</span>
          <span className="price-value total-amount">
            {request.amount.final.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 고객 정보 */}
      <div className="customer-info">
        <h4>주문자 정보</h4>
        <div className="customer-details">
          <div className="customer-row">
            <span className="customer-label">이름</span>
            <span className="customer-value">{request.customer.name}</span>
          </div>
          <div className="customer-row">
            <span className="customer-label">이메일</span>
            <span className="customer-value">{request.customer.email}</span>
          </div>
          {request.customer.phone && (
            <div className="customer-row">
              <span className="customer-label">연락처</span>
              <span className="customer-value">{request.customer.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* 추가 정보 */}
      {request.metadata?.message && (
        <div className="additional-info">
          <h4>추가 정보</h4>
          <p className="message">{request.metadata.message}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentSummary;