import { DartWheelGameSettings } from '../types/dartWheel';
import { DART_WHEEL_WEIGHT_PRESETS } from '../utils/dartWheelSectionGenerator';
import './DartWheelSettings.css';

interface DartWheelSettingsProps {
  dartWheelSettings: DartWheelGameSettings;
  onDartWheelSettingsChange: (settings: DartWheelGameSettings) => void;
  dartWheelIsGameStarted: boolean;
}

function DartWheelSettings({
  dartWheelSettings,
  onDartWheelSettingsChange,
  dartWheelIsGameStarted
}: DartWheelSettingsProps): React.ReactNode {
  const handleDartWheelToggleWeights = () => {
    onDartWheelSettingsChange({
      ...dartWheelSettings,
      dartWheelEnableWeights: !dartWheelSettings.dartWheelEnableWeights,
    });
  };

  const handleDartWheelToggleBonus = () => {
    onDartWheelSettingsChange({
      ...dartWheelSettings,
      dartWheelEnableBonus: !dartWheelSettings.dartWheelEnableBonus,
    });
  };

  const handleDartWheelBonusCountChange = (count: number) => {
    onDartWheelSettingsChange({
      ...dartWheelSettings,
      dartWheelBonusSectionCount: count,
    });
  };

  return (
    <div className="dart-wheel-settings">
      <h3 className="dart-wheel-settings-title">게임 설정</h3>
      
      <div className="dart-wheel-settings-section">
        <label className="dart-wheel-setting-item">
          <input
            type="checkbox"
            checked={dartWheelSettings.dartWheelEnableWeights}
            onChange={handleDartWheelToggleWeights}
            disabled={dartWheelIsGameStarted}
            className="dart-wheel-checkbox"
          />
          <span className="dart-wheel-setting-label">
            가중치 시스템 사용
          </span>
        </label>
        
        {dartWheelSettings.dartWheelEnableWeights && (
          <div className="dart-wheel-weight-presets">
            <p className="dart-wheel-preset-info">
              낮은 점수가 더 자주 나오도록 설정됩니다.
            </p>
          </div>
        )}
      </div>

      <div className="dart-wheel-settings-section">
        <label className="dart-wheel-setting-item">
          <input
            type="checkbox"
            checked={dartWheelSettings.dartWheelEnableBonus}
            onChange={handleDartWheelToggleBonus}
            disabled={dartWheelIsGameStarted}
            className="dart-wheel-checkbox"
          />
          <span className="dart-wheel-setting-label">
            보너스 섹션 추가
          </span>
        </label>
        
        {dartWheelSettings.dartWheelEnableBonus && (
          <div className="dart-wheel-bonus-settings">
            <label className="dart-wheel-bonus-count">
              보너스 섹션 수:
              <select
                value={dartWheelSettings.dartWheelBonusSectionCount}
                onChange={(e) => handleDartWheelBonusCountChange(Number(e.target.value))}
                disabled={dartWheelIsGameStarted}
                className="dart-wheel-select"
              >
                <option value={1}>1개</option>
                <option value={2}>2개</option>
                <option value={3}>3개</option>
              </select>
            </label>
            <p className="dart-wheel-bonus-info">
              2배, 3배, 다시돌리기 등의 특수 효과가 추가됩니다.
            </p>
          </div>
        )}
      </div>

      {dartWheelIsGameStarted && (
        <p className="dart-wheel-settings-notice">
          게임 진행 중에는 설정을 변경할 수 없습니다.
        </p>
      )}
    </div>
  );
}

export default DartWheelSettings;