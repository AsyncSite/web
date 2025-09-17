import React, { useEffect, useRef } from 'react';
import { parseDate } from '../../utils/studyScheduleUtils';
import { convertSectionTypeToLabel } from '../../api/studyDetailPageService';
import styles from './PreviewModal.module.css';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: {
    title: string;
    type: string;
    recurrenceType: string;
    tagline: string;
    generation: number;
    selectedDate: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    duration: number;
    durationUnit: 'WEEKS' | 'MONTHS';
    capacity: number;
    recruitDeadline: string;
    recruitDeadlineTime: string;
    startDate: string;
    endDate: string;
    costType: string;
    costDescription: string;
  };
  sectionData?: {
    [key: string]: any;
  };
  isSubmitting: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  sectionData = {},
  isSubmitting
}) => {
  // 스크롤 위치 저장을 위한 ref
  const scrollPositionRef = useRef(0);
  
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // 현재 스크롤 위치 저장
      scrollPositionRef.current = window.scrollY;
      document.addEventListener('keydown', handleEscape);
      // 배경 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      // 저장된 스크롤 위치로 복원
      if (!isOpen && scrollPositionRef.current > 0) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 요일 이름 변환
  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
  const selectedDays = formData.daysOfWeek
    .sort()
    .map(day => dayNames[day])
    .join(', ');

  // 스터디 유형 표시
  const getStudyTypeLabel = (type: string) => {
    switch (type) {
      case 'PARTICIPATORY': return '참여형';
      case 'CHALLENGE': return '챌린지형';
      case 'LECTURE': return '강의형';
      default: return type;
    }
  };

  // 진행 방식 표시
  const getRecurrenceLabel = (type: string) => {
    switch (type) {
      case 'ONE_TIME': return '1회성';
      case 'WEEKLY': return '매주 진행';
      case 'DAILY': return '매일 진행';
      default: return type;
    }
  };

  // 기간 표시
  const getDurationDisplay = () => {
    if (formData.recurrenceType === 'ONE_TIME') {
      return formData.selectedDate || '-';
    }
    const value = formData.duration;
    const unit = formData.durationUnit === 'WEEKS' ? '주' : '개월';
    return `${value}${unit}`;
  };

  // 날짜 포맷팅
  const formatDate = (dateValue: string | number[] | undefined) => {
    if (!dateValue) return '-';
    try {
      // string인 경우 T00:00:00 추가가 필요할 수 있음
      const dateString = typeof dateValue === 'string' && !dateValue.includes('T') 
        ? dateValue + 'T00:00:00' 
        : dateValue;
      
      const date = parseDate(dateString);
      if (!date) return '-';
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // 모집 마감일시 포맷팅
  const formatRecruitDeadline = () => {
    if (!formData.recruitDeadline) return '설정 안 함';
    const dateStr = formatDate(formData.recruitDeadline);
    if (formData.recruitDeadlineTime) {
      return `${dateStr} ${formData.recruitDeadlineTime}`;
    }
    return dateStr;
  };

  // 가격 정보 표시
  const getCostTypeLabel = (costType: string) => {
    switch (costType) {
      case 'FREE': return '완전 무료';
      case 'FREE_WITH_VENUE': return '무료 (대관비 별도)';
      case 'PAID': return '유료';
      default: return costType;
    }
  };

  // 섹션 타입 라벨 표시 (아이콘 추가)
  const getSectionTypeLabel = (sectionType: string) => {
    const baseLabel = convertSectionTypeToLabel(sectionType) || sectionType;
    
    // 아이콘 매핑
    const iconMap: Record<string, string> = {
      'HERO': '🎯',
      'LEADER_INTRO': '👤',
      'HOW_WE_ROLL': '📋',
      'RICH_TEXT': '📝',
      'FAQ': '❓',
      'REVIEWS': '💬',
      'MEMBERS': '👥',
      'JOURNEY': '🗺️',
      'EXPERIENCE': '🎓'
    };
    
    const icon = iconMap[sectionType] || '📄';
    return `${icon} ${baseLabel}`;
  };

  // 섹션 데이터 요약 표시
  const getSectionSummary = (sectionType: string, data: any) => {
    if (!data || Object.keys(data).length === 0) {
      return '(비어 있음)';
    }

    switch (sectionType) {
      case 'HERO':
        return data.title ? `제목: ${data.title}` : '배너 설정됨';
      case 'LEADER_INTRO':
        const parts = [];
        if (data.name) parts.push(`이름: ${data.name}`);
        if (data.role) parts.push(`역할: ${data.role}`);
        return parts.length > 0 ? parts.join(', ') : '리더 정보 설정됨';
      case 'HOW_WE_ROLL':
        const items = [];
        if (data.meetingOverview?.length > 0) items.push(`미팅 개요 ${data.meetingOverview.length}개`);
        if (data.schedule?.length > 0) items.push(`일정 ${data.schedule.length}개`);
        return items.length > 0 ? items.join(', ') : '규칙 설정됨';
      default:
        return '내용 설정됨';
    }
  };

  // 섹션이 있는지 확인
  const hasSections = sectionData && Object.keys(sectionData).some(key => 
    sectionData[key] && Object.keys(sectionData[key]).length > 0
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>스터디 제안 검토</h2>
          <p className={styles.modalSubtitle}>
            제출 전 마지막으로 입력하신 정보를 확인해주세요
          </p>
        </div>

        {/* 본문 */}
        <div className={styles.modalBody}>
          {/* 기본 정보 섹션 */}
          <div className={styles.previewSection}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
              <span>기본 정보</span>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>스터디 이름</span>
                <span className={styles.previewValue}>{formData.title || '-'}</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>유형</span>
                <span className={styles.previewValue}>
                  {getStudyTypeLabel(formData.type)}
                </span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>기수</span>
                <span className={styles.previewValue}>{formData.generation}기</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>한 줄 소개</span>
                <span className={styles.previewValue}>
                  {formData.tagline || '(입력 안 함)'}
                </span>
              </div>
            </div>
          </div>

          {/* 일정 정보 섹션 */}
          <div className={styles.previewSection}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📅</span>
              <span>일정 정보</span>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>진행 방식</span>
                <span className={styles.previewValue}>
                  {getRecurrenceLabel(formData.recurrenceType)}
                </span>
              </div>
              
              {formData.recurrenceType === 'ONE_TIME' ? (
                <>
                  <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>날짜</span>
                    <span className={styles.previewValue}>
                      {formatDate(formData.selectedDate)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>요일</span>
                    <span className={styles.previewValue}>
                      {selectedDays || '(선택 안 함)'}
                    </span>
                  </div>
                  <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>기간</span>
                    <span className={styles.previewValue}>{getDurationDisplay()}</span>
                  </div>
                  <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>시작일</span>
                    <span className={styles.previewValue}>
                      {formatDate(formData.startDate)}
                    </span>
                  </div>
                  <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>종료일</span>
                    <span className={styles.previewValue}>
                      {formatDate(formData.endDate)}
                    </span>
                  </div>
                </>
              )}
              
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>시간</span>
                <span className={styles.previewValue}>
                  {formData.startTime && formData.endTime
                    ? `${formData.startTime} - ${formData.endTime}`
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 모집 정보 섹션 */}
          <div className={styles.previewSection}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>👥</span>
              <span>모집 정보</span>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>모집 인원</span>
                <span className={styles.previewValue}>{formData.capacity}명</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>모집 마감</span>
                <span className={styles.previewValue}>{formatRecruitDeadline()}</span>
              </div>
            </div>
          </div>

          {/* 섹션 정보 (있는 경우만 표시) */}
          {hasSections && (
            <div className={styles.previewSection}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📄</span>
                <span>상세 페이지 섹션</span>
              </div>
              <div className={styles.sectionContent}>
                {Object.entries(sectionData).map(([sectionType, data]) => {
                  // 비어있는 섹션은 제외
                  if (!data || Object.keys(data).length === 0) return null;
                  
                  return (
                    <div key={sectionType} className={styles.previewItem}>
                      <span className={styles.previewLabel}>
                        {getSectionTypeLabel(sectionType)}
                      </span>
                      <span className={styles.previewValue}>
                        {getSectionSummary(sectionType, data)}
                      </span>
                    </div>
                  );
                })}
                <div className={styles.sectionNote}>
                  💡 상세 페이지는 스터디 승인 후 자동으로 생성됩니다
                </div>
              </div>
            </div>
          )}

          {/* 가격 정보 섹션 */}
          <div className={styles.previewSection}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💰</span>
              <span>가격 정보</span>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>참가 비용</span>
                <span className={styles.previewValue}>
                  {getCostTypeLabel(formData.costType)}
                </span>
              </div>
              {formData.costDescription && (
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>비용 상세</span>
                  <span className={styles.previewValue}>
                    {formData.costDescription}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.modalFooter}>
          <div className={styles.editNote}>
            <span className={styles.warningIcon}>⚠️</span>
            <span>제출 후에는 관리자 승인을 기다려야 합니다</span>
          </div>
          <div className={styles.modalActions}>
            <button 
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              수정하기
            </button>
            <button 
              className={styles.btnPrimary}
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '제출 중...' : '최종 제출'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;