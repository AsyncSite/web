import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PaymentPendingPage.module.css';

const PaymentPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [intentId, setIntentId] = useState<string>('');

  useEffect(() => {
    const id = searchParams.get('intentId');
    if (!id) {
      navigate('/');
      return;
    }
    setIntentId(id);
  }, [searchParams, navigate]);

  if (!intentId) {
    return (
      <div className={styles['payment-pending-loading']}>
        로딩 중...
      </div>
    );
  }

  return (
    <main className={styles['payment-pending-main']}>
      <div className={styles['payment-pending-container']}>
        {/* 성공 아이콘 */}
        <div className={styles['payment-pending-icon']}>
          ⏳
        </div>

        {/* 메인 메시지 */}
        <h1 className={styles['payment-pending-title']}>
          입금 확인 대기 중
        </h1>

        <p className={styles['payment-pending-subtitle']}>
          입금 완료 알림을 받았습니다
        </p>

        {/* 안내 박스 */}
        <div className={styles['payment-pending-info-box']}>
          <div className={styles['payment-pending-info-item']}>
            <span className={styles['payment-pending-info-icon']}>💳</span>
            <div className={styles['payment-pending-info-text']}>
              <strong>입금 확인 중</strong>
              <p>관리자가 입금 내역을 확인하고 있습니다</p>
            </div>
          </div>

          <div className={styles['payment-pending-info-item']}>
            <span className={styles['payment-pending-info-icon']}>⏱️</span>
            <div className={styles['payment-pending-info-text']}>
              <strong>소요 시간</strong>
              <p>영업일 기준 1-2일 이내 확인 완료</p>
            </div>
          </div>

          <div className={styles['payment-pending-info-item']}>
            <span className={styles['payment-pending-info-icon']}>✅</span>
            <div className={styles['payment-pending-info-text']}>
              <strong>확인 완료 시</strong>
              <p>이메일 및 알림으로 안내드립니다</p>
            </div>
          </div>
        </div>

        {/* 주문 번호 */}
        <div className={styles['payment-pending-order-info']}>
          <span className={styles['payment-pending-order-label']}>주문번호</span>
          <span className={styles['payment-pending-order-value']}>
            {intentId.substring(0, 30)}...
          </span>
        </div>

        {/* 액션 버튼 */}
        <div className={styles['payment-pending-actions']}>
          <button
            className={styles['payment-pending-primary-btn']}
            onClick={() => navigate('/users/me')}
          >
            마이페이지로 이동
          </button>

          <button
            className={styles['payment-pending-secondary-btn']}
            onClick={() => navigate('/')}
          >
            홈으로 이동
          </button>
        </div>

        {/* 문의 안내 */}
        <div className={styles['payment-pending-contact']}>
          <p className={styles['payment-pending-contact-text']}>
            입금 확인이 지연되거나 문의사항이 있으신가요?
          </p>
          <a
            href="https://pf.kakao.com/_zxkxmUn/chat"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['payment-pending-contact-link']}
          >
            카카오톡 문의하기 →
          </a>
        </div>

        {/* 추가 안내 */}
        <div className={styles['payment-pending-notice']}>
          <p className={styles['payment-pending-notice-item']}>
            📌 입금 확인 후 자동으로 스터디 참여가 확정됩니다
          </p>
          <p className={styles['payment-pending-notice-item']}>
            📧 확인 완료 시 등록하신 이메일로 안내드립니다
          </p>
          <p className={styles['payment-pending-notice-item']}>
            💡 마이페이지에서 신청 현황을 확인하실 수 있습니다
          </p>
        </div>
      </div>
    </main>
  );
};

export default PaymentPendingPage;
