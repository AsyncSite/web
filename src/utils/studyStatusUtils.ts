/**
 * 스터디 상태 관련 유틸리티 함수들
 * 
 * 백엔드 상태값을 그대로 유지하면서
 * 사용자에게 표시할 때만 적절히 변환
 */

import { StudyStatus } from '../api/studyService';

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
  enrolled?: number
): StudyDisplayInfo {
  const now = new Date();
  
  // 날짜 파싱 헬퍼
  const parseDate = (date: string | number[] | null | undefined): Date | null => {
    if (!date) return null;
    if (Array.isArray(date)) {
      // [year, month, day, hour?, minute?, second?] 형식
      return new Date(date[0], date[1] - 1, date[2], date[3] || 0, date[4] || 0, date[5] || 0);
    }
    return new Date(date);
  };

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
      // APPROVED 상태일 때는 모집 마감일과 정원을 체크
      const isRecruiting = deadlineDate && deadlineDate > now;
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
      
      if (isRecruiting) {
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
      return {
        label: '진행 중',
        color: 'blue',
        canApply: false,
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