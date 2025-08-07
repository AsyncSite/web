import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './TabPage.css';

const PaymentFailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<{
    code: string;
    message: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    // URL 파라미터에서 에러 정보 추출
    const code = searchParams.get('code');
    const message = searchParams.get('message');
    const orderId = searchParams.get('orderId');

    if (code && message) {
      setErrorInfo({ 
        code, 
        message: decodeURIComponent(message),
        orderId: orderId || ''
      });
    }
  }, [searchParams]);

  const getErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
      'PAY_PROCESS_CANCELED': '사용자가 결제를 취소했습니다.',
      'PAY_PROCESS_ABORTED': '결제가 중단되었습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 결제를 거절했습니다.',
      'INSUFFICIENT_BALANCE': '잔액이 부족합니다.',
      'EXCEED_MAX_AMOUNT': '결제 한도를 초과했습니다.',
      'INVALID_CARD_NUMBER': '유효하지 않은 카드번호입니다.',
      'EXPIRED_CARD': '만료된 카드입니다.',
      'DEFAULT': '결제 처리 중 오류가 발생했습니다.'
    };

    return errorMessages[code] || errorMessages['DEFAULT'];
  };

  return (
    <div className="page-container">
      <main className="page-content">
        <div style={{
          maxWidth: '600px',
          margin: '80px auto',
          padding: '40px',
          background: 'rgba(239, 83, 80, 0.05)',
          border: '1px solid rgba(239, 83, 80, 0.2)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>❌</div>
          <h1 style={{ color: '#ef5350', marginBottom: '16px' }}>결제에 실패했습니다</h1>
          
          {errorInfo && (
            <div style={{
              margin: '32px 0',
              padding: '24px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'rgba(255, 255, 255, 0.7)' }}>에러 코드:</strong>
                <span style={{ 
                  marginLeft: '8px', 
                  color: '#ef5350',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  {errorInfo.code}
                </span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'rgba(255, 255, 255, 0.7)' }}>에러 메시지:</strong>
                <span style={{ marginLeft: '8px', color: '#ffffff' }}>
                  {getErrorMessage(errorInfo.code)}
                </span>
              </div>
              {errorInfo.orderId && (
                <div>
                  <strong style={{ color: 'rgba(255, 255, 255, 0.7)' }}>주문번호:</strong>
                  <span style={{ marginLeft: '8px', color: '#ffffff' }}>
                    {errorInfo.orderId}
                  </span>
                </div>
              )}
            </div>
          )}

          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '32px' }}>
            결제를 다시 시도하거나 다른 결제 수단을 이용해주세요.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(-1)}
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
              다시 시도하기
            </button>
            <button
              onClick={() => navigate('/study')}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              스터디 목록으로
            </button>
          </div>

          <div style={{
            marginTop: '40px',
            padding: '16px',
            background: 'rgba(130, 170, 255, 0.05)',
            border: '1px solid rgba(130, 170, 255, 0.1)',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
              💡 결제 관련 문의사항이 있으시면 고객센터로 연락주세요.
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
              support@asyncsite.com | 1588-0000
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentFailPage;