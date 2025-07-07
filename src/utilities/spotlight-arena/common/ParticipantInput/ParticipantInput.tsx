import { useState, useEffect, ChangeEvent } from 'react';
import { Participant } from '../../shared/types';
import './ParticipantInput.css';

interface ParticipantInputProps {
  onParticipantsChange: (participants: Participant[]) => void;
  maxParticipants?: number;
}

const ParticipantInput: React.FC<ParticipantInputProps> = ({
  onParticipantsChange,
  maxParticipants = 20,
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'number'>('text');
  const [textInput, setTextInput] = useState('');
  const [numberRange, setNumberRange] = useState({ start: 1, end: 10 });
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [prevCount, setPrevCount] = useState(0);
  const [isCountChanging, setIsCountChanging] = useState(false);

  useEffect(() => {
    const participants = parseParticipants();
    onParticipantsChange(participants);
  }, [textInput, numberRange, inputMode, removeDuplicates]);

  const parseParticipants = (): Participant[] => {
    if (inputMode === 'text') {
      const names = textInput
        .split('\n')
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      const uniqueNames = removeDuplicates ? Array.from(new Set(names)) : names;

      return uniqueNames.slice(0, maxParticipants).map((name, index) => ({
        id: `participant-${index}`,
        name,
        order: index + 1,
      }));
    } else {
      const participants: Participant[] = [];
      const start = Math.max(1, numberRange.start);
      const end = Math.min(numberRange.end, start + maxParticipants - 1);

      for (let i = start; i <= end; i++) {
        participants.push({
          id: `participant-${i}`,
          name: `${i}번`,
          order: i,
        });
      }
      return participants;
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const names = content
        .split(/[\r\n,]+/)
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      setTextInput(names.join('\n'));
      setInputMode('text');
    };
    reader.readAsText(file);
  };

  const currentCount = parseParticipants().length;

  // 카운트 변경 애니메이션
  useEffect(() => {
    if (currentCount !== prevCount) {
      setIsCountChanging(true);
      setPrevCount(currentCount);
      const timer = setTimeout(() => setIsCountChanging(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentCount, prevCount]);

  return (
    <div className="participant-input">
      <div className="input-mode-selector">
        <button
          className={`mode-button ${inputMode === 'text' ? 'active' : ''}`}
          onClick={() => setInputMode('text')}
        >
          <span className="mode-icon">✏️</span>
          이름 입력
        </button>
        <button
          className={`mode-button ${inputMode === 'number' ? 'active' : ''}`}
          onClick={() => setInputMode('number')}
        >
          <span className="mode-icon">🔢</span>
          번호 입력
        </button>
      </div>

      {inputMode === 'text' ? (
        <div className="text-input-section">
          <textarea
            className="participant-textarea"
            placeholder="한 줄에 한 명씩 입력해주세요..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
          />

          <div className="input-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
              />
              중복 이름 자동 제거
            </label>

            <label className="file-upload-label">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <span className="file-upload-button">📁 파일 업로드</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="number-input-section">
          <div className="number-range">
            <div className="range-input">
              <label>시작 번호</label>
              <input
                type="number"
                min="1"
                value={numberRange.start}
                onChange={(e) =>
                  setNumberRange({
                    ...numberRange,
                    start: Number(e.target.value),
                  })
                }
              />
            </div>
            <span className="range-separator">~</span>
            <div className="range-input">
              <label>끝 번호</label>
              <input
                type="number"
                min={numberRange.start}
                max={numberRange.start + maxParticipants - 1}
                value={numberRange.end}
                onChange={(e) =>
                  setNumberRange({
                    ...numberRange,
                    end: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="participant-count">
        <span className="count-label">총 참가자:</span>
        <span className={`count-number ${isCountChanging ? 'count-changing' : ''}`}>
          {currentCount}명
        </span>
        {currentCount > maxParticipants && (
          <span className="count-warning">(최대 {maxParticipants}명까지만 참가 가능)</span>
        )}
      </div>
    </div>
  );
};

export default ParticipantInput;
