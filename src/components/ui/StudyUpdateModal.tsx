import React, { useState, useEffect } from 'react';
import { Study, StudyUpdateRequest, StudyType, StudyStatus, RecurrenceType, CostType } from '../../api/studyService';
import ModernScheduleInput from '../study/ModernScheduleInput';
import TimePickerCustom from '../study/TimePickerCustom';
import DatePickerCustom from '../study/DatePickerCustom';
import { ScheduleData, DayOfWeek, ScheduleFrequency, formatScheduleToKorean } from '../../types/schedule';
import './StudyUpdateModal.css';

interface StudyUpdateModalProps {
  study: Study;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updateData: StudyUpdateRequest) => Promise<void>;
}

const StudyUpdateModal: React.FC<StudyUpdateModalProps> = ({
  study,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState<StudyUpdateRequest>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 일정 관련 state
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    frequency: 'WEEKLY' as ScheduleFrequency,
    daysOfWeek: [],
    startTime: '',
    endTime: ''
  });
  
  // 시간 관련 state 제거 - scheduleData에서 관리

  // 상태별 수정 가능 필드 체크
  const isFieldEditable = (fieldName: string): boolean => {
    const status = study.status;

    // COMPLETED, TERMINATED, REJECTED 상태에서는 모든 수정 불가
    if (status === StudyStatus.COMPLETED ||
        status === StudyStatus.TERMINATED ||
        status === StudyStatus.REJECTED) {
      return false;
    }

    // PENDING 상태에서만 수정 가능한 필드
    const pendingOnlyFields = ['title', 'type', 'startDate', 'endDate', 'recurrenceType'];
    if (pendingOnlyFields.includes(fieldName)) {
      return status === StudyStatus.PENDING;
    }

    // PENDING, APPROVED 상태에서 수정 가능한 필드
    const pendingApprovedFields = ['tagline', 'capacity'];
    if (pendingApprovedFields.includes(fieldName)) {
      return status === StudyStatus.PENDING || status === StudyStatus.APPROVED;
    }

    // PENDING 상태에서만 수정 가능한 비용 관련 필드
    const costFields = ['costType', 'costDescription'];
    if (costFields.includes(fieldName)) {
      return status === StudyStatus.PENDING;
    }

    // PENDING, APPROVED, IN_PROGRESS 상태에서 수정 가능한 필드
    const alwaysEditableFields = ['schedule', 'duration', 'recruitDeadline'];
    if (alwaysEditableFields.includes(fieldName)) {
      return status === StudyStatus.PENDING ||
             status === StudyStatus.APPROVED ||
             status === StudyStatus.IN_PROGRESS;
    }

    return false;
  };

  useEffect(() => {
    if (isOpen && study) {
      // Initialize form with current study data
      setFormData({
        title: study.name,
        tagline: study.tagline,
        schedule: study.schedule,
        duration: study.duration,
        location: study.location || '',
        capacity: study.capacity,
        recruitDeadline: study.deadline ? formatDateForInput(study.deadline) : '',
        startDate: study.startDate ? formatDateForInput(study.startDate) : '',
        endDate: study.endDate ? formatDateForInput(study.endDate) : '',
        costType: study.costType || 'FREE',
        costDescription: study.costDescription || ''
      });
      
      // duration 문자열을 파싱하여 시간 초기화 (먼저 처리)
      let parsedStartTime = '';
      let parsedEndTime = '';
      if (study.duration) {
        // 예: "19:30-21:30" -> startTime: "19:30", endTime: "21:30"
        const times = study.duration.split('-');
        if (times.length === 2) {
          parsedStartTime = times[0].trim();
          parsedEndTime = times[1].trim();
        }
      }
      
      // schedule 문자열을 파싱하여 scheduleData 초기화
      if (study.schedule) {
        // 예: "매주 금요일" -> frequency: weekly, daysOfWeek: ['FRIDAY']
        const parsedSchedule = parseScheduleString(study.schedule, parsedStartTime, parsedEndTime);
        setScheduleData(parsedSchedule);
      } else {
        // schedule이 없는 경우 기본값 설정
        setScheduleData({
          frequency: 'WEEKLY' as ScheduleFrequency,
          daysOfWeek: [],
          startTime: parsedStartTime,
          endTime: parsedEndTime
        });
      }
      
      setErrors({});
    }
  }, [isOpen, study]);
  
  // schedule 문자열 파싱 헬퍼 함수
  const parseScheduleString = (schedule: string, parsedStartTime: string = '', parsedEndTime: string = ''): ScheduleData => {
    const result: ScheduleData = {
      frequency: 'WEEKLY' as ScheduleFrequency,
      daysOfWeek: [],
      startTime: parsedStartTime,
      endTime: parsedEndTime
    };
    
    // 빈도 파싱
    if (schedule.includes('매주')) {
      result.frequency = 'WEEKLY' as ScheduleFrequency;
    } else if (schedule.includes('격주')) {
      result.frequency = 'BIWEEKLY' as ScheduleFrequency;
    } else if (schedule.includes('매월')) {
      result.frequency = 'MONTHLY' as ScheduleFrequency;
    }
    
    // 요일 파싱 - 다양한 형식 지원 (긴 형식 먼저 체크)
    const dayMap: [string, DayOfWeek][] = [
      // 긴 형식을 먼저 체크
      ['월요일', DayOfWeek.MONDAY],
      ['화요일', DayOfWeek.TUESDAY],
      ['수요일', DayOfWeek.WEDNESDAY],
      ['목요일', DayOfWeek.THURSDAY],
      ['금요일', DayOfWeek.FRIDAY],
      ['토요일', DayOfWeek.SATURDAY],
      ['일요일', DayOfWeek.SUNDAY],
      // 짧은 형식
      ['월', DayOfWeek.MONDAY],
      ['화', DayOfWeek.TUESDAY],
      ['수', DayOfWeek.WEDNESDAY],
      ['목', DayOfWeek.THURSDAY],
      ['금', DayOfWeek.FRIDAY],
      ['토', DayOfWeek.SATURDAY],
      ['일', DayOfWeek.SUNDAY]
    ];
    
    // 긴 형식부터 체크하여 "월요일"이 "월"로도 매칭되는 것을 방지
    for (const [korean, english] of dayMap) {
      if (schedule.includes(korean)) {
        // 중복 방지
        if (!result.daysOfWeek.includes(english)) {
          result.daysOfWeek.push(english);
        }
      }
    }
    
    return result;
  };

  const formatDateForInput = (date: Date | string | number[] | null): string => {
    if (!date) return '';
    
    // Date 객체인 경우
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // 문자열인 경우
    if (typeof date === 'string') {
      // ISO 형식인 경우 날짜 부분만 추출
      if (date.includes('T')) {
        return date.split('T')[0];
      }
      // 이미 YYYY-MM-DD 형식인 경우
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      // 다른 형식인 경우 Date 객체로 변환 후 처리
      return new Date(date).toISOString().split('T')[0];
    }
    
    // 배열인 경우 ([year, month, day, ...] 형식)
    if (Array.isArray(date) && date.length >= 3) {
      const [year, month, day] = date;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = '스터디 제목은 필수입니다.';
    }


    if (formData.capacity && formData.capacity < 1) {
      newErrors.capacity = '참여 인원은 1명 이상이어야 합니다.';
    }

    // recruitDeadline 검증 제거: 과거/현재/미래 모두 자유롭게 설정 가능
    // 과거 날짜 설정 = 모집 즉시 종료, 미래 날짜 = 모집 연장

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate > endDate) {
        newErrors.endDate = '종료일은 시작일 이후여야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Only send fields that have been modified
      const updateData: StudyUpdateRequest = {};
      
      if (formData.title && formData.title !== study.name) {
        updateData.title = formData.title;
      }
      
      
      if (formData.tagline !== study.tagline) {
        updateData.tagline = formData.tagline || '';
      }
      
      // schedule과 duration은 새로운 컴포넌트 값으로 업데이트
      // schedule과 duration은 scheduleData에서 가져옴
      const dayMap: Record<DayOfWeek, string> = {
        [DayOfWeek.MONDAY]: '월',
        [DayOfWeek.TUESDAY]: '화',
        [DayOfWeek.WEDNESDAY]: '수',
        [DayOfWeek.THURSDAY]: '목',
        [DayOfWeek.FRIDAY]: '금',
        [DayOfWeek.SATURDAY]: '토',
        [DayOfWeek.SUNDAY]: '일'
      };
      
      const selectedDays = scheduleData.daysOfWeek
        .map(day => dayMap[day])
        .filter(Boolean)
        .join(', ');
      
      // 주기에 따라 올바른 한글 텍스트 생성
      let frequencyText = '매주';
      if (scheduleData.frequency === 'BIWEEKLY') {
        frequencyText = '격주';
      } else if (scheduleData.frequency === 'MONTHLY') {
        frequencyText = '매월';
      }
      
      const newSchedule = selectedDays ? `${frequencyText} ${selectedDays}` : '';
      if (newSchedule && newSchedule !== study.schedule) {
        updateData.schedule = newSchedule;
      }
      
      // recurrenceType도 업데이트 (백엔드 필드명과 매칭)
      if (scheduleData.frequency && study.recurrenceType !== scheduleData.frequency) {
        updateData.recurrenceType = scheduleData.frequency as RecurrenceType;
      }
      
      const newDuration = scheduleData.startTime && scheduleData.endTime 
        ? `${scheduleData.startTime}-${scheduleData.endTime}` 
        : '';
      if (newDuration && newDuration !== study.duration) {
        updateData.duration = newDuration;
      }
      
      if (formData.capacity && formData.capacity !== study.capacity) {
        updateData.capacity = formData.capacity;
      }

      if (formData.location && formData.location !== (study.location || '')) {
        updateData.location = formData.location;
      }

      // recruitDeadline은 기존 값과 비교하여 변경된 경우만 전송
      const currentDeadline = study.deadline ? formatDateForInput(study.deadline) : '';
      console.log('[DEBUG] recruitDeadline 비교:', {
        formDataValue: formData.recruitDeadline,
        currentDeadline,
        isDifferent: formData.recruitDeadline !== currentDeadline
      });
      if (formData.recruitDeadline !== currentDeadline) {
        updateData.recruitDeadline = formData.recruitDeadline ? formData.recruitDeadline + 'T23:59:59' : undefined;
        console.log('[DEBUG] recruitDeadline 설정됨:', updateData.recruitDeadline);
      }
      
      if (formData.startDate) {
        updateData.startDate = formData.startDate;
      }
      
      if (formData.endDate) {
        updateData.endDate = formData.endDate;
      }
      
      // 비용 정보 업데이트
      if (formData.costType !== study.costType) {
        updateData.costType = formData.costType;
      }
      
      if (formData.costDescription !== (study.costDescription || '')) {
        updateData.costDescription = formData.costDescription || '';
      }

      console.log('[DEBUG] 전송할 updateData:', updateData);
      await onUpdate(updateData);
      onClose();
    } catch (error: any) {
      console.error('스터디 수정 실패:', error);
      setErrors({
        general: error.response?.data?.message || '스터디 수정 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof StudyUpdateRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = field === 'capacity' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="study-update-modal-overlay" onClick={onClose}>
      <div className="study-update-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>스터디 정보 수정</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* 스터디 상태 표시 */}
          <div className="study-status-info">
            <span className="status-label">현재 상태:</span>
            <span className={`status-badge status-${study.status.toLowerCase()}`}>
              {study.status === StudyStatus.PENDING && '검토 대기중'}
              {study.status === StudyStatus.APPROVED && '승인됨'}
              {study.status === StudyStatus.IN_PROGRESS && '진행중'}
              {study.status === StudyStatus.COMPLETED && '완료됨'}
              {study.status === StudyStatus.TERMINATED && '종료됨'}
              {study.status === StudyStatus.REJECTED && '거절됨'}
            </span>
            {(study.status === StudyStatus.COMPLETED || 
              study.status === StudyStatus.TERMINATED || 
              study.status === StudyStatus.REJECTED) && (
              <span className="status-warning">
                ※ 수정할 수 없는 상태입니다
              </span>
            )}
          </div>

          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">
              스터디 제목 *
              {!isFieldEditable('title') && <span className="field-status"> (수정 불가)</span>}
            </label>
            <input
              id="title"
              type="text"
              value={formData.title || ''}
              onChange={handleChange('title')}
              placeholder="스터디 제목을 입력하세요"
              disabled={loading || !isFieldEditable('title')}
              title={!isFieldEditable('title') ? 'PENDING 상태에서만 수정 가능합니다' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tagline">
              한줄 소개
              {!isFieldEditable('tagline') && <span className="field-status"> (수정 불가)</span>}
            </label>
            <input
              id="tagline"
              type="text"
              value={formData.tagline || ''}
              onChange={handleChange('tagline')}
              placeholder="스터디를 한줄로 소개해주세요"
              disabled={loading || !isFieldEditable('tagline')}
              title={!isFieldEditable('tagline') ? 'PENDING 또는 APPROVED 상태에서만 수정 가능합니다' : ''}
            />
            {errors.tagline && <span className="error-message">{errors.tagline}</span>}
          </div>

          {/* 일정 및 시간 섹션 */}
          <div className="schedule-section">
            <div className="section-header">
              <h3>📅 일정 및 시간</h3>
              {(!isFieldEditable('schedule') || !isFieldEditable('duration')) && 
                <span className="field-status">(일부 수정 불가)</span>
              }
            </div>
            
            {/* 일정 선택 */}
            <div className="form-group">
              <label>
                스터디 일정
                {!isFieldEditable('schedule') && <span className="field-status"> (수정 불가)</span>}
              </label>
              {isFieldEditable('schedule') ? (
                <ModernScheduleInput
                  value={scheduleData}
                  onChange={setScheduleData}
                  recurrenceType={study.recurrenceType}
                />
              ) : (
                <div className="readonly-field">
                  {study.schedule || '일정 정보 없음'}
                </div>
              )}
            </div>
            
            {/* ModernScheduleInput이 시간도 포함하므로 별도 시간 선택 제거 */}
          </div>

          <div className="form-group">
            <label htmlFor="location">
              스터디 장소
            </label>
            <input
              id="location"
              type="text"
              value={formData.location || ''}
              onChange={handleChange('location')}
              placeholder="예: 강남역 스터디룸"
              disabled={loading}
            />
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="capacity">
              모집 인원
              {!isFieldEditable('capacity') && <span className="field-status"> (수정 불가)</span>}
            </label>
            <input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity || ''}
              onChange={handleChange('capacity')}
              placeholder="모집할 인원 수"
              disabled={loading || !isFieldEditable('capacity')}
              title={!isFieldEditable('capacity') ? 'PENDING 또는 APPROVED 상태에서만 수정 가능합니다' : ''}
            />
            {errors.capacity && <span className="error-message">{errors.capacity}</span>}
          </div>

          {/* 비용 섹션 */}
          <div className="cost-section">
            <div className="section-header">
              <h3>💰 스터디 비용</h3>
              {!isFieldEditable('costType') && 
                <span className="field-status">(수정 불가)</span>
              }
            </div>

            <div className="form-group">
              <label>
                비용 유형
                {!isFieldEditable('costType') && <span className="field-status"> (수정 불가)</span>}
              </label>
              {isFieldEditable('costType') ? (
                <div className="cost-type-selector">
                  {[
                    { value: 'FREE', label: '완전 무료', desc: '모든 비용이 무료입니다' },
                    { value: 'FREE_WITH_VENUE', label: '무료/대관비 유료', desc: '스터디는 무료이지만 장소 대관비 등이 발생할 수 있습니다' },
                    { value: 'PAID', label: '유료', desc: '스터디 참여에 비용이 발생합니다' }
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`cost-type-option ${formData.costType === option.value ? 'selected' : ''}`}
                      onClick={() => {
                        if (!loading) {
                          setFormData(prev => ({ ...prev, costType: option.value as CostType }));
                        }
                      }}
                    >
                      <div className="cost-type-header">
                        <div className="cost-type-radio">
                          <div className="radio-dot"></div>
                        </div>
                        <span className="cost-type-label">{option.label}</span>
                      </div>
                      <div className="cost-type-desc">{option.desc}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="readonly-field">
                  {formData.costType === 'FREE' && '완전 무료'}
                  {formData.costType === 'FREE_WITH_VENUE' && '무료 (대관비 등 부가비용 발생)'}
                  {formData.costType === 'PAID' && '유료'}
                </div>
              )}
              {errors.costType && <span className="error-message">{errors.costType}</span>}
            </div>

            {formData.costType !== 'FREE' && (
              <div className="form-group">
                <label htmlFor="costDescription">
                  비용 상세 설명
                  {!isFieldEditable('costDescription') && <span className="field-status"> (수정 불가)</span>}
                </label>
                {isFieldEditable('costDescription') ? (
                  <textarea
                    id="costDescription"
                    value={formData.costDescription || ''}
                    onChange={handleChange('costDescription')}
                    placeholder={
                      formData.costType === 'FREE_WITH_VENUE' 
                        ? '예: 카페 대관비 인당 5,000원, 교재비 별도' 
                        : '예: 월 30,000원, 교재비 포함'
                    }
                    rows={3}
                    disabled={loading}
                    title={!isFieldEditable('costDescription') ? 'PENDING 또는 APPROVED 상태에서만 수정 가능합니다' : ''}
                  />
                ) : (
                  <div className="readonly-field">
                    {formData.costDescription || '비용 설명 없음'}
                  </div>
                )}
                {errors.costDescription && <span className="error-message">{errors.costDescription}</span>}
                <div className="form-hint">
                  참가자가 이해하기 쉽게 구체적으로 작성해주세요 (최대 500자)
                </div>
              </div>
            )}
          </div>

          {/* 날짜 섹션 */}
          <div className="date-section">
            <div className="section-header">
              <h3>📅 스터디 기간</h3>
              {(!isFieldEditable('recruitDeadline') || !isFieldEditable('startDate') || !isFieldEditable('endDate')) && 
                <span className="field-status">(수정 불가)</span>
              }
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">📝</span> 모집 마감일
                {!isFieldEditable('recruitDeadline') && <span className="field-status"> (수정 불가)</span>}
              </label>
              {isFieldEditable('recruitDeadline') ? (
                <>
                  <DatePickerCustom
                    value={formData.recruitDeadline || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, recruitDeadline: value }))}
                    placeholder="모집 마감일 선택"
                    min=""
                  />
                  <div className="form-hint" style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    💡 마감일을 연장하면 모집이 계속되고, 과거로 설정하면 모집이 종료됩니다
                  </div>
                </>
              ) : (
                <div className="readonly-field">
                  {formData.recruitDeadline || '날짜 정보 없음'}
                </div>
              )}
              {errors.recruitDeadline && <span className="error-message">{errors.recruitDeadline}</span>}
            </div>

            <div className="form-row date-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">🚀</span> 시작일
                  {!isFieldEditable('startDate') && <span className="field-status"> (수정 불가)</span>}
                </label>
                {isFieldEditable('startDate') ? (
                  <DatePickerCustom
                    value={formData.startDate || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
                    placeholder="시작일 선택"
                    min={new Date().toISOString().split('T')[0]}
                  />
                ) : (
                  <div className="readonly-field">
                    {formData.startDate || '날짜 정보 없음'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">🏁</span> 종료일
                  {!isFieldEditable('endDate') && <span className="field-status"> (수정 불가)</span>}
                </label>
                {isFieldEditable('endDate') ? (
                  <DatePickerCustom
                    value={formData.endDate || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
                    placeholder="종료일 선택"
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                ) : (
                  <div className="readonly-field">
                    {formData.endDate || '날짜 정보 없음'}
                  </div>
                )}
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyUpdateModal;
