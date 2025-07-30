import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { STUDY_LIST, StudyInfo } from '../../../constants/studies';
import './StudyCalendar.css';

// 개선된 이벤트 타입
interface StudyCalendarEvent {
  id: string;
  studyId: number;
  studySlug: string;
  studyName: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  eventType: 'regular' | 'special' | 'recruitment' | 'orientation' | 'retrospective';
  studyType: 'tecoteco' | 'routine11' | 'devlog';
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

type ViewMode = 'modern' | 'timeline';

const StudyCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('modern');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<StudyCalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 스터디 데이터 기반 이벤트 생성
  const generateEventsFromStudies = (): StudyCalendarEvent[] => {
    const events: StudyCalendarEvent[] = [];
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    STUDY_LIST.forEach(study => {
      // 스터디별 색상 정의
      const colors = {
        tecoteco: {
          primary: '#C3E88D',
          background: 'rgba(195, 232, 141, 0.15)',
          border: 'rgba(195, 232, 141, 0.3)',
          glow: 'rgba(195, 232, 141, 0.3)'
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
        }
      };

      const studyType = study.slug === '11routine' ? 'routine11' : study.slug as 'tecoteco' | 'routine11' | 'devlog';
      const studyColor = colors[studyType] || colors.tecoteco;

      // 테코테코 - 매주 금요일
      if (study.slug === 'tecoteco') {
        // 첫 번째 금요일 찾기
        const firstFriday = new Date(currentYear, currentMonth, 1);
        const daysUntilFriday = (5 - firstFriday.getDay() + 7) % 7;
        firstFriday.setDate(firstFriday.getDate() + daysUntilFriday);
        
        // 매주 금요일 추가
        for (let week = 0; week < 5; week++) {
          const friday = new Date(firstFriday);
          friday.setDate(firstFriday.getDate() + week * 7);
          
          if (friday.getMonth() === currentMonth) {
            events.push({
              id: `${study.slug}-${week}`,
              studyId: study.id,
              studySlug: study.slug,
              studyName: study.name,
              title: `${study.name} ${study.generation}기`,
              date: friday.toISOString().split('T')[0],
              startTime: '19:30',
              endTime: '21:30',
              eventType: 'regular',
              studyType: 'tecoteco',
              location: 'offline',
              description: '주간 알고리즘 스터디 모임',
              participantLimit: study.capacity,
              currentParticipants: study.enrolled,
              color: studyColor
            });
          }
        }
      }

      // 11루틴 - 매주 수요일
      if (study.slug === '11routine') {
        // 첫 번째 수요일 찾기
        const firstWednesday = new Date(currentYear, currentMonth, 1);
        const daysUntilWednesday = (3 - firstWednesday.getDay() + 7) % 7;
        firstWednesday.setDate(firstWednesday.getDate() + daysUntilWednesday);
        
        // 매주 수요일 추가
        for (let week = 0; week < 5; week++) {
          const wednesday = new Date(firstWednesday);
          wednesday.setDate(firstWednesday.getDate() + week * 7);
          
          if (wednesday.getMonth() === currentMonth) {
            events.push({
              id: `${study.slug}-${week}`,
              studyId: study.id,
              studySlug: study.slug,
              studyName: study.name,
              title: `${study.name} ${study.generation}기`,
              date: wednesday.toISOString().split('T')[0],
              startTime: '23:00',
              endTime: '24:00',
              eventType: 'regular',
              studyType: 'routine11',
              location: 'online',
              description: '온라인 모각코 세션',
              participantLimit: study.capacity,
              currentParticipants: study.enrolled,
              color: studyColor
            });
          }
        }
      }

      // 데브로그 - 격주 토요일
      if (study.slug === 'devlog') {
        // 첫 번째 토요일 찾기
        const firstSaturday = new Date(currentYear, currentMonth, 1);
        const daysUntilSaturday = (6 - firstSaturday.getDay() + 7) % 7;
        firstSaturday.setDate(firstSaturday.getDate() + daysUntilSaturday);
        
        // 격주로 토요일 추가
        for (let week = 0; week < 3; week++) {
          const saturday = new Date(firstSaturday);
          saturday.setDate(firstSaturday.getDate() + week * 14);
          
          if (saturday.getMonth() === currentMonth) {
            events.push({
              id: `${study.slug}-${week}`,
              studyId: study.id,
              studySlug: study.slug,
              studyName: study.name,
              title: `${study.name} ${study.generation}기`,
              date: saturday.toISOString().split('T')[0],
              startTime: '14:00',
              endTime: '16:00',
              eventType: 'regular',
              studyType: 'devlog',
              location: 'offline',
              description: '기술 블로그 작성 및 리뷰',
              participantLimit: study.capacity,
              currentParticipants: study.enrolled,
              color: studyColor
            });
          }
        }
      }

      // 모집 마감일 이벤트
      if (study.status === 'recruiting' && study.deadline) {
        const deadline = new Date(study.deadline);
        if (deadline.getMonth() === currentMonth && deadline.getFullYear() === currentYear) {
          events.push({
            id: `recruit-${study.slug}`,
            studyId: study.id,
            studySlug: study.slug,
            studyName: study.name,
            title: `${study.name} 모집 마감`,
            date: deadline.toISOString().split('T')[0],
            startTime: '23:59',
            eventType: 'recruitment',
            studyType: studyType,
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
    });

    // 월말 회고 이벤트 추가
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    if (lastDay.getDay() === 5) { // 마지막 날이 금요일이면
      events.push({
        id: 'retrospective-monthly',
        studyId: 0,
        studySlug: 'all',
        studyName: 'AsyncSite',
        title: '월간 회고',
        date: lastDay.toISOString().split('T')[0],
        startTime: '20:00',
        endTime: '21:00',
        eventType: 'retrospective',
        studyType: 'tecoteco',
        location: 'online',
        description: '이번 달 활동 회고 및 다음 달 계획',
        color: {
          primary: '#C792EA',
          background: 'rgba(199, 146, 234, 0.15)',
          border: 'rgba(199, 146, 234, 0.3)',
          glow: 'rgba(199, 146, 234, 0.3)'
        }
      });
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // 이벤트 생성 최적화 - 월과 연도가 변경될 때만 재계산
  const events = useMemo(() => generateEventsFromStudies(), [currentDate.getMonth(), currentDate.getFullYear()]);
  
  // 툴팁 관련 핸들러
  const handleEventHover = useCallback((event: StudyCalendarEvent | null, e?: React.MouseEvent) => {
    setHoveredEvent(event);
    if (event && e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  }, []);
  
  // 오늘로 이동하는 함수
  const handleTodayClick = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    // 부드러운 스크롤 애니메이션
    setTimeout(() => {
      const todayElement = document.querySelector('.sc-day-cell--today');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // 달력 생성 로직 - 월과 연도가 변경될 때만 재계산
  const generateCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      days.push(cellDate);
    }
    return days;
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  // 해당 날짜의 이벤트 가져오기
  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const matchesDate = event.date === dateStr;
      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'recruitment' && event.eventType === 'recruitment') ||
        (selectedFilter === 'retrospective' && event.eventType === 'retrospective') ||
        (selectedFilter === event.studyType);
      return matchesDate && matchesFilter;
    });
  }, [events, selectedFilter]);

  // 필터링된 이벤트 가져오기
  const getFilteredEvents = useCallback(() => {
    if (selectedFilter === 'all') return events;
    if (selectedFilter === 'recruitment') return events.filter(e => e.eventType === 'recruitment');
    if (selectedFilter === 'retrospective') return events.filter(e => e.eventType === 'retrospective');
    return events.filter(e => e.studyType === selectedFilter);
  }, [events, selectedFilter]);

  // 월 변경
  const changeMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const today = new Date();
  const calendarDays = generateCalendarDays;
  const filteredEvents = useMemo(() => getFilteredEvents(), [events, selectedFilter]);

  // 뷰 전환 애니메이션
  const handleViewTransition = (newView: ViewMode) => {
    if (newView === viewMode) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode(newView);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  return (
    <div className="sc-calendar-wrapper">
      {/* 상단 컨트롤 영역 */}
      <div className="sc-controls-wrapper">
        {/* 뷰 모드 토글 */}
        <div className="sc-view-toggle">
          <button 
            className={`sc-toggle-btn ${viewMode === 'modern' ? 'sc-toggle-btn--active' : ''}`}
            onClick={() => handleViewTransition('modern')}
          >
            캘린더 뷰
          </button>
          <button 
            className={`sc-toggle-btn ${viewMode === 'timeline' ? 'sc-toggle-btn--active' : ''}`}
            onClick={() => handleViewTransition('timeline')}
          >
            타임라인 뷰
          </button>
        </div>
        
        {/* 오늘로 이동 버튼 */}
        <button 
          className="sc-today-btn"
          onClick={handleTodayClick}
          title="오늘로 이동"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          오늘
        </button>
      </div>

      {/* 필터 버튼 */}
      <div className="sc-filter-group">
        <button 
          className={`sc-filter-btn sc-filter-btn--all ${selectedFilter === 'all' ? 'sc-filter-btn--active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          전체
        </button>
        <button 
          className={`sc-filter-btn sc-filter-btn--tecoteco ${selectedFilter === 'tecoteco' ? 'sc-filter-btn--active' : ''}`}
          onClick={() => setSelectedFilter('tecoteco')}
        >
          테코테코
        </button>
        <button 
          className={`sc-filter-btn sc-filter-btn--routine11 ${selectedFilter === 'routine11' ? 'sc-filter-btn--active' : ''}`}
          onClick={() => setSelectedFilter('routine11')}
        >
          11루틴
        </button>
        <button 
          className={`sc-filter-btn sc-filter-btn--devlog ${selectedFilter === 'devlog' ? 'sc-filter-btn--active' : ''}`}
          onClick={() => setSelectedFilter('devlog')}
        >
          데브로그
        </button>
        <button 
          className={`sc-filter-btn sc-filter-btn--special ${selectedFilter === 'recruitment' ? 'sc-filter-btn--active' : ''}`}
          onClick={() => setSelectedFilter('recruitment')}
        >
          모집
        </button>
        <button 
          className={`sc-filter-btn sc-filter-btn--retrospective ${selectedFilter === 'retrospective' ? 'sc-filter-btn--active' : ''}`}
          onClick={() => setSelectedFilter('retrospective')}
        >
          회고
        </button>
      </div>

      {/* 달력 컨텐츠 */}
      <div className={`sc-calendar-content ${isTransitioning ? 'sc-calendar-content--transitioning' : ''}`}>
        {viewMode === 'modern' ? (
          // 모던 캘린더 뷰
          <div className="sc-modern-calendar">
            <div className="sc-calendar-header">
              <button className="sc-nav-btn sc-nav-btn--prev" onClick={() => changeMonth(-1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h3 className="sc-calendar-title">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </h3>
              <button className="sc-nav-btn sc-nav-btn--next" onClick={() => changeMonth(1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="sc-calendar-grid">
              <div className="sc-weekdays">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="sc-weekday">{day}</div>
                ))}
              </div>
              
              <div className="sc-days-grid">
                {calendarDays.map((day, index) => {
                  const isToday = day.toDateString() === today.toDateString();
                  const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                  const dayEvents = getEventsForDate(day);

                  return (
                    <div 
                      key={index}
                      className={`sc-day-cell ${isToday ? 'sc-day-cell--today' : ''} ${isOtherMonth ? 'sc-day-cell--other-month' : ''}`}
                    >
                      <div className="sc-day-number">{day.getDate()}</div>
                      <div className="sc-day-events">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div 
                            key={event.id} 
                            className={`sc-event sc-event--${event.eventType}`}
                            style={{
                              backgroundColor: event.color.background,
                              borderLeft: `3px solid ${event.color.primary}`,
                              color: event.color.primary
                            }}
                            onMouseEnter={(e) => handleEventHover(event, e)}
                            onMouseLeave={() => handleEventHover(null)}
                          >
                            <span className="sc-event-time">{event.startTime}</span>
                            <span className="sc-event-title">{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="sc-more-events">+{dayEvents.length - 3}개 더보기</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // 타임라인 뷰
          <div className="sc-timeline-calendar">
            <div className="sc-timeline-sidebar">
              <div className="sc-mini-calendar">
                <div className="sc-mini-calendar-header">
                  <button className="sc-mini-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                  <div className="sc-mini-month">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                  </div>
                  <button className="sc-mini-nav-btn" onClick={() => changeMonth(1)}>›</button>
                </div>
                
                <div className="sc-mini-calendar-grid" onClick={() => handleViewTransition('modern')}>
                  <div className="sc-mini-weekdays">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div key={day} className="sc-mini-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="sc-mini-days-grid">
                    {calendarDays.map((day, index) => {
                      const isToday = day.toDateString() === today.toDateString();
                      const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                      const hasEvent = getEventsForDate(day).length > 0;

                      return (
                        <div 
                          key={index}
                          className={`sc-mini-day ${isToday ? 'sc-mini-day--today' : ''} ${isOtherMonth ? 'sc-mini-day--other-month' : ''} ${hasEvent ? 'sc-mini-day--has-event' : ''}`}
                        >
                          {day.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 이벤트 통계 */}
              <div className="sc-event-stats">
                <h4 className="sc-stats-title">이번 달 일정</h4>
                <div className="sc-stat-item">
                  <div className="sc-stat-color" style={{ backgroundColor: '#C3E88D' }}></div>
                  <span className="sc-stat-name">테코테코</span>
                  <span className="sc-stat-count">{events.filter(e => e.studyType === 'tecoteco').length}</span>
                </div>
                <div className="sc-stat-item">
                  <div className="sc-stat-color" style={{ backgroundColor: '#82AAFF' }}></div>
                  <span className="sc-stat-name">11루틴</span>
                  <span className="sc-stat-count">{events.filter(e => e.studyType === 'routine11').length}</span>
                </div>
                <div className="sc-stat-item">
                  <div className="sc-stat-color" style={{ backgroundColor: '#F78C6C' }}></div>
                  <span className="sc-stat-name">데브로그</span>
                  <span className="sc-stat-count">{events.filter(e => e.studyType === 'devlog').length}</span>
                </div>
              </div>
            </div>

            <div className="sc-timeline-main">
              <div className="sc-timeline">
                {filteredEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  });

                  return (
                    <div 
                      key={event.id} 
                      className={`sc-timeline-item sc-timeline-item--${event.eventType}`}
                      style={{
                        borderLeftColor: event.color.primary,
                        boxShadow: `0 0 20px ${event.color.glow}`
                      }}
                      onMouseEnter={(e) => handleEventHover(event, e)}
                      onMouseLeave={() => handleEventHover(null)}
                    >
                      <div className="sc-timeline-dot" style={{ backgroundColor: event.color.primary }}></div>
                      <div className="sc-timeline-content">
                        <div className="sc-timeline-date">{formattedDate}</div>
                        <div className="sc-timeline-time">{event.startTime} {event.endTime && `- ${event.endTime}`}</div>
                        <div className="sc-timeline-title">{event.title}</div>
                        <div className="sc-timeline-description">{event.description}</div>
                        {event.location && (
                          <div className="sc-timeline-location">
                            {event.location === 'online' ? '🌐 온라인' : '📍 오프라인'}
                          </div>
                        )}
                        {event.currentParticipants && (
                          <div className="sc-timeline-participants">
                            👥 {event.currentParticipants}/{event.participantLimit}명
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 이벤트 상세 정보 툴팁 */}
      {hoveredEvent && (
        <div 
          className="sc-event-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="sc-tooltip-header">
            <h4>{hoveredEvent.title}</h4>
            <span className={`sc-tooltip-badge sc-tooltip-badge--${hoveredEvent.eventType}`}>
              {hoveredEvent.eventType === 'regular' ? '정기 모임' :
               hoveredEvent.eventType === 'special' ? '특별 이벤트' :
               hoveredEvent.eventType === 'recruitment' ? '모집' :
               hoveredEvent.eventType === 'orientation' ? '오리엔테이션' : '회고'}
            </span>
          </div>
          <div className="sc-tooltip-content">
            <div className="sc-tooltip-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {new Date(hoveredEvent.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
            <div className="sc-tooltip-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {hoveredEvent.startTime} {hoveredEvent.endTime && `- ${hoveredEvent.endTime}`}
            </div>
            {hoveredEvent.location && (
              <div className="sc-tooltip-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {hoveredEvent.location === 'online' ? '온라인' : '오프라인'}
              </div>
            )}
            <div className="sc-tooltip-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {hoveredEvent.description}
            </div>
            {hoveredEvent.participantLimit && (
              <div className="sc-tooltip-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="15" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {hoveredEvent.currentParticipants}/{hoveredEvent.participantLimit}명 참여
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyCalendar;