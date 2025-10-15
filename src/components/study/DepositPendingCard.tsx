import React from 'react';
import { parseDate } from '../../utils/studyScheduleUtils';
import type { DepositPendingApplication } from '../../api/types/applicationTypes';
import styles from './DepositPendingCard.module.css';

interface DepositPendingCardProps {
  application: DepositPendingApplication;
}

/**
 * 입금 확인 대기 카드 (PAYMENT_PENDING 상태)
 * 사용자가 "입금 완료했어요" 버튼을 누른 후, 관리자 확인 대기 중인 상태
 */
const DepositPendingCard: React.FC<DepositPendingCardProps> = ({
  application
}) => {
  return (
    <div className={styles.card}>
      {/* 상태 배지 */}
      <div className={styles.statusBadge}>입금 확인 대기</div>

      {/* 스터디 정보 */}
      <h4 className={styles.title}>{application.studyTitle}</h4>

      {/* 안내 메시지 */}
      <div className={styles.infoSection}>
        <p className={styles.infoMessage}>
          ✅ 입금 알림이 전달되었습니다
        </p>
        <p className={styles.detailInfo}>
          관리자가 입금을 확인하면 참여가 확정됩니다.
        </p>
      </div>

      {/* 결제 정보 */}
      <div className={styles.paymentInfo}>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>참가비</span>
          <span className={styles.priceAmount}>
            {application.paidAmount ? `${application.paidAmount.toLocaleString()}원` : '무료'}
          </span>
        </div>

        {application.appliedAt && (
          <div className={styles.dateRow}>
            <span className={styles.dateLabel}>신청일</span>
            <span className={styles.dateValue}>
              {parseDate(application.appliedAt)?.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>

      {/* 안내 텍스트 */}
      <div className={styles.noticeBox}>
        <p className={styles.noticeText}>
          💡 입금 확인은 보통 1-2일 정도 소요됩니다
        </p>
        <p className={styles.noticeText}>
          📞 문의사항이 있으시면 <a
            href="https://pf.kakao.com/_zxkxmUn/chat"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactLink}
          >
            카카오톡
          </a>으로 연락해주세요
        </p>
      </div>

      {/* 호스트 메시지 (있는 경우) */}
      {application.reviewNote && (
        <div className={styles.reviewNote}>
          <p className={styles.reviewNoteLabel}>호스트 메시지:</p>
          <p className={styles.reviewNoteText}>{application.reviewNote}</p>
        </div>
      )}
    </div>
  );
};

export default DepositPendingCard;
