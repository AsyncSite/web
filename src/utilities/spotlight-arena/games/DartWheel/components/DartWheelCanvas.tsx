import { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Wedge, Text, Arrow, Group, Circle, Ring } from 'react-konva';
import { DartWheelSection, DartWheelGameState } from '../types/dartWheel';
import { dartWheelCalculateCurrentRotation } from '../utils/dartWheelCalculations';
import { 
  dartWheelCalculate3DShadow, 
  dartWheelGetNeonStyle,
  dartWheelApplyPulseEffect,
  dartWheelGetCasinoChipStyle,
  dartWheelGetThemeSpecialEffects,
  DART_WHEEL_THEME_PALETTES
} from '../utils/dartWheelVisualEffects';
import DartWheelParticles from './DartWheelParticles';
import { useDartWheelSound } from '../hooks/useDartWheelSound';
import './DartWheelCanvas.css';

interface DartWheelCanvasProps {
  dartWheelGameState: DartWheelGameState;
  dartWheelCanvasWidth?: number;
  dartWheelCanvasHeight?: number;
  dartWheelRadius?: number;
  dartWheelTheme?: string;
  onDartWheelSpinComplete?: (section: DartWheelSection) => void;
}

function DartWheelCanvas({
  dartWheelGameState,
  dartWheelCanvasWidth = 600,
  dartWheelCanvasHeight = 600,
  dartWheelRadius = 250,
  dartWheelTheme = 'casino',
  onDartWheelSpinComplete
}: DartWheelCanvasProps): React.ReactNode {
  const dartWheelCenterX = dartWheelCanvasWidth / 2;
  const dartWheelCenterY = dartWheelCanvasHeight / 2;
  const dartWheelAnimationRef = useRef<number>();
  const dartWheelStartRotationRef = useRef<number>(0);
  const dartWheelGroupRef = useRef<any>(null);
  const [dartWheelShowParticles, setDartWheelShowParticles] = useState(false);
  const [dartWheelSelectedSection, setDartWheelSelectedSection] = useState<DartWheelSection | null>(null);
  const [dartWheelHoveredSection, setDartWheelHoveredSection] = useState<string | null>(null);
  const [dartWheelTime, setDartWheelTime] = useState(0);
  const [dartWheelCurrentRotation, setDartWheelCurrentRotation] = useState(0);

  // 사운드 훅
  const { getDartWheelSoundSettings } = useDartWheelSound({
    dartWheelGameState,
    dartWheelCurrentRotation,
    dartWheelIsEnabled: true,
  });

  // 애니메이션 프레임 업데이트
  const dartWheelUpdateAnimation = useCallback(() => {
    if (dartWheelGameState.dartWheelStatus !== 'spinning' || 
        !dartWheelGameState.dartWheelSpinStartTime) {
      return;
    }

    const elapsedTime = Date.now() - dartWheelGameState.dartWheelSpinStartTime;
    const currentRotation = dartWheelCalculateCurrentRotation(
      dartWheelStartRotationRef.current,
      dartWheelGameState.dartWheelTargetRotation,
      elapsedTime,
      dartWheelGameState.dartWheelSpinDuration,
      'easeOut'
    );

    if (dartWheelGroupRef.current) {
      dartWheelGroupRef.current.rotation(currentRotation);
      setDartWheelCurrentRotation(currentRotation);
    }

    if (elapsedTime < dartWheelGameState.dartWheelSpinDuration) {
      dartWheelAnimationRef.current = requestAnimationFrame(dartWheelUpdateAnimation);
    }
  }, [
    dartWheelGameState.dartWheelStatus,
    dartWheelGameState.dartWheelSpinStartTime,
    dartWheelGameState.dartWheelTargetRotation,
    dartWheelGameState.dartWheelSpinDuration
  ]);

  // 스핀 상태 변경 감지
  useEffect(() => {
    if (dartWheelGameState.dartWheelStatus === 'spinning') {
      dartWheelStartRotationRef.current = dartWheelGameState.dartWheelCurrentRotation;
      dartWheelUpdateAnimation();
      setDartWheelShowParticles(false);
    } else if (dartWheelGameState.dartWheelStatus === 'stopped') {
      // 결과가 나왔을 때 파티클 효과
      const latestResult = dartWheelGameState.dartWheelResults[dartWheelGameState.dartWheelResults.length - 1];
      if (latestResult) {
        setDartWheelSelectedSection(latestResult.section);
        setDartWheelShowParticles(true);
        
        // 3초 후 파티클 효과 종료
        setTimeout(() => {
          setDartWheelShowParticles(false);
          setDartWheelSelectedSection(null);
        }, 3000);
      }
    }

    return () => {
      if (dartWheelAnimationRef.current) {
        cancelAnimationFrame(dartWheelAnimationRef.current);
      }
    };
  }, [dartWheelGameState.dartWheelStatus, dartWheelGameState.dartWheelResults, dartWheelUpdateAnimation]);

  // 시간 애니메이션 (펄스 효과용)
  useEffect(() => {
    const interval = setInterval(() => {
      setDartWheelTime(prev => prev + 1);
    }, 16);
    
    return () => clearInterval(interval);
  }, []);

  // 섹션 텍스트 위치 계산
  const getDartWheelTextPosition = (section: DartWheelSection) => {
    const angleRad = ((section.angle + section.angleSize / 2) * Math.PI) / 180;
    const textRadius = dartWheelRadius * 0.75;
    return {
      x: dartWheelCenterX + Math.cos(angleRad) * textRadius,
      y: dartWheelCenterY + Math.sin(angleRad) * textRadius,
    };
  };

  // 테마 효과 가져오기
  const themeEffects = dartWheelGetThemeSpecialEffects(dartWheelTheme);

  return (
    <div className="dart-wheel-canvas-container">
      <Stage width={dartWheelCanvasWidth} height={dartWheelCanvasHeight}>
        <Layer>
          {/* 외부 링 (테마별) */}
          <Ring
            x={dartWheelCenterX}
            y={dartWheelCenterY}
            innerRadius={dartWheelRadius}
            outerRadius={dartWheelRadius + 10}
            fill={themeEffects.wheelBorder?.stroke || '#333'}
            shadowEnabled={!!themeEffects.wheelBorder?.shadowColor}
            shadowColor={themeEffects.wheelBorder?.shadowColor}
            shadowBlur={themeEffects.wheelBorder?.shadowBlur}
            shadowOpacity={themeEffects.wheelBorder?.shadowOpacity}
          />
          
          {/* 휠 그룹 (회전) */}
          <Group ref={dartWheelGroupRef} x={dartWheelCenterX} y={dartWheelCenterY}>
            {/* 3D 그림자 레이어 */}
            <Group opacity={0.3}>
              {dartWheelGameState.dartWheelSections.map((section) => {
                const shadow = dartWheelCalculate3DShadow(
                  dartWheelGroupRef.current?.rotation() || 0,
                  section.angle + section.angleSize / 2
                );
                return (
                  <Wedge
                    key={`dart-wheel-shadow-${section.id}`}
                    x={shadow.shadowOffsetX}
                    y={shadow.shadowOffsetY}
                    radius={dartWheelRadius}
                    angle={section.angleSize}
                    rotation={section.angle}
                    fill="#000"
                    opacity={shadow.shadowOpacity}
                  />
                );
              })}
            </Group>

            {/* 휠 섹션들 */}
            {dartWheelGameState.dartWheelSections.map((section, index) => {
              const isSelected = dartWheelSelectedSection?.id === section.id;
              const isHovered = dartWheelHoveredSection === section.id;
              const pulseEffect = isSelected ? dartWheelApplyPulseEffect(section, dartWheelTime) : null;
              const neonStyle = section.isBonus ? dartWheelGetNeonStyle(section.color, 1.5) : null;
              const themeEffects = dartWheelGetThemeSpecialEffects(dartWheelTheme);
              const casinoStyle = dartWheelTheme === 'casino' ? dartWheelGetCasinoChipStyle(index, dartWheelGameState.dartWheelSections.length) : null;
              
              return (
                <Group key={`dart-wheel-section-group-${section.id}`}>
                  <Wedge
                    key={`dart-wheel-section-${section.id}`}
                    x={0}
                    y={0}
                    radius={dartWheelRadius}
                    angle={section.angleSize}
                    rotation={section.angle}
                    fill={casinoStyle ? casinoStyle.innerColor : section.color}
                    stroke={themeEffects.sectionStyle?.stroke || (section.isBonus ? '#FFD700' : '#333')}
                    strokeWidth={themeEffects.sectionStyle?.strokeWidth || (section.isBonus ? 4 : 2)}
                    scaleX={pulseEffect?.scale || (isHovered ? 1.05 : 1)}
                    scaleY={pulseEffect?.scale || (isHovered ? 1.05 : 1)}
                    opacity={pulseEffect?.opacity || 1}
                    shadowEnabled={section.isBonus || isSelected || isHovered}
                    shadowColor={section.isBonus ? '#FFD700' : section.color}
                    shadowBlur={pulseEffect?.glow || neonStyle?.shadowBlur || (isHovered ? 15 : 0)}
                    shadowOpacity={neonStyle?.shadowOpacity || 0.5}
                    onMouseEnter={() => setDartWheelHoveredSection(section.id)}
                    onMouseLeave={() => setDartWheelHoveredSection(null)}
                  />
                  
                  {/* 카지노 테마 패턴 */}
                  {dartWheelTheme === 'casino' && casinoStyle?.pattern === 'stripes' && (
                    <Wedge
                      x={0}
                      y={0}
                      radius={dartWheelRadius * 0.9}
                      angle={section.angleSize}
                      rotation={section.angle}
                      fill={casinoStyle.outerColor}
                      opacity={0.3}
                      listening={false}
                    />
                  )}
                  
                  {/* 보너스 섹션 추가 효과 */}
                  {section.isBonus && (
                    <>
                      <Wedge
                        x={0}
                        y={0}
                        radius={dartWheelRadius * 0.95}
                        angle={section.angleSize}
                        rotation={section.angle}
                        fill="transparent"
                        stroke="#FFF"
                        strokeWidth={2}
                        dash={[5, 5]}
                        opacity={0.8}
                      />
                      <Wedge
                        x={0}
                        y={0}
                        radius={dartWheelRadius * 1.02}
                        angle={section.angleSize}
                        rotation={section.angle}
                        fill="transparent"
                        stroke="#FFD700"
                        strokeWidth={1}
                        shadowColor="#FFD700"
                        shadowBlur={20}
                        shadowOpacity={0.8}
                      />
                    </>
                  )}
                </Group>
              );
            })}
            
            {/* 섹션 텍스트 */}
            {dartWheelGameState.dartWheelSections.map((section) => {
              const textPos = getDartWheelTextPosition(section);
              return (
                <Text
                  key={`dart-wheel-text-${section.id}`}
                  x={textPos.x - dartWheelCenterX}
                  y={textPos.y - dartWheelCenterY}
                  text={section.label}
                  fontSize={20}
                  fontStyle="bold"
                  fill="white"
                  align="center"
                  verticalAlign="middle"
                  offsetX={15}
                  offsetY={10}
                />
              );
            })}

            {/* 중앙 원 (3D 효과) */}
            <Group>
              {/* 그림자 */}
              <Circle
                x={3}
                y={3}
                radius={30}
                fill="#000"
                opacity={0.3}
              />
              {/* 메인 원 */}
              <Circle
                x={0}
                y={0}
                radius={30}
                fill={dartWheelTheme === 'casino' ? '#FFB300' : '#333'}
                stroke={themeEffects.centerButton?.stroke || '#fff'}
                strokeWidth={themeEffects.centerButton?.strokeWidth || 3}
                shadowColor={themeEffects.wheelBorder?.shadowColor || '#000'}
                shadowBlur={themeEffects.wheelBorder?.shadowBlur || 10}
                shadowOpacity={themeEffects.wheelBorder?.shadowOpacity || 0.5}
              />
              {/* 하이라이트 */}
              <Circle
                x={-5}
                y={-5}
                radius={10}
                fill="#fff"
                opacity={0.3}
              />
              {/* 카지노 테마 상징 */}
              {dartWheelTheme === 'casino' && (
                <Text
                  x={0}
                  y={0}
                  text="$"
                  fontSize={24}
                  fontStyle="bold"
                  fill="#000"
                  align="center"
                  verticalAlign="middle"
                />
              )}
            </Group>
          </Group>

          {/* 포인터 (고정) */}
          <Arrow
            x={dartWheelCenterX}
            y={dartWheelCenterY - dartWheelRadius - 20}
            points={[0, 0, -20, 30, 0, 25, 20, 30]}
            fill={dartWheelTheme === 'casino' ? '#FFB300' : '#FF6B6B'}
            stroke={dartWheelTheme === 'casino' ? '#2C2C2C' : '#333'}
            strokeWidth={3}
            shadowEnabled={true}
            shadowColor={dartWheelTheme === 'casino' ? '#FFB300' : 'black'}
            shadowBlur={dartWheelTheme === 'casino' ? 20 : 10}
            shadowOffsetY={5}
            shadowOpacity={dartWheelTheme === 'casino' ? 0.6 : 0.3}
            closed
          />
          
          {/* 파티클 효과 */}
          {dartWheelShowParticles && dartWheelSelectedSection && (
            <DartWheelParticles
              dartWheelEmitX={dartWheelCenterX}
              dartWheelEmitY={dartWheelCenterY}
              dartWheelEmitActive={dartWheelShowParticles}
              dartWheelParticleColor={dartWheelSelectedSection.color}
              dartWheelParticleCount={dartWheelSelectedSection.isBonus ? 50 : 30}
              dartWheelIsBonus={dartWheelSelectedSection.isBonus}
            />
          )}
        </Layer>
      </Stage>
      
      {/* 스핀 버튼 (게임 상태에 따라 표시) */}
      {dartWheelGameState.dartWheelStatus === 'idle' && (
        <div className="dart-wheel-controls">
          <button 
            className="dart-wheel-spin-button"
            onClick={() => {
              // 스핀 버튼 클릭은 상위 컴포넌트에서 처리
            }}
          >
            휠 돌리기
          </button>
        </div>
      )}
    </div>
  );
}

export default DartWheelCanvas;