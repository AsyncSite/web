import React from 'react';
import { 
  DayOfWeek, 
  ScheduleFrequency, 
  dayToKorean,
  frequencyToKorean,
  formatScheduleToKorean
} from '../../types/schedule';
import type { ScheduleData } from '../../types/schedule';

interface ScheduleInputProps {
  value: ScheduleData;
  onChange: (schedule: ScheduleData) => void;
  error?: string;
}

const ScheduleInput: React.FC<ScheduleInputProps> = ({ value, onChange, error }) => {
  const handleDayToggle = (day: DayOfWeek) => {
    const newDays = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter(d => d !== day)
      : [...value.daysOfWeek, day];
    
    onChange({ ...value, daysOfWeek: newDays });
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', time: string) => {
    onChange({ ...value, [field]: time });
  };

  const handleFrequencyChange = (frequency: ScheduleFrequency) => {
    onChange({ ...value, frequency });
  };

  // 요일 순서대로 정렬
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 요일 선택 */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
          요일 선택
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {orderedDays.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              style={{
                padding: '8px',
                border: value.daysOfWeek.includes(day) ? '2px solid #C3E88D' : '2px solid rgba(255, 255, 255, 0.2)',
                background: value.daysOfWeek.includes(day) ? '#C3E88D' : 'rgba(255, 255, 255, 0.05)',
                color: value.daysOfWeek.includes(day) ? '#1a1a2e' : 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {dayToKorean(day)}
            </button>
          ))}
        </div>
      </div>

      {/* 시간 선택 */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
          시간 설정
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginBottom: '4px' }}>
              시작 시간
            </label>
            <input
              type="time"
              value={value.startTime}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                colorScheme: 'dark'
              }}
            />
          </div>
          <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '20px' }}>~</span>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginBottom: '4px' }}>
              종료 시간
            </label>
            <input
              type="time"
              value={value.endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                colorScheme: 'dark'
              }}
            />
          </div>
        </div>
      </div>

      {/* 반복 주기 */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
          반복 주기
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {Object.values(ScheduleFrequency).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => handleFrequencyChange(freq)}
              style={{
                padding: '10px 16px',
                border: value.frequency === freq ? '2px solid #C3E88D' : '2px solid rgba(255, 255, 255, 0.2)',
                background: value.frequency === freq ? '#C3E88D' : 'rgba(255, 255, 255, 0.05)',
                color: value.frequency === freq ? '#1a1a2e' : 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {frequencyToKorean(freq)}
            </button>
          ))}
        </div>
      </div>

      {/* 미리보기 */}
      <div style={{
        padding: '16px',
        background: 'rgba(195, 232, 141, 0.1)',
        border: '1px solid rgba(195, 232, 141, 0.3)',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
          일정 미리보기
        </div>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#C3E88D' }}>
          {value.daysOfWeek.length > 0 && value.startTime && value.endTime
            ? formatScheduleToKorean(value)
            : '요일과 시간을 선택해주세요'}
        </div>
      </div>

      {error && (
        <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ScheduleInput;