import { useState, useEffect } from 'react';
import './DartWheelSoundSettings.css';

interface DartWheelSoundSettingsProps {
  dartWheelSoundSettings: {
    masterVolume: number;
    isMuted: boolean;
    isEnabled: boolean;
  };
  onDartWheelVolumeChange: (volume: number) => void;
  onDartWheelMuteToggle: () => void;
  dartWheelIsCompact?: boolean;
}

function DartWheelSoundSettings({
  dartWheelSoundSettings,
  onDartWheelVolumeChange,
  onDartWheelMuteToggle,
  dartWheelIsCompact = false,
}: DartWheelSoundSettingsProps): React.ReactNode {
  const [dartWheelLocalVolume, setDartWheelLocalVolume] = useState(
    dartWheelSoundSettings.masterVolume * 100
  );

  useEffect(() => {
    setDartWheelLocalVolume(dartWheelSoundSettings.masterVolume * 100);
  }, [dartWheelSoundSettings.masterVolume]);

  const handleDartWheelVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setDartWheelLocalVolume(newVolume);
    onDartWheelVolumeChange(newVolume / 100);
  };

  const getDartWheelVolumeIcon = () => {
    if (dartWheelSoundSettings.isMuted || dartWheelLocalVolume === 0) {
      return '🔇';
    } else if (dartWheelLocalVolume < 33) {
      return '🔈';
    } else if (dartWheelLocalVolume < 66) {
      return '🔉';
    } else {
      return '🔊';
    }
  };

  if (dartWheelIsCompact) {
    return (
      <div className="dart-wheel-sound-settings-compact">
        <button
          className="dart-wheel-mute-button-compact"
          onClick={onDartWheelMuteToggle}
          title={dartWheelSoundSettings.isMuted ? '음소거 해제' : '음소거'}
        >
          {getDartWheelVolumeIcon()}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={dartWheelLocalVolume}
          onChange={handleDartWheelVolumeChange}
          className="dart-wheel-volume-slider-compact"
          disabled={dartWheelSoundSettings.isMuted}
        />
      </div>
    );
  }

  return (
    <div className="dart-wheel-sound-settings">
      <h4 className="dart-wheel-sound-title">사운드 설정</h4>
      
      <div className="dart-wheel-sound-controls">
        <div className="dart-wheel-volume-control">
          <label className="dart-wheel-volume-label">
            <span className="dart-wheel-volume-icon">{getDartWheelVolumeIcon()}</span>
            <span className="dart-wheel-volume-text">볼륨</span>
            <span className="dart-wheel-volume-value">{dartWheelLocalVolume}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={dartWheelLocalVolume}
            onChange={handleDartWheelVolumeChange}
            className="dart-wheel-volume-slider"
            disabled={dartWheelSoundSettings.isMuted}
          />
        </div>

        <button
          className={`dart-wheel-mute-button ${
            dartWheelSoundSettings.isMuted ? 'dart-wheel-muted' : ''
          }`}
          onClick={onDartWheelMuteToggle}
        >
          {dartWheelSoundSettings.isMuted ? '🔇 음소거 중' : '🔊 소리 켜짐'}
        </button>
      </div>

      <div className="dart-wheel-sound-info">
        <p className="dart-wheel-sound-description">
          • 휠 회전음과 효과음이 재생됩니다<br />
          • 배경음악은 게임 중 자동으로 재생됩니다
        </p>
      </div>
    </div>
  );
}

export default DartWheelSoundSettings;