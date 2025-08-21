import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import studyService, { StudyProposalRequest, StudyType, RecurrenceType, CostType } from '../api/studyService';
import { ScheduleFrequency, DurationUnit } from '../types/schedule';
import { ToastContainer, useToast } from '../components/ui/Toast';
import TimePickerCustom from '../components/study/TimePickerCustom';
import DatePickerCustom from '../components/study/DatePickerCustom';
import DurationSelector from '../components/study/DurationSelector';
import GenerationSelector from '../components/study/GenerationSelector';
import PreviewModal from '../components/study/PreviewModal';
import { useDebouncedCallback } from '../hooks/useDebounce';
import styles from './StudyProposalPageV2.module.css';

const StudyProposalPageV2: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { messages, success, error, warning, removeToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Helper function to format date to YYYY-MM-DD in local timezone
  const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    type: 'PARTICIPATORY' as StudyType,
    recurrenceType: 'WEEKLY' as RecurrenceType,
    tagline: '',
    // description 제거: 상세 콘텐츠는 DetailPage 섹션으로 대체
    generation: 1,
    selectedDate: '',
    daysOfWeek: [] as number[],
    startTime: '',
    endTime: '',
    duration: 8,
    durationUnit: 'WEEKS' as 'WEEKS' | 'MONTHS',
    capacity: 20,
    recruitDeadline: '',
    recruitDeadlineTime: '',
    startDate: '',
    endDate: '',
    costType: 'FREE' as CostType,
    costDescription: '',
  });

  // Validation functions
  const validateTitle = (title: string): string | null => {
    if (!title.trim()) return '스터디 이름은 필수입니다.';
    if (title.length > 255) return '스터디 이름은 255자 이내로 입력해주세요.';
    if (title.length < 2) return '스터디 이름은 2자 이상 입력해주세요.';
    return null;
  };

  const validateTagline = (tagline: string): string | null => {
    if (tagline && tagline.length > 500) return '한 줄 소개는 500자 이내로 입력해주세요.';
    return null;
  };

  const validateTime = (startTime: string, endTime: string): string | null => {
    if (!startTime || !endTime) return null;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    if (startMinutes >= endMinutes) {
      return '종료 시간은 시작 시간보다 늦어야 합니다.';
    }
    if (endMinutes - startMinutes < 30) {
      return '최소 30분 이상의 시간을 설정해주세요.';
    }
    return null;
  };

  const validateStartTimeForToday = (date: string, time: string): string | null => {
    if (!date || !time) return null;
    
    const today = new Date();
    const selectedDate = new Date(date);
    
    // 날짜가 오늘인지 확인 (시간 제외하고 비교)
    selectedDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    
    if (selectedDate.getTime() === todayDate.getTime()) {
      const [h, m] = time.split(':').map(Number);
      const currentHour = today.getHours();
      const currentMin = today.getMinutes();
      
      // 선택한 시간이 현재 시간보다 이전인지 확인
      if (h < currentHour || (h === currentHour && m <= currentMin)) {
        return `현재 시간(${currentHour}:${String(currentMin).padStart(2, '0')}) 이후로 설정해주세요`;
      }
    }
    return null;
  };

  const validateCapacity = (capacity: number): string | null => {
    if (capacity <= 0) return '모집 인원은 1명 이상이어야 합니다.';
    if (capacity > 100) return '모집 인원은 100명 이하로 설정해주세요.';
    return null;
  };

  const validateDuration = (duration: number): string | null => {
    if (duration <= 0) return '진행 기간은 1 이상이어야 합니다.';
    if (duration > 52) return '진행 기간이 너무 깁니다.';
    return null;
  };

  const validateGeneration = (generation: number): string | null => {
    if (generation < 1) return '기수는 1 이상이어야 합니다.';
    if (generation > 100) return '기수는 100 이하로 설정해주세요.';
    return null;
  };

  // Debounced validation callbacks
  const debouncedTitleValidation = useDebouncedCallback((value: string) => {
    const error = validateTitle(value);
    if (error) warning(error);
  }, 500);

  const debouncedTaglineValidation = useDebouncedCallback((value: string) => {
    const error = validateTagline(value);
    if (error) warning(error);
  }, 500);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate end date when start date or duration changes
      if (prev.recurrenceType !== 'ONE_TIME') {
        if (field === 'startDate' && value && value.trim() !== '') {
          // Calculate end date based on duration
          const endDate = calculateEndDate(value, prev.duration, prev.durationUnit);
          if (endDate) {
            newData.endDate = endDate;
          }
        } else if ((field === 'duration' || field === 'durationUnit') && prev.startDate && prev.startDate.trim() !== '') {
          // Recalculate end date when duration changes
          const endDate = calculateEndDate(
            prev.startDate, 
            field === 'duration' ? value : prev.duration,
            field === 'durationUnit' ? value : prev.durationUnit
          );
          if (endDate) {
            newData.endDate = endDate;
          }
        }
      }
      
      // Clear irrelevant data based on recurrence type
      if (field === 'recurrenceType') {
        if (value === 'ONE_TIME') {
          // Clear weekly-specific data
          newData.daysOfWeek = [];
          newData.startDate = '';
          newData.endDate = '';
          newData.duration = 8;
        } else {
          // Clear one-time specific data
          newData.selectedDate = '';
        }
      }
      
      // Auto-set time when recruit deadline date is selected
      if (field === 'recruitDeadline' && value && value.trim() !== '') {
        if (!prev.recruitDeadlineTime || prev.recruitDeadlineTime.trim() === '') {
          newData.recruitDeadlineTime = '23:59';
        }
      } else if (field === 'recruitDeadline' && (!value || value.trim() === '')) {
        // Clear time when date is cleared
        newData.recruitDeadlineTime = '';
      }
      
      return newData;
    });

    // Real-time validation with debouncing
    if (field === 'title') {
      debouncedTitleValidation(value);
    } else if (field === 'tagline') {
      debouncedTaglineValidation(value);
    }
  };

  const calculateEndDate = (startDate: string, duration: number, unit: 'WEEKS' | 'MONTHS'): string => {
    if (!startDate || startDate.trim() === '') {
      return '';
    }
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(start);
    
    if (unit === 'WEEKS') {
      end.setDate(end.getDate() + (duration * 7));
    } else {
      end.setMonth(end.getMonth() + duration);
    }
    
    return end.toISOString().split('T')[0];
  };

  const handleQuickDuration = (hours: number) => {
    if (formData.startTime) {
      const [h, m] = formData.startTime.split(':').map(Number);
      let endHour = h + Math.floor(hours);
      let endMinute = m + Math.round((hours % 1) * 60);
      
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }
      
      if (endHour >= 24) {
        endHour = endHour % 24;
      }
      
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      handleInputChange('endTime', endTime);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return formData.title.trim() !== '';
      case 1:
        if (formData.recurrenceType === 'ONE_TIME') {
          return formData.selectedDate !== '' && formData.startTime !== '' && formData.endTime !== '';
        }
        return formData.daysOfWeek.length > 0 && formData.startTime !== '' && formData.endTime !== '';
      case 2:
        return true; // Optional fields
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    // Skip check during auth loading
    if (authLoading) {
      return;
    }
    
    // Check for user after loading is complete
    if (!user) {
      error('스터디 제안을 위해서는 로그인이 필요합니다.');
      setTimeout(() => navigate('/login', { state: { from: '/study/propose' } }), 1500);
      return;
    }

    // Basic field validation
    const titleError = validateTitle(formData.title);
    if (titleError) {
      error(titleError);
      return;
    }

    const taglineError = validateTagline(formData.tagline);
    if (taglineError) {
      error(taglineError);
      return;
    }

    // Time validation
    if (formData.startTime && formData.endTime) {
      const timeError = validateTime(formData.startTime, formData.endTime);
      if (timeError) {
        error(timeError);
        return;
      }
    }

    // Capacity validation
    if (formData.capacity) {
      const capacityError = validateCapacity(formData.capacity);
      if (capacityError) {
        error(capacityError);
        return;
      }
    }

    // Duration validation for recurring studies
    if (formData.recurrenceType !== 'ONE_TIME' && formData.duration) {
      const durationError = validateDuration(formData.duration);
      if (durationError) {
        error(durationError);
        return;
      }
    }

    // Generation validation
    const generationError = validateGeneration(formData.generation);
    if (generationError) {
      error(generationError);
      return;
    }

    // Data consistency validation
    if (formData.recurrenceType === 'ONE_TIME') {
      if (formData.daysOfWeek.length > 0) {
        error('1회성 스터디는 요일 선택이 불필요합니다.');
        return;
      }
    } else {
      if (formData.selectedDate) {
        error('반복 스터디는 단일 날짜 선택이 불필요합니다.');
        return;
      }
      if (formData.recurrenceType === 'WEEKLY' && formData.daysOfWeek.length === 0) {
        error('매주 진행하는 스터디는 요일을 선택해주세요.');
        return;
      }
    }

    // 날짜 검증
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 시작일 검증
    if (formData.startDate) {
      const start = new Date(formData.startDate);
      start.setHours(0, 0, 0, 0);
      if (start < today) {
        error('시작일은 오늘 이후여야 합니다.');
        return;
      }
    }

    // 종료일 검증
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        error('시작일은 종료일보다 이전이어야 합니다.');
        return;
      }
    }

    // 모집 마감일 검증 (개선된 로직 - 시간 고려)
    if (formData.recruitDeadline && formData.recruitDeadlineTime) {
      const deadline = new Date(formData.recruitDeadline);
      deadline.setHours(0, 0, 0, 0);
      
      // 오늘 날짜 체크
      if (deadline < today) {
        error('모집 마감일은 오늘 이후여야 합니다.');
        return;
      }
      
      // 시작일과 비교 (ONE_TIME의 경우 selectedDate 사용)
      const effectiveStartDate = formData.recurrenceType === 'ONE_TIME' 
        ? formData.selectedDate 
        : formData.startDate;
      
      if (effectiveStartDate) {
        const start = new Date(effectiveStartDate);
        start.setHours(0, 0, 0, 0);
        
        // 날짜만 비교 (마감일이 시작일보다 늦으면 안됨)
        if (deadline > start) {
          error('모집 마감일은 스터디 시작일 이후일 수 없습니다.');
          return;
        }
        
        // 같은 날인 경우 시간까지 비교
        if (deadline.getTime() === start.getTime() && formData.startTime && formData.recruitDeadlineTime) {
          const [deadlineH, deadlineM] = formData.recruitDeadlineTime.split(':').map(Number);
          const [startH, startM] = formData.startTime.split(':').map(Number);
          const deadlineMinutes = deadlineH * 60 + deadlineM;
          const startMinutes = startH * 60 + startM;
          
          if (deadlineMinutes >= startMinutes) {
            error(`모집 마감 시간(${formData.recruitDeadlineTime})은 스터디 시작 시간(${formData.startTime})보다 이전이어야 합니다.`);
            return;
          }
        }
      }
    }

    // ONE_TIME 스터디의 경우 selectedDate 검증
    if (formData.recurrenceType === 'ONE_TIME' && formData.selectedDate) {
      const selectedDate = new Date(formData.selectedDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        error('스터디 날짜는 오늘 이후여야 합니다.');
        return;
      }
      
      // 오늘 날짜인 경우 시작 시간 검증
      if (selectedDate.getTime() === today.getTime() && formData.startTime) {
        const todayError = validateStartTimeForToday(formData.selectedDate, formData.startTime);
        if (todayError) {
          error(todayError.replace('설정해주세요', '설정해야 합니다'));
          return;
        }
      }
    }
    
    // 반복 스터디의 경우 startDate가 오늘인 경우 시간 검증
    if (formData.recurrenceType !== 'ONE_TIME' && formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      if (startDate.getTime() === today.getTime() && formData.startTime) {
        const todayError = validateStartTimeForToday(formData.startDate, formData.startTime);
        if (todayError) {
          error(todayError.replace('설정해주세요', '설정해야 합니다'));
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      let scheduleString: string | undefined;
      let finalStartDate = formData.startDate;
      let finalEndDate = formData.endDate;

      // 시간 정보를 duration 필드에 저장
      let durationString: string | undefined;
      if (formData.startTime && formData.endTime) {
        durationString = `${formData.startTime}-${formData.endTime}`;
      }

      if (formData.recurrenceType === 'ONE_TIME') {
        if (formData.selectedDate) {
          finalStartDate = formData.selectedDate;
          finalEndDate = formData.selectedDate;
          
          const dateObj = new Date(formData.selectedDate + 'T00:00:00');
          scheduleString = `${dateObj.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
          })}`;
        }
      } else {
        if (formData.daysOfWeek.length > 0) {
          const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
          const selectedDays = formData.daysOfWeek.map(day => dayNames[day]).join(', ');
          scheduleString = `매주 ${selectedDays}`;
        }
      }

      const recruitDeadlineDateTime = formData.recruitDeadline 
        ? `${formData.recruitDeadline}T${formData.recruitDeadlineTime}:00`
        : undefined;

      // Removed debug console.log

      const proposalRequest: StudyProposalRequest = {
        title: formData.title.trim(),
        proposerId: user.id || user.username || user.email,
        type: formData.type as StudyType,
        generation: formData.generation,
        tagline: formData.tagline || undefined,
        schedule: scheduleString,
        duration: durationString,
        capacity: formData.capacity || undefined,
        recruitDeadline: recruitDeadlineDateTime,
        startDate: finalStartDate || undefined,
        endDate: finalEndDate || undefined,
        recurrenceType: formData.recurrenceType,
        costType: formData.costType,
        costDescription: formData.costDescription || undefined,
        // detailPage는 제안 단계에서는 보내지 않음 - 승인 후 관리 페이지에서 생성
        // detailPage: undefined
      };

      await studyService.proposeStudy(proposalRequest);
      
      success('스터디 제안이 성공적으로 제출되었습니다! 관리자 검토 후 연락드리겠습니다.');
      setTimeout(() => navigate('/study'), 2000);
    } catch (err: any) {
      // Parse API error messages for better user feedback
      let errorMessage = '스터디 제안 제출 중 오류가 발생했습니다.';
      
      if (err.response?.data) {
        const { data, message, errors } = err.response.data;
        
        // Handle different error response formats
        if (message) {
          errorMessage = message;
        } else if (errors && Array.isArray(errors)) {
          // Handle field-specific errors
          errorMessage = errors.map((e: any) => e.message || e).join(', ');
        } else if (errors && typeof errors === 'object') {
          // Handle field-mapped errors
          errorMessage = Object.values(errors).flat().join(', ');
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
        
        // Handle specific error codes
        if (err.response.status === 400) {
          errorMessage = `입력값 오류: ${errorMessage}`;
        } else if (err.response.status === 409) {
          errorMessage = '이미 동일한 제목의 스터디를 제안하셨습니다.';
        } else if (err.response.status === 422) {
          errorMessage = `검증 실패: ${errorMessage}`;
        }
      }
      
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: '기본 정보', icon: '📝' },
    { title: '일정 설정', icon: '📅' },
    { title: '모집 정보', icon: '👥' },
  ];

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  // 페이지 진입 시 로그인 체크
  useEffect(() => {
    // 로딩 중이면 대기
    if (authLoading) return;
    
    // 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
    if (!user) {
      error('스터디 제안을 위해서는 로그인이 필요합니다.');
      setTimeout(() => {
        navigate('/login', { state: { from: '/study/propose' } });
      }, 1500);
    }
  }, [user, authLoading, navigate, error]);

  // 로딩 중이거나 로그인 안 된 경우 로딩 표시
  if (authLoading) {
    return (
      <div className={styles['study-proposal-v2']}>
        <div className={styles['proposal-container-v2']}>
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <div style={{ fontSize: '20px', marginBottom: '20px' }}>로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 안 된 경우 (리다이렉트 전 잠시 표시)
  if (!user) {
    return (
      <div className={styles['study-proposal-v2']}>
        <div className={styles['proposal-container-v2']}>
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ fontSize: '20px', color: '#C3E88D', marginBottom: '20px' }}>
              로그인이 필요합니다
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              로그인 페이지로 이동 중...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['study-proposal-v2']}>
      <ToastContainer messages={messages} onClose={removeToast} />
      <div className={styles['proposal-container-v2']}>
        <button 
          onClick={() => navigate('/study')} 
          className={styles['back-button-v2']}
        >
          ← 돌아가기
        </button>
        
        <div className={styles['proposal-header-v2']}>
          <h1>스터디 제안하기</h1>
          <p>원하는 스터디가 없나요? 직접 제안해보세요!</p>
        </div>

        <div className={styles['steps-container']}>
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`${styles['step-item']} ${currentStep === index ? styles['active'] : ''} ${currentStep > index ? styles['completed'] : ''}`}
            >
              <div className={styles['step-icon']}>{step.icon}</div>
              <div className={styles['step-title']}>{step.title}</div>
            </div>
          ))}
        </div>

        <div className={styles['form-container-v2']}>
          {currentStep === 0 && (
            <div className={styles['form-step']}>
              <div className={styles['form-group-v2']}>
                <label>스터디 이름 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="예: React 심화 스터디"
                  className={styles['proposal-input']}
                  maxLength={255}
                />
              </div>

              <div className={styles['form-row-v2']}>
                <div className={styles['form-group-v2']}>
                  <label>스터디 유형 *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={styles['proposal-select']}
                  >
                    <option value="PARTICIPATORY">참여형 (함께 학습하고 성장)</option>
                    <option value="EDUCATIONAL">교육형 (강의 중심 학습)</option>
                  </select>
                </div>

                <div className={styles['form-group-v2']}>
                  <label>반복 유형 *</label>
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => handleInputChange('recurrenceType', e.target.value)}
                    className={styles['proposal-select']}
                  >
                    <option value="ONE_TIME">1회성 (한 번만 진행)</option>
                    <option value="DAILY">매일</option>
                    <option value="WEEKLY">매주</option>
                    <option value="BIWEEKLY">격주</option>
                    <option value="MONTHLY">매월</option>
                  </select>
                </div>
              </div>

              <div className={styles['form-group-v2']}>
                <label>한 줄 소개</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="스터디를 한 문장으로 표현해주세요"
                  className={styles['proposal-input']}
                  maxLength={500}
                />
                <span className={styles['form-hint']}>
                  상세 소개와 콘텐츠는 스터디 생성 후 관리 페이지에서 편집할 수 있습니다
                </span>
              </div>

              <div className={styles['form-group-v2']}>
                <label>기수</label>
                <GenerationSelector
                  value={formData.generation}
                  onChange={(value) => handleInputChange('generation', value)}
                  min={1}
                  max={100}
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className={styles['form-step']}>
              {formData.recurrenceType === 'ONE_TIME' ? (
                <>
                  <div className={styles['form-group-v2']}>
                    <label>스터디 날짜 *</label>
                    <DatePickerCustom
                      value={formData.selectedDate}
                      onChange={(value) => {
                        handleInputChange('selectedDate', value);
                        // 과거 날짜 검증
                        if (value) {
                          const selected = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (selected < today) {
                            error('스터디 날짜는 오늘 이후여야 합니다.');
                          }
                        }
                      }}
                      placeholder="날짜를 선택해주세요"
                      min={getLocalDateString()}
                    />
                    <span className={styles['form-hint']}>
                      오늘 이후 날짜를 선택해주세요
                    </span>
                  </div>

                  <div className={styles['form-row-v2']}>
                    <div className={styles['form-group-v2']}>
                      <label>시작 시간 *</label>
                      <TimePickerCustom
                        value={formData.startTime}
                        onChange={(value) => {
                          handleInputChange('startTime', value);
                          
                          // 오늘 날짜인 경우 현재 시간 이후인지 검증
                          if (formData.selectedDate) {
                            const todayError = validateStartTimeForToday(formData.selectedDate, value);
                            if (todayError) {
                              warning(todayError);
                            }
                          }
                          
                          // 기존 종료 시간과의 검증
                          if (formData.endTime) {
                            const timeError = validateTime(value, formData.endTime);
                            if (timeError) warning(timeError);
                          }
                        }}
                        placeholder="시작 시간 선택"
                      />
                    </div>

                    <div className={styles['form-group-v2']}>
                      <label>종료 시간 *</label>
                      <TimePickerCustom
                        value={formData.endTime}
                        onChange={(value) => {
                          handleInputChange('endTime', value);
                          if (formData.startTime) {
                            const timeError = validateTime(formData.startTime, value);
                            if (timeError) warning(timeError);
                          }
                        }}
                        placeholder="종료 시간 선택"
                      />
                    </div>
                  </div>
                  
                  {formData.startTime && (
                    <div className={styles['quick-duration-section']}>
                      <label>빠른 시간 설정</label>
                      <div className={styles['quick-duration-buttons']}>
                        {[1, 1.5, 2, 2.5, 3].map(hours => (
                          <button
                            key={hours}
                            type="button"
                            className={styles['quick-duration-btn']}
                            onClick={() => handleQuickDuration(hours)}
                          >
                            {hours % 1 === 0 ? `${hours}시간` : `${Math.floor(hours)}시간 30분`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className={styles['form-group-v2']}>
                    <label>요일 선택 *</label>
                    <div className={styles['days-selector']}>
                      {dayNames.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`${styles['day-button-v2']} ${formData.daysOfWeek.includes(index) ? styles['selected'] : ''}`}
                          onClick={() => {
                            const newDays = formData.daysOfWeek.includes(index)
                              ? formData.daysOfWeek.filter(d => d !== index)
                              : [...formData.daysOfWeek, index];
                            handleInputChange('daysOfWeek', newDays);
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles['form-row-v2']}>
                    <div className={styles['form-group-v2']}>
                      <label>시작 시간 *</label>
                      <TimePickerCustom
                        value={formData.startTime}
                        onChange={(value) => {
                          handleInputChange('startTime', value);
                          
                          // 시작일이 오늘인 경우 현재 시간 이후인지 검증
                          if (formData.startDate) {
                            const todayError = validateStartTimeForToday(formData.startDate, value);
                            if (todayError) {
                              warning(todayError);
                            }
                          }
                          
                          // 기존 종료 시간과의 검증
                          if (formData.endTime) {
                            const timeError = validateTime(value, formData.endTime);
                            if (timeError) warning(timeError);
                          }
                        }}
                        placeholder="시작 시간 선택"
                      />
                    </div>

                    <div className={styles['form-group-v2']}>
                      <label>종료 시간 *</label>
                      <TimePickerCustom
                        value={formData.endTime}
                        onChange={(value) => {
                          handleInputChange('endTime', value);
                          if (formData.startTime) {
                            const timeError = validateTime(formData.startTime, value);
                            if (timeError) warning(timeError);
                          }
                        }}
                        placeholder="종료 시간 선택"
                      />
                    </div>
                  </div>
                  
                  {formData.startTime && (
                    <div className={styles['quick-duration-section']}>
                      <label>빠른 시간 설정</label>
                      <div className={styles['quick-duration-buttons']}>
                        {[1, 1.5, 2, 2.5, 3].map(hours => (
                          <button
                            key={hours}
                            type="button"
                            className={styles['quick-duration-btn']}
                            onClick={() => handleQuickDuration(hours)}
                          >
                            {hours % 1 === 0 ? `${hours}시간` : `${Math.floor(hours)}시간 30분`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles['form-group-v2']}>
                    <label>진행 기간</label>
                    <DurationSelector
                      value={formData.duration}
                      unit={formData.durationUnit}
                      onValueChange={(value) => {
                        if (value >= 1 && value <= 52) {
                          handleInputChange('duration', value);
                        } else {
                          warning('진행 기간은 1-52 사이의 값으로 설정해주세요.');
                        }
                      }}
                      onUnitChange={(unit) => handleInputChange('durationUnit', unit)}
                      startDate={formData.startDate}
                      endDate={formData.endDate}
                    />
                  </div>

                  <div className={styles['form-row-v2']}>
                    <div className={styles['form-group-v2']}>
                      <label>시작일</label>
                      <DatePickerCustom
                        value={formData.startDate}
                        onChange={(value) => {
                          handleInputChange('startDate', value);
                          // 모집 마감일 검증
                          if (value && formData.recruitDeadline) {
                            const start = new Date(value);
                            const deadline = new Date(formData.recruitDeadline);
                            if (deadline > start) {
                              warning('모집 마감일이 스터디 시작일보다 늦습니다. 모집 마감일을 다시 설정해주세요.');
                            }
                          }
                        }}
                        placeholder="시작일 선택"
                        min={getLocalDateString()}
                      />
                      <span className={styles['form-hint']}>
                        오늘 이후 날짜를 선택해주세요
                      </span>
                    </div>

                    <div className={styles['form-group-v2']}>
                      <label>종료일</label>
                      <DatePickerCustom
                        value={formData.endDate}
                        onChange={(value) => {
                          handleInputChange('endDate', value);
                          // 시작일과 비교 검증
                          if (value && formData.startDate) {
                            const end = new Date(value);
                            const start = new Date(formData.startDate);
                            if (end < start) {
                              error('종료일은 시작일 이후여야 합니다.');
                            }
                          }
                        }}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        placeholder="종료일 선택"
                      />
                      {formData.endDate && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '12px', 
                          color: '#89DDFF' 
                        }}>
                          💡 진행 기간에 따라 자동 계산됨 (수정 가능)
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles['form-step']}>
              <div className={styles['form-group-v2']}>
                <label>모집 인원</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= 100) {
                      handleInputChange('capacity', value);
                    }
                  }}
                  className={styles['proposal-input']}
                  min="1"
                  max="100"
                />
              </div>

              <div className={styles['form-group-v2']}>
                <label>스터디 비용 정보</label>
                <div className={styles['cost-type-selector']}>
                  {[
                    { value: 'FREE', label: '완전 무료', desc: '모든 비용이 무료입니다' },
                    { value: 'FREE_WITH_VENUE', label: '무료/대관비 유료', desc: '스터디는 무료이지만 장소 대관비 등이 발생할 수 있습니다' },
                    { value: 'PAID', label: '유료', desc: '스터디 참여에 비용이 발생합니다' }
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`${styles['cost-type-option']} ${formData.costType === option.value ? styles['selected'] : ''}`}
                      onClick={() => handleInputChange('costType', option.value as CostType)}
                    >
                      <div className={styles['cost-type-header']}>
                        <div className={styles['cost-type-radio']}>
                          <div className={styles['radio-dot']}></div>
                        </div>
                        <span className={styles['cost-type-label']}>{option.label}</span>
                      </div>
                      <div className={styles['cost-type-desc']}>{option.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.costType !== 'FREE' && (
                <div className={styles['form-group-v2']}>
                  <label>비용 상세 설명</label>
                  <textarea
                    value={formData.costDescription}
                    onChange={(e) => handleInputChange('costDescription', e.target.value)}
                    placeholder={
                      formData.costType === 'FREE_WITH_VENUE' 
                        ? '예: 카페 대관비 인당 5,000원, 교재비 별도' 
                        : '예: 월 30,000원, 교재비 포함'
                    }
                    className={styles['modern-textarea']}
                    rows={3}
                    maxLength={500}
                  />
                  <span className={styles['form-hint']}>
                    참가자가 이해하기 쉽게 구체적으로 작성해주세요 (최대 500자)
                  </span>
                </div>
              )}

              <div className={styles['form-row-v2']}>
                <div className={styles['form-group-v2']}>
                  <label>모집 마감일 <span className={styles['optional-badge']}>(선택)</span></label>
                  {(() => {
                    // 시작일이 없는 경우
                    if (!formData.startDate && formData.recurrenceType !== 'ONE_TIME') {
                      return (
                        <div className={styles['deadline-placeholder-v2']}>
                          <span className={styles['placeholder-icon']}>📅</span>
                          <span className={styles['placeholder-text']}>먼저 스터디 시작일을 설정해주세요</span>
                        </div>
                      );
                    }
                    
                    // ONE_TIME의 경우 selectedDate 사용
                    const effectiveStartDate = formData.recurrenceType === 'ONE_TIME' 
                      ? formData.selectedDate 
                      : formData.startDate;
                    
                    // 시작일이 오늘인 경우
                    if (effectiveStartDate === getLocalDateString()) {
                      return (
                        <div className={styles['deadline-today-notice-v2']}>
                          <span className={styles['notice-icon']}>💡</span>
                          <div className={styles['notice-content']}>
                            <span className={styles['notice-title']}>즉시 시작 스터디</span>
                            <span className={styles['notice-desc']}>오늘 시작하는 스터디는 별도 모집 기간이 없습니다</span>
                          </div>
                        </div>
                      );
                    }
                    
                    // 정상적인 경우
                    return (
                      <>
                        <DatePickerCustom
                          value={formData.recruitDeadline}
                          onChange={(value) => {
                            handleInputChange('recruitDeadline', value);
                            
                            // 날짜가 처음 선택되었을 때 시간 자동 설정
                            if (value && !formData.recruitDeadlineTime) {
                              handleInputChange('recruitDeadlineTime', '23:59');
                            }
                            
                            // 실시간 검증 - 시간을 고려한 검증
                            if (value && effectiveStartDate) {
                              const deadline = new Date(value);
                              const start = new Date(effectiveStartDate);
                              
                              // 날짜만 비교 (시간 제외)
                              deadline.setHours(0, 0, 0, 0);
                              start.setHours(0, 0, 0, 0);
                              
                              if (deadline > start) {
                                warning('모집 마감일은 스터디 시작일 이후일 수 없습니다.');
                              } else if (deadline.getTime() === start.getTime() && formData.startTime) {
                                // 같은 날인 경우 시간 체크를 위한 안내
                                warning(`${effectiveStartDate} ${formData.startTime} 시작 예정 - 모집 마감 시간을 확인해주세요`);
                              }
                            }
                          }}
                          placeholder="모집 마감일 선택 (선택사항)"
                          min={getLocalDateString()}
                          max={effectiveStartDate || undefined}
                        />
                        {effectiveStartDate && (
                          <span className={styles['form-hint']}>
                            📅 스터디 시작: {effectiveStartDate} {formData.startTime || '(시간 미정)'}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className={styles['form-group-v2']}>
                  <label>마감 시간</label>
                  {formData.recruitDeadline ? (
                    <TimePickerCustom
                      value={formData.recruitDeadlineTime}
                      onChange={(value) => {
                        handleInputChange('recruitDeadlineTime', value);
                        // 같은 날 시간 검증
                        if (formData.recruitDeadline && formData.startDate && formData.startTime) {
                          const effectiveStartDate = formData.recurrenceType === 'ONE_TIME' 
                            ? formData.selectedDate 
                            : formData.startDate;
                          
                          if (formData.recruitDeadline === effectiveStartDate) {
                            const [deadlineH, deadlineM] = value.split(':').map(Number);
                            const [startH, startM] = formData.startTime.split(':').map(Number);
                            const deadlineMinutes = deadlineH * 60 + deadlineM;
                            const startMinutes = startH * 60 + startM;
                            
                            if (deadlineMinutes >= startMinutes) {
                              error('모집 마감 시간은 스터디 시작 시간보다 이전이어야 합니다.');
                            }
                          }
                        }
                      }}
                      placeholder="23:59"
                    />
                  ) : (
                    <div className={styles['time-picker-disabled-v2']}>
                      <span className={styles['disabled-text']}>날짜를 먼저 선택해주세요</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles['info-box']}>
                <h4>💡 제안 프로세스</h4>
                <ol>
                  <li>제안서를 작성하여 제출합니다.</li>
                  <li>관리자가 제안을 검토합니다. (1-3일 소요)</li>
                  <li>승인되면 이메일로 안내드립니다.</li>
                  <li>스터디 페이지에 공개되어 모집이 시작됩니다.</li>
                </ol>
              </div>

              <div className={styles['page-edit-notice']}>
                <span className={styles['notice-text']}>
                  💡 스터디 생성 후 관리 페이지에서 상세 페이지를 자유롭게 편집할 수 있어요
                </span>
              </div>
            </div>
          )}

          <div className={styles['form-actions-v2']}>
            {currentStep > 0 && (
              <button 
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className={styles['proposal-secondary-btn']}
              >
                이전
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button 
                type="button"
                onClick={() => {
                  if (validateStep(currentStep)) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    warning('필수 항목을 모두 입력해주세요.');
                  }
                }}
                className={styles['proposal-primary-btn']}
              >
                다음
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  // validation을 통과해야 모달 표시
                  if (validateStep(currentStep)) {
                    setShowPreviewModal(true);
                  } else {
                    warning('필수 항목을 모두 입력해주세요.');
                  }
                }}
                className={styles['proposal-primary-btn']}
                disabled={isSubmitting}
              >
                {isSubmitting ? '제출 중...' : '제안하기'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 미리보기 모달 */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onSubmit={() => {
          setShowPreviewModal(false);
          handleSubmit();
        }}
        formData={formData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StudyProposalPageV2;