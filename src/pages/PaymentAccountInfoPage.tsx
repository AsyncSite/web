import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PaymentAccountInfoPage.module.css';
import studyService from '../api/studyService';

interface OrderInfo {
  intentId: string;
  studyName: string;
  studyId: string;
  applicationId: string;
  amount: number;
  userName: string;
}

const PaymentAccountInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [depositorName, setDepositorName] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);

  useEffect(() => {
    // URL 파라미터에서 intentId 가져오기
    const intentId = searchParams.get('intentId');

    if (!intentId) {
      // intentId 없으면 메인으로 이동
      navigate('/');
      return;
    }

    // sessionStorage에서 주문 정보 가져오기
    const sessionData = sessionStorage.getItem('currentPaymentSession');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);

      // 임시로 표시할 정보 설정
      setOrderInfo({
        intentId: intentId,
        studyName: parsedData.studyName || '스터디',
        studyId: parsedData.studyId || '',
        applicationId: parsedData.applicationId || '',
        amount: parsedData.amount || 0,
        userName: parsedData.userName || ''
      });

      setDepositorName(parsedData.userName || '');
    } else {
      // 세션 정보 없으면 메인으로
      navigate('/');
    }
  }, [searchParams, navigate]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const handleComplete = async () => {
    if (!orderInfo || isNotifying) return;

    // studyId와 applicationId 검증
    if (!orderInfo.studyId || !orderInfo.applicationId) {
      setNotifyError('결제 정보를 찾을 수 없습니다. 다시 시도해주세요.');
      return;
    }

    setIsNotifying(true);
    setNotifyError(null);

    try {
      // 백엔드에 입금 알림 전송
      console.log('Notifying deposit:', {
        studyId: orderInfo.studyId,
        applicationId: orderInfo.applicationId
      });

      const response = await studyService.notifyDeposit(
        orderInfo.studyId,
        orderInfo.applicationId
      );

      console.log('Notify deposit response:', response);

      if (response.success) {
        // 성공 시 pending 페이지로 이동
        navigate(`/payment/pending?intentId=${orderInfo.intentId}`);
      } else {
        setNotifyError(response.message || '입금 알림 처리에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Failed to notify deposit:', error);
      const errorMessage = error.response?.data?.error || error.message || '입금 알림 전송에 실패했습니다.';
      setNotifyError(errorMessage);
    } finally {
      setIsNotifying(false);
    }
  };

  if (!orderInfo) {
    return (
      <div className={styles['payment-account-info-loading']}>
        로딩 중...
      </div>
    );
  }

  return (
    <main className={styles['payment-account-info-main']}>
      <div className={styles['payment-account-info-container']}>
        {/* 헤더 */}
        <div className={styles['payment-account-info-header']}>
          <h1 className={styles['payment-account-info-title']}>
            🏦 계좌이체 안내
          </h1>
          <p className={styles['payment-account-info-subtitle']}>
            아래 계좌로 입금 후, 관리자가 확인하면 참여가 확정됩니다
          </p>
        </div>

        {/* 주문 정보 */}
        <div className={styles['payment-account-info-order-info']}>
          <h3 className={styles['payment-account-info-section-title']}>
            주문 정보
          </h3>
          <div className={styles['payment-account-info-info-row']}>
            <span className={styles['payment-account-info-label']}>주문번호</span>
            <span className={styles['payment-account-info-value']}>
              {orderInfo.intentId.substring(0, 20)}...
            </span>
          </div>
          <div className={styles['payment-account-info-info-row']}>
            <span className={styles['payment-account-info-label']}>스터디</span>
            <span className={styles['payment-account-info-value']}>
              {orderInfo.studyName}
            </span>
          </div>
          <div className={styles['payment-account-info-info-row']}>
            <span className={styles['payment-account-info-label']}>결제금액</span>
            <span className={styles['payment-account-info-value']}>
              {orderInfo.amount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 입금 계좌 정보 */}
        <div className={styles['payment-account-info-account-info']}>
          <h3 className={styles['payment-account-info-section-title']}>
            입금 계좌 정보
          </h3>

          <div className={styles['payment-account-info-bank-card']}>
            <div className={styles['payment-account-info-bank-logo']}>
              국민은행
            </div>

            <div className={styles['payment-account-info-account-number']}>
              <span className={styles['payment-account-info-number']}>
                893837-00-005595
              </span>
              <button
                className={styles['payment-account-info-copy-btn']}
                onClick={() => copyToClipboard('89383700005595', 'account')}
              >
                {copySuccess === 'account' ? '✓ 복사됨' : '복사'}
              </button>
            </div>

            <div className={styles['payment-account-info-account-holder']}>
              <span className={styles['payment-account-info-label']}>예금주</span>
              <span className={styles['payment-account-info-holder-name']}>
                최보임 (어싱크사이트)
              </span>
            </div>

            <div className={styles['payment-account-info-deposit-name']}>
              <span className={styles['payment-account-info-label']}>입금자명</span>
              <div className={styles['payment-account-info-deposit-name-box']}>
                <input
                  type="text"
                  className={styles['payment-account-info-deposit-name-input']}
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                  placeholder="입금자명을 입력하세요"
                />
                <button
                  className={styles['payment-account-info-copy-btn']}
                  onClick={() => copyToClipboard(depositorName, 'name')}
                >
                  {copySuccess === 'name' ? '✓ 복사됨' : '복사'}
                </button>
              </div>
              <p className={styles['payment-account-info-deposit-name-hint']}>
                ⚠️ 실제 입금하실 분의 이름으로 수정 가능합니다
              </p>
            </div>
          </div>

          <div className={styles['payment-account-info-notice']}>
            <p className={styles['payment-account-info-notice-item']}>
              ⚠️ 반드시 위의 <strong>입금자명</strong>과 동일하게 입금해주세요
            </p>
            <p className={styles['payment-account-info-notice-item']}>
              📌 입금 확인 후 1-2일 내에 관리자가 확인합니다
            </p>
            <p className={styles['payment-account-info-notice-item']}>
              💡 입금 후 아래 버튼을 눌러 입금 완료를 알려주세요
            </p>
          </div>
        </div>

        {/* 에러 메시지 */}
        {notifyError && (
          <div className={styles['payment-account-info-error']}>
            ⚠️ {notifyError}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className={styles['payment-account-info-actions']}>
          <button
            className={styles['payment-account-info-complete-btn']}
            onClick={handleComplete}
            disabled={isNotifying}
          >
            {isNotifying ? '처리 중...' : '입금 완료했어요 →'}
          </button>

          <button
            className={styles['payment-account-info-later-btn']}
            onClick={() => navigate('/users/me')}
            disabled={isNotifying}
          >
            나중에 입금할게요
          </button>
        </div>

        {/* 문의 안내 */}
        <div className={styles['payment-account-info-contact']}>
          <p className={styles['payment-account-info-contact-text']}>
            입금 관련 문의사항이 있으신가요?
          </p>
          <a
            href="https://pf.kakao.com/_zxkxmUn/chat"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['payment-account-info-contact-link']}
          >
            카카오톡 문의하기 →
          </a>
        </div>
      </div>
    </main>
  );
};

export default PaymentAccountInfoPage;
