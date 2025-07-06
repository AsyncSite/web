import React from 'react';
import { Group, Path, Circle, Text, Line } from 'react-konva';
import { Snail } from '../../../shared/types';
import { getContrastColor } from '../utils/snailColors';

interface SnailSpriteProps {
  snail: Snail;
  x: number;
  y: number;
  isFinished: boolean;
  rank?: number;
}

const SnailSprite: React.FC<SnailSpriteProps> = ({ snail, x, y, isFinished, rank }) => {
  const scale = 0.8;
  
  // 달팽이 몸통 경로 (단순화)
  const bodyPath = `
    M -30,0
    Q -20,-15 0,-15
    Q 20,-15 25,0
    Q 20,15 0,15
    Q -20,15 -30,0
    Z
  `;

  // 달팽이 껍질 경로 (나선형)
  const shellPath = `
    M 0,0
    m -15,0
    a 15,15 0 1,1 30,0
    a 15,15 0 1,1 -30,0
    m 5,0
    a 10,10 0 1,1 20,0
    a 10,10 0 1,1 -20,0
    m 5,0
    a 5,5 0 1,1 10,0
    a 5,5 0 1,1 -10,0
  `;

  return (
    <Group x={x} y={y} opacity={isFinished ? 0.7 : 1}>
      {/* 점액 자국 */}
      {!isFinished && (
        <Line
          points={[-40, 0, -30, 0]}
          stroke={snail.color}
          strokeWidth={8}
          opacity={0.3}
          lineCap="round"
        />
      )}

      {/* 달팽이 그룹 */}
      <Group scaleX={scale} scaleY={scale}>
        {/* 몸통 */}
        <Path
          data={bodyPath}
          fill={snail.color}
          stroke="#333"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* 껍질 */}
        <Group x={5} y={0}>
          <Path
            data={shellPath}
            fill={snail.color}
            stroke="#333"
            strokeWidth={2}
          />
          {/* 껍질 무늬 */}
          <Circle
            x={0}
            y={0}
            radius={12}
            fill={snail.color}
            opacity={0.7}
          />
        </Group>

        {/* 더듬이 (정적) */}
        <Group x={-25} y={-10}>
          <Line
            points={[0, 0, -5, -8]}
            stroke="#333"
            strokeWidth={2}
            lineCap="round"
          />
          <Circle
            x={-5}
            y={-8}
            radius={3}
            fill="#333"
          />
        </Group>
        <Group x={-25} y={-5}>
          <Line
            points={[0, 0, -5, -8]}
            stroke="#333"
            strokeWidth={2}
            lineCap="round"
          />
          <Circle
            x={-5}
            y={-8}
            radius={3}
            fill="#333"
          />
        </Group>

        {/* 눈 */}
        <Circle
          x={-20}
          y={-5}
          radius={2}
          fill="#fff"
        />
        <Circle
          x={-20}
          y={0}
          radius={2}
          fill="#fff"
        />
      </Group>

      {/* 이름표 */}
      <Text
        x={-30}
        y={-35}
        text={snail.participant.name}
        fontSize={14}
        fill={getContrastColor(snail.color)}
        align="center"
        width={60}
      />

      {/* 이벤트 아이콘 */}
      {snail.activeEvent && (
        <Group x={0} y={-20}>
          <Circle
            radius={15}
            fill="white"
            stroke={snail.color}
            strokeWidth={2}
          />
          <Text
            x={-10}
            y={-10}
            text={snail.activeEvent.event.icon}
            fontSize={18}
            width={20}
            height={20}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}

      {/* 순위 표시 */}
      {isFinished && rank && (
        <Group x={30} y={-10}>
          <Circle
            radius={18}
            fill="#F44336"
            stroke="#fff"
            strokeWidth={2}
          />
          <Text
            x={-15}
            y={-10}
            text={`${rank}등`}
            fontSize={16}
            fontStyle="bold"
            fill="white"
            width={30}
            align="center"
          />
        </Group>
      )}
    </Group>
  );
};

export default SnailSprite;