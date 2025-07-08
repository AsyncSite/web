import { DartWheelGameMode } from '../types/dartWheel';
import './DartWheelModeSelector.css';

interface DartWheelModeInfo {
  mode: DartWheelGameMode;
  name: string;
  description: string;
  icon: string;
  minPlayers: number;
  maxPlayers?: number;
  color: string;
}

const DART_WHEEL_GAME_MODES: DartWheelModeInfo[] = [
  {
    mode: 'classic',
    name: '클래식',
    description: '전통적인 다트휠 게임. 가장 높은 점수를 획득하세요!',
    icon: '🎯',
    minPlayers: 2,
    color: '#4ECDC4',
  },
  {
    mode: 'survival',
    name: '서바이벌',
    description: '매 라운드 최저 점수 탈락! 마지막까지 살아남으세요.',
    icon: '💀',
    minPlayers: 3,
    color: '#FF6B6B',
  },
  {
    mode: 'team',
    name: '팀전',
    description: '팀을 이뤄 경쟁하세요. 팀워크가 승리의 열쇠!',
    icon: '👥',
    minPlayers: 4,
    color: '#45B7D1',
  },
  {
    mode: 'target',
    name: '타겟',
    description: '목표 점수에 가장 가까이 도달하세요. 전략이 중요합니다!',
    icon: '🎯',
    minPlayers: 2,
    color: '#96CEB4',
  },
  {
    mode: 'reverse',
    name: '역전',
    description: '낮은 점수가 승리! 모든 것이 뒤바뀐 세계.',
    icon: '🔄',
    minPlayers: 2,
    color: '#DDA0DD',
  },
];

interface DartWheelModeSelectorProps {
  dartWheelCurrentMode: DartWheelGameMode;
  onDartWheelModeChange: (mode: DartWheelGameMode) => void;
  dartWheelParticipantCount: number;
  dartWheelIsDisabled?: boolean;
}

function DartWheelModeSelector({
  dartWheelCurrentMode,
  onDartWheelModeChange,
  dartWheelParticipantCount,
  dartWheelIsDisabled = false,
}: DartWheelModeSelectorProps): React.ReactNode {
  const isDartWheelModeAvailable = (modeInfo: DartWheelModeInfo): boolean => {
    if (dartWheelParticipantCount < modeInfo.minPlayers) return false;
    if (modeInfo.maxPlayers && dartWheelParticipantCount > modeInfo.maxPlayers) return false;
    return true;
  };

  return (
    <div className="dart-wheel-mode-selector">
      <h3 className="dart-wheel-mode-title">게임 모드 선택</h3>
      
      <div className="dart-wheel-mode-grid">
        {DART_WHEEL_GAME_MODES.map((modeInfo) => {
          const isAvailable = isDartWheelModeAvailable(modeInfo);
          const isSelected = dartWheelCurrentMode === modeInfo.mode;
          
          return (
            <button
              key={`dart-wheel-mode-${modeInfo.mode}`}
              className={`dart-wheel-mode-card ${
                isSelected ? 'dart-wheel-mode-selected' : ''
              } ${!isAvailable ? 'dart-wheel-mode-disabled' : ''}`}
              onClick={() => isAvailable && onDartWheelModeChange(modeInfo.mode)}
              disabled={dartWheelIsDisabled || !isAvailable}
              style={{
                borderColor: isSelected ? modeInfo.color : 'transparent',
                '--dart-wheel-mode-color': modeInfo.color,
              } as React.CSSProperties}
            >
              <div className="dart-wheel-mode-icon">{modeInfo.icon}</div>
              <h4 className="dart-wheel-mode-name">{modeInfo.name}</h4>
              <p className="dart-wheel-mode-description">{modeInfo.description}</p>
              
              {!isAvailable && (
                <div className="dart-wheel-mode-requirement">
                  최소 {modeInfo.minPlayers}명 필요
                </div>
              )}
              
              {isSelected && (
                <div className="dart-wheel-mode-badge">
                  선택됨
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="dart-wheel-mode-info">
        <p>현재 참가자: {dartWheelParticipantCount}명</p>
      </div>
    </div>
  );
}

export default DartWheelModeSelector;