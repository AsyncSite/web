import { useRef, useCallback, useEffect } from 'react';
import { Participant } from '../../shared/types';
import RaceTrack from './components/RaceTrack';
import RaceCountdown from './components/RaceCountdown';
import EventNotification from './components/EventNotification';
import RaceCommentary from './components/RaceCommentary';
import RecordingControls from './components/RecordingControls';
import ResultDisplay from '../../common/ResultDisplay';
import { useSnailRaceGame } from './hooks/useSnailRaceGame';
import useRaceRecorder from './hooks/useRaceRecorder';
import useResultRecording from './hooks/useResultRecording';
import './SnailRaceGame.css';

interface SnailRaceGameProps {
  participants: Participant[];
  winnerCount: number;
  onBack: () => void;
  onReplay: () => void;
  onNewGame: () => void;
}

function SnailRaceGame({
  participants,
  winnerCount,
  onBack,
  onReplay,
  onNewGame,
}: SnailRaceGameProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, showCountdown, currentEvent, commentaryMessages, handlers } = useSnailRaceGame(
    { participants, winnerCount },
  );
  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    isStarting,
    hasRecording,
  } = useRaceRecorder({ canvasRef });

  // 결과 화면용 녹화 관리
  const resultRecording = useResultRecording();

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    (canvasRef as any).current = canvas;
  }, []);

  // 게임이 종료되면 녹화 자동 중지
  useEffect(() => {
    if (gameState.status === 'finished' && isRecording) {
      stopRecording();
    }
  }, [gameState.status, isRecording, stopRecording]);
  // 컴포넌트 언마운트 시 녹화 데이터 정리
  useEffect(() => {
    return () => {
      // 게임을 떠날 때 localStorage 정리
      localStorage.removeItem('snailRaceRecording');
      localStorage.removeItem('snailRaceRecordingTime');
    };
  }, []);
  if (gameState.status === 'finished') {
    return (
      <ResultDisplay
        winners={gameState.winners}
        gameName="달팽이 레이스"
        onReplay={onReplay}
        onNewGame={onNewGame}
        onGoHome={onBack}
        onDownloadRecording={hasRecording ? downloadRecording : resultRecording.downloadRecording}
        hasRecording={hasRecording || resultRecording.hasRecording}
      />
    );
  }

  return (
    <div className="snail-race-game">
      <div className="game-header">
        <button className="snail-race-back-button" onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2 className="game-title">🐌 달팽이 레이스</h2>
      </div>

      <div className="game-content">
        {showCountdown && <RaceCountdown onComplete={handlers.handleCountdownComplete} />}

        {currentEvent && (
          <EventNotification
            snailName={
              gameState.snails.find((s) => s.id === currentEvent.snailId)?.participant.name || ''
            }
            eventName={currentEvent.eventName}
          />
        )}

        <RaceTrack
          gameState={gameState}
          isPlaying={gameState.status === 'playing'}
          onRaceComplete={handlers.handleRaceComplete}
          onEventTrigger={handlers.handleEventTrigger}
          onCanvasReady={handleCanvasReady}
        />

        <RaceCommentary messages={commentaryMessages} />
        <RecordingControls
          isRecording={isRecording}
          isPaused={isPaused}
          recordingTime={recordingTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onPauseRecording={pauseRecording}
          onResumeRecording={resumeRecording}
          onDownload={downloadRecording}
          hasRecording={hasRecording}
          isStarting={isStarting}
        />

        {gameState.status === 'waiting' && (
          <div className="game-controls">
            <button
              className="start-button sa-button sa-button-primary"
              onClick={handlers.handleStartGame}
            >
              🏁 레이스 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SnailRaceGame;
