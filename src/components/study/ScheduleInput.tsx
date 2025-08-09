import React from 'react';
import { 
  DayOfWeek, 
  ScheduleFrequency, 
  dayToKorean,
  frequencyToKorean,
  formatScheduleToKorean
} from '../../types/schedule';
import type { ScheduleData } from '../../types/schedule';
import type { RecurrenceType } from '../../api/studyService';
import './ScheduleInput.css';

interface ScheduleInputProps {
  value: ScheduleData;
  onChange: (schedule: ScheduleData) => void;
  recurrenceType?: RecurrenceType;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  error?: string;
}

const ScheduleInput: React.FC<ScheduleInputProps> = ({ 
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

  const handleTimeChange = (field: 'startTime' | 'endTime', time: string) => {
    onChange({ ...value, [field]: time });
  };

  const handleDurationClick = (hours: number) => {
    if (value.startTime) {
      const [startHour, startMinute] = value.startTime.split(':').map(Number);
      let endHour = startHour + Math.floor(hours);
      let endMinute = startMinute + Math.round((hours % 1) * 60);
      
      // 분이 60을 넘으면 시간으로 변환
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }
      
      // 24시간이 넘으면 다음날로 처리 (24시간 형식 유지)
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
      {/* 날짜/요일 선택 */}
      {recurrenceType === 'ONE_TIME' ? (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
            날짜 선택
          </h4>
          <input
            type="date"
            className="date-input"
            value={selectedDate || ''}
            onChange={(e) => onDateChange && onDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          {selectedDate && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#89DDFF' 
            }}>
              선택한 날짜: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })}
            </div>
          )}
        </div>
      ) : (
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
      )}

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
            <div style={{ display: 'flex', gap: '4px' }}>
              <select
                value={value.startTime ? value.startTime.split(':')[0] : ''}
                onChange={(e) => {
                  const hour = e.target.value;
                  const minute = value.startTime ? value.startTime.split(':')[1] : '00';
                  handleTimeChange('startTime', `${hour}:${minute}`);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="">시</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}시
                  </option>
                ))}
              </select>
              <select
                value={value.startTime ? value.startTime.split(':')[1] : ''}
                onChange={(e) => {
                  const hour = value.startTime ? value.startTime.split(':')[0] : '00';
                  const minute = e.target.value;
                  handleTimeChange('startTime', `${hour}:${minute}`);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="">분</option>
                <option value="00">00분</option>
                <option value="15">15분</option>
                <option value="30">30분</option>
                <option value="45">45분</option>
              </select>
            </div>
          </div>
          <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '20px' }}>~</span>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginBottom: '4px' }}>
              종료 시간
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <select
                value={value.endTime ? value.endTime.split(':')[0] : ''}
                onChange={(e) => {
                  const hour = e.target.value;
                  const minute = value.endTime ? value.endTime.split(':')[1] : '00';
                  handleTimeChange('endTime', `${hour}:${minute}`);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="">시</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}시
                  </option>
                ))}
              </select>
              <select
                value={value.endTime ? value.endTime.split(':')[1] : ''}
                onChange={(e) => {
                  const hour = value.endTime ? value.endTime.split(':')[0] : '00';
                  const minute = e.target.value;
                  handleTimeChange('endTime', `${hour}:${minute}`);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="">분</option>
                <option value="00">00분</option>
                <option value="15">15분</option>
                <option value="30">30분</option>
                <option value="45">45분</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 진행 시간 버튼 */}
        {value.startTime && (
          <div style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginBottom: '8px' }}>
              또는 진행 시간 선택
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 1.5, 2, 2.5, 3].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleDurationClick(hours)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(195, 232, 141, 0.2)';
                    e.currentTarget.style.borderColor = '#C3E88D';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  {hours % 1 === 0 ? `${hours}시간` : `${hours}시간`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 반복 주기 - ONE_TIME이 아닐 때만 표시 */}
      {recurrenceType !== 'ONE_TIME' && (
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
      )}

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
        <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ScheduleInput;