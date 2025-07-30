import React, { useState, useEffect } from 'react';
import './ModernCalendar.css';

interface CalendarEvent {
  date: string;
  title: string;
  type: 'tecoteco' | 'devlog' | 'resume' | 'retrospective';
  description: string;
}

// not use currently, for sample
const ModernCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // 2025년 7월
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [events] = useState<CalendarEvent[]>([
    { date: '2025-07-04', title: '테코테코', type: 'tecoteco', description: '주간 스터디 모임' },
    { date: '2025-07-11', title: '테코테코', type: 'tecoteco', description: '주간 스터디 모임' },
    { date: '2025-07-18', title: '테코테코', type: 'tecoteco', description: '주간 스터디 모임' },
    { date: '2025-07-25', title: '테코테코', type: 'tecoteco', description: '주간 스터디 모임' },
    { date: '2025-07-30', title: '회고 미팅', type: 'retrospective', description: '월간 회고' },
    { date: '2025-07-10', title: 'DEVLOG', type: 'devlog', description: '개발 블로그 스터디' },
    { date: '2025-07-24', title: 'DEVLOG', type: 'devlog', description: '개발 블로그 스터디' },
    { date: '2025-07-15', title: '이력서 리뷰', type: 'resume', description: '월간 이력서 검토' },
    { date: '2025-07-29', title: '이력서 리뷰', type: 'resume', description: '월간 이력서 검토' }
  ]);

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

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

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const filterEvents = (type: string) => {
    setCurrentFilter(type);
  };

  const showEventDetails = (event: CalendarEvent) => {
    alert(`${event.title}\n날짜: ${event.date}\n설명: ${event.description}`);
  };

  const addEvent = (date: string) => {
    const title = prompt('일정 제목을 입력하세요:');
    if (title) {
      alert(`${date}에 "${title}" 일정이 추가되었습니다!`);
    }
  };

  const getFilteredEvents = (date: string) => {
    return events.filter(event => {
      const eventMatches = event.date === date;
      const filterMatches = currentFilter === 'all' || currentFilter === event.type;
      return eventMatches && filterMatches;
    });
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        const filterMatches = currentFilter === 'all' || currentFilter === event.type;
        return eventDate >= today && filterMatches;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const days = generateCalendarDays();
  const upcomingEvents = getUpcomingEvents();

  return (
    <section className="modern-calendar-section">
      <div className="modern-calendar-container">
        <div className="modern-calendar-header">
          <div className="header-top">
            <h1 className="modern-calendar-title">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h1>
            <div className="nav-buttons">
              <button className="nav-btn" onClick={previousMonth}>‹</button>
              <button className="nav-btn" onClick={nextMonth}>›</button>
              <button className="nav-btn" onClick={goToToday}>오늘</button>
            </div>
          </div>
          <div className="study-filters">
            <button 
              className={`filter-btn all ${currentFilter === 'all' ? 'active' : ''}`}
              onClick={() => filterEvents('all')}
            >
              전체
            </button>
            <button 
              className={`filter-btn tecoteco ${currentFilter === 'tecoteco' ? 'active' : ''}`}
              onClick={() => filterEvents('tecoteco')}
            >
              테코테코
            </button>
            <button 
              className={`filter-btn devlog ${currentFilter === 'devlog' ? 'active' : ''}`}
              onClick={() => filterEvents('devlog')}
            >
              DEVLOG
            </button>
            <button 
              className={`filter-btn resume ${currentFilter === 'resume' ? 'active' : ''}`}
              onClick={() => filterEvents('resume')}
            >
              이력서 리뷰
            </button>
          </div>
        </div>

        <div className="modern-calendar-grid">
          <div className="weekdays">
            {weekDays.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="days-grid">
            {days.map((cellDate, index) => {
              const isOtherMonth = cellDate.getMonth() !== currentDate.getMonth();
              const isToday = cellDate.toDateString() === new Date().toDateString();
              const dateStr = cellDate.toISOString().split('T')[0];
              const dayEvents = getFilteredEvents(dateStr);

              return (
                <div 
                  key={index}
                  className={`day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                >
                  <div className="day-number">{cellDate.getDate()}</div>
                  {dayEvents.map((event, eventIndex) => (
                    <div 
                      key={eventIndex}
                      className={`event ${event.type}`}
                      onClick={() => showEventDetails(event)}
                    >
                      {event.title}
                    </div>
                  ))}
                  <button 
                    className="add-event-btn"
                    onClick={() => addEvent(dateStr)}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="modern-sidebar">
        <h3>다가오는 일정</h3>
        <div className="upcoming-events">
          {upcomingEvents.map((event, index) => (
            <div key={index} className={`upcoming-event ${event.type}`}>
              <div className="event-date">
                {new Date(event.date).toLocaleDateString('ko-KR')}
              </div>
              <div className="event-title">{event.title}</div>
              <div className="event-description">{event.description}</div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <div className="no-events">예정된 일정이 없습니다.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ModernCalendar;