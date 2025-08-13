import { Study, RecurrenceType } from '../api/studyService';

// 요일 매핑
const DAY_OF_WEEK_MAP: Record<string, number> = {
  '일요일': 0,
  '월요일': 1,
  '화요일': 2,
  '수요일': 3,
  '목요일': 4,
  '금요일': 5,
  '토요일': 6,
  '일': 0,
  '월': 1,
  '화': 2,
  '수': 3,
  '목': 4,
  '금': 5,
  '토': 6,
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6,
  'sun': 0,
  'mon': 1,
  'tue': 2,
  'wed': 3,
  'thu': 4,
  'fri': 5,
  'sat': 6
};

// 스터디 캘린더 이벤트 타입
export interface StudyCalendarEvent {
  id: string;
  studyId: string;
  studySlug: string;
  studyName: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  eventType: 'regular' | 'special' | 'recruitment' | 'orientation' | 'retrospective';
  studyType: string;
  location?: 'online' | 'offline';
  description: string;
  participantLimit?: number;
  currentParticipants?: number;
  color: {
    primary: string;
    background: string;
    border: string;
    glow: string;
  };
}

// 스터디별 색상 정의
const STUDY_COLORS: Record<string, any> = {
  tecoteco: {
    primary: '#C3E88D',
    background: 'rgba(195, 232, 141, 0.15)',
    border: 'rgba(195, 232, 141, 0.3)',
    glow: 'rgba(195, 232, 141, 0.3)'
  },
  '11routine': {
    primary: '#82AAFF',
    background: 'rgba(130, 170, 255, 0.15)',
    border: 'rgba(130, 170, 255, 0.3)',
    glow: 'rgba(130, 170, 255, 0.3)'
  },
  routine11: {
    primary: '#82AAFF',
    background: 'rgba(130, 170, 255, 0.15)',
    border: 'rgba(130, 170, 255, 0.3)',
    glow: 'rgba(130, 170, 255, 0.3)'
  },
  devlog: {
    primary: '#F78C6C',
    background: 'rgba(247, 140, 108, 0.15)',
    border: 'rgba(247, 140, 108, 0.3)',
    glow: 'rgba(247, 140, 108, 0.3)'
  },
  default: {
    primary: '#C792EA',
    background: 'rgba(199, 146, 234, 0.15)',
    border: 'rgba(199, 146, 234, 0.3)',
    glow: 'rgba(199, 146, 234, 0.3)'
  }
};

// 스케줄 문자열에서 요일 추출
export function parseDayOfWeekFromSchedule(schedule: string | undefined): number | null {
  if (!schedule) return null;
  
  const lowerSchedule = schedule.toLowerCase();
  
  for (const [day, dayNumber] of Object.entries(DAY_OF_WEEK_MAP)) {
    if (lowerSchedule.includes(day)) {
      return dayNumber;
    }
  }
  
  return null;
}

// duration 문자열에서 시간 추출 (예: "19:30-21:30")
export function parseDuration(duration: string | undefined): { start: string; end: string | undefined } {
  if (!duration) return { start: '00:00', end: undefined };
  
  // 다양한 형식 처리
  // "19:30-21:30", "19:30~21:30", "19:30 - 21:30", "7:30PM-9:30PM"
  const timePattern = /(\d{1,2}):?(\d{2})?\s*(?:AM|PM|am|pm)?\s*[-~]\s*(\d{1,2}):?(\d{2})?\s*(?:AM|PM|am|pm)?/;
  const singleTimePattern = /(\d{1,2}):?(\d{2})?\s*(?:AM|PM|am|pm)?/;
  
  const match = duration.match(timePattern);
  if (match) {
    const startHour = match[1].padStart(2, '0');
    const startMin = (match[2] || '00').padStart(2, '0');
    const endHour = match[3].padStart(2, '0');
    const endMin = (match[4] || '00').padStart(2, '0');
    
    return {
      start: `${startHour}:${startMin}`,
      end: `${endHour}:${endMin}`
    };
  }
  
  const singleMatch = duration.match(singleTimePattern);
  if (singleMatch) {
    const hour = singleMatch[1].padStart(2, '0');
    const min = (singleMatch[2] || '00').padStart(2, '0');
    return {
      start: `${hour}:${min}`,
      end: undefined
    };
  }
  
  // 기본값
  return { start: '00:00', end: undefined };
}

