import { useRef, useCallback, useEffect, useState } from 'react';
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
  const {
    gameState,
    showCountdown,
    currentEvent,
    commentaryMessages,
    handlers,
  } = useSnailRaceGame({ participants, winnerCount });
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
  // 녹화가 완료되었는지 추적하는 상태
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    // Canvas는 사용하지 않고 Stage만 사용
    // (canvasRef as any).current = canvas;
  }, []);
  // Stage ref를 전달받기 위한 callback
  const handleStageRef = useCallback((stage: any) => {
    if (stage) {
      // Stage 자체를 저장하여 toCanvas 메서드 사용 가능
      (canvasRef as any).current = stage;
    }
  }, []);

  // 게임이 종료되면 녹화 자동 중지
  useEffect(() => {
    if (gameState.status === 'finished') {
      if (isRecording) {
        console.log('Game finished, will stop recording after delay...');
        setRecordingCompleted(true); // 녹화가 있었음을 기록

        // 최소 1초 후에 녹화 중지하여 데이터가 수집되도록 함
        setTimeout(() => {
          console.log('Stopping recording after delay');
          stopRecording();
        }, 1000);
      } else if (hasRecording) {
        // 이미 녹화가 중지되었지만 데이터가 있는 경우
        setRecordingCompleted(true);
      }
    }
  }, [gameState.status, isRecording, hasRecording, stopRecording]);
  // 컴포넌트 언마운트 시 녹화 데이터 정리
  // 주의: 게임 종료 시에는 정리하지 않고, 실제로 페이지를 떠날 때만 정리
  useEffect(() => {
    return () => {
      // 게임이 아직 진행 중이거나 기다리는 중일 때만 정리
      // (결과 화면으로 전환될 때는 정리하지 않음)
      if (gameState.status !== 'finished') {
        console.log('Cleaning up recording data (game not finished)');
        localStorage.removeItem('snailRaceRecording');
        localStorage.removeItem('snailRaceRecordingTime');
      } else {
        console.log('Game finished, keeping recording data');
      }
    };
  }, [gameState.status]);
  if (gameState.status === 'finished') {
    // 녹화가 있는지 최종 확인
    const hasAnyRecording =
      recordingCompleted || hasRecording || resultRecording.hasRecording;
    console.log('Rendering ResultDisplay with:', {
      recordingCompleted,
      hasRecording,
      resultRecordingHasRecording: resultRecording.hasRecording,
      hasAnyRecording,
    });
    return (
      <ResultDisplay
        winners={gameState.winners}
        gameName="달팽이 레이스"
        onReplay={onReplay}
        onNewGame={onNewGame}
        onGoHome={onBack}
        onDownloadRecording={
          hasRecording ? downloadRecording : resultRecording.downloadRecording
        }
        hasRecording={hasAnyRecording}
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
        {showCountdown && (
          <RaceCountdown onComplete={handlers.handleCountdownComplete} />
        )}

        {currentEvent && (
          <EventNotification
            snailName={
              gameState.snails.find((s) => s.id === currentEvent.snailId)
                ?.participant.name || ''
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
          onStageReady={handleStageRef}
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
