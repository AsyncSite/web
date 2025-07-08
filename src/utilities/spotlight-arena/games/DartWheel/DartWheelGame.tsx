import { useCallback, useEffect } from 'react';
import { Participant } from '../../../../components/lab/utilities/spotlight-arena/shared/types';
import ResultDisplay from '../../../../components/lab/utilities/spotlight-arena/common/ResultDisplay';
import { useDartWheelGame } from './hooks/useDartWheelGame';
import DartWheelCountdown from './components/DartWheelCountdown';
import DartWheelCanvas from './components/DartWheelCanvas';
import DartWheelParticipantDisplay from './components/DartWheelParticipantDisplay';
import DartWheelResultsDisplay from './components/DartWheelResultsDisplay';
import DartWheelSettings from './components/DartWheelSettings';
import DartWheelThemeSelector from './components/DartWheelThemeSelector';
import DartWheelSoundSettings from './components/DartWheelSoundSettings';
import DartWheelModeSelector from './components/DartWheelModeSelector';
import { DART_WHEEL_THEME_PALETTES } from './utils/dartWheelVisualEffects';
import { useDartWheelSound } from './hooks/useDartWheelSound';
import './DartWheelGame.css';

interface DartWheelGameProps {
  participants: Participant[];
  winnerCount: number;
  onBack: () => void;
  onReplay: () => void;
  onNewGame: () => void;
}

function DartWheelGame({
  participants,
  winnerCount,
  onBack,
  onReplay,
  onNewGame
}: DartWheelGameProps): React.ReactNode {
  const {
    dartWheelGameState,
    dartWheelGameStatus,
    dartWheelWinners,
    dartWheelStartGame,
    dartWheelSpinWheel,
    dartWheelIsSpinning,
    dartWheelCurrentParticipant,
    dartWheelShowCountdown,
    dartWheelSettings,
    dartWheelUpdateSettings,
    dartWheelTheme,
    dartWheelSetTheme,
    dartWheelGameMode,
    dartWheelSetGameMode,
    dartWheelModeState,
  } = useDartWheelGame({ participants, winnerCount });

  // 사운드 훅
  const {
    playDartWheelCountdownSound,
    startDartWheelBGM,
    stopDartWheelBGM,
    setDartWheelVolume,
    toggleDartWheelMute,
    getDartWheelSoundSettings,
  } = useDartWheelSound({
    dartWheelGameState,
    dartWheelIsEnabled: true,
  });

  const dartWheelSoundSettings = getDartWheelSoundSettings();

  const handleDartWheelStartClick = useCallback(() => {
    dartWheelStartGame();
    playDartWheelCountdownSound();
    startDartWheelBGM();
  }, [dartWheelStartGame, playDartWheelCountdownSound, startDartWheelBGM]);

  const handleDartWheelSpinClick = useCallback(() => {
    dartWheelSpinWheel();
  }, [dartWheelSpinWheel]);

  const handleDartWheelCountdownComplete = useCallback(() => {
    // 카운트다운 완료 후 처리는 훅에서 진행
  }, []);

  // 게임 종료 시 BGM 정지
  useEffect(() => {
    if (dartWheelGameStatus === 'finished') {
      stopDartWheelBGM();
    }
  }, [dartWheelGameStatus, stopDartWheelBGM]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopDartWheelBGM();
    };
  }, [stopDartWheelBGM]);

  // 게임 완료 상태
  if (dartWheelGameStatus === 'finished') {
    return (
      <ResultDisplay
        winners={dartWheelWinners}
        gameName="다트휠"
        onReplay={onReplay}
        onNewGame={onNewGame}
        onGoHome={onBack}
      />
    );
  }

  const dartWheelThemeColors = DART_WHEEL_THEME_PALETTES[dartWheelTheme];

  return (
    <div 
      className="dart-wheel-game-container"
      data-theme={dartWheelTheme}
      style={{
        '--dart-wheel-bg': dartWheelThemeColors.background,
        '--dart-wheel-surface': dartWheelThemeColors.surface || dartWheelThemeColors.background,
        '--dart-wheel-text': dartWheelThemeColors.text,
        '--dart-wheel-secondary-text': dartWheelThemeColors.secondaryText,
        '--dart-wheel-accent': dartWheelThemeColors.accent,
        '--dart-wheel-glow': dartWheelThemeColors.glow,
        '--dart-wheel-border': dartWheelThemeColors.border || '#e0e0e0',
        '--dart-wheel-success': dartWheelThemeColors.success || '#4CAF50',
        '--dart-wheel-warning': dartWheelThemeColors.warning || '#FF9800',
        '--dart-wheel-error': dartWheelThemeColors.error || '#F44336',
        '--dart-wheel-hover': dartWheelThemeColors.hover || 'rgba(0, 0, 0, 0.05)',
        '--dart-wheel-shadow': dartWheelThemeColors.shadow || 'rgba(0, 0, 0, 0.1)',
        minHeight: '100vh',
      } as React.CSSProperties}
    >
      {/* 카운트다운 오버레이 */}
      {dartWheelShowCountdown && (
        <DartWheelCountdown 
          onDartWheelCountdownComplete={handleDartWheelCountdownComplete}
        />
      )}

      {/* 게임 헤더 */}
      <div className="dart-wheel-game-header">
        <h2 className="dart-wheel-game-title">다트휠 게임</h2>
        <div className="dart-wheel-header-controls">
          {/* 컴팩트 사운드 설정 */}
          <DartWheelSoundSettings
            dartWheelSoundSettings={dartWheelSoundSettings}
            onDartWheelVolumeChange={setDartWheelVolume}
            onDartWheelMuteToggle={toggleDartWheelMute}
            dartWheelIsCompact={true}
          />
          <button 
            className="dart-wheel-back-button"
            onClick={onBack}
          >
            뒤로가기
          </button>
        </div>
      </div>

      {/* 게임 메인 영역 */}
      <div className="dart-wheel-game-content">
        {dartWheelGameStatus === 'waiting' ? (
          // 게임 시작 전 화면
          <div className="dart-wheel-start-screen">
            <div className="dart-wheel-pre-game-container">
              <div className="dart-wheel-participants-preview">
                <h3>참가자 목록</h3>
                <div className="dart-wheel-participants-list">
                  {participants.map((participant) => (
                    <div 
                      key={`dart-wheel-preview-${participant.id}`}
                      className="dart-wheel-participant-item"
                    >
                      {participant.name}
                    </div>
                  ))}
                </div>
                <div className="dart-wheel-game-info">
                  <p>총 {participants.length}명의 참가자</p>
                  <p>우승자: {winnerCount}명</p>
                </div>
              </div>
              
              {/* 게임 설정 UI */}
              <DartWheelSettings
                dartWheelSettings={dartWheelSettings}
                onDartWheelSettingsChange={dartWheelUpdateSettings}
                dartWheelIsGameStarted={false}
              />
              
              {/* 테마 선택기 */}
              <DartWheelThemeSelector
                dartWheelCurrentTheme={dartWheelTheme}
                onDartWheelThemeChange={dartWheelSetTheme}
                dartWheelIsDisabled={false}
              />
              
              {/* 게임 모드 선택기 */}
              <DartWheelModeSelector
                dartWheelCurrentMode={dartWheelGameMode}
                onDartWheelModeChange={dartWheelSetGameMode}
                dartWheelParticipantCount={participants.length}
                dartWheelIsDisabled={false}
              />
            </div>
            
            <button 
              className="dart-wheel-start-button"
              onClick={handleDartWheelStartClick}
            >
              게임 시작
            </button>
          </div>
        ) : (
          // 게임 진행 중 화면
          <div className="dart-wheel-playing-screen">
            <div className="dart-wheel-main-area">
              {/* 다트휠 캔버스 */}
              <div className="dart-wheel-canvas-wrapper">
                <DartWheelCanvas
                  dartWheelGameState={dartWheelGameState}
                  dartWheelCanvasWidth={600}
                  dartWheelCanvasHeight={600}
                  dartWheelRadius={250}
                  dartWheelTheme={dartWheelTheme}
                />
                {!dartWheelIsSpinning && dartWheelGameState.dartWheelStatus === 'idle' && (
                  <button 
                    className="dart-wheel-spin-action-button"
                    onClick={handleDartWheelSpinClick}
                  >
                    휠 돌리기
                  </button>
                )}
              </div>
            </div>

            <div className="dart-wheel-side-panel">
              {/* 게임 모드별 정보 표시 */}
              {dartWheelGameMode === 'team' && dartWheelModeState.teams && (
                <div className="dart-wheel-team-display">
                  <h3>팀 점수</h3>
                  {dartWheelModeState.teams.map(team => (
                    <div key={team.id} className="dart-wheel-team-item" style={{ borderColor: team.color }}>
                      <span style={{ color: team.color }}>{team.name}</span>
                      <span>{team.totalScore}점</span>
                    </div>
                  ))}
                </div>
              )}
              
              {dartWheelGameMode === 'survival' && dartWheelModeState.survival && (
                <div className="dart-wheel-survival-display">
                  <h3>서바이벌 모드</h3>
                  <p>라운드 {dartWheelModeState.survival.currentRound}</p>
                  <p>생존자: {dartWheelModeState.survival.activeParticipants.length}명</p>
                  <p>탈락자: {dartWheelModeState.survival.eliminatedParticipants.length}명</p>
                </div>
              )}
              
              {dartWheelGameMode === 'target' && dartWheelSettings.dartWheelTargetScore && (
                <div className="dart-wheel-target-display">
                  <h3>목표 점수: {dartWheelSettings.dartWheelTargetScore}점</h3>
                </div>
              )}
              
              {/* 현재 참가자 정보 */}
              <DartWheelParticipantDisplay
                dartWheelCurrentParticipant={dartWheelCurrentParticipant}
                dartWheelParticipantsList={dartWheelGameMode === 'survival' && dartWheelModeState.survival 
                  ? dartWheelModeState.survival.activeParticipants 
                  : participants}
                dartWheelCurrentIndex={dartWheelGameState.dartWheelCurrentParticipantIndex}
                dartWheelIsSpinning={dartWheelIsSpinning}
              />

              {/* 결과 표시 */}
              <DartWheelResultsDisplay
                dartWheelResults={dartWheelGameState.dartWheelResults}
                dartWheelShowLatestOnly={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DartWheelGame;