/**
 * 스터디 상태 관련 유틸리티 함수들
 * 
 * 백엔드 상태값을 그대로 유지하면서
 * 사용자에게 표시할 때만 적절히 변환
 */

import { StudyStatus } from '../api/studyService';
import { parseDate } from './studyScheduleUtils';

// 사용자에게 표시할 상태 정보
export interface StudyDisplayInfo {
  label: string;           // 표시할 텍스트
  color: string;           // 상태 색상
  canApply: boolean;       // 지원 가능 여부
  isActive: boolean;       // 현재 활동 중인지
  showReviewButton: boolean; // 리뷰 버튼 표시 여부
}

/**
 * 백엔드 스터디 상태를 사용자 친화적인 표시 정보로 변환
 */
export function getStudyDisplayInfo(
  status: StudyStatus,
  recruitDeadline?: string | number[] | null,
  startDate?: string | number[] | null,
  endDate?: string | number[] | null,
  capacity?: number,
  enrolled?: number,
  isRecruiting?: boolean | null
): StudyDisplayInfo {
  const now = new Date();
  
  const deadlineDate = parseDate(recruitDeadline);
  const startDateParsed = parseDate(startDate);
  const endDateParsed = parseDate(endDate);

  switch (status) {
    case 'PENDING':
      return {
        label: '승인 대기',
        color: 'gray',
        canApply: false,
        isActive: false,
        showReviewButton: false
      };

    case 'APPROVED':
      // 백엔드에서 isRecruiting 값을 제공하면 그 값을 사용 (우선순위)
      let isRecruitingApproved = false;
      if (isRecruiting !== undefined && isRecruiting !== null) {
        // 백엔드 값 사용 (가장 정확함)
        isRecruitingApproved = isRecruiting;
      } else {
        // 백엔드 값이 없으면 프론트엔드에서 계산 (fallback)
        if (!deadlineDate) {
          isRecruitingApproved = true; // 마감일 없으면 계속 모집
        } else {
          // 마감일을 그 날의 끝 시간(23:59:59)으로 설정
          const deadlineEndOfDay = new Date(deadlineDate);
          deadlineEndOfDay.setHours(23, 59, 59, 999);
          isRecruitingApproved = deadlineEndOfDay >= now;
        }
      }
      const isFull = capacity && enrolled && enrolled >= capacity;

      if (isFull) {
        return {
          label: '정원 마감',
          color: 'orange',
          canApply: false,
          isActive: false,
          showReviewButton: false
        };
      }

      if (isRecruitingApproved) {
        return {
          label: '모집 중',
          color: 'green',
          canApply: true,
          isActive: false,
          showReviewButton: false
        };
      }

      return {
        label: '모집 마감',
        color: 'orange',
        canApply: false,
        isActive: false,
        showReviewButton: false
      };

    case 'IN_PROGRESS':
      // 백엔드에서 isRecruiting 값을 제공하면 그 값을 사용 (우선순위)
      let canApplyInProgress = false;
      if (isRecruiting !== undefined && isRecruiting !== null) {
        // 백엔드 값 사용 (가장 정확함)
        canApplyInProgress = isRecruiting;
      } else {
        // 백엔드 값이 없으면 프론트엔드에서 계산 (fallback)
        // 마감일이 없거나 아직 지나지 않았으면
        if (!deadlineDate || deadlineDate >= now) {
          // 정원이 없거나 정원이 남아있으면 신청 가능
          if (!(capacity && enrolled && enrolled >= capacity)) {
            canApplyInProgress = true;
          }
        }
      }

      return {
        label: canApplyInProgress ? '진행 중 (모집 중)' : '진행 중',
        color: 'blue',
        canApply: canApplyInProgress,
        isActive: true,
        showReviewButton: false
      };

    case 'COMPLETED':
      return {
        label: '완료',
        color: 'gray',
        canApply: false,
        isActive: false,
        showReviewButton: true
      };

    case 'TERMINATED':
      return {
        label: '중단됨',
        color: 'red',
        canApply: false,
        isActive: false,
        showReviewButton: false
      };

    case 'REJECTED':
      return {
        label: '반려됨',
        color: 'red',
        canApply: false,
        isActive: false,
        showReviewButton: false
      };

    default:
      return {
        label: '알 수 없음',
        color: 'gray',
        canApply: false,
        isActive: false,
        showReviewButton: false
      };
  }
}

/**
 * 프로필 페이지용 카테고리 결정
 */
export function getStudyCategory(
  status: StudyStatus,
  role?: string
): 'active' | 'pending' | 'completed' | 'leading' | null {
  // 리더인 경우
  if (role === 'OWNER') {
    return 'leading';
  }
  
  // 상태별 카테고리
  switch (status) {
    case 'IN_PROGRESS':
      return 'active';
    case 'COMPLETED':
    case 'TERMINATED':
      return 'completed';
    case 'APPROVED':
      return 'pending'; // 모집 중인 스터디는 pending 카테고리
    default:
      return null;
  }
}

/**
 * 스터디 카드 배지 스타일
 */
export function getStatusBadgeStyle(status: StudyStatus): {
  className: string;
  icon?: string;
} {
  const displayInfo = getStudyDisplayInfo(status);
  
  const colorMap: Record<string, string> = {
    green: 'status-recruiting',
    blue: 'status-in-progress',
    gray: 'status-completed',
    orange: 'status-closed',
    red: 'status-terminated'
  };
  
  const iconMap: Record<string, string> = {
    green: '🟢',
    blue: '🔵',
    gray: '⚫',
    orange: '🟠',
    red: '🔴'
  };
  
  return {
    className: colorMap[displayInfo.color] || 'status-default',
    icon: iconMap[displayInfo.color]
  };
}

/**
 * 리뷰 작성 가능 여부 체크
 */
export function canWriteReview(
  status: StudyStatus,
  isMember: boolean
): boolean {
  return (status === 'IN_PROGRESS' || status === 'COMPLETED') && isMember;
}

/**
 * 멤버 전용 섹션 표시 여부
 */
export function shouldShowMemberSection(
  status: StudyStatus,
  isMember: boolean
): boolean {
  return (status === 'IN_PROGRESS' || status === 'APPROVED') && isMember;
}