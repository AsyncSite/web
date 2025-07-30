import React, { useState, useEffect } from 'react';
import './Calendar.css';

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
    <section className="calendar-section section-background" id="calendar">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">스터디 일정</h2>
          <p className="section-subtitle">함께하는 정기 활동과 일정을 확인하세요</p>
        </div>

        {/* 뷰 모드 토글 */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'modern' ? 'active' : ''}`}
            onClick={() => handleViewTransition('modern')}
          >
            캘린더 뷰
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => handleViewTransition('timeline')}
          >
            타임라인 뷰
          </button>
        </div>

        {/* 필터 버튼 */}
        <div className="calendar-filters">
          <button 
            className={`filter-btn all ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            전체
          </button>
          <button 
            className={`filter-btn tecoteco ${selectedFilter === 'tecoteco' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('tecoteco')}
          >
            테코테코
          </button>
          <button 
            className={`filter-btn devlog ${selectedFilter === 'devlog' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('devlog')}
          >
            모각코 & 블로그
          </button>
          <button 
            className={`filter-btn retrospective ${selectedFilter === 'retrospective' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('retrospective')}
          >
            회고
          </button>
        </div>

        {/* 달력 컨텐츠 */}
        <div className={`calendar-content ${isTransitioning ? 'transitioning' : ''}`}>
          {viewMode === 'modern' ? (
            // 모던 캘린더 뷰
            <div className="modern-calendar">
              <div className="calendar-header">
                <button className="nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                <h3 className="calendar-title">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h3>
                <button className="nav-btn" onClick={() => changeMonth(1)}>›</button>
              </div>

              <div className="calendar-grid">
                <div className="weekdays">
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>
                
                <div className="days-grid">
                  {calendarDays.map((day, index) => {
                    const isToday = day.toDateString() === today.toDateString();
                    const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                    const dayEvents = getEventsForDate(day);

                    return (
                      <div 
                        key={index}
                        className={`day-cell ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}`}
                      >
                        <div className="day-number">{day.getDate()}</div>
                        <div className="day-events">
                          {dayEvents.map((event, eventIndex) => (
                            <div key={eventIndex} className={`event ${event.type}`}>
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
            <div className="timeline-calendar">
              <div className="timeline-sidebar">
                <div className="mini-calendar-container">
                  <div className="mini-calendar-header">
                    <button className="mini-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                    <div className="mini-month-display">
                      {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </div>
                    <button className="mini-nav-btn" onClick={() => changeMonth(1)}>›</button>
                  </div>
                  
                  <div className="mini-calendar" onClick={handleMiniCalendarClick}>
                    <div className="mini-weekdays">
                      {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="mini-weekday">{day}</div>
                      ))}
                    </div>
                    <div className="mini-days-grid">
                      {calendarDays.map((day, index) => {
                        const isToday = day.toDateString() === today.toDateString();
                        const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                        const hasEvent = getEventsForDate(day).length > 0;

                        return (
                          <div 
                            key={index}
                            className={`mini-day ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''} ${hasEvent ? 'has-event' : ''}`}
                          >
                            {day.getDate()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 이벤트 통계 */}
                <div className="event-stats">
                  <h4>이벤트 현황</h4>
                  <div className="stat-item">
                    <div className="stat-color tecoteco"></div>
                    <span>테코테코</span>
                    <span className="stat-count">{events.filter(e => e.type === 'tecoteco').length}</span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-color devlog"></div>
                    <span>모각코 & 블로그</span>
                    <span className="stat-count">{events.filter(e => e.type === 'devlog').length}</span>
                  </div>
                  <div className="stat-item">
                    <div className="stat-color retrospective"></div>
                    <span>회고</span>
                    <span className="stat-count">{events.filter(e => e.type === 'retrospective').length}</span>
                  </div>
                </div>
              </div>

              <div className="timeline-main">
                <div className="timeline">
                  {filteredEvents.map((event, index) => {
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    });

                    return (
                      <div key={index} className={`timeline-item ${event.type}`}>
                        <div className="event-date">{formattedDate}</div>
                        <div className="event-title">{event.title}</div>
                        <div className="event-description">{event.description}</div>
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