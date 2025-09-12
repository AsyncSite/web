import React from 'react';
import { 
  CheckoutRequest, 
  isStudyCheckoutData, 
  isDocumentoCheckoutData,
  isJobNavigatorCheckoutData 
} from '../../types/checkout';
import styles from './CheckoutSummary.module.css';

interface CheckoutSummaryProps {
  checkoutData: Omit<CheckoutRequest, 'paymentMethod'>;
  className?: string;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  checkoutData,
  className = ''
}) => {
  const { domain, domainData, amount, orderName } = checkoutData;
  
  // 도메인별 상세 정보 렌더링
  const renderDomainSpecificInfo = () => {
    if (domain === 'study' && isStudyCheckoutData(domainData)) {
      return (
        <div className={styles['unified-checkout-summary-domain-info']}>
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>스터디명</span>
            <span className={styles['unified-checkout-summary-info-value']}>{domainData.studyName}</span>
          </div>
          {domainData.cohort && (
            <div className={styles['unified-checkout-summary-info-row']}>
              <span className={styles['unified-checkout-summary-info-label']}>기수</span>
              <span className={styles['unified-checkout-summary-info-value']}>{domainData.cohort}</span>
            </div>
          )}
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>기간</span>
            <span className={styles['unified-checkout-summary-info-value']}>
              {new Date(domainData.startDate).toLocaleDateString('ko-KR')} ~ {new Date(domainData.endDate).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>참가 유형</span>
            <span className={styles['unified-checkout-summary-info-value']}>
              {domainData.participationType === 'regular' ? '정규 참가' : 
               domainData.participationType === 'audit' ? '청강' : '멘토'}
            </span>
          </div>
        </div>
      );
    }
    
    if (domain === 'documento' && isDocumentoCheckoutData(domainData)) {
      return (
        <div className={styles['unified-checkout-summary-domain-info']}>
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>플랜</span>
            <span className={styles['unified-checkout-summary-info-value']}>
              {domainData.planName}
            </span>
          </div>
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>결제 주기</span>
            <span className={styles['unified-checkout-summary-info-value']}>
              {domainData.billingCycle === 'monthly' ? '월간' : '연간'}
            </span>
          </div>
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>자동 갱신</span>
            <span className={styles['unified-checkout-summary-info-value']}>
              {domainData.autoRenewal ? '자동 갱신' : '수동 갱신'}
            </span>
          </div>
          {domainData.trialDays && domainData.trialDays > 0 && (
            <div className={styles['unified-checkout-summary-info-row']}>
              <span className={styles['unified-checkout-summary-info-label']}>무료 체험</span>
              <span className={styles['unified-checkout-summary-info-value']}>
                {domainData.trialDays}일
              </span>
            </div>
          )}
        </div>
      );
    }
    
    if (domain === 'job-navigator' && isJobNavigatorCheckoutData(domainData)) {
      return (
        <div className={styles['unified-checkout-summary-domain-info']}>
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>서비스</span>
            <span className={styles['unified-checkout-summary-info-value']}>
              {domainData.serviceName}
            </span>
          </div>
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>유형</span>
            <span className={styles['unified-checkout-summary-info-value']}>
              {domainData.serviceType === 'basic' ? '베이직' : 
               domainData.serviceType === 'premium' ? '프리미엄' : '엔터프라이즈'}
            </span>
          </div>
          <div className={styles['unified-checkout-summary-info-row']}>
            <span className={styles['unified-checkout-summary-info-label']}>이용 기간</span>
            <span className={styles['unified-checkout-summary-info-value']}>
              {domainData.duration}일
            </span>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // 도메인별 아이콘
  const getDomainIcon = () => {
    switch (domain) {
      case 'study': return '📚';
      case 'documento': return '📄';
      case 'job-navigator': return '💼';
      default: return '🛒';
    }
  };
  
  return (
    <div className={`${styles['unified-checkout-summary-container']} ${className}`}>
      {/* 헤더 */}
      <div className={styles['unified-checkout-summary-header']}>
        <span className={styles['unified-checkout-summary-icon']}>
          {getDomainIcon()}
        </span>
        <h3 className={styles['unified-checkout-summary-title']}>
          주문 내역
        </h3>
      </div>
      
      {/* 주문명 */}
      <div className={styles['unified-checkout-summary-order-name']}>
        {orderName}
      </div>
      
      {/* 도메인별 상세 정보 */}
      {renderDomainSpecificInfo()}
      
      {/* 가격 정보 */}
      <div className={styles['unified-checkout-summary-price-section']}>
        {amount.discount > 0 && (
          <>
            <div className={styles['unified-checkout-summary-price-row']}>
              <span className={styles['unified-checkout-summary-price-label']}>상품 금액</span>
              <span className={styles['unified-checkout-summary-price-value']}>
                {amount.original.toLocaleString('ko-KR')}원
              </span>
            </div>
            <div className={styles['unified-checkout-summary-price-row']}>
              <span className={styles['unified-checkout-summary-price-label']}>할인 금액</span>
              <span className={styles['unified-checkout-summary-price-discount']}>
                -{amount.discount.toLocaleString('ko-KR')}원
              </span>
            </div>
          </>
        )}
        
        <div className={styles['unified-checkout-summary-price-total']}>
          <span className={styles['unified-checkout-summary-price-total-label']}>
            최종 결제 금액
          </span>
          <span className={styles['unified-checkout-summary-price-total-value']}>
            {amount.final.toLocaleString('ko-KR')}원
          </span>
        </div>
        
        {amount.vatIncluded && (
          <span className={styles['unified-checkout-summary-vat-notice']}>
            (VAT 포함)
          </span>
        )}
      </div>
    </div>
  );
};

export default CheckoutSummary;