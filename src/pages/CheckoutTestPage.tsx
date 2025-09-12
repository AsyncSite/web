import React, { useState } from 'react';
import { CheckoutButton } from '../components/UnifiedCheckout';
import { 
  createStudyCheckoutRequest,
  createDocumentoCheckoutRequest,
  CheckoutResponse,
  CheckoutError
} from '../types/checkout';
import styles from './CheckoutTestPage.module.css';

const CheckoutTestPage: React.FC = () => {
  const [lastResult, setLastResult] = useState<{
    type: 'success' | 'error';
    data: CheckoutResponse | CheckoutError;
  } | null>(null);

  // Study domain test data
  const studyCheckoutData = createStudyCheckoutRequest({
    studyId: 'test-study-001',
    studyName: 'Advanced React Patterns',
    price: 150000,
    discountRate: 10,
    customerName: '홍길동',
    customerEmail: 'hong@example.com',
    customerPhone: '010-1234-5678',
    cohortId: 'cohort-2024-q1',
    cohortName: '2024년 1기',
    startDate: '2024-02-01',
    endDate: '2024-04-30'
  });

  // Documento domain test data
  const documentoCheckoutData = createDocumentoCheckoutRequest({
    planId: 'pro-monthly',
    planName: 'Documento Pro 월간',
    price: 29900,
    customerName: '김철수',
    customerEmail: 'kim@example.com',
    customerPhone: '010-9876-5432',
    billingCycle: 'monthly',
    features: ['무제한 분석', 'AI 추천', '우선 지원']
  });

  // Job Navigator test data (manual creation)
  const jobNavigatorCheckoutData = {
    domain: 'job-navigator' as const,
    domainId: 'job-nav-premium',
    itemType: 'service' as const,
    orderName: 'Job Navigator Premium',
    orderId: `job-${Date.now()}`,
    amount: {
      original: 99000,
      discount: 0,
      final: 99000
    },
    customer: {
      name: '이영희',
      email: 'lee@example.com',
      phone: '010-5555-5555'
    },
    domainData: {
      serviceId: 'job-nav-premium',
      serviceName: 'Job Navigator Premium',
      serviceType: 'premium' as const,
      duration: 90,
      features: ['1:1 멘토링', '이력서 리뷰', '모의 면접']
    },
    metadata: {
      source: 'test-page',
      campaign: 'launch-promo'
    }
  };

  const handleCheckoutComplete = (response: CheckoutResponse) => {
    console.log('Checkout completed:', response);
    setLastResult({ type: 'success', data: response });
  };

  const handleCheckoutError = (error: CheckoutError) => {
    console.error('Checkout error:', error);
    setLastResult({ type: 'error', data: error });
  };

  return (
    <div className={styles['checkout-test-page']}>
      <div className={styles['checkout-test-container']}>
        <header className={styles['checkout-test-header']}>
          <h1>통합 결제 시스템 테스트</h1>
          <p>네이버페이/카카오페이 통합 결제 컴포넌트 테스트 페이지</p>
        </header>

        <div className={styles['checkout-test-sections']}>
          {/* Study Domain Test */}
          <section className={styles['checkout-test-section']}>
            <div className={styles['checkout-test-section-header']}>
              <span className={styles['checkout-test-badge']}>Study</span>
              <h2>스터디 결제 테스트</h2>
            </div>
            <div className={styles['checkout-test-info']}>
              <p><strong>스터디명:</strong> {studyCheckoutData.orderName}</p>
              <p><strong>기간:</strong> {(studyCheckoutData.domainData as any).startDate} ~ {(studyCheckoutData.domainData as any).endDate}</p>
              <p><strong>코호트:</strong> {(studyCheckoutData.domainData as any).cohortName}</p>
              <p><strong>가격:</strong> {studyCheckoutData.amount.original.toLocaleString()}원</p>
              {studyCheckoutData.amount.discount > 0 && (
                <p><strong>할인:</strong> -{studyCheckoutData.amount.discount.toLocaleString()}원</p>
              )}
              <p><strong>최종 결제금액:</strong> {studyCheckoutData.amount.final.toLocaleString()}원</p>
            </div>
            <div className={styles['checkout-test-buttons']}>
              <CheckoutButton
                variant="primary"
                size="large"
                checkoutData={studyCheckoutData}
                onCheckoutComplete={handleCheckoutComplete}
                onCheckoutError={handleCheckoutError}
                showPrice={true}
              />
              <CheckoutButton
                variant="secondary"
                size="medium"
                checkoutData={studyCheckoutData}
                onCheckoutComplete={handleCheckoutComplete}
                onCheckoutError={handleCheckoutError}
                label="스터디 신청하기"
              />
            </div>
          </section>

          {/* Documento Domain Test */}
          <section className={styles['checkout-test-section']}>
            <div className={styles['checkout-test-section-header']}>
              <span className={styles['checkout-test-badge']}>Documento</span>
              <h2>Documento 구독 테스트</h2>
            </div>
            <div className={styles['checkout-test-info']}>
              <p><strong>플랜:</strong> {documentoCheckoutData.orderName}</p>
              <p><strong>결제 주기:</strong> {(documentoCheckoutData.domainData as any).billingCycle === 'monthly' ? '월간' : '연간'}</p>
              <p><strong>포함 기능:</strong></p>
              <ul>
                {((documentoCheckoutData.domainData as any).features || []).map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <p><strong>가격:</strong> {documentoCheckoutData.amount.final.toLocaleString()}원/월</p>
            </div>
            <div className={styles['checkout-test-buttons']}>
              <CheckoutButton
                variant="primary"
                size="large"
                fullWidth
                checkoutData={documentoCheckoutData}
                onCheckoutComplete={handleCheckoutComplete}
                onCheckoutError={handleCheckoutError}
                showPrice={true}
              />
            </div>
          </section>

          {/* Job Navigator Domain Test */}
          <section className={styles['checkout-test-section']}>
            <div className={styles['checkout-test-section-header']}>
              <span className={styles['checkout-test-badge']}>Job Navigator</span>
              <h2>Job Navigator 서비스 테스트</h2>
            </div>
            <div className={styles['checkout-test-info']}>
              <p><strong>서비스:</strong> {jobNavigatorCheckoutData.orderName}</p>
              <p><strong>기간:</strong> 3개월</p>
              <p><strong>포함 서비스:</strong></p>
              <ul>
                {jobNavigatorCheckoutData.domainData.features.map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <p><strong>가격:</strong> {jobNavigatorCheckoutData.amount.final.toLocaleString()}원</p>
            </div>
            <div className={styles['checkout-test-buttons']}>
              <CheckoutButton
                variant="outline"
                size="large"
                checkoutData={jobNavigatorCheckoutData}
                onCheckoutComplete={handleCheckoutComplete}
                onCheckoutError={handleCheckoutError}
                label="Premium 시작하기"
                icon={<span>🚀</span>}
              />
            </div>
          </section>

          {/* Button Variants Test */}
          <section className={styles['checkout-test-section']}>
            <div className={styles['checkout-test-section-header']}>
              <span className={styles['checkout-test-badge']}>UI Test</span>
              <h2>버튼 스타일 테스트</h2>
            </div>
            <div className={styles['checkout-test-grid']}>
              <div className={styles['checkout-test-grid-item']}>
                <h3>Primary</h3>
                <CheckoutButton
                  variant="primary"
                  size="small"
                  checkoutData={studyCheckoutData}
                  label="Small"
                />
                <CheckoutButton
                  variant="primary"
                  size="medium"
                  checkoutData={studyCheckoutData}
                  label="Medium"
                />
                <CheckoutButton
                  variant="primary"
                  size="large"
                  checkoutData={studyCheckoutData}
                  label="Large"
                />
              </div>
              <div className={styles['checkout-test-grid-item']}>
                <h3>Secondary</h3>
                <CheckoutButton
                  variant="secondary"
                  size="small"
                  checkoutData={studyCheckoutData}
                  label="Small"
                />
                <CheckoutButton
                  variant="secondary"
                  size="medium"
                  checkoutData={studyCheckoutData}
                  label="Medium"
                />
                <CheckoutButton
                  variant="secondary"
                  size="large"
                  checkoutData={studyCheckoutData}
                  label="Large"
                />
              </div>
              <div className={styles['checkout-test-grid-item']}>
                <h3>Outline</h3>
                <CheckoutButton
                  variant="outline"
                  size="small"
                  checkoutData={studyCheckoutData}
                  label="Small"
                />
                <CheckoutButton
                  variant="outline"
                  size="medium"
                  checkoutData={studyCheckoutData}
                  label="Medium"
                />
                <CheckoutButton
                  variant="outline"
                  size="large"
                  checkoutData={studyCheckoutData}
                  label="Large"
                />
              </div>
              <div className={styles['checkout-test-grid-item']}>
                <h3>States</h3>
                <CheckoutButton
                  variant="primary"
                  size="medium"
                  checkoutData={studyCheckoutData}
                  label="Normal"
                />
                <CheckoutButton
                  variant="primary"
                  size="medium"
                  checkoutData={studyCheckoutData}
                  label="Loading"
                  loading={true}
                />
                <CheckoutButton
                  variant="primary"
                  size="medium"
                  checkoutData={studyCheckoutData}
                  label="Disabled"
                  disabled={true}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Result Display */}
        {lastResult && (
          <div className={styles[`checkout-test-result-${lastResult.type}`]}>
            <h3>{lastResult.type === 'success' ? '✅ 결제 성공' : '❌ 결제 실패'}</h3>
            <pre>{JSON.stringify(lastResult.data, null, 2)}</pre>
            <button
              className={styles['checkout-test-close-button']}
              onClick={() => setLastResult(null)}
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutTestPage;