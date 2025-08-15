import React from 'react';
import './GenerationSelector.css';

interface GenerationSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const GenerationSelector: React.FC<GenerationSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 100
}) => {
  const adjustValue = (delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta));
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    if (inputValue === '') {
      onChange(min);
      return;
    }
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
  };

  return (
    <div className="generation-selector-simple">
      <div className="generation-input-group">
        <button
          type="button"
          className="gen-btn decrease"
          onClick={() => adjustValue(-1)}
          disabled={value <= min}
        >
          −
        </button>
        
        <div className="generation-input-wrapper">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            className="generation-input"
            maxLength={3}
          />
          <span className="generation-label">기</span>
        </div>
        
        <button
          type="button"
          className="gen-btn increase"
          onClick={() => adjustValue(1)}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default GenerationSelector;