// 날짜 배열을 Date 객체로 변환
export function parseDate(dateValue: string | number[] | Date | undefined | null): Date | null {
  if (!dateValue) return null;
  
  // 이미 Date 객체인 경우
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

// 스터디 색상 가져오기
export function getStudyColor(studySlug: string) {
  // slug 정규화
  const normalizedSlug = studySlug.toLowerCase().replace(/[-_\s]/g, '');
  
  // 특정 스터디 매칭
  if (normalizedSlug.includes('tecoteco') || normalizedSlug.includes('테코')) {
    return STUDY_COLORS.tecoteco;
  }
  if (normalizedSlug.includes('11routine') || normalizedSlug.includes('routine11') || normalizedSlug.includes('11루틴')) {
    return STUDY_COLORS.routine11;
  }
  if (normalizedSlug.includes('devlog') || normalizedSlug.includes('데브로그')) {
    return STUDY_COLORS.devlog;
  }
  
  // 기본 색상
  return STUDY_COLORS.default;
}

// 위치 정보 추출 (온라인/오프라인)
export function parseLocation(schedule: string | undefined, description?: string): 'online' | 'offline' | undefined {
  const text = `${schedule || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('온라인') || text.includes('online') || text.includes('zoom') || text.includes('meet')) {
    return 'online';
  }
  if (text.includes('오프라인') || text.includes('offline') || text.includes('대면')) {
    return 'offline';
  }
  
  return undefined;
}

// 다음 날짜 계산 (요일 기준)
export function getNextDateByDayOfWeek(startDate: Date, dayOfWeek: number): Date {
  const date = new Date(startDate);
  const currentDay = date.getDay();
  const daysToAdd = (dayOfWeek - currentDay + 7) % 7 || 7;
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

// 스터디에서 이벤트 생성
export function generateEventsFromStudy(
  study: Study,
  currentYear: number,
  currentMonth: number
): StudyCalendarEvent[] {
  const events: StudyCalendarEvent[] = [];
  const color = getStudyColor(study.slug);
  
  // 스터디 기간 확인
  const studyStartDate = study.startDate ? parseDate(study.startDate) : null;
  const studyEndDate = study.endDate ? parseDate(study.endDate) : null;
  
  // 현재 월의 시작일과 종료일
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  
  // 시간 파싱
  const { start: startTime, end: endTime } = parseDuration(study.duration);
  
  // 위치 파싱
  const location = parseLocation(study.schedule, study.description);
  
  // RecurrenceType에 따른 이벤트 생성
  if (study.recurrenceType === RecurrenceType.WEEKLY) {
    const dayOfWeek = parseDayOfWeekFromSchedule(study.schedule);
    if (dayOfWeek !== null) {
      // 이번 달의 첫 번째 해당 요일 찾기
      let currentDate = new Date(monthStart);
      const daysUntilTarget = (dayOfWeek - currentDate.getDay() + 7) % 7;
      currentDate.setDate(currentDate.getDate() + daysUntilTarget);
      
      // 매주 반복
      let weekCount = 0;
      while (currentDate <= monthEnd) {
        // 스터디 기간 내에 있는지 확인
        if ((!studyStartDate || currentDate >= studyStartDate) &&
            (!studyEndDate || currentDate <= studyEndDate)) {
          events.push({
            id: `${study.id}-week-${weekCount}`,
            studyId: study.id,
            studySlug: study.slug,
            studyName: study.name,
            title: `${study.name} ${study.generation}기`,
            date: currentDate.toISOString().split('T')[0],
            startTime,
            endTime,
            eventType: 'regular',
            studyType: study.slug,
            location,
            description: study.tagline || study.schedule || '정기 모임',
            participantLimit: study.capacity,
            currentParticipants: study.enrolled,
            color
          });
        }
        
        // 다음 주로 이동
        currentDate.setDate(currentDate.getDate() + 7);
        weekCount++;
      }
    }
  } else if (study.recurrenceType === RecurrenceType.BIWEEKLY) {
    const dayOfWeek = parseDayOfWeekFromSchedule(study.schedule);
    if (dayOfWeek !== null) {
      // 이번 달의 첫 번째 해당 요일 찾기
      let currentDate = new Date(monthStart);
      const daysUntilTarget = (dayOfWeek - currentDate.getDay() + 7) % 7;
      currentDate.setDate(currentDate.getDate() + daysUntilTarget);
      
      // 격주 반복
      let weekCount = 0;
      while (currentDate <= monthEnd) {
        // 스터디 기간 내에 있는지 확인
        if ((!studyStartDate || currentDate >= studyStartDate) &&
            (!studyEndDate || currentDate <= studyEndDate)) {
          events.push({
            id: `${study.id}-biweek-${weekCount}`,
            studyId: study.id,
            studySlug: study.slug,
            studyName: study.name,
            title: `${study.name} ${study.generation}기`,
            date: currentDate.toISOString().split('T')[0],
            startTime,
            endTime,
            eventType: 'regular',
            studyType: study.slug,
            location,
            description: study.tagline || study.schedule || '격주 모임',
            participantLimit: study.capacity,
            currentParticipants: study.enrolled,
            color
          });
        }
        
        // 2주 후로 이동
        currentDate.setDate(currentDate.getDate() + 14);
        weekCount++;
      }
    }
  } else if (study.recurrenceType === RecurrenceType.MONTHLY) {
    // 매월 특정 날짜 또는 특정 주차의 요일
    // 예: "매월 첫째 주 금요일" 또는 "매월 15일"
    const dayOfWeek = parseDayOfWeekFromSchedule(study.schedule);
    
    if (dayOfWeek !== null) {
      // 매월 첫째 주 특정 요일로 가정
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const daysUntilTarget = (dayOfWeek - firstDayOfMonth.getDay() + 7) % 7;
      const targetDate = new Date(currentYear, currentMonth, 1 + daysUntilTarget);
      
      if ((!studyStartDate || targetDate >= studyStartDate) &&
          (!studyEndDate || targetDate <= studyEndDate)) {
        events.push({
          id: `${study.id}-monthly`,
          studyId: study.id,
          studySlug: study.slug,
          studyName: study.name,
          title: `${study.name} ${study.generation}기`,
          date: targetDate.toISOString().split('T')[0],
          startTime,
          endTime,
          eventType: 'regular',
          studyType: study.slug,
          location,
          description: study.tagline || study.schedule || '월간 모임',
          participantLimit: study.capacity,
          currentParticipants: study.enrolled,
          color
        });
      }
    }
  } else if (study.recurrenceType === RecurrenceType.DAILY) {
    // 매일 반복 (주말 제외 가능)
    let currentDate = new Date(monthStart);
    let dayCount = 0;
    
    while (currentDate <= monthEnd) {
      // 스터디 기간 내에 있는지 확인
      if ((!studyStartDate || currentDate >= studyStartDate) &&
          (!studyEndDate || currentDate <= studyEndDate)) {
        // 주말 제외 옵션 (schedule에 "평일"이 포함된 경우)
        const isWeekday = currentDate.getDay() !== 0 && currentDate.getDay() !== 6;
        const shouldInclude = !study.schedule?.includes('평일') || isWeekday;
        
        if (shouldInclude) {
          events.push({
            id: `${study.id}-daily-${dayCount}`,
            studyId: study.id,
            studySlug: study.slug,
            studyName: study.name,
            title: `${study.name} ${study.generation}기`,
            date: currentDate.toISOString().split('T')[0],
            startTime,
            endTime,
            eventType: 'regular',
            studyType: study.slug,
            location,
            description: study.tagline || study.schedule || '일일 모임',
            participantLimit: study.capacity,
            currentParticipants: study.enrolled,
            color
          });
          dayCount++;
        }
      }
      
      // 다음 날로 이동
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (study.recurrenceType === RecurrenceType.ONE_TIME) {
    // 단발성 이벤트
    if (studyStartDate) {
      const eventDate = new Date(studyStartDate);
      if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
        events.push({
          id: `${study.id}-onetime`,
          studyId: study.id,
          studySlug: study.slug,
          studyName: study.name,
          title: `${study.name} ${study.generation}기`,
          date: eventDate.toISOString().split('T')[0],
          startTime,
          endTime,
          eventType: 'special',
          studyType: study.slug,
          location,
          description: study.tagline || study.schedule || '특별 세션',
          participantLimit: study.capacity,
          currentParticipants: study.enrolled,
          color
        });
      }
    }
  }
  
  // 모집 마감일 이벤트 추가
  if (study.status === 'APPROVED' && study.deadline) {
    const deadline = parseDate(study.deadline);
    if (deadline && deadline.getMonth() === currentMonth && deadline.getFullYear() === currentYear) {
      events.push({
        id: `${study.id}-recruitment`,
        studyId: study.id,
        studySlug: study.slug,
        studyName: study.name,
        title: `${study.name} 모집 마감`,
        date: deadline.toISOString().split('T')[0],
        startTime: '23:59',
        eventType: 'recruitment',
        studyType: study.slug,
        description: `${study.name} ${study.generation}기 모집이 마감됩니다.`,
        color: {
          primary: '#FF5370',
          background: 'rgba(255, 83, 112, 0.15)',
          border: 'rgba(255, 83, 112, 0.3)',
          glow: 'rgba(255, 83, 112, 0.3)'
        }
      });
    }
  }
  
  return events;
}