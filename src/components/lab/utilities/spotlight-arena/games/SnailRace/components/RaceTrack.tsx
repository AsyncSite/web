import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line, Group } from 'react-konva';
import { SnailRaceState, Participant } from '../../../shared/types';
import { SNAIL_RACE_EVENTS } from '../utils/eventDefinitions';
import useGameEngine from '../hooks/useGameEngine';
import SnailSprite from './SnailSprite';
import TrackBackground from './TrackBackground';
import './RaceTrack.css';

interface CommentaryMessage {
  id: string;
  text: string;
  timestamp: number;
}

interface RaceTrackProps {
  gameState: SnailRaceState;
  isPlaying: boolean;
  onRaceComplete: (winners: Participant[]) => void;
  onEventTrigger: (snailId: string, eventName: string) => void;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  onStageReady?: (stage: any) => void;
  commentaryMessages?: CommentaryMessage[];
  showResult?: boolean;
}

const RaceTrack: React.FC<RaceTrackProps> = ({
  gameState,
  isPlaying,
  onRaceComplete,
  onEventTrigger,
  onCanvasReady,
  onStageReady,
  commentaryMessages = [],
  showResult = false,
}) => {
  const stageRef = useRef<any>(null);
  const [finishedSnails, setFinishedSnails] = useState<string[]>([]);
  const trackWidth = 1000;
  const trackPaddingY = 80; // 상하 패딩 추가
  const commentaryHeight = 150; // 실시간 중계 영역 높이
  // 달팽이 수에 따라 트랙 높이 동적 조정
  const snailCount = gameState.snails.length;
  const minLaneHeight = 60; // 최소 레인 높이
  const calculatedHeight = Math.max(600, snailCount * minLaneHeight);
  const trackAreaHeight = calculatedHeight + trackPaddingY * 2;
  const totalHeight = trackAreaHeight + commentaryHeight; // 전체 높이에 중계 영역 추가
  const laneHeight = (calculatedHeight) / snailCount;
  const trackStartX = 100;
  const trackEndX = trackWidth - 100;
  const trackDistance = trackEndX - trackStartX;

  const { snails, startRace, stopRace } = useGameEngine({
    initialSnails: gameState.snails,
    trackLength: gameState.trackLength,
    winnerCount: gameState.settings.winnerCount,
    events: SNAIL_RACE_EVENTS,
    onRaceComplete,
    onEventTrigger,
  });

  useEffect(() => {
    if (isPlaying) {
      startRace();
    } else {
      stopRace();
    }
  }, [isPlaying, startRace, stopRace]);

  // Canvas와 Stage를 부모 컴포넌트에 전달
  useEffect(() => {
    if (stageRef.current) {
      // Stage ref 즉시 전달
      if (onStageReady) {
        // Stage를 바로 전달하여 녹화 준비 시간 단축
        requestAnimationFrame(() => {
          onStageReady(stageRef.current);
        });
      }

      // Canvas 전달 (기존 방식 유지)
      if (onCanvasReady) {
        // Konva Stage가 완전히 렌더링된 후 canvas 전달
        const timer = setTimeout(() => {
          const stage = stageRef.current;
          if (stage) {
            // Stage의 컨테이너에서 실제 canvas 요소 찾기
            const container = stage.container();
            const canvases = container.getElementsByTagName('canvas');

            // Konva는 여러 canvas를 사용하므로, 마지막 canvas가 주로 콘텐츠를 담고 있음
            if (canvases.length > 0) {
              const contentCanvas = canvases[canvases.length - 1];
              onCanvasReady(contentCanvas);
            }
          }
        }, 100); // 렌더링 시간 단축

        return () => clearTimeout(timer);
      }
    }
  }, [onCanvasReady, onStageReady]);

  // 완주한 달팽이 추적
  useEffect(() => {
    setFinishedSnails((prev) => {
      const currentFinished = snails
        .filter((snail) => snail.position >= gameState.trackLength)
        .map((snail) => snail.id);
      const newFinished = currentFinished.filter((id) => !prev.includes(id));
      if (newFinished.length > 0) {
        return [...prev, ...newFinished];
      }
      return prev;
    });
  }, [snails, gameState.trackLength]);

  const getSnailX = (position: number) => {
    return trackStartX + (position / gameState.trackLength) * trackDistance;
  };

  return (
    <div className="race-track-container">
      <Stage width={trackWidth} height={totalHeight} ref={stageRef}>
        {/* 배경 레이어 */}
        <Layer>
          <TrackBackground
            width={trackWidth}
            height={trackAreaHeight}
            laneCount={gameState.snails.length}
          />

          {/* 레인 구분선 */}
          {gameState.snails.map((_, index) => (
            <Line
              key={`lane-${index}`}
              points={[
                trackStartX,
                trackPaddingY + (index + 1) * laneHeight,
                trackEndX,
                trackPaddingY + (index + 1) * laneHeight,
              ]}
              stroke="#388E3C"
              strokeWidth={4}
              dash={[20, 10]}
              opacity={1}
            />
          ))}

          {/* 시작선 */}
          <Line
            points={[trackStartX, trackPaddingY, trackStartX, trackAreaHeight - trackPaddingY]}
            stroke="#1B5E20"
            strokeWidth={8}
          />
          <Text
            x={trackStartX - 80}
            y={trackAreaHeight / 2 - 20}
            text="START"
            fontSize={20}
            fontStyle="bold"
            fill="#1B5E20"
            rotation={-90}
          />

          {/* 결승선 */}
          <Line
            points={[trackEndX, trackPaddingY, trackEndX, trackAreaHeight - trackPaddingY]}
            stroke="#B71C1C"
            strokeWidth={8}
          />
          <Text
            x={trackEndX + 20}
            y={trackAreaHeight / 2 - 20}
            text="FINISH"
            fontSize={20}
            fontStyle="bold"
            fill="#B71C1C"
            rotation={-90}
          />
        </Layer>

        {/* 달팽이 레이어 */}
        <Layer>
          {snails.map((snail, index) => {
            const snailX = getSnailX(snail.position);
            // 각 레인의 정확한 중앙 위치 계산
            const laneTop = trackPaddingY + index * laneHeight;
            const snailY = laneTop + laneHeight / 2;
            const isFinished = snail.position >= gameState.trackLength;

            // 완주 순위 계산
            const rank = isFinished ? finishedSnails.indexOf(snail.id) + 1 : 0;

            return (
              <SnailSprite
                key={snail.id}
                snail={snail}
                x={snailX}
                y={snailY}
                isFinished={isFinished}
                rank={rank || undefined}
              />
            );
          })}
        </Layer>

        {/* 진행 상황 레이어 */}
        <Layer>
          {snails.map((snail, index) => {
            const progress = (snail.position / gameState.trackLength) * 100;
            // 진행 바를 레인 하단 근처에 배치
            const laneTop = trackPaddingY + index * laneHeight;
            const barY = laneTop + laneHeight - 15;

            return (
              <React.Fragment key={`progress-${snail.id}`}>
                {/* 진행 바 배경 */}
                <Rect
                  x={trackStartX}
                  y={barY}
                  width={trackDistance}
                  height={5}
                  fill="#E0E0E0"
                  cornerRadius={2.5}
                />
                {/* 진행 바 */}
                <Rect
                  x={trackStartX}
                  y={barY}
                  width={(trackDistance * progress) / 100}
                  height={5}
                  fill={snail.color}
                  cornerRadius={2.5}
                />
              </React.Fragment>
            );
          })}
        </Layer>

        {/* 실시간 중계 레이어 */}
        <Layer>
          {/* 중계 배경 */}
          <Rect
            x={0}
            y={trackAreaHeight}
            width={trackWidth}
            height={commentaryHeight}
            fill="#2C2C2C"
          />
          
          {/* 중계 헤더 */}
          <Rect
            x={0}
            y={trackAreaHeight}
            width={trackWidth}
            height={30}
            fill="#1A1A1A"
          />
          <Text
            x={20}
            y={trackAreaHeight + 8}
            text="📢 실시간 중계"
            fontSize={16}
            fontStyle="bold"
            fill="#FFFFFF"
          />
          
          {/* 중계 메시지들 */}
          {commentaryMessages.slice(-5).map((message, index) => (
            <Text
              key={message.id}
              x={20}
              y={trackAreaHeight + 40 + (index * 20)}
              text={message.text}
              fontSize={14}
              fill="#E0E0E0"
              width={trackWidth - 40}
            />
          ))}
          
          {commentaryMessages.length === 0 && (
            <Text
              x={20}
              y={trackAreaHeight + 40}
              text="레이스가 곧 시작됩니다..."
              fontSize={14}
              fill="#9E9E9E"
            />
          )}
        </Layer>

        {/* 결과 표시 레이어 */}
        {showResult && gameState.status === 'finished' && (
          <Layer>
            {/* 반투명 오버레이 */}
            <Rect
              x={0}
              y={0}
              width={trackWidth}
              height={totalHeight}
              fill="black"
              opacity={0.7}
            />
            
            {/* 결과 박스 */}
            <Rect
              x={trackWidth / 2 - 250}
              y={totalHeight / 2 - 150}
              width={500}
              height={300}
              fill="#FFFFFF"
              stroke="#FFD700"
              strokeWidth={4}
              cornerRadius={20}
            />
            
            {/* 게임 제목 */}
            <Text
              x={trackWidth / 2}
              y={totalHeight / 2 - 120}
              text="🐌 달팽이 레이스 결과"
              fontSize={28}
              fontStyle="bold"
              fill="#1A1A1A"
              align="center"
              offsetX={120}
            />
            
            {/* 우승자 목록 */}
            {gameState.winners.map((winner, index) => (
              <Group key={winner.id}>
                <Text
                  x={trackWidth / 2 - 150}
                  y={totalHeight / 2 - 50 + (index * 40)}
                  text={`${index + 1}위: ${winner.name}`}
                  fontSize={24}
                  fill={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                  fontStyle="bold"
                />
              </Group>
            ))}
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default RaceTrack;
