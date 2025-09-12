import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckoutRequest } from '../types/checkout';
import styles from './MockPaymentPage.module.css';

const MockPaymentPage: React.FC = () => {
  const { method } = useParams<{ method: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'success' | 'fail' | null>(null);
  
  const checkoutId = searchParams.get('checkoutId');
  
  // localStorage에서 checkout 데이터 읽기
  useEffect(() => {
    if (checkoutId) {
      const storedData = localStorage.getItem(`checkout_${checkoutId}`);
      if (storedData) {
        setCheckoutData(JSON.parse(storedData));
      }
    }
  }, [checkoutId]);
  
  // 결제 성공 처리
  const handleSuccess = () => {
    setIsProcessing(true);
    setSelectedAction('success');
    
    // Mock 결제 결과 저장
    const paymentResult = {
      checkoutId,
      orderId: checkoutData?.orderId,
      paymentKey: `mock_${method}_${Date.now()}`,
      status: 'completed',
      amount: checkoutData?.amount,
      paidAt: new Date().toISOString()
    };
    
    localStorage.setItem('lastPaymentResult', JSON.stringify(paymentResult));
    
    // 2초 후 성공 페이지로 이동
    setTimeout(() => {
      navigate(`/payment/success?paymentKey=${paymentResult.paymentKey}&orderId=${checkoutData?.orderId}&amount=${checkoutData?.amount.final}`);
    }, 2000);
  };
  
  // 결제 실패 처리
  const handleFail = () => {
    setIsProcessing(true);
    setSelectedAction('fail');
    
    // 2초 후 실패 페이지로 이동
    setTimeout(() => {
      navigate(`/payment/fail?code=USER_CANCEL&message=${encodeURIComponent('사용자가 결제를 취소했습니다')}&orderId=${checkoutData?.orderId}`);
    }, 2000);
  };
  
  // 결제창 닫기 (취소)
  const handleCancel = () => {
    navigate(-1);
  };
  
  if (!checkoutData) {
    return (
      <div className={styles['mock-payment-page']}>
        <div className={styles['mock-payment-error']}>
          <h1>결제 정보를 찾을 수 없습니다</h1>
          <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
        </div>
      </div>
    );
  }
  
  const isKakaoPay = method === 'kakaopay';
  const isNaverPay = method === 'naverpay';
  
  return (
    <div className={styles['mock-payment-page']}>
      <div className={styles['mock-payment-container']}>
        {/* 헤더 */}
        <div 
          className={styles['mock-payment-header']}
          style={{ 
            background: isKakaoPay ? '#FEE500' : '#03C75A' 
          }}
        >
          <h1 className={styles['mock-payment-title']}>
            {isKakaoPay ? '카카오페이' : '네이버페이'} Mock 결제
          </h1>
          <span className={styles['mock-payment-badge']}>개발 모드</span>
        </div>
        
        {/* 결제 정보 */}
        <div className={styles['mock-payment-info']}>
          <h2>결제 정보</h2>
          
          <div className={styles['mock-payment-detail']}>
            <span className={styles['mock-payment-label']}>상품명</span>
            <span className={styles['mock-payment-value']}>{checkoutData.orderName}</span>
          </div>
          
          <div className={styles['mock-payment-detail']}>
            <span className={styles['mock-payment-label']}>주문번호</span>
            <span className={styles['mock-payment-value']}>{checkoutData.orderId}</span>
          </div>
          
          <div className={styles['mock-payment-detail']}>
            <span className={styles['mock-payment-label']}>결제금액</span>
            <span className={styles['mock-payment-value']}>
              {checkoutData.amount.final.toLocaleString('ko-KR')}원
            </span>
          </div>
          
          <div className={styles['mock-payment-detail']}>
            <span className={styles['mock-payment-label']}>구매자</span>
            <span className={styles['mock-payment-value']}>
              {checkoutData.customer.name} ({checkoutData.customer.email})
            </span>
          </div>
        </div>
        
        {/* 테스트 안내 */}
        <div className={styles['mock-payment-notice']}>
          <p>🧪 이것은 개발 환경 테스트 페이지입니다.</p>
          <p>실제 결제는 이루어지지 않습니다.</p>
          <p>아래 버튼을 선택하여 결제 시나리오를 테스트하세요.</p>
        </div>
        
        {/* 액션 버튼 */}
        {isProcessing ? (
          <div className={styles['mock-payment-processing']}>
            <div className={styles['mock-payment-spinner']}>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p>
              {selectedAction === 'success' ? '결제 처리 중...' : '취소 처리 중...'}
            </p>
          </div>
        ) : (
          <div className={styles['mock-payment-actions']}>
            <button
              className={styles['mock-payment-button-success']}
              onClick={handleSuccess}
              style={{
                background: isKakaoPay ? '#FEE500' : '#03C75A',
                color: isKakaoPay ? '#000000' : '#ffffff'
              }}
            >
              결제 성공 시뮬레이션
            </button>
            
            <button
              className={styles['mock-payment-button-fail']}
              onClick={handleFail}
            >
              결제 실패 시뮬레이션
            </button>
            
            <button
              className={styles['mock-payment-button-cancel']}
              onClick={handleCancel}
            >
              결제창 닫기
            </button>
          </div>
        )}
        
        {/* 개발자 정보 */}
        <div className={styles['mock-payment-debug']}>
          <details>
            <summary>🔍 디버그 정보</summary>
            <pre>{JSON.stringify(checkoutData, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentPage;