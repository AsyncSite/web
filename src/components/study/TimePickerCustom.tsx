import React, { useState, useRef, useEffect } from 'react';
import './TimePickerCustom.css';

interface TimePickerCustomProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TimePickerCustom: React.FC<TimePickerCustomProps> = ({ value, onChange, placeholder = '시간 선택' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(value ? value.split(':')[0] : '');
  const [selectedMinute, setSelectedMinute] = useState(value ? value.split(':')[1] : '');
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
      const [h, m] = value.split(':');
      setSelectedHour(h);
      setSelectedMinute(m);
    }
  }, [value]);

  const handleTimeSelect = (hour: string, minute: string) => {
    const timeString = `${hour}:${minute}`;
    onChange(timeString);
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const formatDisplay = () => {
    if (selectedHour && selectedMinute) {
      return `${selectedHour}:${selectedMinute}`;
    }
    return placeholder;
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="time-picker-custom" ref={dropdownRef}>
      <button
        type="button"
        className="time-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'has-value' : 'placeholder'}>
          {formatDisplay()}
        </span>
        <svg className="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </button>

      {isOpen && (
        <div className="time-picker-dropdown">
          <div className="time-picker-content">
            <div className="time-column">
              <div className="time-column-header">시</div>
              <div className="time-options">
                {hours.map(hour => (
                  <button
                    key={hour}
                    type="button"
                    className={`time-option ${selectedHour === hour ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedHour(hour);
                      if (selectedMinute) {
                        handleTimeSelect(hour, selectedMinute);
                      }
                    }}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="time-column">
              <div className="time-column-header">분</div>
              <div className="time-options">
                {minutes.map(minute => (
                  <button
                    key={minute}
                    type="button"
                    className={`time-option ${selectedMinute === minute ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedMinute(minute);
                      if (selectedHour) {
                        handleTimeSelect(selectedHour, minute);
                        setIsOpen(false);
                      }
                    }}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="time-picker-footer">
            <button
              type="button"
              className="time-quick-button"
              onClick={() => {
                const now = new Date();
                const h = String(now.getHours()).padStart(2, '0');
                const m = String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, '0');
                handleTimeSelect(h, m);
                setIsOpen(false);
              }}
            >
              현재 시간
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePickerCustom;