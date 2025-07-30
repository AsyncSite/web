import { DART_WHEEL_THEME_PALETTES } from '../utils/dartWheelVisualEffects';
import './DartWheelThemeSelector.css';

export type DartWheelTheme = keyof typeof DART_WHEEL_THEME_PALETTES;

interface DartWheelThemeSelectorProps {
  dartWheelCurrentTheme: DartWheelTheme;
  onDartWheelThemeChange: (theme: DartWheelTheme) => void;
  dartWheelIsDisabled?: boolean;
}

function DartWheelThemeSelector({
  dartWheelCurrentTheme,
  onDartWheelThemeChange,
  dartWheelIsDisabled = false
}: DartWheelThemeSelectorProps): React.ReactNode {
  const dartWheelThemes: { key: DartWheelTheme; label: string; icon: string }[] = [
    { key: 'casino', label: '카지노', icon: '🎰' },
    { key: 'circus', label: '서커스', icon: '🎪' },
    { key: 'space', label: '우주', icon: '🌌' },
    { key: 'neon', label: '네온', icon: '🌟' },
    { key: 'forest', label: '숲', icon: '🌳' },
  ];

  return (
    <div className="dart-wheel-theme-selector">
      <h4 className="dart-wheel-theme-title">테마 선택</h4>
      <div className="dart-wheel-theme-options">
        {dartWheelThemes.map((theme) => {
          const palette = DART_WHEEL_THEME_PALETTES[theme.key];
          return (
            <button
              key={`dart-wheel-theme-${theme.key}`}
              className={`dart-wheel-theme-option ${
                dartWheelCurrentTheme === theme.key ? 'dart-wheel-theme-active' : ''
              }`}
              onClick={() => onDartWheelThemeChange(theme.key)}
              disabled={dartWheelIsDisabled}
              style={{
                background: `linear-gradient(135deg, ${palette.primary[0]} 0%, ${palette.primary[1]} 100%)`,
                borderColor: palette.accent,
              }}
            >
              <span className="dart-wheel-theme-icon">{theme.icon}</span>
              <span className="dart-wheel-theme-label">{theme.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DartWheelThemeSelector;