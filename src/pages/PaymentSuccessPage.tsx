import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './TabPage.css';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<{
    orderId: string;
    amount: string;
    paymentKey: string;
  } | null>(null);

  useEffect(() => {
    // URL 파라미터에서 결제 정보 추출
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const paymentKey = searchParams.get('paymentKey');

    if (orderId && amount && paymentKey) {
      setPaymentInfo({ orderId, amount, paymentKey });
      
      // 실제 프로덕션에서는 여기서 백엔드 API를 호출하여 결제 승인 처리
      // await confirmPayment({ orderId, amount, paymentKey });
    }
  }, [searchParams]);

  return (
    <div className="page-container">
      <main className="page-content">
        <div style={{
          maxWidth: '600px',
          margin: '80px auto',
          padding: '40px',
          background: 'rgba(195, 232, 141, 0.05)',
          border: '1px solid rgba(195, 232, 141, 0.2)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h1 style={{ color: '#c3e88d', marginBottom: '16px' }}>결제가 완료되었습니다!</h1>
          
          {paymentInfo && (
            <div style={{
              margin: '32px 0',
              padding: '24px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'rgba(255, 255, 255, 0.7)' }}>주문번호:</strong>
                <span style={{ marginLeft: '8px', color: '#ffffff' }}>{paymentInfo.orderId}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'rgba(255, 255, 255, 0.7)' }}>결제금액:</strong>
                <span style={{ marginLeft: '8px', color: '#ffffff' }}>
                  {parseInt(paymentInfo.amount).toLocaleString()}원
                </span>
              </div>
              <div>
                <strong style={{ color: 'rgba(255, 255, 255, 0.7)' }}>결제키:</strong>
                <span style={{ 
                  marginLeft: '8px', 
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}>
                  {paymentInfo.paymentKey}
                </span>
              </div>
            </div>
          )}

          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '32px' }}>
            결제 내역은 마이페이지에서 확인하실 수 있습니다.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/study')}
              style={{
                padding: '12px 24px',
                background: 'rgba(195, 232, 141, 0.1)',
                border: '1px solid rgba(195, 232, 141, 0.3)',
                borderRadius: '8px',
                color: '#c3e88d',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              스터디 목록으로
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #c3e88d, #8fd67a)',
                border: 'none',
                borderRadius: '8px',
                color: '#05060A',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              홈으로 이동
            </button>
          </div>

          <div style={{
            marginTop: '40px',
            padding: '16px',
            background: 'rgba(130, 170, 255, 0.05)',
            border: '1px solid rgba(130, 170, 255, 0.1)',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
              💡 테스트 모드에서는 실제 결제가 이루어지지 않습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;