import React from 'react';
import './RecordingControls.css';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onDownload: () => void;
  hasRecording: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isPaused,
  recordingTime,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onDownload,
  hasRecording,
}) => {
  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-controls">
      <div className="recording-status">
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot" />
            <span className="recording-time">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      <div className="recording-buttons">
        {!isRecording ? (
          <>
            <button
              className="recording-button record-button"
              onClick={onStartRecording}
              title="녹화 시작"
            >
              <span className="button-icon">🔴</span>
              <span className="button-text">녹화</span>
            </button>
            {hasRecording && (
              <button
                className="recording-button download-button"
                onClick={onDownload}
                title="녹화 다운로드"
              >
                <span className="button-icon">💾</span>
                <span className="button-text">다운로드</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="recording-button stop-button"
              onClick={onStopRecording}
              title="녹화 중지"
            >
              <span className="button-icon">⏹️</span>
              <span className="button-text">중지</span>
            </button>
            {isPaused ? (
              <button
                className="recording-button resume-button"
                onClick={onResumeRecording}
                title="녹화 재개"
              >
                <span className="button-icon">▶️</span>
                <span className="button-text">재개</span>
              </button>
            ) : (
              <button
                className="recording-button pause-button"
                onClick={onPauseRecording}
                title="녹화 일시정지"
              >
                <span className="button-icon">⏸️</span>
                <span className="button-text">일시정지</span>
              </button>
            )}
          </>
        )}
      </div>

      <div className="recording-info">
        <p className="recording-hint">🎥 레이스를 녹화하여 영상으로 저장할 수 있습니다</p>
      </div>
    </div>
  );
};

export default RecordingControls;
