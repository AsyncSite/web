import React, { useState, useMemo, useCallback } from 'react';
import { Study } from '../../../api/studyService';
import { generateEventsFromStudy, StudyCalendarEvent } from '../../../utils/studyScheduleUtils';
import styles from './StudyCalendar.module.css';

type ViewMode = 'modern' | 'timeline';

interface StudyCalendarProps {
  studies?: Study[];
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({ studies = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('modern');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<StudyCalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [modalEvents, setModalEvents] = useState<StudyCalendarEvent[] | null>(null);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  // 스터디 데이터 기반 이벤트 생성
  const events = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const allEvents: StudyCalendarEvent[] = [];

    // 각 스터디에서 이벤트 생성
    studies.forEach(study => {
      const studyEvents = generateEventsFromStudy(study, currentYear, currentMonth);
      allEvents.push(...studyEvents);
    });

    // 정렬
    return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [studies, currentDate.getMonth(), currentDate.getFullYear()]);

  // 툴팁 관련 핸들러 - 항상 위쪽에만 표시
  const handleEventHover = useCallback((event: StudyCalendarEvent | null, e?: React.MouseEvent) => {
    if (event && e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 15
      });
      setHoveredEvent(event);
    } else {
      setHoveredEvent(null);
    }
  }, []);

  // 더보기 모달 열기
  const handleShowMoreEvents = useCallback((events: StudyCalendarEvent[], date: Date) => {
    setModalEvents(events);
    setModalDate(date);
  }, []);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setModalEvents(null);
    setModalDate(null);
  }, []);

  // 오늘로 이동하는 함수
  const handleTodayClick = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    // 부드러운 스크롤 애니메이션
    setTimeout(() => {
      const todayElement = document.querySelector(`.${styles['day-cell--today']}`);
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // 달력 생성 로직
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

  // 고유한 스터디 타입 추출 (필터 버튼용)
  const uniqueStudyTypes = useMemo(() => {
    const types = new Set<string>();
    studies.forEach(study => {
      types.add(study.slug);
    });
    return Array.from(types);
  }, [studies]);

  return (
    <div className={styles['calendar-wrapper']}>
      {/* 상단 컨트롤 영역 */}
      <div className={styles['controls-wrapper']}>
        {/* 뷰 모드 토글 */}
        <div className={styles['view-toggle']}>
          <button 
            className={`${styles['toggle-btn']} ${viewMode === 'modern' ? styles['toggle-btn--active'] : ''}`}
            onClick={() => handleViewTransition('modern')}
          >
            캘린더 뷰
          </button>
          <button 
            className={`${styles['toggle-btn']} ${viewMode === 'timeline' ? styles['toggle-btn--active'] : ''}`}
            onClick={() => handleViewTransition('timeline')}
          >
            타임라인 뷰
          </button>
        </div>
        
        {/* 오늘로 이동 버튼 */}
        <button 
          className={styles['today-btn']}
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
      <div className={styles['filter-group']}>
        <button 
          className={`${styles['filter-btn']} ${styles['filter-btn--all']} ${selectedFilter === 'all' ? styles['filter-btn--active'] : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          전체
        </button>
        {uniqueStudyTypes.map(type => (
          <button 
            key={type}
            className={`${styles['filter-btn']} ${selectedFilter === type ? styles['filter-btn--active'] : ''}`}
            onClick={() => setSelectedFilter(type)}
          >
            {studies.find(s => s.slug === type)?.name || type}
          </button>
        ))}
        <button 
          className={`${styles['filter-btn']} ${styles['filter-btn--special']} ${selectedFilter === 'recruitment' ? styles['filter-btn--active'] : ''}`}
          onClick={() => setSelectedFilter('recruitment')}
        >
          모집
        </button>
      </div>

      {/* 달력 컨텐츠 */}
      <div className={`${styles['calendar-content']} ${isTransitioning ? styles['calendar-content--transitioning'] : ''}`}>
        {viewMode === 'modern' ? (
          // 모던 캘린더 뷰
          <div className={styles['modern-calendar']}>
            <div className={styles['calendar-header']}>
              <button className={`${styles['nav-btn']} ${styles['nav-btn--prev']}`} onClick={() => changeMonth(-1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h3 className={styles['calendar-title']}>
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </h3>
              <button className={`${styles['nav-btn']} ${styles['nav-btn--next']}`} onClick={() => changeMonth(1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={styles['calendar-grid']}>
              <div className={styles['weekdays']}>
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className={styles['weekday']}>{day}</div>
                ))}
              </div>
              
              <div className={styles['days-grid']}>
                {calendarDays.map((day, index) => {
                  const isToday = day.toDateString() === today.toDateString();
                  const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                  const dayEvents = getEventsForDate(day);

                  return (
                    <div 
                      key={index}
                      className={`${styles['day-cell']} ${isToday ? styles['day-cell--today'] : ''} ${isOtherMonth ? styles['day-cell--other-month'] : ''}`}
                    >
                      <div className={styles['day-number']}>{day.getDate()}</div>
                      <div className={styles['day-events']}>
                        {dayEvents.slice(0, 3).map((event) => (
                          <div 
                            key={event.id} 
                            className={`${styles['event']} ${styles[`event--${event.eventType}`]}`}
                            style={{
                              backgroundColor: event.color.background,
                              borderLeft: `3px solid ${event.color.primary}`,
                              color: event.color.primary
                            }}
                            onMouseEnter={(e) => handleEventHover(event, e)}
                            onMouseLeave={() => handleEventHover(null)}
                          >
                            <span className={styles['event-time']}>{event.startTime}</span>
                            <span className={styles['event-title']}>
                              {event.title.length > 8 ? `${event.title.substring(0, 8)}...` : event.title}
                            </span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <button 
                            className={styles['more-events']}
                            onClick={() => handleShowMoreEvents(dayEvents, day)}
                          >
                            +{dayEvents.length - 3}개 더보기
                          </button>
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
          <div className={styles['timeline-calendar']}>
            <div className={styles['timeline-sidebar']}>
              <div className={styles['mini-calendar']}>
                <div className={styles['mini-calendar-header']}>
                  <button className={styles['mini-nav-btn']} onClick={() => changeMonth(-1)}>‹</button>
                  <div className={styles['mini-month']}>
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                  </div>
                  <button className={styles['mini-nav-btn']} onClick={() => changeMonth(1)}>›</button>
                </div>
                
                <div className={styles['mini-calendar-grid']} onClick={() => handleViewTransition('modern')}>
                  <div className={styles['mini-weekdays']}>
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div key={day} className={styles['mini-weekday']}>{day}</div>
                    ))}
                  </div>
                  <div className={styles['mini-days-grid']}>
                    {calendarDays.map((day, index) => {
                      const isToday = day.toDateString() === today.toDateString();
                      const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                      const hasEvent = getEventsForDate(day).length > 0;

                      return (
                        <div 
                          key={index}
                          className={`${styles['mini-day']} ${isToday ? styles['mini-day--today'] : ''} ${isOtherMonth ? styles['mini-day--other-month'] : ''} ${hasEvent ? styles['mini-day--has-event'] : ''}`}
                        >
                          {day.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 이벤트 통계 */}
              <div className={styles['event-stats']}>
                <h4 className={styles['stats-title']}>이번 달 일정</h4>
                {uniqueStudyTypes.map(type => {
                  const study = studies.find(s => s.slug === type);
                  const count = events.filter(e => e.studyType === type).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={type} className={styles['stat-item']}>
                      <div className={styles['stat-color']} style={{ 
                        backgroundColor: study ? study.color.primary : '#C792EA' 
                      }}></div>
                      <span className={styles['stat-name']}>{study?.name || type}</span>
                      <span className={styles['stat-count']}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles['timeline-main']}>
              <div className={styles['timeline']}>
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
                      className={`${styles['timeline-item']} ${styles[`timeline-item--${event.eventType}`]}`}
                      style={{
                        borderLeftColor: event.color.primary,
                        boxShadow: `0 0 20px ${event.color.glow}`
                      }}
                      onMouseEnter={(e) => handleEventHover(event, e)}
                      onMouseLeave={() => handleEventHover(null)}
                    >
                      <div className={styles['timeline-dot']} style={{ backgroundColor: event.color.primary }}></div>
                      <div className={styles['timeline-content']}>
                        <div className={styles['timeline-date']}>{formattedDate}</div>
                        <div className={styles['timeline-time']}>{event.startTime} {event.endTime && `- ${event.endTime}`}</div>
                        <div className={styles['timeline-title']}>{event.title}</div>
                        <div className={styles['timeline-description']}>{event.description}</div>
                        {event.location && (
                          <div className={styles['timeline-location']}>
                            {event.location === 'online' ? '🌐 온라인' : '📍 오프라인'}
                          </div>
                        )}
                        {event.currentParticipants !== undefined && event.participantLimit && (
                          <div className={styles['timeline-participants']}>
                            👥 {event.currentParticipants}/{event.participantLimit}명
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <div className={styles['empty-timeline']}>
                    <p>이번 달에는 일정이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 이벤트 상세 정보 툴팁 */}
      {hoveredEvent && (
        <div
          className={styles['event-tooltip']}
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseEnter={() => setHoveredEvent(hoveredEvent)}
          onMouseLeave={() => setHoveredEvent(null)}
        >
          <div className={styles['tooltip-header']}>
            <h4>{hoveredEvent.title}</h4>
            <span className={`${styles['tooltip-badge']} ${styles[`tooltip-badge--${hoveredEvent.eventType}`]}`}>
              {hoveredEvent.eventType === 'regular' ? '정기 모임' :
               hoveredEvent.eventType === 'special' ? '특별 이벤트' :
               hoveredEvent.eventType === 'recruitment' ? '모집' :
               hoveredEvent.eventType === 'orientation' ? '오리엔테이션' : '회고'}
            </span>
          </div>
          <div className={styles['tooltip-content']}>
            <div className={styles['tooltip-item']}>
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
            <div className={styles['tooltip-item']}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {hoveredEvent.startTime} {hoveredEvent.endTime && `- ${hoveredEvent.endTime}`}
            </div>
            {hoveredEvent.location && (
              <div className={styles['tooltip-item']}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {hoveredEvent.location === 'online' ? '온라인' : '오프라인'}
              </div>
            )}
            <div className={styles['tooltip-item']}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {hoveredEvent.description}
            </div>
            {hoveredEvent.participantLimit && (
              <div className={styles['tooltip-item']}>
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
      
      {/* 더보기 모달 */}
      {modalEvents && modalDate && (
        <>
          <div className={styles['modal-overlay']} onClick={handleCloseModal} />
          <div className={styles['events-modal']}>
            <div className={styles['modal-header']}>
              <h3>
                {modalDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </h3>
              <button 
                className={styles['modal-close']}
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
            <div className={styles['modal-body']}>
              {modalEvents.map((event) => (
                <div 
                  key={event.id}
                  className={`${styles['modal-event']} ${styles[`modal-event--${event.eventType}`]}`}
                  style={{
                    borderLeft: `4px solid ${event.color.primary}`,
                    backgroundColor: event.color.background
                  }}
                >
                  <div className={styles['modal-event-header']}>
                    <h4>{event.title}</h4>
                    <span className={styles['modal-event-time']}>
                      {event.startTime} {event.endTime && `- ${event.endTime}`}
                    </span>
                  </div>
                  <p className={styles['modal-event-description']}>{event.description}</p>
                  {event.location && (
                    <div className={styles['modal-event-location']}>
                      {event.location === 'online' ? '🌐 온라인' : '📍 오프라인'}
                    </div>
                  )}
                  {event.currentParticipants !== undefined && event.participantLimit && (
                    <div className={styles['modal-event-participants']}>
                      👥 {event.currentParticipants}/{event.participantLimit}명
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudyCalendar;