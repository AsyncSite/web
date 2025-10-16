import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import studyService, { StudyProposalRequest, StudyType, RecurrenceType, CostType, Study, SectionRequest } from '../api/studyService';
import { ScheduleFrequency, DurationUnit } from '../types/schedule';
import { ToastContainer, useToast } from '../components/ui/Toast';
import TimePickerCustom from '../components/study/TimePickerCustom';
import DatePickerCustom from '../components/study/DatePickerCustom';
import DurationSelector from '../components/study/DurationSelector';
import GenerationSelector from '../components/study/GenerationSelector';
import PreviewModal from '../components/study/PreviewModal';
import { useDebouncedCallback } from '../hooks/useDebounce';
import { useApiError } from '../hooks/useApiError';
import { SectionType as DetailPageSectionType } from '../api/studyDetailPageService';
import SectionEditForm from '../components/studyDetailPage/editor/SectionEditForm';
import styles from './StudyProposalPageV2.module.css';

const StudyProposalPageV2: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { messages, success, error, warning, removeToast } = useToast();
  const { handleApiError } = useApiError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [similarStudies, setSimilarStudies] = useState<Study[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isSearchingStudies, setIsSearchingStudies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasRedirected, setHasRedirected] = useState(false);

  // Section data states
  const [sectionData, setSectionData] = useState<{
    [key: string]: any;
  }>({
    [DetailPageSectionType.HERO]: {},
    [DetailPageSectionType.LEADER_INTRO]: {},
    [DetailPageSectionType.HOW_WE_ROLL]: {}
  });
  const [currentEditingSection, setCurrentEditingSection] = useState<DetailPageSectionType | null>(null);
  
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
    welcomeMessage: '',  // 스터디 리더 환영 메시지 추가
    // description 제거: 상세 콘텐츠는 DetailPage 섹션으로 대체
    generation: 1,
    selectedDate: '',
    daysOfWeek: [] as number[],
    startTime: '',
    endTime: '',
    duration: 8,
    durationUnit: 'WEEKS' as 'WEEKS' | 'MONTHS',
    capacity: null as number | null,
    recruitDeadline: '',
    recruitDeadlineTime: '',
    startDate: '',
    endDate: '',
    costType: 'FREE' as CostType,
    costDescription: '',
    cost: null as number | null,  // 스터디 비용 추가
    location: '',  // 스터디 장소 추가
  });

  // Validation functions
  const validateTitle = (title: string): string | null => {
    if (!title.trim()) return '스터디 이름은 필수입니다.';
    if (title.length > 255) return '스터디 이름은 255자 이내로 입력해주세요.';
    if (title.length < 2) return '스터디 이름은 2자 이상 입력해주세요.';
    return null;
  };

  const validateTagline = (tagline: string): string | null => {
    if (tagline && tagline.length > 200) return '한 줄 소개는 200자 이내로 입력해주세요.';
    return null;
  };

  const validateWelcomeMessage = (welcomeMessage: string): string | null => {
    if (!welcomeMessage.trim()) return '환영 메시지는 필수입니다.';
    if (welcomeMessage.length > 100) return '환영 메시지는 100자 이내로 입력해주세요.';
    if (welcomeMessage.length < 5) return '환영 메시지는 5자 이상 입력해주세요.';
    return null;
  };

  const validateLocation = (location: string): string | null => {
    if (location && location.length > 200) return '장소는 200자 이내로 입력해주세요.';
    return null;
  };

  // 스터디 이름에서 기수 정보 제거하여 기본 이름 추출
  const getBaseStudyName = (title: string): string => {
    // "테코테코 3기" → "테코테코"
    // "TecoTeco 2nd" → "TecoTeco"
    return title
      .replace(/\s*\d+기\s*$/, '')
      .replace(/\s*\d+(st|nd|rd|th)\s*$/i, '')
      .trim();
  };

  // 이전 기수 가져오기 다이얼로그 열기
  const openImportDialog = async () => {
    setShowImportDialog(true);
    setSearchQuery('');
    setSimilarStudies([]);
    
    // 모든 스터디 미리 로드
    setIsSearchingStudies(true);
    try {
      const allStudies = await studyService.getAllStudies();
      // 기수 역순 정렬 (최신 기수가 먼저)
      allStudies.sort((a, b) => b.generation - a.generation);
      setSimilarStudies(allStudies);
    } catch (err) {
      console.error('Failed to load studies:', err);
      error('스터디 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsSearchingStudies(false);
    }
  };

  // 스터디 검색 (다이얼로그 내부)
  const handleSearchInDialog = useDebouncedCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.length === 0) {
      // 검색어가 없으면 모든 스터디 표시
      setIsSearchingStudies(true);
      try {
        const allStudies = await studyService.getAllStudies();
        allStudies.sort((a, b) => b.generation - a.generation);
        setSimilarStudies(allStudies);
      } catch (err) {
        console.error('Failed to load studies:', err);
      } finally {
        setIsSearchingStudies(false);
      }
      return;
    }

    setIsSearchingStudies(true);
    try {
      const allStudies = await studyService.getAllStudies();
      
      // 제목 기반으로 유사 스터디 필터링
      const searchTerm = query.toLowerCase();
      
      const filtered = allStudies.filter(study => {
        const studyName = study.name.toLowerCase();
        const studyBaseName = getBaseStudyName(study.name).toLowerCase();
        // 이름이나 태그라인에서 검색
        return studyName.includes(searchTerm) || 
               studyBaseName.includes(searchTerm) ||
               (study.tagline && study.tagline.toLowerCase().includes(searchTerm));
      });

      // 기수 역순 정렬 (최신 기수가 먼저)
      filtered.sort((a, b) => b.generation - a.generation);
      
      setSimilarStudies(filtered);
    } catch (err) {
      console.error('Failed to search studies:', err);
    } finally {
      setIsSearchingStudies(false);
    }
  }, 500);

  // 선택한 스터디에서 데이터 가져오기
  const importFromStudy = async (study: Study) => {
    // 스터디 상세 정보 가져오기
    try {
      const detailedStudy = await studyService.getStudyById(study.id);
      if (!detailedStudy) {
        warning('스터디 정보를 가져올 수 없습니다.');
        return;
      }

      // 기본 정보 복사 (날짜 관련 필드는 제외)
      setFormData(prev => ({
        ...prev,
        // 제목은 유지 (사용자가 입력한 대로)
        title: prev.title,
        // 기수는 다음 기수로 자동 설정
        generation: detailedStudy.generation + 1,
        // 나머지 정보는 그대로 복사
        type: detailedStudy.type === 'participatory' ? 'PARTICIPATORY' : 
              detailedStudy.type === 'educational' ? 'EDUCATIONAL' : 'PARTICIPATORY',
        recurrenceType: detailedStudy.recurrenceType || 'WEEKLY',
        tagline: detailedStudy.tagline || '',
        welcomeMessage: detailedStudy.leader?.welcomeMessage || '',
        location: detailedStudy.location || '',
        capacity: detailedStudy.capacity || 20,
        costType: detailedStudy.costType || 'FREE',
        costDescription: detailedStudy.costDescription || '',
        // 기간 정보는 기본값 유지 (number 타입)
        duration: prev.duration,
        durationUnit: prev.durationUnit,
        // 날짜는 비워둠 (새로 설정해야 함)
        selectedDate: '',
        startDate: '',
        endDate: '',
        recruitDeadline: '',
        recruitDeadlineTime: '',
        // 시간 정보 파싱 (duration 필드에서 추출)
        startTime: detailedStudy.duration?.includes('-') ? 
                   detailedStudy.duration.split('-')[0] : '',
        endTime: detailedStudy.duration?.includes('-') ? 
                 detailedStudy.duration.split('-')[1] : '',
      }));

      // 요일 정보 파싱 (schedule에서 추출)
      if (detailedStudy.schedule && detailedStudy.schedule.includes('매주')) {
        const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
        const daysOfWeek: number[] = [];
        dayNames.forEach((day, index) => {
          if (detailedStudy.schedule.includes(day)) {
            daysOfWeek.push(index);
          }
        });
        setFormData(prev => ({ ...prev, daysOfWeek }));
      }

      // TODO: 이전 기수의 상세 페이지 섹션 데이터도 가져오기
      // 현재는 기본 정보만 가져오고, 나중에 상세 페이지 API 연동 시 섹션 데이터도 가져올 수 있음
      
      success(`${detailedStudy.name}의 정보를 가져왔습니다. 날짜는 새로 설정해주세요.`);
      setShowImportDialog(false);
    } catch (err) {
      console.error('Failed to import study data:', err);
      error('스터디 정보를 가져오는데 실패했습니다.');
    }
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

  const validateSections = (): string | null => {
    // LEADER_INTRO 필수 검증 - name만 필수, introduction은 선택사항
    const leaderIntroData = sectionData[DetailPageSectionType.LEADER_INTRO];
    if (!leaderIntroData?.name) {
      return '리더 소개 섹션에서 이름을 입력해주세요.';
    }

    // HOW_WE_ROLL 필수 검증 - HowWeRollData 구조에 맞게 수정
    const howWeRollData = sectionData[DetailPageSectionType.HOW_WE_ROLL];
    if (!howWeRollData?.meetingOverview || howWeRollData.meetingOverview.length === 0) {
      if (!howWeRollData?.schedule || howWeRollData.schedule.length === 0) {
        return '스터디 규칙 섹션에서 미팅 개요 또는 일정을 최소 하나 입력해주세요.';
      }
    }

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

  const debouncedWelcomeMessageValidation = useDebouncedCallback((value: string) => {
    const error = validateWelcomeMessage(value);
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
      // 자동 검색 제거 - 버튼으로 명시적 호출
    } else if (field === 'tagline') {
      debouncedTaglineValidation(value);
    } else if (field === 'welcomeMessage') {
      debouncedWelcomeMessageValidation(value);
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
        // 첫 번째 단계: 제목과 환영 메시지 검증
        const titleError = validateTitle(formData.title);
        const welcomeMessageError = validateWelcomeMessage(formData.welcomeMessage);

        if (titleError) {
          error(titleError);
          return false;
        }
        if (welcomeMessageError) {
          error(welcomeMessageError);
          return false;
        }
        return true;
      case 1:
        if (formData.recurrenceType === 'ONE_TIME') {
          return formData.selectedDate !== '' && formData.startTime !== '' && formData.endTime !== '';
        }
        return formData.daysOfWeek.length > 0 && formData.startTime !== '' && formData.endTime !== '';
      case 2:
        // 섹션 정보 검증
        const sectionError = validateSections();
        if (sectionError) {
          error(sectionError);
          return false;
        }
        return true;
      case 3:
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

    const welcomeMessageError = validateWelcomeMessage(formData.welcomeMessage);
    if (welcomeMessageError) {
      error(welcomeMessageError);
      return;
    }

    const locationError = validateLocation(formData.location);
    if (locationError) {
      error(locationError);
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
    if (formData.capacity !== null && formData.capacity !== undefined) {
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

      // 섹션 데이터를 detailPage 형태로 변환
      const detailPageSections: SectionRequest[] = [];
      
      // HERO 섹션 추가 (데이터가 있는 경우만)
      if (sectionData[DetailPageSectionType.HERO] && Object.keys(sectionData[DetailPageSectionType.HERO]).length > 0) {
        detailPageSections.push({
          type: DetailPageSectionType.HERO,
          order: 100,
          data: sectionData[DetailPageSectionType.HERO], // SectionEditForm에서 저장한 데이터를 data 필드에 저장
          props: sectionData[DetailPageSectionType.HERO] // 호환성을 위해 props에도 저장
        });
      }
      
      // LEADER_INTRO 섹션 추가 (필수)
      if (sectionData[DetailPageSectionType.LEADER_INTRO]) {
        detailPageSections.push({
          type: DetailPageSectionType.LEADER_INTRO,
          order: 200,
          data: sectionData[DetailPageSectionType.LEADER_INTRO], // SectionEditForm에서 저장한 데이터를 data 필드에 저장
          props: sectionData[DetailPageSectionType.LEADER_INTRO] // 호환성을 위해 props에도 저장
        });
      }
      
      // HOW_WE_ROLL 섹션 추가 (필수)
      if (sectionData[DetailPageSectionType.HOW_WE_ROLL]) {
        detailPageSections.push({
          type: DetailPageSectionType.HOW_WE_ROLL,
          order: 300,
          data: sectionData[DetailPageSectionType.HOW_WE_ROLL], // SectionEditForm에서 저장한 데이터를 data 필드에 저장
          props: sectionData[DetailPageSectionType.HOW_WE_ROLL] // 호환성을 위해 props에도 저장
        });
      }

      const proposalRequest: StudyProposalRequest = {
        title: formData.title.trim(),
        proposerId: user.id || user.username || user.email,
        type: formData.type as StudyType,
        generation: formData.generation,
        tagline: formData.tagline || undefined,
        welcomeMessage: formData.welcomeMessage.trim(),
        schedule: scheduleString,
        duration: durationString,
        location: formData.location || undefined,
        capacity: formData.capacity || undefined,
        recruitDeadline: recruitDeadlineDateTime,
        startDate: finalStartDate || undefined,
        endDate: finalEndDate || undefined,
        recurrenceType: formData.recurrenceType,
        costType: formData.costType,
        costDescription: formData.costDescription || undefined,
        cost: formData.cost || undefined,
        // 섹션 데이터 포함
        detailPage: detailPageSections.length > 0 ? {
          sections: detailPageSections
        } : undefined
      };

      await studyService.proposeStudy(proposalRequest);
      
      success('스터디 제안이 성공적으로 제출되었습니다! 관리자 검토 후 연락드리겠습니다.');
      setTimeout(() => navigate('/study'), 2000);
    } catch (err: any) {
      // 401 에러는 handleApiError가 자동으로 처리 (세션 만료 메시지 + 로그인 리다이렉트)
      if (err.response?.status === 401) {
        handleApiError(err);
        return;
      }
      
      // 특정 상태 코드는 커스텀 메시지로 처리
      if (err.response?.status === 409) {
        error('이미 동일한 제목의 스터디를 제안하셨습니다.');
      } else if (err.response?.status === 422) {
        const message = err.response?.data?.message || '입력값을 확인해주세요.';
        error(`검증 실패: ${message}`);
      } else if (err.response?.status === 400) {
        const message = err.response?.data?.message || '잘못된 요청입니다.';
        error(`입력값 오류: ${message}`);
      } else {
        // 기타 에러는 handleApiError로 처리
        handleApiError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: '기본 정보', icon: '📝' },
    { title: '일정 설정', icon: '📅' },
    { title: '섹션 정보', icon: '📄' },
    { title: '모집 정보', icon: '👥' },
  ];

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  // 페이지 진입 시 로그인 체크
  useEffect(() => {
    // 로딩 중이거나 이미 리다이렉트했으면 대기
    if (authLoading || hasRedirected) return;

    // 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
    if (!user) {
      setHasRedirected(true);
      // 즉시 리다이렉트 (메시지는 렌더링에서 처리)
      navigate('/login', { state: { from: '/study/propose' } });
    }

    // cleanup 함수는 이제 필요 없음
  }, [user, authLoading, navigate, hasRedirected]);

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
                <div className={styles['input-with-button']}>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="예: React 심화 스터디"
                    className={styles['proposal-input']}
                    maxLength={255}
                  />
                  <button
                    type="button"
                    className={styles['import-button']}
                    onClick={openImportDialog}
                    disabled={false}
                    title="이전 기수 데이터 가져오기"
                  >
                    📋 이전 기수 가져오기
                  </button>
                </div>
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
                  maxLength={200}
                />
                <span className={styles['form-hint']}>
                  상세 소개와 콘텐츠는 스터디 생성 후 관리 페이지에서 편집할 수 있습니다 (최대 200자)
                </span>
              </div>

              <div className={styles['form-group-v2']}>
                <label>환영 메시지 <span className={styles['required']}>*</span></label>
                <textarea
                  value={formData.welcomeMessage}
                  onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                  placeholder="스터디 참여자들을 위한 환영 메시지를 작성해주세요"
                  className={styles['proposal-input']}
                  maxLength={100}
                  rows={2}
                  required
                />
                <span className={styles['form-hint']}>
                  스터디 리더로서 참여자들에게 전하고 싶은 메시지를 작성해주세요 (5-100자)
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
              <div className={styles['section-editor-container']}>
                <h3>스터디 상세 페이지 섹션</h3>
                <p className={styles['section-description']}>
                  스터디 참여자들이 보게 될 상세 페이지의 주요 섹션들을 미리 작성해주세요.
                </p>

                <div className={styles['required-sections']}>
                  {/* HERO 섹션 */}
                  <div className={styles['section-card']}>
                    <div className={styles['section-header']}>
                      <h4>🎯 메인 배너 (선택사항)</h4>
                      <button
                        type="button"
                        className={styles['edit-section-btn']}
                        onClick={() => setCurrentEditingSection(DetailPageSectionType.HERO)}
                      >
                        {Object.keys(sectionData[DetailPageSectionType.HERO]).length > 0 ? '✏️ 수정' : '➕ 추가'}
                      </button>
                    </div>
                    <p className={styles['section-desc']}>스터디의 첫인상을 결정하는 메인 배너를 설정할 수 있습니다.</p>
                    {sectionData[DetailPageSectionType.HERO]?.title && (
                      <div className={styles['section-preview']}>
                        <strong>제목:</strong> {sectionData[DetailPageSectionType.HERO].title}
                      </div>
                    )}
                  </div>

                  {/* LEADER_INTRO 섹션 */}
                  <div className={styles['section-card']}>
                    <div className={styles['section-header']}>
                      <h4>👤 리더 소개 <span className={styles['required-badge']}>*필수</span></h4>
                      <button
                        type="button"
                        className={styles['edit-section-btn']}
                        onClick={() => setCurrentEditingSection(DetailPageSectionType.LEADER_INTRO)}
                      >
                        {sectionData[DetailPageSectionType.LEADER_INTRO]?.name ? '✏️ 수정' : '➕ 작성'}
                      </button>
                    </div>
                    <p className={styles['section-desc']}>스터디 리더 자신을 소개하고 참여자들과 친밀감을 형성하세요.</p>
                    {sectionData[DetailPageSectionType.LEADER_INTRO]?.name && (
                      <div className={styles['section-preview']}>
                        <strong>이름:</strong> {sectionData[DetailPageSectionType.LEADER_INTRO].name}<br/>
                        {sectionData[DetailPageSectionType.LEADER_INTRO].role && (
                          <><strong>역할:</strong> {sectionData[DetailPageSectionType.LEADER_INTRO].role}<br/></>
                        )}
                        {sectionData[DetailPageSectionType.LEADER_INTRO].introduction && (
                          <>
                            <strong>소개:</strong> {typeof sectionData[DetailPageSectionType.LEADER_INTRO].introduction === 'string' 
                              ? sectionData[DetailPageSectionType.LEADER_INTRO].introduction.substring(0, 50) 
                              : '작성됨'}...
                          </>
                        )}
                      </div>
                    )}
                  </div>

                    {/* HOW_WE_ROLL 섹션 */}
                  <div className={styles['section-card']}>
                    <div className={styles['section-header']}>
                      <h4>📋 스터디 규칙 <span className={styles['required-badge']}>*필수</span></h4>
                      <button
                        type="button"
                        className={styles['edit-section-btn']}
                        onClick={() => setCurrentEditingSection(DetailPageSectionType.HOW_WE_ROLL)}
                      >
                        {(sectionData[DetailPageSectionType.HOW_WE_ROLL]?.meetingOverview?.length > 0 || 
                          sectionData[DetailPageSectionType.HOW_WE_ROLL]?.schedule?.length > 0) ? '✏️ 수정' : '➕ 작성'}
                      </button>
                    </div>
                    <p className={styles['section-desc']}>스터디 진행 방식과 참여자들이 지켜야 할 규칙을 명시하세요.</p>
                    {(sectionData[DetailPageSectionType.HOW_WE_ROLL]?.meetingOverview?.length > 0 || 
                      sectionData[DetailPageSectionType.HOW_WE_ROLL]?.schedule?.length > 0) && (
                      <div className={styles['section-preview']}>
                        <strong>
                          {sectionData[DetailPageSectionType.HOW_WE_ROLL]?.meetingOverview?.length > 0 && 
                            `미팅 개요 ${sectionData[DetailPageSectionType.HOW_WE_ROLL].meetingOverview.length}개`}
                          {sectionData[DetailPageSectionType.HOW_WE_ROLL]?.meetingOverview?.length > 0 && 
                           sectionData[DetailPageSectionType.HOW_WE_ROLL]?.schedule?.length > 0 && ', '}
                          {sectionData[DetailPageSectionType.HOW_WE_ROLL]?.schedule?.length > 0 && 
                            `일정 ${sectionData[DetailPageSectionType.HOW_WE_ROLL].schedule.length}개`}
                          {' 작성됨'}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* 섹션 편집 모달 */}
                {currentEditingSection && (
                  <div 
                    className={styles['section-edit-overlay']}
                    onClick={() => setCurrentEditingSection(null)}
                  >
                    <div 
                      className={styles['section-edit-modal']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles['section-edit-content']}>
                        <SectionEditForm
                          sectionType={currentEditingSection}
                          initialData={sectionData[currentEditingSection] || {}}
                          currentUser={user}
                          onSave={(data) => {
                            setSectionData(prev => ({
                              ...prev,
                              [currentEditingSection]: data
                            }));
                            setCurrentEditingSection(null);
                            success('섹션이 저장되었습니다.');
                          }}
                          onCancel={() => setCurrentEditingSection(null)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles['form-step']}>
              <div className={styles['form-group-v2']}>
                <label>모집 인원</label>
                <input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleInputChange('capacity', null);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
                        handleInputChange('capacity', numValue);
                      }
                    }
                  }}
                  className={styles['proposal-input']}
                  min="1"
                  max="100"
                  placeholder="모집 인원을 입력하세요 (1-100명)"
                />
              </div>

              <div className={styles['form-group-v2']}>
                <label>스터디 장소</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="예: 강남역 스터디룸, 온라인, 강남역 인근 카페"
                  className={styles['proposal-input']}
                  maxLength={200}
                />
                <span className={styles['form-hint']}>
                  스터디가 진행될 장소를 입력해주세요 (최대 200자)
                </span>
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
                <>
                  <div className={styles['form-group-v2']}>
                    <label>스터디 비용 {formData.costType === 'PAID' && <span className={styles['required-badge']}>*</span>}</label>
                    <input
                      type="text"
                      value={formData.cost || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 숫자만 허용 (빈 문자열도 허용)
                        if (value === '' || /^\d+$/.test(value)) {
                          handleInputChange('cost', value === '' ? null : parseInt(value));
                        }
                      }}
                      placeholder="비용을 입력하세요 (원)"
                      className={styles['proposal-input']}
                    />
                    <span className={styles['form-hint']}>
                      {formData.costType === 'PAID' 
                        ? '스터디 참가비를 원 단위로 입력해주세요' 
                        : '예상 비용을 원 단위로 입력해주세요 (장소비, 교재비 등)'}
                    </span>
                  </div>
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
                      className={styles['proposal-input']}
                      rows={3}
                      maxLength={500}
                    />
                    <span className={styles['form-hint']}>
                      참가자가 이해하기 쉽게 구체적으로 작성해주세요 (최대 500자)
                    </span>
                  </div>
                </>
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
                  }
                  // validateStep이 false를 반환하면 이미 구체적인 에러 메시지를 표시했음
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
                  }
                  // validateStep이 false를 반환하면 이미 구체적인 에러 메시지를 표시했음
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
        formData={{
          ...formData,
          capacity: formData.capacity || 20
        }}
        sectionData={sectionData}
        isSubmitting={isSubmitting}
      />

      {/* 이전 기수 데이터 가져오기 다이얼로그 */}
      {showImportDialog && (
        <div className={styles['import-dialog-overlay']} onClick={() => setShowImportDialog(false)}>
          <div className={styles['import-dialog']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['import-dialog-header']}>
              <h3>이전 스터디에서 데이터 가져오기</h3>
              <button 
                className={styles['import-dialog-close']}
                onClick={() => setShowImportDialog(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles['import-dialog-content']}>
              <p className={styles['import-dialog-description']}>
                기존 스터디의 정보를 가져와서 빠르게 시작할 수 있어요.
              </p>
              
              {/* 검색 입력창 */}
              <div className={styles['import-search-container']}>
                <input
                  type="text"
                  className={styles['import-search-input']}
                  placeholder="스터디 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInDialog(e.target.value)}
                  autoFocus
                />
                {isSearchingStudies && (
                  <span className={styles['search-loading']}>검색 중...</span>
                )}
              </div>
              
              <div className={styles['similar-studies-list']}>
                {similarStudies.length === 0 ? (
                  <div className={styles['no-studies-message']}>
                    {isSearchingStudies ? '로딩 중...' : 
                     searchQuery ? '검색 결과가 없습니다.' : '등록된 스터디가 없습니다.'}
                  </div>
                ) : (
                  similarStudies.map(study => (
                    <div 
                      key={study.id}
                      className={styles['similar-study-item']}
                      onClick={() => importFromStudy(study)}
                    >
                      <div className={styles['similar-study-info']}>
                        <div className={styles['similar-study-title']}>
                          {study.name} {study.generation > 1 && `(${study.generation}기)`}
                        </div>
                        <div className={styles['similar-study-meta']}>
                          {study.schedule && <span>{study.schedule}</span>}
                          {study.capacity > 0 && <span>정원 {study.capacity}명</span>}
                          {study.costType && <span>{study.costType === 'FREE' ? '무료' : '유료'}</span>}
                        </div>
                        {study.tagline && (
                          <div className={styles['similar-study-tagline']}>
                            {study.tagline}
                          </div>
                        )}
                      </div>
                      <div className={styles['similar-study-action']}>
                        <span className={styles['import-arrow']}>→</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                className={styles['import-dialog-skip']}
                onClick={() => setShowImportDialog(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyProposalPageV2;