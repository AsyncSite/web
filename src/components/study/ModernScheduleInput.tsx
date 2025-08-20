import React, { useState } from 'react';
import { 
  DayOfWeek, 
  ScheduleFrequency, 
  dayToKorean,
  frequencyToKorean,
  formatScheduleToKorean
} from '../../types/schedule';
import type { ScheduleData } from '../../types/schedule';
import type { RecurrenceType } from '../../api/studyService';
import TimePickerCustom from './TimePickerCustom';
import './ModernScheduleInput.css';

interface ModernScheduleInputProps {
  value: ScheduleData;
  onChange: (schedule: ScheduleData) => void;
  recurrenceType?: RecurrenceType;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  error?: string;
}

const ModernScheduleInput: React.FC<ModernScheduleInputProps> = ({ 
  value, 
  onChange, 
  recurrenceType,
  selectedDate,
  onDateChange,
  error 
}) => {
  const handleDayToggle = (day: DayOfWeek) => {
    const newDays = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter(d => d !== day)
      : [...value.daysOfWeek, day];
    
    onChange({ ...value, daysOfWeek: newDays });
  };

  const handleStartTimeChange = (timeStr: string) => {
    onChange({ ...value, startTime: timeStr });
  };

  const handleEndTimeChange = (timeStr: string) => {
    onChange({ ...value, endTime: timeStr });
  };

  const handleQuickDuration = (hours: number) => {
    if (value.startTime) {
      const [startHour, startMinute] = value.startTime.split(':').map(Number);
      let endHour = startHour + Math.floor(hours);
      let endMinute = startMinute + Math.round((hours % 1) * 60);
      
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }
      
      if (endHour >= 24) {
        endHour = endHour % 24;
      }
      
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      onChange({ ...value, endTime });
    }
  };

  const handleFrequencyChange = (frequency: ScheduleFrequency) => {
    onChange({ ...value, frequency });
  };

  const orderedDays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY
  ];

  return (
    <div className="modern-schedule-input">
      {/* 날짜/요일 선택 */}
      {recurrenceType === 'ONE_TIME' ? (
        <div className="schedule-section">
          <h4 className="section-title">날짜 선택</h4>
          <div className="modern-date-picker">
            <input
              type="date"
              className="modern-date-input"
              value={selectedDate || ''}
              onChange={(e) => onDateChange && onDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            {selectedDate && (
              <div className="date-preview">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="schedule-section">
          <h4 className="section-title">요일 선택</h4>
          <div className="day-selector">
            {orderedDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`day-button ${value.daysOfWeek.includes(day) ? 'selected' : ''}`}
              >
                {dayToKorean(day)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 시간 선택 */}
      <div className="schedule-section">
        <h4 className="section-title">시간 설정</h4>
        <div className="time-selector">
          <div className="time-input-group">
            <label>시작 시간</label>
            <TimePickerCustom
              value={value.startTime}
              onChange={handleStartTimeChange}
              placeholder="시작 시간 선택"
            />
          </div>

          <span className="time-separator">~</span>

          <div className="time-input-group">
            <label>종료 시간</label>
            <TimePickerCustom
              value={value.endTime}
              onChange={handleEndTimeChange}
              placeholder="종료 시간 선택"
            />
          </div>
        </div>
        
        {/* 빠른 선택 버튼 */}
        {value.startTime && (
          <div className="quick-duration">
            <label>빠른 시간 설정</label>
            <div className="duration-buttons">
              {[1, 1.5, 2, 2.5, 3].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleQuickDuration(hours)}
                  className="duration-button"
                >
                  {hours % 1 === 0 ? `${hours}시간` : `${Math.floor(hours)}시간 30분`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 반복 주기 */}
      {recurrenceType !== 'ONE_TIME' && (
        <div className="schedule-section">
          <h4 className="section-title">반복 주기</h4>
          <div className="frequency-selector">
            {Object.values(ScheduleFrequency).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => handleFrequencyChange(freq)}
                className={`frequency-button ${value.frequency === freq ? 'selected' : ''}`}
              >
                {frequencyToKorean(freq)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 일정 미리보기 */}
      <div className="schedule-preview">
        <div className="preview-label">일정 미리보기</div>
        <div className="preview-content">
          {recurrenceType === 'ONE_TIME' ? (
            selectedDate && value.startTime && value.endTime ? (
              `${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })} ${value.startTime}-${value.endTime}`
            ) : '날짜와 시간을 선택해주세요'
          ) : (
            value.daysOfWeek.length > 0 && value.startTime && value.endTime
              ? formatScheduleToKorean(value)
              : '요일과 시간을 선택해주세요'
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default ModernScheduleInput;