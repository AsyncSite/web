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
 * 결제 필요 카드
 * - PAYMENT_REQUIRED: 새 플로우 (신청 → 결제 → 리더 승인)
 * - ACCEPTED: 레거시 플로우 (신청 → 리더 승인 → 결제)
 */
const PaymentRequiredCard: React.FC<PaymentRequiredCardProps> = ({
  application,
  onPaymentCreated
}) => {
  // 새 플로우(PAYMENT_REQUIRED) vs 레거시 플로우(ACCEPTED) 구분
  const isNewFlow = application.status === 'PAYMENT_REQUIRED';
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePayment = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      toast.loading('결제 생성 중...', { id: 'payment-loading' });

      const idempotencyKey = `${application.applicationId}-${Date.now()}`;
      const response = await studyService.createPayment(application.studyId, application.applicationId, { idempotencyKey });

      toast.dismiss('payment-loading');

      // 계좌이체인 경우 계좌 정보 페이지로 이동
      // SDK payload의 payMethod가 ACCOUNT_TRANSFER이거나, checkoutUrl에 ACCOUNT_TRANSFER가 포함된 경우
      if (response.portOneSdkPayload?.payMethod === 'ACCOUNT_TRANSFER' ||
          response.checkoutUrl?.includes('ACCOUNT_TRANSFER')) {
        // 사용자 이름 가져오기 (localStorage에서)
        const userStr = localStorage.getItem('user');
        const userName = userStr ? JSON.parse(userStr).name || '' : '';

        // 세션 스토리지에 주문 정보 저장 (입금 알림 API 호출용 studyId, applicationId 포함)
        const paymentSessionData = {
          intentId: response.checkoutId,
          studyId: application.studyId,
          applicationId: application.applicationId,
          studyName: application.studyTitle,
          amount: application.paidAmount,
          userName: userName
        };
        sessionStorage.setItem('currentPaymentSession', JSON.stringify(paymentSessionData));

        toast.success('계좌이체 정보 페이지로 이동합니다', { duration: 2000 });
        window.location.href = `/payment/account-info?intentId=${response.checkoutId}`;

        if (onPaymentCreated) {
          onPaymentCreated();
        }
      }
      // SDK 모드인 경우 PortOne SDK 호출
      else if (response.invocationType === 'SDK' && response.portOneSdkPayload) {
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
      <div className={styles.statusBadge}>
        {isNewFlow ? '결제 대기' : '승인됨'}
      </div>

      {/* 스터디 정보 */}
      <h4 className={styles.title}>{application.studyTitle}</h4>

      {/* 안내 메시지 - 플로우에 따라 다름 */}
      <div className={styles.congratsSection}>
        {isNewFlow ? (
          <>
            <p className={styles.congratsMessage}>
              💳 결제를 완료해주세요
            </p>
            <p className={styles.paymentInfo}>
              결제 완료 후 스터디 리더가 신청을 검토합니다.
            </p>
          </>
        ) : (
          <>
            <p className={styles.congratsMessage}>
              🎉 축하합니다! 참가 신청이 승인되었습니다.
            </p>
            <p className={styles.paymentInfo}>
              결제를 완료하면 스터디 참여가 확정됩니다.
            </p>
          </>
        )}
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
        {isProcessing ? '처리 중...' : isNewFlow ? '결제하고 신청 완료하기' : '결제하고 참여 확정하기'}
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
