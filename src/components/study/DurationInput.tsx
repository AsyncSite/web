import React, { useEffect, useState } from 'react';
import { 
  DurationUnit, 
  durationUnitToKorean,
  formatDurationToKorean
} from '../../types/schedule';
import type { DurationData } from '../../types/schedule';

interface DurationInputProps {
  value: DurationData;
  onChange: (duration: DurationData) => void;
  startDate?: string;
  endDate?: string;
  error?: string;
}

const DurationInput: React.FC<DurationInputProps> = ({ 
  value, 
  onChange, 
  startDate, 
  endDate,
  error 
}) => {
  const [totalDays, setTotalDays] = useState<number | null>(null);

  // 시작일과 종료일이 있을 때 총 일수 계산
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      setTotalDays(diffDays);
    } else {
      setTotalDays(null);
    }
  }, [startDate, endDate]);

  const handleValueChange = (newValue: string) => {
    const numValue = parseInt(newValue) || 0;
    if (numValue >= 0) {
      onChange({ ...value, value: numValue });
    }
  };

  const handleUnitChange = (unit: DurationUnit) => {
    onChange({ ...value, unit });
  };

  // 추정 일수 계산
  const getEstimatedDays = (): number => {
    if (value.unit === DurationUnit.WEEKS) {
      return value.value * 7;
    } else if (value.unit === DurationUnit.MONTHS) {
      return value.value * 30; // 대략적인 계산
    }
    return 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="number"
          min="1"
          max={value.unit === DurationUnit.WEEKS ? 52 : 12}
          value={value.value || ''}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="0"
          style={{
            width: '80px',
            padding: '10px 12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff'
          }}
        />
        <div style={{ display: 'flex', gap: '4px' }}>
          {Object.values(DurationUnit).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => handleUnitChange(unit)}
              style={{
                padding: '10px 16px',
                border: value.unit === unit ? '2px solid #C3E88D' : '2px solid rgba(255, 255, 255, 0.2)',
                background: value.unit === unit ? '#C3E88D' : 'rgba(255, 255, 255, 0.05)',
                color: value.unit === unit ? '#1a1a2e' : 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {durationUnitToKorean(unit)}
            </button>
          ))}
        </div>
      </div>

      {/* 추가 정보 */}
      <div style={{
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {value.value > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
              기간 표시:
            </span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' }}>
              {formatDurationToKorean(value)}
            </span>
          </div>
        )}
        
        {value.value > 0 && !totalDays && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
              예상 일수:
            </span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' }}>
              약 {getEstimatedDays()}일
            </span>
          </div>
        )}

        {totalDays && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
              실제 일수:
            </span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' }}>
              {totalDays}일간 진행
            </span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default DurationInput;