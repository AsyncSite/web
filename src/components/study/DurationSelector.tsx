import React from 'react';
import './DurationSelector.css';

interface DurationSelectorProps {
  value: number;
  unit: 'WEEKS' | 'MONTHS';
  onValueChange: (value: number) => void;
  onUnitChange: (unit: 'WEEKS' | 'MONTHS') => void;
  startDate?: string;
  endDate?: string;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  value,
  unit,
  onValueChange,
  onUnitChange,
  startDate,
  endDate
}) => {
  const quickDurations = [
    { value: 4, unit: 'WEEKS' as const, label: '1개월' },
    { value: 8, unit: 'WEEKS' as const, label: '2개월' },
    { value: 12, unit: 'WEEKS' as const, label: '3개월' },
    { value: 6, unit: 'MONTHS' as const, label: '6개월' },
    { value: 12, unit: 'MONTHS' as const, label: '1년' },
  ];

  const handleQuickSelect = (duration: typeof quickDurations[0]) => {
    onValueChange(duration.value);
    onUnitChange(duration.unit);
  };

  const handleSliderChange = (newValue: number) => {
    onValueChange(newValue);
  };

  const getDisplayText = () => {
    if (unit === 'WEEKS') {
      if (value === 4) return '1개월';
      if (value === 8) return '2개월';
      if (value === 12) return '3개월';
      return `${value}주`;
    } else {
      if (value === 12) return '1년';
      return `${value}개월`;
    }
  };

  const maxValue = unit === 'WEEKS' ? 52 : 24;

  return (
    <div className="duration-selector">
      <div className="duration-display">
        <div className="duration-value-display">
          <span className="duration-number">{value}</span>
          <span className="duration-unit-text">{unit === 'WEEKS' ? '주' : '개월'}</span>
        </div>
        <div className="duration-converted">
          ≈ {getDisplayText()}
        </div>
      </div>

      <div className="duration-slider-container">
        <input
          type="range"
          min="1"
          max={maxValue}
          value={value}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="duration-slider"
        />
        <div className="slider-labels">
          <span>1{unit === 'WEEKS' ? '주' : '개월'}</span>
          <span>{maxValue}{unit === 'WEEKS' ? '주' : '개월'}</span>
        </div>
      </div>

      <div className="duration-unit-toggle">
        <button
          type="button"
          className={`unit-button ${unit === 'WEEKS' ? 'active' : ''}`}
          onClick={() => {
            onUnitChange('WEEKS');
            if (unit === 'MONTHS' && value > 12) {
              onValueChange(value * 4); // Convert months to weeks approximately
            }
          }}
        >
          주 단위
        </button>
        <button
          type="button"
          className={`unit-button ${unit === 'MONTHS' ? 'active' : ''}`}
          onClick={() => {
            onUnitChange('MONTHS');
            if (unit === 'WEEKS' && value > 4) {
              onValueChange(Math.ceil(value / 4)); // Convert weeks to months approximately
            }
          }}
        >
          월 단위
        </button>
      </div>

      <div className="quick-duration-grid">
        <label className="quick-duration-label">빠른 선택</label>
        <div className="quick-duration-options">
          {quickDurations.map((duration) => (
            <button
              key={`${duration.value}-${duration.unit}`}
              type="button"
              className={`quick-duration-option ${
                value === duration.value && unit === duration.unit ? 'selected' : ''
              }`}
              onClick={() => handleQuickSelect(duration)}
            >
              {duration.label}
            </button>
          ))}
        </div>
      </div>

      <div className="duration-preview">
        <div className="preview-icon">📅</div>
        <div className="preview-text">
          총 <strong>{getDisplayText()}</strong> 동안 진행됩니다
          {startDate && endDate && startDate.trim() !== '' && endDate.trim() !== '' && (
            <div className="date-range-preview">
              {new Date(startDate + 'T00:00:00').toLocaleDateString('ko-KR', { 
                month: 'long', 
                day: 'numeric' 
              })} ~ {new Date(endDate + 'T00:00:00').toLocaleDateString('ko-KR', { 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DurationSelector;