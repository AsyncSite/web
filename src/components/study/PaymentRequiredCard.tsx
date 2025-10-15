import React from 'react';
import toast from 'react-hot-toast';
import studyService from '../../api/studyService';
import { parseDate } from '../../utils/studyScheduleUtils';
import type { PaymentRequiredApplication } from '../../api/types/applicationTypes';
import styles from './PaymentRequiredCard.module.css';

interface PaymentRequiredCardProps {
  application: PaymentRequiredApplication;
  onPaymentCreated?: () => void;
}

/**
 * 결제 필요 카드 (ACCEPTED 상태)
 * 사용자가 즉시 액션을 취해야 하는 가장 중요한 카드
 */
const PaymentRequiredCard: React.FC<PaymentRequiredCardProps> = ({
  application,
  onPaymentCreated
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePayment = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      toast.loading('결제 생성 중...', { id: 'payment-loading' });

      const idempotencyKey = `${application.applicationId}-${Date.now()}`;
      const response = await studyService.createPayment(application.studyId, application.applicationId, { idempotencyKey });

      toast.dismiss('payment-loading');

      // SDK 모드인 경우 PortOne SDK 호출
      if (response.invocationType === 'SDK' && response.portOneSdkPayload) {
        toast.loading('결제창을 여는 중...', { id: 'portone-loading' });

        const portOneModule = await import('@portone/browser-sdk/v2');
        const PortOne = portOneModule.default;

        const sdkResponse = await PortOne.requestPayment({
          storeId: response.portOneSdkPayload.storeId,
          channelKey: response.portOneSdkPayload.channelKey,
          paymentId: response.portOneSdkPayload.paymentId,
          orderName: response.portOneSdkPayload.orderName,
          totalAmount: response.portOneSdkPayload.totalAmount,
          currency: response.portOneSdkPayload.currency as any,
          payMethod: response.portOneSdkPayload.payMethod as any,
          customer: {
            fullName: response.portOneSdkPayload.customer.fullName,
            email: response.portOneSdkPayload.customer.email,
            phoneNumber: response.portOneSdkPayload.customer.phoneNumber
          },
          redirectUrl: response.portOneSdkPayload.redirectUrl,
          noticeUrls: response.portOneSdkPayload.noticeUrls,
          customData: response.portOneSdkPayload.customData
        });

        toast.dismiss('portone-loading');

        console.log('SDK Response:', sdkResponse);

        // SDK 응답 처리
        if (sdkResponse && sdkResponse.code) {
          // 결제 실패 or 취소
          throw new Error(`결제 실패: ${sdkResponse.message || '알 수 없는 오류'}`);
        } else {
          // 결제 성공 - 페이지 새로고침하여 상태 업데이트
          toast.success('결제가 완료되었습니다! 페이지를 새로고침합니다.', { duration: 2000 });
          setTimeout(() => window.location.reload(), 2000);
        }

        if (onPaymentCreated) {
          onPaymentCreated();
        }
      }
      // URL 모드인 경우 리다이렉트
      else if (response.checkoutUrl) {
        toast.success('결제 페이지로 이동합니다', { duration: 2000 });
        window.location.href = response.checkoutUrl;

        if (onPaymentCreated) {
          onPaymentCreated();
        }
      }
      // 예외 상황
      else {
        throw new Error('Invalid payment response: missing SDK payload or checkout URL');
      }
    } catch (error: any) {
      setIsProcessing(false);
      toast.dismiss('payment-loading');
      toast.dismiss('portone-loading');

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error?.message ||
                          error.message ||
                          '결제 생성에 실패했습니다';

      toast.error(errorMessage, { duration: 5000 });
      console.error('Payment creation failed:', error);
    }
  };

  // 결제 마감일 계산
  const deadline = application.paymentDeadline ? parseDate(application.paymentDeadline) : null;
  const now = new Date();
  const isDeadlineClose = deadline && (deadline.getTime() - now.getTime()) < 24 * 60 * 60 * 1000; // 24시간 이내

  return (
    <div className={`${styles.card} ${isDeadlineClose ? styles.urgent : ''}`}>
      {/* 긴급 배지 */}
      {isDeadlineClose && (
        <div className={styles.urgentBadge}>
          <span className={styles.urgentIcon}>⚠️</span>
          <span>마감 임박</span>
        </div>
      )}

      {/* 상태 배지 */}
      <div className={styles.statusBadge}>승인됨</div>

      {/* 스터디 정보 */}
      <h4 className={styles.title}>{application.studyTitle}</h4>

      {/* 축하 메시지 */}
      <div className={styles.congratsSection}>
        <p className={styles.congratsMessage}>
          🎉 축하합니다! 참가 신청이 승인되었습니다.
        </p>
        <p className={styles.paymentInfo}>
          결제를 완료하면 스터디 참여가 확정됩니다.
        </p>
      </div>

      {/* 결제 정보 */}
      <div className={styles.paymentSection}>
        <div className={styles.priceInfo}>
          <span className={styles.priceLabel}>참가비</span>
          <span className={styles.priceAmount}>
            {application.paidAmount ? `${application.paidAmount.toLocaleString()}원` : '무료'}
          </span>
        </div>

        {deadline && (
          <div className={`${styles.deadlineInfo} ${isDeadlineClose ? styles.deadlineUrgent : ''}`}>
            <span className={styles.deadlineLabel}>결제 마감</span>
            <span className={styles.deadlineDate}>
              {deadline.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </div>

      {/* CTA 버튼 */}
      <button
        className={styles.paymentButton}
        onClick={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? '처리 중...' : '결제하고 참여 확정하기'}
      </button>

      {/* 추가 정보 */}
      {application.reviewNote && (
        <div className={styles.reviewNote}>
          <p className={styles.reviewNoteLabel}>호스트 메시지:</p>
          <p className={styles.reviewNoteText}>{application.reviewNote}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentRequiredCard;
