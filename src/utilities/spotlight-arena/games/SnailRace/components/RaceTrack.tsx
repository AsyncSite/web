import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import { SnailRaceState, Participant } from '../../../shared/types';
import { SNAIL_RACE_EVENTS } from '../utils/eventDefinitions';
import useGameEngine from '../hooks/useGameEngine';
import SnailSprite from './SnailSprite';
import TrackBackground from './TrackBackground';
import './RaceTrack.css';

interface RaceTrackProps {
  gameState: SnailRaceState;
  isPlaying: boolean;
  onRaceComplete: (winners: Participant[]) => void;
  onEventTrigger: (snailId: string, eventName: string) => void;
}

const RaceTrack: React.FC<RaceTrackProps> = ({
  gameState,
  isPlaying,
  onRaceComplete,
  onEventTrigger,
}) => {
  const stageRef = useRef<any>(null);
  const [finishedSnails, setFinishedSnails] = useState<string[]>([]);
  const trackWidth = 1000;
  const trackPaddingY = 80; // 상하 패딩 추가
  // 달팽이 수에 따라 트랙 높이 동적 조정
  const snailCount = gameState.snails.length;
  const minLaneHeight = 60; // 최소 레인 높이
  const calculatedHeight = Math.max(600, snailCount * minLaneHeight);
  const trackHeight = calculatedHeight + trackPaddingY * 2;
  const laneHeight = (trackHeight - trackPaddingY * 2) / snailCount;
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

  // 완주한 달팽이 추적
  useEffect(() => {
    const newFinishedSnails = snails
      .filter((snail) => snail.position >= gameState.trackLength)
      .map((snail) => snail.id)
      .filter((id) => !finishedSnails.includes(id));

    if (newFinishedSnails.length > 0) {
      setFinishedSnails((prev) => [...prev, ...newFinishedSnails]);
    }
  }, [snails, gameState.trackLength, finishedSnails]);

  const getSnailX = (position: number) => {
    return trackStartX + (position / gameState.trackLength) * trackDistance;
  };

  return (
    <div className="race-track-container">
      <Stage width={trackWidth} height={trackHeight} ref={stageRef}>
        {/* 배경 레이어 */}
        <Layer>
          <TrackBackground
            width={trackWidth}
            height={trackHeight}
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
              stroke="#C8E6C9"
              strokeWidth={2}
              dash={[10, 5]}
            />
          ))}

          {/* 시작선 */}
          <Line
            points={[trackStartX, trackPaddingY, trackStartX, trackHeight - trackPaddingY]}
            stroke="#4CAF50"
            strokeWidth={4}
          />
          <Text
            x={trackStartX - 80}
            y={trackHeight / 2 - 20}
            text="START"
            fontSize={20}
            fontStyle="bold"
            fill="#4CAF50"
            rotation={-90}
          />

          {/* 결승선 */}
          <Line
            points={[trackEndX, trackPaddingY, trackEndX, trackHeight - trackPaddingY]}
            stroke="#F44336"
            strokeWidth={4}
          />
          <Text
            x={trackEndX + 20}
            y={trackHeight / 2 - 20}
            text="FINISH"
            fontSize={20}
            fontStyle="bold"
            fill="#F44336"
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
      </Stage>
    </div>
  );
};

export default RaceTrack;
