import React from 'react';
import { Group, Rect, Circle, Path, Text } from 'react-konva';

interface TrackBackgroundProps {
  width: number;
  height: number;
  laneCount: number;
}

const TrackBackground: React.FC<TrackBackgroundProps> = ({ width, height, laneCount }) => {
  const trackPaddingY = 80;
  const trackAreaHeight = height - trackPaddingY * 2;

  // 응원하는 캐릭터들 (트랙 영역에 맞게 조정)
  const cheeringPositions = [
    { x: 50, y: trackPaddingY + trackAreaHeight * 0.25 },
    { x: 50, y: trackPaddingY + trackAreaHeight * 0.5 },
    { x: 50, y: trackPaddingY + trackAreaHeight * 0.75 },
    { x: width - 50, y: trackPaddingY + trackAreaHeight * 0.25 },
    { x: width - 50, y: trackPaddingY + trackAreaHeight * 0.5 },
    { x: width - 50, y: trackPaddingY + trackAreaHeight * 0.75 },
  ];

  const cheeringEmojis = ['🐰', '🐸', '🦋', '🐝', '🐞', '🦗'];

  return (
    <Group>
      {/* 잔디 배경 그라데이션 효과 */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: height }}
        fillLinearGradientColorStops={[0, '#66BB6A', 1, '#4CAF50']}
      />

      {/* 잔디 텍스처 - 성능을 위해 개수 감소 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Path
          key={`grass-${i}`}
          x={Math.random() * width}
          y={Math.random() * height}
          data="M0,0 L-2,-5 L0,-8 L2,-5 Z"
          fill="#2E7D32"
          opacity={0.5}
          rotation={Math.random() * 360}
        />
      ))}

      {/* 응원하는 캐릭터 - 정적으로 표시 (성능 최적화) */}
      {cheeringPositions.map((pos, index) => (
        <Text
          key={`cheering-${index}`}
          x={pos.x - 15}
          y={pos.y - 15}
          text={cheeringEmojis[index % cheeringEmojis.length]}
          fontSize={30}
        />
      ))}
    </Group>
  );
};

export default TrackBackground;
