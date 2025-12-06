/**
 * Application Types
 * Backend ApplicationStatus enum과 1:1 매핑되는 타입 시스템
 */

// Backend enum과 정확히 매핑
export const ApplicationStatus = {
  // 신청 단계
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED', // 결제 대기 (새 플로우: 신청 → 결제 → 승인)
  PENDING: 'PENDING',           // 승인 대기 (호스트 검토 대기)
  ACCEPTED: 'ACCEPTED',         // 승인됨 → 결제 필요 (레거시 플로우)
  PAYMENT_PENDING: 'PAYMENT_PENDING',  // 입금 대기 (입금 알림 완료, 관리자 확인 대기)
  REJECTED: 'REJECTED',         // 거절됨

  // 완료 단계
  CONFIRMED: 'CONFIRMED',       // 결제 완료 + Member 생성 완료

  // 취소/환불 단계
  CANCELLED: 'CANCELLED',       // 신청 취소
  REFUNDED: 'REFUNDED'          // 환불 완료
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

/**
 * 카테고리별 상태 매핑
 * Backend의 getAllMyStudyRelations() 응답 구조와 일치
 */
export const APPLICATION_CATEGORIES = {
  // 신청 대기 중 (회색 배지)
  pending: [ApplicationStatus.PENDING],

  // 결제 필요 (빨강 배지 + 긴급 CTA)
  // PAYMENT_REQUIRED: 새 플로우 (신청 → 결제 → 승인)
  // ACCEPTED: 레거시 플로우 (신청 → 승인 → 결제)
  awaitingPayment: [ApplicationStatus.PAYMENT_REQUIRED, ApplicationStatus.ACCEPTED],

  // 입금 확인 대기 (파랑 배지 + 정보성)
  depositPending: [ApplicationStatus.PAYMENT_PENDING],

  // 결제 완료 (초록 배지)
  confirmed: [ApplicationStatus.CONFIRMED],

  // 비활성 (회색, 읽기 전용)
  inactive: [
    ApplicationStatus.REJECTED,
    ApplicationStatus.CANCELLED,
    ApplicationStatus.REFUNDED
  ]
} as const;

/**
 * 카테고리 타입
 */
export type ApplicationCategory = keyof typeof APPLICATION_CATEGORIES;

/**
 * 사용자에게 표시될 상태 라벨
 */
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PAYMENT_REQUIRED]: '결제 대기',
  [ApplicationStatus.PENDING]: '승인 대기중',
  [ApplicationStatus.ACCEPTED]: '결제 필요',
  [ApplicationStatus.PAYMENT_PENDING]: '입금 확인 대기',
  [ApplicationStatus.REJECTED]: '거절됨',
  [ApplicationStatus.CONFIRMED]: '참여 확정',
  [ApplicationStatus.CANCELLED]: '취소됨',
  [ApplicationStatus.REFUNDED]: '환불 완료'
};

/**
 * 상태별 배지 색상 클래스
 */
export const STATUS_BADGE_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PAYMENT_REQUIRED]: 'orange', // 새 플로우 - 결제 대기
  [ApplicationStatus.PENDING]: 'gray',
  [ApplicationStatus.ACCEPTED]: 'red',        // 긴급 - 사용자 액션 필요!
  [ApplicationStatus.PAYMENT_PENDING]: 'blue', // 정보성 - 관리자 확인 대기
  [ApplicationStatus.REJECTED]: 'gray',
  [ApplicationStatus.CONFIRMED]: 'green',
  [ApplicationStatus.CANCELLED]: 'gray',
  [ApplicationStatus.REFUNDED]: 'gray'
};

/**
 * 유틸리티 함수: 상태에서 카테고리 추출
 */
export const getApplicationCategory = (status: ApplicationStatus): ApplicationCategory | null => {
  for (const [category, statuses] of Object.entries(APPLICATION_CATEGORIES)) {
    if ((statuses as readonly ApplicationStatus[]).includes(status)) {
      return category as ApplicationCategory;
    }
  }
  return null;
};

/**
 * 유틸리티 함수: 사용자 액션이 필요한 상태인지 확인
 */
export const isActionRequired = (status: ApplicationStatus): boolean => {
  return status === ApplicationStatus.PAYMENT_REQUIRED || status === ApplicationStatus.ACCEPTED;
};

/**
 * 유틸리티 함수: 완료된 상태인지 확인
 */
export const isCompleted = (status: ApplicationStatus): boolean => {
  return status === ApplicationStatus.CONFIRMED;
};

/**
 * 유틸리티 함수: 비활성 상태인지 확인
 */
export const isInactive = (status: ApplicationStatus): boolean => {
  return ([
    ApplicationStatus.REJECTED,
    ApplicationStatus.CANCELLED,
    ApplicationStatus.REFUNDED
  ] as ApplicationStatus[]).includes(status);
};

/**
 * 상태별 우선순위 (정렬용)
 * 낮을수록 높은 우선순위
 */
export const STATUS_PRIORITY: Record<ApplicationStatus, number> = {
  [ApplicationStatus.PAYMENT_REQUIRED]: 1, // 최우선 - 결제 대기
  [ApplicationStatus.ACCEPTED]: 1,         // 최우선 - 사용자 액션 필요!
  [ApplicationStatus.PAYMENT_PENDING]: 2,  // 입금 확인 대기
  [ApplicationStatus.PENDING]: 3,          // 신청 대기 중
  [ApplicationStatus.CONFIRMED]: 4,        // 완료
  [ApplicationStatus.CANCELLED]: 5,        // 비활성
  [ApplicationStatus.REJECTED]: 5,
  [ApplicationStatus.REFUNDED]: 5
};

/**
 * Application 기본 인터페이스
 */
export interface ApplicationBase {
  applicationId: string;
  studyId: string;
  studyTitle: string;
  studySlug?: string;
  status: ApplicationStatus;
  relationship: string;
  relationshipStatus: string;
  category: string;
  appliedAt: string | number[];
  reviewNote?: string;
}

/**
 * 결제 필요 Application (PAYMENT_REQUIRED 또는 ACCEPTED)
 * - PAYMENT_REQUIRED: 새 플로우 (신청 → 결제 → 리더 승인)
 * - ACCEPTED: 레거시 플로우 (신청 → 리더 승인 → 결제)
 */
export interface PaymentRequiredApplication extends ApplicationBase {
  status: typeof ApplicationStatus.PAYMENT_REQUIRED | typeof ApplicationStatus.ACCEPTED;
  paidAmount: number;
  costType?: string;
  paymentDeadline?: string | number[];
}

/**
 * 입금 확인 대기 Application (PAYMENT_PENDING)
 */
export interface DepositPendingApplication extends ApplicationBase {
  status: typeof ApplicationStatus.PAYMENT_PENDING;
  paidAmount: number;
  costType?: string;
  checkoutId?: string;
}

/**
 * Grouped Study Relations 응답 타입
 * Backend의 getAllMyStudyRelations() 응답 구조
 */
export interface GroupedStudyRelations {
  proposed: any[];
  pending: ApplicationBase[];
  awaitingPayment: PaymentRequiredApplication[];
  depositPending: DepositPendingApplication[];
  confirmed: ApplicationBase[];
  leading: any[];
  participating: any[];
  completed: any[];
  inactive: ApplicationBase[];
}
