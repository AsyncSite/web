import React, { useState, useRef, useEffect } from 'react';
import './DatePickerCustom.css';

interface DatePickerCustomProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
}

const DatePickerCustom: React.FC<DatePickerCustomProps> = ({ 
  value, 
  onChange, 
  min = new Date().toISOString().split('T')[0],
  placeholder = '날짜 선택' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value + 'T00:00:00') : null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00');
      setSelectedDate(date);
      setViewDate(date);
    }
  }, [value]);

  const formatDisplay = () => {
    if (selectedDate) {
      return selectedDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
    return placeholder;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const days = [];
    
    // 이전 달 날짜들
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // 현재 달 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // 다음 달 날짜들
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateString = date.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isDateDisabled = (date: Date) => {
    const minDate = new Date(min + 'T00:00:00');
    return date < minDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  };

  const days = getDaysInMonth(viewDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className="date-picker-custom" ref={dropdownRef}>
      <button
        type="button"
        className="date-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'has-value' : 'placeholder'}>
          {formatDisplay()}
        </span>
        <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="date-picker-header">
            <button
              type="button"
              className="month-nav-button"
              onClick={() => handleMonthChange('prev')}
            >
              ‹
            </button>
            <div className="month-year">
              {viewDate.getFullYear()}년 {monthNames[viewDate.getMonth()]}
            </div>
            <button
              type="button"
              className="month-nav-button"
              onClick={() => handleMonthChange('next')}
            >
              ›
            </button>
          </div>

          <div className="date-picker-weekdays">
            {weekDays.map(day => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="date-picker-days">
            {days.map((dayInfo, index) => (
              <button
                key={index}
                type="button"
                className={`day-button ${
                  !dayInfo.isCurrentMonth ? 'other-month' : ''
                } ${isToday(dayInfo.date) ? 'today' : ''} ${
                  isSelected(dayInfo.date) ? 'selected' : ''
                } ${isDateDisabled(dayInfo.date) ? 'disabled' : ''}`}
                onClick={() => !isDateDisabled(dayInfo.date) && handleDateSelect(dayInfo.date)}
                disabled={isDateDisabled(dayInfo.date)}
              >
                {dayInfo.day}
              </button>
            ))}
          </div>

          <div className="date-picker-footer">
            <button
              type="button"
              className="today-button"
              onClick={() => {
                const today = new Date();
                handleDateSelect(today);
              }}
            >
              오늘 선택
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerCustom;