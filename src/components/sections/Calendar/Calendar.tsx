import React, { useState, useEffect } from 'react';
import styles from './Calendar.module.css';

interface CalendarEvent {
  date: string;
  title: string;
  type: 'tecoteco' | 'devlog' | 'resume' | 'retrospective';
  description: string;
}

type ViewMode = 'modern' | 'timeline';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)); // 12월로 설정
  const [viewMode, setViewMode] = useState<ViewMode>('modern');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 샘플 이벤트 데이터 - 현재 달로 설정
  const events: CalendarEvent[] = [
    { date: '2024-12-01', title: '테코테코', type: 'tecoteco', description: '주간 알고리즘 스터디 모임' },
    { date: '2024-12-05', title: '11루틴', type: 'devlog', description: '온라인 모각코 세션' },
    { date: '2024-12-08', title: '테코테코', type: 'tecoteco', description: '코드 리뷰 세션' },
    { date: '2024-12-12', title: 'DEVLOG-14', type: 'devlog', description: '기술 블로그 챌린지' },
    { date: '2024-12-15', title: '테코테코', type: 'tecoteco', description: '프로젝트 발표' },
    { date: '2024-12-18', title: '11루틴', type: 'devlog', description: '온라인 모각코 세션' },
    { date: '2024-12-22', title: '테코테코', type: 'tecoteco', description: '주간 알고리즘 스터디' },
    { date: '2024-12-26', title: 'DEVLOG-14', type: 'devlog', description: '블로그 포스팅 리뷰' },
    { date: '2024-12-29', title: '월간 회고', type: 'retrospective', description: '12월 활동 회고 및 계획' }
  ];

  // 달력 생성 로직
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      days.push(cellDate);
    }
    return days;
  };

  // 해당 날짜의 이벤트 가져오기
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => 
      event.date === dateStr && 
      (selectedFilter === 'all' || selectedFilter === event.type)
    );
  };

  // 필터링된 이벤트 가져오기
  const getFilteredEvents = () => {
    return selectedFilter === 'all' 
      ? events 
      : events.filter(event => event.type === selectedFilter);
  };

  // 월 변경
  const changeMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const today = new Date(2024, 11, 15); // 12월 15일로 설정하여 오늘 표시
  const calendarDays = generateCalendarDays();
  const filteredEvents = getFilteredEvents().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 뷰 전환 애니메이션 함수
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

  // 미니 달력 클릭 핸들러
  const handleMiniCalendarClick = () => {
    handleViewTransition('modern');
  };

  return (
    <section className={`${styles.calendarSection} section-background`} id="calendar">
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>스터디 일정</h2>
          <p className={styles.sectionSubtitle}>함께하는 정기 활동과 일정을 확인하세요</p>
        </div>

        {/* 뷰 모드 토글 */}
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'modern' ? styles.active : ''}`}
            onClick={() => handleViewTransition('modern')}
          >
            캘린더 뷰
          </button>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'timeline' ? styles.active : ''}`}
            onClick={() => handleViewTransition('timeline')}
          >
            타임라인 뷰
          </button>
        </div>

        {/* 필터 버튼 */}
        <div className={styles.calendarFilters}>
          <button 
            className={`${styles.filterBtn} ${styles.all} ${selectedFilter === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            전체
          </button>
          <button 
            className={`${styles.filterBtn} ${styles.tecoteco} ${selectedFilter === 'tecoteco' ? styles.active : ''}`}
            onClick={() => setSelectedFilter('tecoteco')}
          >
            테코테코
          </button>
          <button 
            className={`${styles.filterBtn} ${styles.devlog} ${selectedFilter === 'devlog' ? styles.active : ''}`}
            onClick={() => setSelectedFilter('devlog')}
          >
            모각코 & 블로그
          </button>
          <button 
            className={`${styles.filterBtn} ${styles.retrospective} ${selectedFilter === 'retrospective' ? styles.active : ''}`}
            onClick={() => setSelectedFilter('retrospective')}
          >
            회고
          </button>
        </div>

        {/* 달력 컨텐츠 */}
        <div className={`${styles.calendarContent} ${isTransitioning ? styles.transitioning : ''}`}>
          {viewMode === 'modern' ? (
            // 모던 캘린더 뷰
            <div className={styles.modernCalendar}>
              <div className={styles.calendarHeader}>
                <button className={styles.navBtn} onClick={() => changeMonth(-1)}>‹</button>
                <h3 className={styles.calendarTitle}>
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h3>
                <button className={styles.navBtn} onClick={() => changeMonth(1)}>›</button>
              </div>

              <div className={styles.calendarGrid}>
                <div className={styles.weekdays}>
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className={styles.weekday}>{day}</div>
                  ))}
                </div>
                
                <div className={styles.daysGrid}>
                  {calendarDays.map((day, index) => {
                    const isToday = day.toDateString() === today.toDateString();
                    const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                    const dayEvents = getEventsForDate(day);

                    return (
                      <div 
                        key={index}
                        className={`${styles.dayCell} ${isToday ? styles.today : ''} ${isOtherMonth ? styles.otherMonth : ''}`}
                      >
                        <div className={styles.dayNumber}>{day.getDate()}</div>
                        <div className={styles.dayEvents}>
                          {dayEvents.map((event, eventIndex) => (
                            <div key={eventIndex} className={`${styles.event} ${styles[event.type]}`}>
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // 타임라인 뷰
            <div className={styles.timelineCalendar}>
              <div className={styles.timelineSidebar}>
                <div className={styles.miniCalendarContainer}>
                  <div className={styles.miniCalendarHeader}>
                    <button className={styles.miniNavBtn} onClick={() => changeMonth(-1)}>‹</button>
                    <div className={styles.miniMonthDisplay}>
                      {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </div>
                    <button className={styles.miniNavBtn} onClick={() => changeMonth(1)}>›</button>
                  </div>
                  
                  <div className={styles.miniCalendar} onClick={handleMiniCalendarClick}>
                    <div className={styles.miniWeekdays}>
                      {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className={styles.miniWeekday}>{day}</div>
                      ))}
                    </div>
                    <div className={styles.miniDaysGrid}>
                      {calendarDays.map((day, index) => {
                        const isToday = day.toDateString() === today.toDateString();
                        const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                        const hasEvent = getEventsForDate(day).length > 0;

                        return (
                          <div 
                            key={index}
                            className={`${styles.miniDay} ${isToday ? styles.today : ''} ${isOtherMonth ? styles.otherMonth : ''} ${hasEvent ? styles.hasEvent : ''}`}
                          >
                            {day.getDate()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 이벤트 통계 */}
                <div className={styles.eventStats}>
                  <h4>이벤트 현황</h4>
                  <div className={styles.statItem}>
                    <div className={`${styles.statColor} ${styles.tecoteco}`}></div>
                    <span>테코테코</span>
                    <span className={styles.statCount}>{events.filter(e => e.type === 'tecoteco').length}</span>
                  </div>
                  <div className={styles.statItem}>
                    <div className={`${styles.statColor} ${styles.devlog}`}></div>
                    <span>모각코 & 블로그</span>
                    <span className={styles.statCount}>{events.filter(e => e.type === 'devlog').length}</span>
                  </div>
                  <div className={styles.statItem}>
                    <div className={`${styles.statColor} ${styles.retrospective}`}></div>
                    <span>회고</span>
                    <span className={styles.statCount}>{events.filter(e => e.type === 'retrospective').length}</span>
                  </div>
                </div>
              </div>

              <div className={styles.timelineMain}>
                <div className={styles.timeline}>
                  {filteredEvents.map((event, index) => {
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    });

                    return (
                      <div key={index} className={`${styles.timelineItem} ${styles[event.type]}`}>
                        <div className={styles.eventDate}>{formattedDate}</div>
                        <div className={styles.eventTitle}>{event.title}</div>
                        <div className={styles.eventDescription}>{event.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Calendar;