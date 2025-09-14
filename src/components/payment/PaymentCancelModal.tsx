import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
import styles from './PaymentCancelModal.module.css';

interface PaymentCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyInfo: {
    studyId: string;
    studyTitle: string;
    role?: string;
    joinedAt?: string;
  } | null;
}

const PaymentCancelModal: React.FC<PaymentCancelModalProps> = ({
  isOpen,
  onClose,
  studyInfo
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('취소 사유를 입력해주세요.', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: 실제 결제 취소 API 호출
      console.log('Payment cancel requested:', {
        studyId: studyInfo?.studyId,
        reason: cancelReason
      });

      // 임시 메시지
      toast.error('결제 취소 기능은 준비 중입니다.', {
        duration: 4000,
        position: 'top-center',
      });

      setTimeout(() => {
        setIsProcessing(false);
        setCancelReason('');
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Payment cancel failed:', error);
      toast.error('결제 취소 중 오류가 발생했습니다.', {
        duration: 3000,
        position: 'top-center',
      });
      setIsProcessing(false);
    }
  };

  if (!isOpen || !studyInfo) return null;

  return ReactDOM.createPortal(
    <div
      className={styles['modal-overlay']}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div className={styles['modal-container']}>
        {/* 헤더 */}
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>결제 취소 확인</h2>
          {!isProcessing && (
            <button
              className={styles['modal-close']}
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          )}
        </div>

        {/* 본문 */}
        <div className={styles['modal-body']}>
          {isProcessing ? (
            <div className={styles['processing']}>
              <div className={styles['spinner']}>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className={styles['processing-text']}>
                결제 취소를 처리 중입니다...
              </p>
            </div>
          ) : (
            <>
              {/* 스터디 정보 */}
              <div className={styles['study-info']}>
                <h3 className={styles['study-title']}>{studyInfo.studyTitle}</h3>
                <p className={styles['warning-text']}>
                  정말로 이 스터디의 결제를 취소하시겠습니까?
                </p>
              </div>

              {/* 안내 사항 */}
              <div className={styles['notice-box']}>
                <h4 className={styles['notice-title']}>⚠️ 취소 전 확인사항</h4>
                <ul className={styles['notice-list']}>
                  <li>환불 처리까지 영업일 기준 3-5일이 소요됩니다.</li>
                  <li>스터디 시작 후에는 환불 규정에 따라 부분 환불될 수 있습니다.</li>
                  <li>취소 후 재신청 시 승인이 보장되지 않습니다.</li>
                </ul>
              </div>

              {/* 취소 사유 입력 */}
              <div className={styles['reason-section']}>
                <label className={styles['reason-label']}>
                  취소 사유 <span className={styles['required']}>*</span>
                </label>
                <textarea
                  className={styles['reason-input']}
                  placeholder="취소 사유를 입력해주세요. (최소 10자)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  minLength={10}
                  maxLength={500}
                  rows={4}
                />
                <div className={styles['char-count']}>
                  {cancelReason.length} / 500
                </div>
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        {!isProcessing && (
          <div className={styles['modal-footer']}>
            <button
              className={styles['cancel-button']}
              onClick={onClose}
            >
              돌아가기
            </button>
            <button
              className={styles['confirm-button']}
              onClick={handleCancel}
              disabled={!cancelReason.trim() || cancelReason.length < 10}
            >
              결제 취소하기
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default PaymentCancelModal;